import { el } from "../lib/dom";

interface IntroActions {
  onStartPlayground(): void;
  onOpenCompare(): void;
}

const FACTS: ReadonlyArray<readonly [string, string, string]> = [
  ["Kiểu dữ liệu", "Không có: kiểu chỉ lộ ra khi chạy", "Khai báo và kiểm tra trước khi chạy"],
  ["Lỗi gõ sai tên, sai kiểu", "Thường chỉ biết khi chạy tới dòng đó", "Gạch đỏ ngay trong editor"],
  ["Gợi ý code", "Dựa trên suy đoán", "Chính xác nhờ kiểu dữ liệu"],
  ["Chạy trên trình duyệt", "Chạy trực tiếp", "Biên dịch sang JS rồi chạy"],
  ["Đổi tên, refactor", "Dễ sót chỗ", "Công cụ đổi đúng mọi nơi dùng"],
];

export function createIntro(container: HTMLElement, actions: IntroActions): void {
  const table = el(
    "table",
    { class: "intro-table" },
    el("thead", {}, el("tr", {}, el("th", { text: "" }), el("th", { text: "JavaScript" }), el("th", { text: "TypeScript" }))),
    el(
      "tbody",
      {},
      ...FACTS.map(([topic, js, ts]) =>
        el("tr", {}, el("th", { attrs: { scope: "row" }, text: topic }), el("td", { text: js }), el("td", { text: ts })),
      ),
    ),
  );

  const root = el(
    "div",
    { class: "intro" },
    el(
      "section",
      { class: "intro-hero" },
      el("h1", { class: "intro-title", text: "TypeScript là JavaScript có kiểu dữ liệu" }),
      el("p", {
        class: "intro-lead",
        text: "TypeScript là ngôn ngữ do Microsoft phát triển, ra mắt năm 2012. Nó là tập mở rộng của JavaScript: mọi code JS đều hợp lệ, và bạn thêm kiểu dữ liệu vào khi cần. Trình biên dịch kiểm tra kiểu rồi xuất ra JavaScript thuần để chạy ở bất cứ đâu.",
      }),
      el(
        "div",
        { class: "intro-actions" },
        el("button", { class: "btn btn-primary", text: "Thử trong Playground", attrs: { type: "button" }, on: { click: () => actions.onStartPlayground() } }),
        el("button", { class: "btn", text: "Xem lỗi JS bỏ sót", attrs: { type: "button" }, on: { click: () => actions.onOpenCompare() } }),
      ),
    ),
    el(
      "section",
      { class: "intro-section" },
      el("h2", { text: "Vì sao dùng TypeScript" }),
      el(
        "ul",
        { class: "intro-list" },
        el("li", { text: "Bắt lỗi sớm: sai kiểu, gõ nhầm tên thuộc tính, thiếu tham số đều bị báo trước khi chạy." }),
        el("li", { text: "Code tự mô tả: kiểu của hàm và dữ liệu là tài liệu luôn đúng với code." }),
        el("li", { text: "Dễ làm việc nhóm và dự án lớn: sửa một chỗ, trình biên dịch chỉ ra mọi chỗ bị ảnh hưởng." }),
      ),
    ),
    el("section", { class: "intro-section" }, el("h2", { text: "JavaScript và TypeScript" }), el("div", { class: "intro-table-wrap" }, table)),
    el(
      "section",
      { class: "intro-section" },
      el("h2", { text: "Trang này gồm" }),
      el(
        "ul",
        { class: "intro-list" },
        el("li", { text: "Playground: gõ TypeScript, thấy lỗi kiểu ngay, bấm Chạy để xem kết quả (8 bài mẫu)." }),
        el("li", { text: "So sánh JS/TS: cùng một đoạn code, JS chạy sai im lặng còn TS báo lỗi." }),
      ),
    ),
  );

  container.replaceChildren(root);
}
