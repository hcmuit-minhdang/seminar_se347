import type { Lesson } from "../types";

export const utilityTypes: Lesson = {
  id: "utility-types",
  title: "Utility types",
  summary: "Partial, Pick, Omit, Record, Readonly.",
  explanation: [
    "Utility types biến đổi một kiểu có sẵn thành kiểu mới mà không phải viết lại.",
  ],
  expectedErrors: [
    "const wrong: ProductPreview = { id: 1, name: \"x\", price: 5 };",
  ],
  code: `interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

type ProductPreview = Pick<Product, "id" | "name">;
type NewProduct = Omit<Product, "id">;
type ProductPatch = Partial<Product>;
type Prices = Record<string, number>;

const preview: ProductPreview = { id: 1, name: "Bàn phím" };
const draft: NewProduct = { name: "Chuột", price: 250, stock: 10 };
const patch: ProductPatch = { price: 199 };
const prices: Prices = { banphim: 450, chuot: 250 };

console.log(preview, draft, patch);
console.log("Tổng giá:", Object.values(prices).reduce((a, b) => a + b, 0));

// Bỏ comment để thấy lỗi:
// const wrong: ProductPreview = { id: 1, name: "x", price: 5 };
`,
};
