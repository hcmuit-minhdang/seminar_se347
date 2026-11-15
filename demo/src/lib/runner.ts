import type * as Monaco from "monaco-editor";
import type { Diagnostic, LogItem, LogLevel, SandboxMessage } from "../types";

/* ------------------------------------------------------------------ */
/*  Biên dịch & kiểm tra kiểu (dùng compiler TypeScript trong Monaco)  */
/* ------------------------------------------------------------------ */

interface DiagnosticChain {
  messageText: string;
  next?: DiagnosticChain[];
}
interface TsDiagnostic {
  start?: number;
  messageText: string | DiagnosticChain;
}

/** Nối cả chuỗi thông báo lồng nhau, mỗi tầng một dòng thụt vào. */
function flatten(text: string | DiagnosticChain, depth = 0): string {
  if (typeof text === "string") return text;
  const indent = "  ".repeat(depth);
  const own = `${indent}${text.messageText}`;
  const rest = (text.next ?? []).map((n) => flatten(n, depth + 1));
  return [own, ...rest].join("\n");
}

async function getWorker(model: Monaco.editor.ITextModel) {
  const monaco = await import("monaco-editor");
  const factory = await monaco.typescript.getTypeScriptWorker();
  return factory(model.uri);
}

/** Biên dịch TS sang JS ngay trên trình duyệt (kiểu bị xoá). */
export async function transpile(model: Monaco.editor.ITextModel): Promise<string> {
  const worker = await getWorker(model);
  const out = await worker.getEmitOutput(model.uri.toString());
  const file = out.outputFiles.find((f) => f.name.endsWith(".js"));
  return file ? file.text : "";
}

/** Lấy danh sách lỗi kiểu (cú pháp + ngữ nghĩa). */
export async function getDiagnostics(model: Monaco.editor.ITextModel): Promise<Diagnostic[]> {
  const worker = await getWorker(model);
  const uri = model.uri.toString();
  const [syntactic, semantic] = await Promise.all([
    worker.getSyntacticDiagnostics(uri),
    worker.getSemanticDiagnostics(uri),
  ]);
  return [...syntactic, ...semantic].map((d: TsDiagnostic): Diagnostic => {
    const pos = model.getPositionAt(d.start ?? 0);
    return { line: pos.lineNumber, column: pos.column, message: flatten(d.messageText) };
  });
}

let snippetSeq = 0;

/** Kiểm tra kiểu một đoạn code rời (dùng cho tab So sánh) mà không đụng tới editor chính. */
export async function checkSnippet(code: string): Promise<Diagnostic[]> {
  const monaco = await import("monaco-editor");
  // Thêm `export {}` để đoạn code là module riêng, không đụng khai báo toàn cục của model khác.
  const uri = monaco.Uri.parse(`inmemory://model/snippet-${snippetSeq++}.ts`);
  const model = monaco.editor.createModel(`${code}\nexport {};\n`, "typescript", uri);
  try {
    return await getDiagnostics(model);
  } finally {
    model.dispose();
  }
}

/* ------------------------------------------------------------------ */
/*  Chạy code: iframe sandbox -> Web Worker                            */
/* ------------------------------------------------------------------ */

/**
 * Code trong Worker. Worker chạy luồng riêng nên `while(true){}` không treo trang,
 * và xoá iframe là terminate luôn worker. Các hàm gốc được lưu trong closure
 * trước khi chạy code người dùng, nên code người dùng không phá được việc báo `done`.
 */
