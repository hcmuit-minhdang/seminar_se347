import type { Diagnostic, LogItem, Trap } from "../types";
import { el } from "../lib/dom";
import { checkSnippet, runInSandbox, type RunHandle } from "../lib/runner";

export interface CompareInstance {
  /** Cập nhật cặp TS / JS biên dịch của bài đang mở trong Playground. */
  setLesson(tsCode: string, jsCode: string): void;
  /** Gọi khi tab So sánh được mở. */
  activate(): void;
  /** Gọi khi rời tab: dừng mọi thứ đang chạy. */
  deactivate(): void;
}

type Mode = "traps" | "lesson";

function column(kind: "ts" | "js", subtitle: string, code: HTMLElement, extra?: HTMLElement): HTMLElement {
  return el(
    "div",
    { class: `compare-column compare-column-${kind}` },
    el(
      "div",
      { class: "compare-column-header" },
      el("span", { class: `compare-badge compare-badge-${kind}`, text: kind === "ts" ? "TypeScript" : "JavaScript" }),
      el("span", { class: "compare-column-subtitle", text: subtitle }),
    ),
    el("div", { class: "compare-code-wrapper" }, el("pre", { class: "compare-pre" }, code)),
    extra,
  );
}

export function createCompare(container: HTMLElement, traps: readonly Trap[]): CompareInstance {
  let mode: Mode = "traps";
  let active = false;
  let seq = 0;
  let run: RunHandle | null = null;
  const stopRun = (): void => {
    run?.stop();
    run = null;
  };
  let trap: Trap | undefined = traps[0];
  let lessonTs = "";
  let lessonJs = "";

  // ---- Chế độ "bẫy": JS chạy sai im lặng, TS báo lỗi ----
  const trapJsCode = el("code");
  const trapTsCode = el("code");
  const jsOutput = el("div", { class: "compare-output" });
  const tsDiagnostics = el("div", { class: "compare-output" });
  const trapNote = el("p", { class: "compare-note" });
  const trapButtons = traps.map((t) =>
    el("button", { class: "btn", text: t.title, attrs: { type: "button", "data-id": t.id }, on: { click: () => selectTrap(t) } }),
  );
  const trapView = el(
    "div",
    { class: "compare-view" },
    el("div", { class: "compare-trap-list" }, ...trapButtons),
    trapNote,
    el(
      "div",
      { class: "compare-layout" },
      column("js", "Chạy được, nhưng sai lặng lẽ", trapJsCode, el("div", { class: "compare-output-wrap" }, el("div", { class: "compare-output-title", text: "Kết quả khi chạy" }), jsOutput)),
      column("ts", "Báo lỗi ngay khi gõ", trapTsCode, el("div", { class: "compare-output-wrap" }, el("div", { class: "compare-output-title", text: "Trình biên dịch báo" }), tsDiagnostics)),
    ),
  );

  // ---- Chế độ "bài hiện tại": TS và JS đã xoá kiểu ----
  const lessonTsCode = el("code");
  const lessonJsCode = el("code");
  const lessonView = el(
    "div",
    { class: "compare-view" },
    el("p", { class: "compare-note", text: "Đây là code trong Playground và JavaScript thật sự được sinh ra. Mọi kiểu dữ liệu, interface và type đều bị xoá (type erasure)." }),
    el("div", { class: "compare-layout" }, column("ts", "Code trong Playground", lessonTsCode), column("js", "JavaScript sau khi biên dịch", lessonJsCode)),
  );

  const modeTraps = el("button", { class: "tab-btn", text: "Lỗi JS bỏ sót", attrs: { type: "button" }, on: { click: () => setMode("traps") } });
  const modeLesson = el("button", { class: "tab-btn", text: "Code bài hiện tại", attrs: { type: "button" }, on: { click: () => setMode("lesson") } });
  const toolbar = el("div", { class: "compare-toolbar" }, el("div", { class: "tab-navigation" }, modeTraps, modeLesson));

  container.replaceChildren(el("div", { class: "compare-root" }, toolbar, trapView, lessonView));

  function outputLine(target: HTMLElement, text: string, kind: "log" | "warn" | "error" | "ok" | "info"): void {
    target.append(el("div", { class: `compare-line compare-line-${kind}`, text }));
  }

  function showLogs(items: readonly LogItem[]): void {
    for (const it of items) outputLine(jsOutput, it.text, it.level === "error" ? "error" : it.level === "warn" ? "warn" : "log");
  }

  function showDiagnostics(list: readonly Diagnostic[]): void {
    tsDiagnostics.replaceChildren();
    if (list.length === 0) {
      outputLine(tsDiagnostics, "Không có lỗi kiểu.", "ok");
      return;
    }
    for (const d of list) outputLine(tsDiagnostics, `Dòng ${d.line}, cột ${d.column}: ${d.message}`, "error");
  }

  function selectTrap(t: Trap): void {
    trap = t;
    for (const b of trapButtons) b.classList.toggle("active", b.getAttribute("data-id") === t.id);
    trapNote.textContent = t.note;
    trapJsCode.textContent = t.js;
    trapTsCode.textContent = t.ts;
    jsOutput.replaceChildren();
    tsDiagnostics.replaceChildren();
    if (!active || mode !== "traps") return;

    const mine = ++seq;
    outputLine(tsDiagnostics, "Đang kiểm tra kiểu...", "info");
    void checkSnippet(t.ts)
      .then((list) => {
        if (mine === seq) showDiagnostics(list);
      })
      .catch((err: unknown) => {
        if (mine === seq) {
          tsDiagnostics.replaceChildren();
          outputLine(tsDiagnostics, err instanceof Error ? err.message : String(err), "error");
        }
      });

    stopRun();
    run = runInSandbox(t.js, {
      onLogs: (items) => mine === seq && showLogs(items),
      onError: (message) => mine === seq && outputLine(jsOutput, `Lỗi lúc chạy: ${message}`, "error"),
      onDone: () => undefined,
    });
  }

  function renderLesson(): void {
    lessonTsCode.textContent = lessonTs || "// (Chưa có code)";
    lessonJsCode.textContent = lessonJs || "// (Chưa biên dịch được)";
  }

  function setMode(next: Mode): void {
    mode = next;
    seq++;
    stopRun();
    modeTraps.classList.toggle("active", next === "traps");
    modeLesson.classList.toggle("active", next === "lesson");
    trapView.hidden = next !== "traps";
    lessonView.hidden = next !== "lesson";
    if (next === "traps" && trap) selectTrap(trap);
    if (next === "lesson") renderLesson();
  }

  setMode("traps");

  return {
    setLesson(tsCode, jsCode) {
      lessonTs = tsCode;
      lessonJs = jsCode;
      if (mode === "lesson") renderLesson();
    },
    activate() {
      active = true;
      setMode(mode);
    },
    deactivate() {
      active = false;
      seq++;
      stopRun();
    },
  };
}
