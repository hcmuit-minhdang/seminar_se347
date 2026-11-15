import "./styles.css";
import type { Lesson, RunState, Tab, Theme } from "./types";
import type { EditorInstance } from "./components/Editor";
import { $, el } from "./lib/dom";
import { buildShareUrl, readLessonId, readSharedCode, readTabHash } from "./lib/share";
import { getDiagnostics, runInSandbox, transpile, type RunHandle } from "./lib/runner";
import { lessons } from "./lessons";
import { traps } from "./lessons/traps";
import { createConsole } from "./components/Console";
import { createLessonList } from "./components/LessonList";
import { createCompare } from "./components/Compare";
import { createIntro } from "./components/Intro";
import { createQuiz } from "./components/Quiz";
import { questions } from "./lessons/quiz";

const THEME_KEY = "ts-demo-theme";

/** Đang mở bài mẫu hay code chia sẻ qua link. */
type Source = { kind: "lesson"; lesson: Lesson } | { kind: "shared"; code: string };

function loadTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* localStorage có thể bị chặn */
  }
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

async function start(): Promise<void> {
  const app = $<HTMLDivElement>("#app");
  const firstLesson = lessons[0];
  if (!firstLesson) throw new Error("Chưa có bài học nào");

  let theme: Theme = loadTheme();
  let tab: Tab = "intro";
  let state: RunState = { status: "idle" };
  let runId = 0; // tăng mỗi lần chạy/dừng/đổi bài để bỏ qua kết quả của lần chạy cũ
  let compareSeq = 0;
  let currentRun: RunHandle | null = null;
  // Editor (Monaco) tải lười: trong lúc chờ, mọi thao tác chỉ ghi lại lựa chọn.
  let editor: EditorInstance | undefined;
  // Code chia sẻ mà trang này đã nạp hoặc tự tạo ra, để Back/Forward không nạp đè lên bản đang sửa.
  let lastSharedCode: string | null = null;

  // ---- Khung giao diện ----
  const runBtn = el("button", { class: "btn btn-primary", text: "▶ Chạy", attrs: { type: "button", title: "Ctrl + Enter" } });
  const stopBtn = el("button", { class: "btn btn-stop", text: "■ Dừng", attrs: { type: "button" } });
  stopBtn.hidden = true;
  const shareBtn = el("button", { class: "btn", text: "Chia sẻ", attrs: { type: "button" } });
  const themeBtn = el("button", { class: "theme-toggle-btn", attrs: { type: "button", "aria-label": "Đổi giao diện sáng/tối" } });
  // Trên điện thoại, 5 tab này nằm ở thanh dưới cùng; trên desktop nằm ở header (tab "Bài học" chỉ có ở điện thoại).
  const tabButtons: Record<Tab, HTMLButtonElement> = {
    intro: el("button", { class: "tab-btn", text: "Giới thiệu", attrs: { type: "button" } }),
    lessons: el("button", { class: "tab-btn tab-btn-mobile-only", text: "Bài học", attrs: { type: "button" } }),
    playground: el("button", { class: "tab-btn", text: "Code", attrs: { type: "button" } }),
    compare: el("button", { class: "tab-btn", text: "So sánh", attrs: { type: "button" } }),
    quiz: el("button", { class: "tab-btn", text: "Đố vui", attrs: { type: "button" } }),
  };

  const header = el(
    "header",
    { class: "app-header" },
    el("div", { class: "app-brand" }, el("span", { class: "brand-badge", text: "TS" }), el("span", { class: "brand-title", text: "TypeScript Demo" })),
    el("div", { class: "header-actions" }, runBtn, stopBtn, shareBtn, themeBtn),
  );

  const sidebar = el("aside", { class: "sidebar-panel" });
  const explainTitle = el("h3", { class: "lesson-explain-title" });
  const explainBody = el("div", { class: "lesson-explain-body" });
  const explainActions = el("div", { class: "lesson-explain-actions" });
  const mobileQuery = matchMedia("(max-width: 768px)");
  const touchDevice = matchMedia("(pointer: coarse)").matches;
  // Màn hình nhỏ: thu gọn phần giải thích để dành chỗ cho code và kết quả.
  const explain = el("details", { class: "lesson-explain", props: { open: !mobileQuery.matches } }, el("summary", { text: "Giải thích bài học" }), explainTitle, explainBody, explainActions);
  const editorStatus = el("p", { class: "compare-note", text: "Đang tải trình soạn thảo..." });
  const editorHost = el("div", { class: "editor-host" }, editorStatus);
  // Trên thiết bị cảm ứng, code mặc định chỉ để xem: tránh bàn phím ảo bật lên mỗi lần chạm hoặc cuộn.
  const editToggle = el("button", { class: "btn btn-small", text: "Sửa code", attrs: { type: "button" } });
  const editorToolbar = el("div", { class: "editor-toolbar" }, editToggle);
  editorToolbar.hidden = !touchDevice;
  const consoleHost = el("div", { class: "console-pane" });
  const panels: Record<Exclude<Tab, "lessons">, HTMLElement> = {
    intro: el("section", { class: "tab-panel" }),
    playground: el(
      "section",
      { class: "tab-panel" },
      el("div", { class: "playground-view" }, el("div", { class: "editor-pane" }, explain, editorToolbar, editorHost), consoleHost),
    ),
    compare: el("section", { class: "tab-panel" }),
    quiz: el("section", { class: "tab-panel" }),
  };

  // Thanh tab là phần tử con trực tiếp của #app: desktop đặt nó giữa header, điện thoại thì nó nằm đáy màn hình.
  const tabBar = el("nav", { class: "tab-navigation" }, tabButtons.intro, tabButtons.lessons, tabButtons.playground, tabButtons.compare, tabButtons.quiz);
  app.replaceChildren(
    header,
    el("div", { class: "app-body" }, sidebar, el("main", { class: "main-content" }, panels.intro, panels.playground, panels.compare, panels.quiz)),
    tabBar,
  );

  const consoleView = createConsole(consoleHost);
  const compare = createCompare(panels.compare, traps);

  // ---- Nguồn code ban đầu theo hash ----
  const sharedAtStart = readSharedCode();
  const lessonAtStart = lessons.find((l) => l.id === readLessonId()) ?? firstLesson;
  let source: Source = sharedAtStart !== null ? { kind: "shared", code: sharedAtStart } : { kind: "lesson", lesson: lessonAtStart };
  if (sharedAtStart !== null) lastSharedCode = sharedAtStart;

  const sourceCode = (): string => (source.kind === "shared" ? source.code : source.lesson.code);

  // ---- Hành vi (không phụ thuộc Monaco đã tải hay chưa) ----
  function setState(next: RunState): void {
    state = next;
    consoleView.setStatus(next);
    runBtn.disabled = next.status === "running";
    stopBtn.hidden = next.status !== "running";
  }

  function cancelRun(): void {
    runId++;
    currentRun?.stop();
    currentRun = null;
  }

  async function refreshCompare(): Promise<void> {
    if (!editor) return;
    const seq = ++compareSeq;
    const code = editor.getValue();
    let js = "";
    try {
      js = await transpile(editor.getModel());
    } catch {
      /* hiện code mà không có JS */
    }
    if (seq === compareSeq) compare.setLesson(code, js);
  }

  function renderExplain(): void {
    explainActions.replaceChildren();
    if (source.kind === "shared") {
      explainTitle.textContent = "Code được chia sẻ";
      explainBody.replaceChildren(el("p", { text: "Bạn đang xem code mở từ một link chia sẻ. Chọn một bài ở danh sách bên trái để quay lại bài mẫu." }));
      return;
    }
    const lesson = source.lesson;
    explainTitle.textContent = lesson.title;
    explainBody.replaceChildren(...lesson.explanation.map((p) => el("p", { text: p })));
    const errors = lesson.expectedErrors;
    if (errors && errors.length > 0) {
      explainActions.append(
        el("button", {
          class: "btn",
          text: "Bật dòng lỗi",
          attrs: { type: "button", title: "Gỡ comment các dòng cố tình sai kiểu để xem TypeScript báo lỗi" },
          on: { click: () => enableErrorLines(errors) },
        }),
        el("button", { class: "btn", text: "Khôi phục bài", attrs: { type: "button" }, on: { click: () => resetLesson(lesson) } }),
      );
    }
  }

  function enableErrorLines(errors: readonly string[]): void {
    if (!editor) return;
    let code = editor.getValue();
    for (const line of errors) code = code.replace(`// ${line}`, () => line);
    editor.setValue(code); // sửa trong cùng tài liệu nên Ctrl+Z vẫn hoàn tác được
  }

  function resetLesson(lesson: Lesson): void {
    cancelRun();
    editor?.setValue(lesson.code);
    consoleView.clear();
    setState({ status: "idle" });
  }

  function resetOutput(): void {
    cancelRun();
    consoleView.clear();
    setState({ status: "idle" });
  }

  function loadLesson(lesson: Lesson): void {
    source = { kind: "lesson", lesson };
    lastSharedCode = null;
    editor?.replaceDocument(lesson.code);
    list.setActive(lesson.id);
    renderExplain();
    resetOutput();
  }

  function loadShared(code: string): void {
    source = { kind: "shared", code };
    lastSharedCode = code;
    editor?.replaceDocument(code);
    list.setActive("");
    renderExplain();
    resetOutput();
  }

  function selectLesson(lesson: Lesson): void {
    loadLesson(lesson);
    const hash = `#lesson=${lesson.id}`;
    if (location.hash !== hash) history.pushState(null, "", hash);
    showTab("playground");
  }

  async function run(): Promise<void> {
    if (!editor || tab !== "playground" || state.status === "running") return;
    const id = ++runId;
    consoleView.clear();
    setState({ status: "running" });
    try {
      const model = editor.getModel();
      const [js, diagnostics] = await Promise.all([transpile(model), getDiagnostics(model)]);
      if (id !== runId) return; // đã đổi bài hoặc bấm Dừng trong lúc biên dịch

      for (const d of diagnostics) {
        consoleView.append("error", `TS lỗi (dòng ${d.line}, cột ${d.column}): ${d.message}`);
      }
      if (diagnostics.length > 0) {
        consoleView.append("warn", `Có ${diagnostics.length} lỗi kiểu. TypeScript vẫn xoá kiểu và chạy JS bên dưới, nên lỗi chỉ lộ ra lúc chạy nếu code sai thật.`);
      }
      currentRun = runInSandbox(js, {
        onLogs: (items) => {
          if (id !== runId) return;
          for (const it of items) consoleView.append(it.level, it.text);
        },
        onError: (message) => {
          if (id !== runId) return;
          currentRun = null;
          consoleView.append("error", message);
          setState({ status: "error", message });
        },
        onDone: (ms) => {
          if (id !== runId) return;
          currentRun = null;
          setState({ status: "success", durationMs: ms });
        },
      });
    } catch (err) {
      if (id !== runId) return;
      const message = err instanceof Error ? err.message : String(err);
      consoleView.append("error", message);
      setState({ status: "error", message });
    }
  }

  function stop(): void {
    if (state.status !== "running") return;
    cancelRun();
    consoleView.append("info", "Đã dừng.");
    setState({ status: "idle" });
  }

  function showTab(next: Tab): void {
    if (next !== tab) {
      if (state.status === "running") {
        cancelRun();
        setState({ status: "idle" });
      }
      if (tab === "compare") compare.deactivate();
    }
    tab = next;
    runBtn.hidden = next !== "playground";
    shareBtn.hidden = next !== "playground";
    app.dataset["tab"] = next; // CSS dùng để hiện danh sách bài thành một màn riêng trên điện thoại
    for (const key of Object.keys(tabButtons) as Tab[]) {
      tabButtons[key].classList.toggle("active", key === next);
    }
    for (const key of Object.keys(panels) as Array<keyof typeof panels>) {
      panels[key].classList.toggle("active", key === next);
    }
    window.scrollTo(0, 0);
    // Tab So sánh cần Monaco: nếu chưa tải xong thì đợi, applyHash() sẽ gọi lại sau khi editor sẵn sàng.
    if (next === "compare" && editor) {
      compare.activate();
      void refreshCompare();
    }
  }

  /** Hash là nguồn sự thật: #intro | #playground | #compare | #lesson=<id> | #code=<...>. */
  function applyHash(): void {
    const code = readSharedCode();
    const lessonId = readLessonId();
    if (code !== null) {
      if (code !== lastSharedCode) loadShared(code);
      showTab("playground");
    } else if (lessonId !== null) {
      const lesson = lessons.find((l) => l.id === lessonId);
      if (lesson && !(source.kind === "lesson" && source.lesson.id === lesson.id)) loadLesson(lesson);
      showTab("playground");
    } else {
      const wanted = readTabHash() ?? "intro";
      // Danh sách bài chỉ là một màn riêng trên điện thoại; trên desktop nó luôn nằm ở sidebar.
      showTab(wanted === "lessons" && !mobileQuery.matches ? "playground" : wanted);
    }
  }

  /** Quay lại Playground đúng bài đang học (F5 vẫn mở lại bài đó). */
  function goPlayground(): void {
    location.hash = source.kind === "lesson" ? `lesson=${source.lesson.id}` : "playground";
  }

  function applyTheme(next: Theme): void {
    theme = next;
    document.documentElement.setAttribute("data-theme", next);
    editor?.setTheme(next);
    themeBtn.textContent = next === "dark" ? "☀" : "☾";
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* bỏ qua */
    }
  }

  async function share(): Promise<void> {
    if (!editor) return;
    const code = editor.getValue();
    lastSharedCode = code; // đánh dấu: hash #code này do chính trang tạo ra, Back về đây không nạp đè
    const url = buildShareUrl(code);
    history.replaceState(null, "", url);
    try {
      await navigator.clipboard.writeText(url);
      shareBtn.textContent = "Đã chép link";
    } catch {
      shareBtn.textContent = "Link đã ở thanh địa chỉ";
    }
    window.setTimeout(() => (shareBtn.textContent = "Chia sẻ"), 2000);
  }

  const list = createLessonList(sidebar, lessons, (lesson) => selectLesson(lesson));
  createIntro(panels.intro, {
    onStartPlayground: goPlayground,
    onOpenCompare: () => (location.hash = "compare"),
    onOpenQuiz: () => (location.hash = "quiz"),
  });
  createQuiz(panels.quiz, questions, {
    onOpenInCode: (code) => {
      loadShared(code);
      location.hash = "playground";
    },
  });

  // ---- Gắn sự kiện và hiện trang ngay, trước khi Monaco tải xong ----
  runBtn.addEventListener("click", () => void run());
  stopBtn.addEventListener("click", stop);
  shareBtn.addEventListener("click", () => void share());
  themeBtn.addEventListener("click", () => applyTheme(theme === "dark" ? "light" : "dark"));
  tabButtons.intro.addEventListener("click", () => (location.hash = "intro"));
  tabButtons.lessons.addEventListener("click", () => (location.hash = "lessons"));
  tabButtons.playground.addEventListener("click", goPlayground);
  tabButtons.compare.addEventListener("click", () => (location.hash = "compare"));
  tabButtons.quiz.addEventListener("click", () => (location.hash = "quiz"));
  let editing = false;
  editToggle.addEventListener("click", () => {
    editing = !editing;
    editor?.setReadOnly(!editing);
    editToggle.textContent = editing ? "Xong" : "Sửa code";
    if (editing) editor?.focus();
  });
  window.addEventListener("hashchange", applyHash);
  window.addEventListener("keydown", (ev) => {
    if (tab === "playground" && (ev.ctrlKey || ev.metaKey) && ev.key === "Enter") {
      ev.preventDefault();
      void run();
    }
  });

  list.setActive(source.kind === "lesson" ? source.lesson.id : "");
  renderExplain();
  setState({ status: "idle" });
  applyTheme(theme);
  applyHash();

  // ---- Tải Monaco (rất nặng) rồi tạo editor từ nguồn code hiện tại ----
  try {
    const { createEditor } = await import("./components/Editor");
    editor = createEditor(
      editorHost,
      sourceCode(), // lấy sau khi tải xong: người dùng có thể đã đổi bài trong lúc chờ
      () => undefined,
      () => void run(),
    );
    editorStatus.remove();
    editor.setTheme(theme);
    if (touchDevice) editor.setReadOnly(true);
    applyHash(); // kích hoạt phần cần editor (tab So sánh)
  } catch (err) {
    editorStatus.textContent = `Không tải được trình soạn thảo: ${err instanceof Error ? err.message : String(err)}. Hãy tải lại trang.`;
    editorStatus.classList.add("compare-line-error");
  }
}

void start();