const WORKER_SRC = `
(function () {
  var origSetTimeout = self.setTimeout.bind(self);
  var origSetInterval = self.setInterval.bind(self);
  var origClearTimeout = self.clearTimeout.bind(self);
  var origPost = self.postMessage.bind(self);
  var now = self.performance.now.bind(self.performance);
  var SETTLE = 30, MAX_LINES = 1000, BATCH = 50;
  var token = null, t0 = 0, buf = [], flushTimer = 0, count = 0, finished = false;
  var timers = new Set();

  function flush() {
    flushTimer = 0;
    if (buf.length) { var items = buf; buf = []; origPost({ token: token, kind: "logs", items: items }); }
  }
  function push(level, text) {
    if (count > MAX_LINES) return;
    if (count === MAX_LINES) { level = "warn"; text = "Đã đạt giới hạn " + MAX_LINES + " dòng log, các dòng sau bị bỏ qua."; }
    count++;
    buf.push({ level: level, text: text });
    if (buf.length >= BATCH) flush();
    else if (!flushTimer) flushTimer = origSetTimeout(flush, 20);
  }
  function fmt(v) {
    if (typeof v === "string") return v;
    if (v instanceof Error) return v.name + ": " + v.message;
    if (typeof v === "function") return "[Function " + (v.name || "anonymous") + "]";
    if (v === null || typeof v !== "object") return typeof v === "bigint" ? v + "n" : String(v);
    try {
      return JSON.stringify(v, function (k, x) {
        if (typeof x === "bigint") return x + "n";
        if (typeof x === "number" && !isFinite(x)) return String(x);
        if (typeof x === "undefined") return "undefined";
        return x;
      }, 2);
    }
    catch (e) { return String(v); }
  }
  function fail(e) {
    flush();
    origPost({ token: token, kind: "error", message: e && e.message ? e.message : String(e) });
  }
  var settleQueued = false;
  function settle() {
    if (settleQueued) return;
    settleQueued = true;
    origSetTimeout(function () {
      settleQueued = false;
      if (timers.size === 0 && !finished) {
        finished = true; flush();
        origPost({ token: token, kind: "done", ms: Math.max(0, Math.round(now() - t0 - SETTLE)) });
      }
    }, SETTLE);
  }

  ["log", "info", "warn", "error"].forEach(function (level) {
    console[level] = function () { push(level, Array.prototype.map.call(arguments, fmt).join(" ")); };
  });
  console.debug = console.log;

  // Đếm timeout/interval đang chờ để biết khi nào code bất đồng bộ đã chạy xong.
  // Interval chưa clear thì còn "đang chờ" cho tới khi watchdog ở trang chính dừng lại.
  function wrapTimer(orig, repeat) {
    return function (fn, ms) {
      var args = Array.prototype.slice.call(arguments, 2);
      var id = orig(function () {
        if (!repeat) timers.delete(id);
        try {
          if (typeof fn === "function") fn.apply(self, args);
          else (0, eval)(String(fn));
        } catch (e) { fail(e); }
        finally { settle(); }
      }, ms);
      timers.add(id);
      return id;
    };
  }
  self.setTimeout = wrapTimer(origSetTimeout, false);
  self.setInterval = wrapTimer(origSetInterval, true);
  self.clearTimeout = self.clearInterval = function (id) {
    timers.delete(id);
    origClearTimeout(id);
    if (timers.size === 0) settle();
  };

  self.exports = {}; self.module = { exports: self.exports };
  self.require = function (name) { throw new Error("require/import chưa được hỗ trợ trong playground: " + name); };

  self.addEventListener("error", function (e) { e.preventDefault(); fail(e.message); });
  self.addEventListener("unhandledrejection", function (e) { e.preventDefault(); fail("Promise bị từ chối: " + fmt(e.reason)); });

  self.onmessage = function (ev) {
    if (token !== null) return;
    token = ev.data.token; t0 = now();
    try { (0, eval)(ev.data.code); } catch (e) { fail(e); }
    settle();
  };
})();
`;

/** Trang trong iframe: tạo worker, chuyển tiếp message (chỉ message đúng token). */
const IFRAME_BOOT = `
(function () {
  var cfg = __CONFIG__;
  var send = function (m) { parent.postMessage(Object.assign({ source: "ts-demo", token: cfg.token }, m), "*"); };
  try {
    var url = URL.createObjectURL(new Blob([cfg.workerSrc], { type: "text/javascript" }));
    var w = new Worker(url);
    w.onmessage = function (ev) {
      var d = ev.data;
      if (d && d.token === cfg.token) parent.postMessage(Object.assign({ source: "ts-demo" }, d), "*");
    };
    w.onerror = function (e) { e.preventDefault(); send({ kind: "error", message: e.message || "Lỗi worker" }); };
    w.postMessage({ token: cfg.token, code: cfg.code });
  } catch (e) {
    send({ kind: "error", message: "Không khởi tạo được worker: " + (e && e.message ? e.message : e) });
  }
})();
`;

