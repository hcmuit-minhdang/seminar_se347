import type { LogLevel, RunState } from "../types";
import { el } from "../lib/dom";

export interface ConsoleInstance {
  append(level: LogLevel, text: string): void;
  clear(): void;
  setStatus(state: RunState): void;
}

export function createConsole(container: HTMLElement): ConsoleInstance {
  const statusBadge = el("span", {
    class: "console-status-badge console-status-idle",
    text: "Chờ chạy",
  });

  const clearBtn = el("button", {
    class: "console-btn-clear",
    text: "Xóa",
    attrs: { type: "button", title: "Xóa toàn bộ log console" },
    on: {
      click: () => clear(),
    },
  });

  const header = el(
    "div",
    { class: "console-header" },
    el(
      "div",
      { class: "console-header-left" },
      el("span", { class: "console-title", text: "Console" }),
      statusBadge
    ),
    clearBtn
  );

  const emptyMessage = el("div", {
    class: "console-empty",
    text: "Chưa có log đầu ra. Nhấn \"Chạy\" (hoặc Ctrl+Enter) để xem kết quả.",
  });

  const body = el("div", { class: "console-body" }, emptyMessage);

  const root = el("div", { class: "console-container" }, header, body);
  container.replaceChildren(root);

  const MAX_LINES = 1000;
  let lineCount = 0;
  let truncated = false;
  let scrollQueued = false;

  function scrollToEndSoon(): void {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      scrollQueued = false;
      body.scrollTop = body.scrollHeight;
    });
  }

  function append(level: LogLevel, text: string): void {
    if (emptyMessage.parentNode === body) {
      emptyMessage.remove();
    }

    // Giới hạn số dòng để vòng lặp in log không làm đứng trang.
    if (lineCount >= MAX_LINES) {
      if (!truncated) {
        truncated = true;
        level = "warn";
        text = `Đã đạt giới hạn ${MAX_LINES} dòng log, các dòng sau bị bỏ qua.`;
      } else {
        return;
      }
    }
    lineCount += 1;

    const item = el(
      "div",
      { class: `console-item console-item-${level}` },
      el("span", {
        class: `console-level-tag console-level-${level}`,
        text: level.toUpperCase(),
      }),
      el("span", { class: "console-text", text })
    );

    body.appendChild(item);
    scrollToEndSoon();
  }

  function clear(): void {
    lineCount = 0;
    truncated = false;
    body.replaceChildren(emptyMessage);
  }

  function setStatus(state: RunState): void {
    statusBadge.className = `console-status-badge console-status-${state.status}`;

    switch (state.status) {
      case "idle":
        statusBadge.textContent = "Chờ chạy";
        statusBadge.removeAttribute("title");
        break;

      case "running":
        statusBadge.textContent = "Đang chạy...";
        statusBadge.removeAttribute("title");
        break;

      case "success":
        statusBadge.textContent = `Thành công (${state.durationMs}ms)`;
        statusBadge.removeAttribute("title");
        break;

      case "error":
        statusBadge.textContent = state.message ? `Lỗi: ${state.message}` : "Lỗi";
        statusBadge.setAttribute("title", state.message);
        break;
    }
  }

  return {
    append,
    clear,
    setStatus,
  };
}
