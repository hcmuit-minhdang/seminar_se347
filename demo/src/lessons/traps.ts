import type { Trap } from "../types";

/** Cùng một ý đồ: JS chạy "bình thường" nhưng sai, TS báo lỗi trước khi chạy. */
export const traps: readonly Trap[] = [
  {
    id: "string-plus",
    title: "Cộng nhầm chuỗi",
    note: "Truyền chuỗi thay vì số: JS nối chuỗi và ra \"12\", không báo gì.",
    js: `function add(a, b) {
  return a + b;
}
console.log("1 + 2 =", add("1", "2"));`,
    ts: `function add(a: number, b: number): number {
  return a + b;
}
console.log("1 + 2 =", add("1", "2"));`,
  },
  {
    id: "typo-property",
    title: "Gõ sai tên thuộc tính",
    note: "Truy cập thuộc tính không tồn tại: JS trả undefined và in ra chữ \"undefined\".",
    js: `const user = { name: "An", age: 20 };
console.log("Xin chào " + user.nmae);`,
    ts: `const user = { name: "An", age: 20 };
console.log("Xin chào " + user.nmae);`,
  },
  {
    id: "missing-arg",
    title: "Thiếu tham số",
    note: "Gọi hàm thiếu đối số: JS cho tham số đó là undefined, phép nhân ra NaN.",
    js: `function area(width, height) {
  return width * height;
}
console.log("Diện tích:", area(5));`,
    ts: `function area(width: number, height: number): number {
  return width * height;
}
console.log("Diện tích:", area(5));`,
  },
  {
    id: "maybe-undefined",
    title: "Giá trị có thể không tồn tại",
    note: "find() có thể không thấy gì. JS chỉ sập khi chạy tới dòng đó, TS báo từ lúc gõ.",
    js: `const found = [1, 2, 3].find((n) => n > 5);
console.log(found.toFixed(1));`,
    ts: `const found = [1, 2, 3].find((n) => n > 5);
console.log(found.toFixed(1));`,
  },
];
