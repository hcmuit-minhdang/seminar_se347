import type { Question } from "../types";

export const questions: readonly Question[] = [
  {
    id: "number-string",
    code: `let age: number = "20";`,
    hasError: true,
    explain: "Biến khai báo là number nhưng được gán chuỗi \"20\". TypeScript báo lỗi ngay khi gõ.",
  },
  {
    id: "push-string",
    code: `const nums = [1, 2, 3];
nums.push("4");`,
    hasError: true,
    explain: "TypeScript tự suy ra nums là number[], nên không thể push một chuỗi vào.",
  },
  {
    id: "hello-ok",
    code: `function hello(name: string) {
  return "Xin chào " + name;
}
hello("An");`,
    hasError: false,
    explain: "Truyền đúng kiểu string nên không có lỗi.",
  },
  {
    id: "missing-prop",
    code: `interface User {
  id: number;
  name: string;
}
const u: User = { id: 1 };`,
    hasError: true,
    explain: "Thiếu thuộc tính bắt buộc name. Interface buộc object phải đủ các trường.",
  },
  {
    id: "map-ok",
    code: `const doubled = [1, 2, 3].map((n) => n * 2);
console.log(doubled.length);`,
    hasError: false,
    explain: "map trả về number[], có thuộc tính length. Mọi thứ đều hợp lệ.",
  },
  {
    id: "bad-literal",
    code: `type Role = "admin" | "user";
const r: Role = "guest";`,
    hasError: true,
    explain: "Role chỉ cho phép \"admin\" hoặc \"user\". \"guest\" không nằm trong union.",
  },
  {
    id: "union-ok",
    code: `let v: string | number = 5;
v = "five";`,
    hasError: false,
    explain: "v được phép là string hoặc number, nên gán lại bằng chuỗi vẫn hợp lệ.",
  },
  {
    id: "extra-prop",
    code: `const user = { name: "An" };
user.age = 20;`,
    hasError: true,
    explain: "Object user không có thuộc tính age. TypeScript không cho thêm thuộc tính tuỳ ý.",
  },
];
