import type { Lesson } from "../types";

export const unions: Lesson = {
  id: "unions",
  title: "Union & narrowing",
  summary: "Một giá trị có thể là nhiều kiểu; thu hẹp bằng kiểm tra.",
  explanation: [
    "Union (A | B) cho phép nhiều kiểu. Dùng typeof, in hoặc trường phân biệt (kind) để thu hẹp.",
    "Discriminated union cùng switch giúp TypeScript kiểm tra bạn đã xử lý hết các trường hợp chưa.",
  ],
  code: `function format(value: string | number): string {
  if (typeof value === "string") {
    return value.toUpperCase(); // ở đây value là string
  }
  return value.toFixed(2);      // ở đây value là number
}
console.log(format("hello"), format(3.14159));

type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rect":
      return shape.width * shape.height;
  }
}

console.log(area({ kind: "circle", radius: 2 }).toFixed(2));
console.log(area({ kind: "rect", width: 3, height: 4 }));
`,
};
