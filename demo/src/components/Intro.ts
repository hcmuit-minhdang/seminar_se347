import qrcode from "qrcode-generator";
import { el } from "../lib/dom";

interface IntroActions {
  onStartPlayground(): void;
  onOpenCompare(): void;
  onOpenQuiz(): void;
}

/** Mã QR (SVG) dẫn tới trang này, để khán giả quét bằng điện thoại. */
function createQr(url: string): HTMLElement {
  const box = el("div", { class: "intro-qr-code", attrs: { role: "img", "aria-label": `Mã QR mở ${url}` } });
  try {
    const qr = qrcode(0, "M");
    qr.addData(url);
    qr.make();
    box.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); // SVG do thư viện sinh ra từ URL
  } catch {
    box.textContent = "Không tạo được mã QR.";
  }
  return box;
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
        el("button", { class: "btn", text: "Chơi Đố vui", attrs: { type: "button" }, on: { click: () => actions.onOpenQuiz() } }),
        el("button", { class: "btn", text: "Xem lỗi JS bỏ sót", attrs: { type: "button" }, on: { click: () => actions.onOpenCompare() } }),
      ),
    ),
    el(
      "section",
      { class: "intro-section intro-qr" },
      createQr(`${location.origin}${location.pathname}`),
      el(
        "div",
        { class: "intro-qr-text" },
        el("h2", { text: "Mở trên điện thoại" }),
        el("p", { text: "Quét mã QR để thử ngay trên máy bạn. Trang chạy hoàn toàn trên trình duyệt, không cần cài đặt." }),
        el("p", { class: "intro-qr-url", text: `${location.origin}${location.pathname}` }),
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
        el("li", { text: "Đố vui: chạm để đoán đoạn code có lỗi kiểu hay không (8 câu)." }),
      ),
    ),
  );

  container.replaceChildren(root);
}
