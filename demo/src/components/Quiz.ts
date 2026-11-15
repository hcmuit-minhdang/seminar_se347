import type { Question } from "../types";
import { el } from "../lib/dom";

interface QuizOptions {
  /** Mở đoạn code đang xem trong tab Code để thử sửa. */
  onOpenInCode(code: string): void;
}

/** Trò "Có lỗi kiểu không?": chạm để trả lời, thiết kế cho điện thoại. */
export function createQuiz(container: HTMLElement, questions: readonly Question[], options: QuizOptions): void {
  let index = 0;
  let score = 0;

  function render(): void {
    const q = questions[index];
    if (!q) {
      renderResult();
      return;
    }

    const dots = el(
      "div",
      { class: "quiz-dots", attrs: { "aria-hidden": "true" } },
      ...questions.map((_, i) => el("span", { class: `quiz-dot${i < index ? " done" : i === index ? " current" : ""}` })),
    );
    const feedback = el("div", { class: "quiz-feedback", attrs: { "aria-live": "polite" } });
    const actions = el("div", { class: "quiz-actions" });

    const answer = (guess: boolean): void => {
      const correct = guess === q.hasError;
      if (correct) score += 1;
      for (const b of answerButtons) b.disabled = true;
      answerButtons[guess ? 0 : 1]?.classList.add("chosen");
      feedback.className = `quiz-feedback ${correct ? "ok" : "bad"}`;
      feedback.replaceChildren(
        el("strong", { text: correct ? "Đúng rồi!" : "Chưa đúng." }),
        el("span", { text: ` ${q.hasError ? "Đoạn code này có lỗi kiểu." : "Đoạn code này không có lỗi."}` }),
        el("p", { text: q.explain }),
      );
      actions.replaceChildren(
        el("button", { class: "btn", text: "Thử trong Code", attrs: { type: "button" }, on: { click: () => options.onOpenInCode(q.code) } }),
        el("button", {
          class: "btn btn-primary",
          text: index + 1 < questions.length ? "Câu tiếp" : "Xem điểm",
          attrs: { type: "button" },
          on: {
            click: () => {
              index += 1;
              render();
            },
          },
        }),
      );
    };

    const answerButtons = [
      el("button", { class: "quiz-answer quiz-answer-error", text: "Có lỗi", attrs: { type: "button" }, on: { click: () => answer(true) } }),
      el("button", { class: "quiz-answer quiz-answer-ok", text: "Không lỗi", attrs: { type: "button" }, on: { click: () => answer(false) } }),
    ];

    container.replaceChildren(
      el(
        "div",
        { class: "quiz" },
        el("div", { class: "quiz-head" }, el("span", { class: "quiz-progress", text: `Câu ${index + 1}/${questions.length}` }), el("span", { class: "quiz-score", text: `Điểm: ${score}` })),
        dots,
        el("h2", { class: "quiz-question", text: "Đoạn TypeScript này có lỗi kiểu không?" }),
        el("pre", { class: "quiz-code" }, el("code", { text: q.code })),
        el("div", { class: "quiz-answers" }, ...answerButtons),
        feedback,
        actions,
      ),
    );
  }

  function renderResult(): void {
    const total = questions.length;
    const message = score === total ? "Tuyệt vời, đúng hết!" : score >= total * 0.6 ? "Khá lắm!" : "Thử lại để nhớ kỹ hơn nhé.";
    container.replaceChildren(
      el(
        "div",
        { class: "quiz quiz-result" },
        el("h2", { class: "quiz-question", text: "Kết quả" }),
        el("div", { class: "quiz-big-score", text: `${score}/${total}` }),
        el("p", { text: message }),
        el("div", { class: "quiz-actions" }, el("button", {
          class: "btn btn-primary",
          text: "Chơi lại",
          attrs: { type: "button" },
          on: {
            click: () => {
              index = 0;
              score = 0;
              render();
            },
          },
        })),
      ),
    );
  }

  render();
}
