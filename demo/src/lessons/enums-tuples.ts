import type { Lesson } from "../types";

export const enumsTuples: Lesson = {
  id: "enums-tuples",
  title: "Enum & tuple",
  summary: "Tập hằng có tên và mảng có độ dài, kiểu cố định.",
  explanation: [
    "Enum đặt tên cho một tập giá trị. Tuple là mảng có số phần tử và kiểu từng vị trí xác định.",
  ],
  expectedErrors: [
    "const bad: [number, number] = [1, \"2\"];",
  ],
  code: `enum Status {
  Pending,
  Active,
  Done,
}

const current: Status = Status.Active;
console.log("Status:", Status[current], "=", current);

// Tuple: [kiểu vị trí 0, kiểu vị trí 1]
const point: [number, number] = [10, 20];
const entry: [string, boolean] = ["darkMode", true];
const [x, y] = point;
console.log("x + y =", x + y, "| entry:", entry);

// Bỏ comment để thấy lỗi:
// const bad: [number, number] = [1, "2"];
`,
};
