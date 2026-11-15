import type { Lesson } from "../types";

export const interfaces: Lesson = {
  id: "interfaces",
  title: "Interface & type alias",
  summary: "Mô tả hình dạng của object.",
  explanation: [
    "Interface và type alias đều mô tả cấu trúc dữ liệu. Thiếu thuộc tính bắt buộc, TypeScript báo lỗi.",
    "Thuộc tính có dấu ? là tuỳ chọn, readonly là không cho gán lại.",
  ],
  expectedErrors: [
    "console.log(greet(an, \"owner\"));   // \"owner\" không thuộc Role",
    "an.id = 2;                         // readonly",
  ],
  code: `interface User {
  readonly id: number;
  name: string;
  email?: string; // tuỳ chọn
}

type Role = "admin" | "editor" | "viewer";

function greet(user: User, role: Role): string {
  const contact = user.email ?? "chưa có email";
  return "Chào " + user.name + " (" + role + ") - " + contact;
}

const an: User = { id: 1, name: "An" };
console.log(greet(an, "admin"));

// Bỏ comment để thấy lỗi:
// console.log(greet(an, "owner"));   // "owner" không thuộc Role
// an.id = 2;                         // readonly
`,
};