const CSP =
  "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none'";

const LEVELS: ReadonlySet<string> = new Set<LogLevel>(["log", "info", "warn", "error"]);
const MAX_TEXT = 10_000;

/** Kiểm tra đầy đủ message từ sandbox (code người dùng có thể tự gửi message giả). */
function parseMessage(data: unknown, token: string): SandboxMessage | null {
  if (typeof data !== "object" || data === null) return null;
  const d = data as Record<string, unknown>;
  if (d["source"] !== "ts-demo" || d["token"] !== token) return null;

  switch (d["kind"]) {
    case "logs": {
      const raw = d["items"];
      if (!Array.isArray(raw)) return null;
      const items: LogItem[] = [];
      for (const it of raw as unknown[]) {
        if (typeof it !== "object" || it === null) return null;
        const { level, text } = it as Record<string, unknown>;
        if (typeof level !== "string" || !LEVELS.has(level) || typeof text !== "string") return null;
        items.push({ level: level as LogLevel, text: text.slice(0, MAX_TEXT) });
      }
      return { source: "ts-demo", token, kind: "logs", items };
    }
    case "done": {
      const ms = d["ms"];
      return typeof ms === "number" && Number.isFinite(ms) ? { source: "ts-demo", token, kind: "done", ms } : null;
    }
    case "error": {
      const message = d["message"];
      return typeof message === "string" ? { source: "ts-demo", token, kind: "error", message: message.slice(0, MAX_TEXT) } : null;
    }
    default:
      return null;
  }
}

export interface RunHandlers {
  onLogs(items: readonly LogItem[]): void;
  onError(message: string): void;
  onDone(ms: number): void;
}

export const DEFAULT_TIMEOUT_MS = 5000;

/** Mỗi lần chạy có handle riêng, nên Playground và tab So sánh không dừng nhầm nhau. */
export interface RunHandle {
  stop(): void;
}

function newToken(): string {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Chạy JS trong iframe sandbox (không allow-same-origin) và Web Worker bên trong.
 * Quá `timeoutMs` thì dừng hẳn, kể cả khi code đang kẹt trong vòng lặp vô hạn.
 */
export function runInSandbox(js: string, handlers: RunHandlers, timeoutMs = DEFAULT_TIMEOUT_MS): RunHandle {
  const token = newToken();
  let stopped = false;
  let watchdog: number | undefined;
  const frame = document.createElement("iframe");
  frame.setAttribute("sandbox", "allow-scripts");
  frame.style.display = "none";

  const stop = (): void => {
    if (stopped) return;
    stopped = true;
    window.clearTimeout(watchdog);
    window.removeEventListener("message", listener);
    frame.remove(); // xoá iframe cũng terminate luôn worker bên trong
  };

  const listener = (ev: MessageEvent): void => {
    if (stopped || ev.source !== frame.contentWindow) return;
    const msg = parseMessage(ev.data, token);
    if (!msg) return;
    switch (msg.kind) {
      case "logs":
        handlers.onLogs(msg.items);
        break;
      case "error":
        // Lỗi (kể cả lỗi khởi tạo worker) kết thúc lần chạy: không để worker chạy tiếp ngầm.
        stop();
        handlers.onError(msg.message);
        break;
      case "done":
        stop();
        handlers.onDone(msg.ms);
        break;
    }
  };

  // Escape "<" để chuỗi code không thể đóng thẻ script sớm.
  const config = JSON.stringify({ token, code: js, workerSrc: WORKER_SRC }).replace(/</g, "\\u003c");
  const boot = IFRAME_BOOT.replace("__CONFIG__", () => config);
  frame.srcdoc =
    `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="${CSP}"></head>` +
    `<body><script>${boot}<\/script></body></html>`;

  window.addEventListener("message", listener);
  watchdog = window.setTimeout(() => {
    stop();
    handlers.onError(
      `Code chạy quá ${Math.round(timeoutMs / 1000)} giây nên đã bị dừng (vòng lặp vô hạn, hoặc setInterval chưa được clearInterval).`,
    );
  }, timeoutMs);
  document.body.append(frame);
  return { stop };
}
