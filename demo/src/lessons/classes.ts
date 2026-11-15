import type { Lesson } from "../types";

export const classes: Lesson = {
  id: "classes",
  title: "Class & decorators",
  summary: "Access modifier, readonly và decorator.",
  explanation: [
    "TypeScript thêm public / private / protected vào class và cho phép khai báo thuộc tính ngay ở constructor.",
    "Decorator ở đây dùng dạng experimentalDecorators đã được bật trong playground.",
  ],
  expectedErrors: [
    "acc.balance = 1_000_000;   // private",
  ],
  code: `function sealed(constructor: Function): void {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class Account {
  private balance = 0;

  constructor(public readonly owner: string) {}

  deposit(amount: number): void {
    if (amount <= 0) throw new Error("Số tiền phải lớn hơn 0");
    this.balance += amount;
  }

  get total(): number {
    return this.balance;
  }
}

const acc = new Account("Lan");
acc.deposit(500);
console.log(acc.owner, "có", acc.total);

// Bỏ comment để thấy lỗi:
// acc.balance = 1_000_000;   // private
`,
};
