import type { Lesson } from "../types";

export const generics: Lesson = {
  id: "generics",
  title: "Generics",
  summary: "Viết một hàm dùng được cho nhiều kiểu mà vẫn an toàn.",
  explanation: [
    "Generic dùng tham số kiểu <T> để giữ liên hệ giữa đầu vào và đầu ra.",
    "Hàm firstItem<number> trả về number, firstItem<string> trả về string, không cần ép kiểu.",
  ],
  code: `function firstItem<T>(items: T[]): T | undefined {
  return items[0];
}

const n = firstItem([10, 20, 30]);        // number | undefined
const s = firstItem(["a", "b"]);          // string | undefined
console.log(n, s);

interface Box<T> {
  value: T;
}

function wrap<T>(value: T): Box<T> {
  return { value };
}

const box = wrap({ id: 1, label: "demo" });
console.log(box.value.label.toUpperCase());

// Ràng buộc generic: T phải có thuộc tính length
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}
console.log(longest("typescript", "js"));
console.log(longest([1, 2, 3], [1]));
`,
};
