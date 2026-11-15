import * as monaco from "monaco-editor";
import type { Theme } from "../types";
import editorWorker from "monaco-editor/editor/editor.worker?worker";
import tsWorker from "monaco-editor/language/typescript/ts.worker?worker";

// Cấu hình worker cho Monaco Editor theo chuẩn Vite Web Worker
self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string): Worker {
    void _workerId;
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

// Bật strict compiler options cho TypeScript mặc định trong Monaco
monaco.typescript.typescriptDefaults.setCompilerOptions({
  // Enum của Monaco chỉ khai báo tới ES2020; đủ cho mọi bài demo.
  target: monaco.typescript.ScriptTarget.ES2020,
  // CommonJS: code có `export {}`/`import` vẫn biên dịch được (sandbox có sẵn `exports`).
  module: monaco.typescript.ModuleKind.CommonJS,
  strict: true,
  experimentalDecorators: true,
  // Không đặt `lib`: Monaco dùng thư viện mặc định theo target (đã gồm DOM + console).
});

monaco.typescript.typescriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: false,
  noSyntaxValidation: false,
});

export interface EditorInstance {
  getValue(): string;
  /** Sửa nội dung nhưng vẫn undo được (dùng cho "Bật dòng lỗi", "Khôi phục bài"). */
  setValue(v: string): void;
  /** Thay bằng tài liệu khác và xoá lịch sử undo. */
  replaceDocument(v: string): void;
  getModel(): monaco.editor.ITextModel;
  setTheme(t: Theme): void;
  dispose(): void;
}

export function createEditor(
  container: HTMLElement,
  initial: string,
  onChange: (code: string) => void,
  onRun?: () => void
): EditorInstance {
  container.classList.add("monaco-editor-container");

  const modelUri = monaco.Uri.parse("inmemory://model/main.ts");
  let model = monaco.editor.getModel(modelUri);
  if (model) {
    model.setValue(initial);
  } else {
    model = monaco.editor.createModel(initial, "typescript", modelUri);
  }

  const editor = monaco.editor.create(container, {
    model,
    theme: "vs",
    automaticLayout: true,
    fontSize: 14,
    fontFamily: "'JetBrains Mono', Consolas, Monaco, monospace",
    tabSize: 2,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: "on",
    roundedSelection: true,
    padding: { top: 12, bottom: 12 },
  });

  // Monaco dùng sẵn Ctrl+Enter để chèn dòng, nên phải đăng ký lệnh chạy ngay trong editor.
  if (onRun) {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, onRun);
  }

  const subscription = model.onDidChangeContent(() => {
    onChange(model.getValue());
  });

  return {
    getValue(): string {
      return model.getValue();
    },

    replaceDocument(v: string): void {
      // Đổi sang tài liệu khác (bài mới, code chia sẻ): xoá lịch sử undo để Ctrl+Z không trả về bài trước.
      if (model.getValue() !== v) model.setValue(v);
    },

    setValue(v: string): void {
      if (model.getValue() === v) return;
      // Thay bằng edit operation (không dùng model.setValue) để Ctrl+Z còn khôi phục được code cũ.
      editor.pushUndoStop();
      model.pushEditOperations([], [{ range: model.getFullModelRange(), text: v }], () => null);
      editor.pushUndoStop();
    },

    getModel(): monaco.editor.ITextModel {
      return model;
    },

    setTheme(t: Theme): void {
      monaco.editor.setTheme(t === "dark" ? "vs-dark" : "vs");
    },

    dispose(): void {
      subscription.dispose();
      editor.dispose();
      model.dispose();
    },
  };
}
