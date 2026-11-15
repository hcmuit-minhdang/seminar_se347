/** Một bài học trong danh sách demo. */
export interface Lesson {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly explanation: string[];
  readonly code: string;
  /**
   * Các dòng code gây lỗi kiểu, đang được comment trong `code` dưới dạng `// <dòng>`.
   * Nút "Bật dòng lỗi" sẽ gỡ comment đúng các dòng này.
   */
  readonly expectedErrors?: readonly string[];
}

/** Cặp ví dụ "JS lặng lẽ sai, TS báo lỗi ngay" cho tab So sánh. */
export interface Trap {
  readonly id: string;
  readonly title: string;
  readonly note: string;
  readonly js: string;
  readonly ts: string;
}

export type Theme = "light" | "dark";
export type Tab = "intro" | "playground" | "compare";

/** Trạng thái chạy code: discriminated union. */
export type RunState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "success"; durationMs: number }
  | { status: "error"; message: string };

export type LogLevel = "log" | "info" | "warn" | "error";

export interface LogItem {
  readonly level: LogLevel;
  readonly text: string;
}

/** Message chạy từ sandbox về trang chính. `token` khác nhau ở mỗi lần chạy. */
export type SandboxMessage =
  | { source: "ts-demo"; token: string; kind: "logs"; items: LogItem[] }
  | { source: "ts-demo"; token: string; kind: "done"; ms: number }
  | { source: "ts-demo"; token: string; kind: "error"; message: string };

export interface Diagnostic {
  readonly line: number;
  readonly column: number;
  readonly message: string;
}
