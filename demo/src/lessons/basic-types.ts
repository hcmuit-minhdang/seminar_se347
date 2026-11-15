import type { Lesson } from "../types";

export const basicTypes: Lesson = {
  id: "basic-types",
  title: "Kiểu cơ bản & type inference",
  summary: "Khai báo kiểu và để TypeScript tự suy luận.",
  explanation: [
    "Gắn kiểu cho biến, tham số, giá trị trả về. Nếu bạn không ghi, TypeScript tự suy luận từ giá trị gán.",
    "Thử bỏ comment dòng cuối: gán chuỗi vào biến kiểu number sẽ báo lỗi ngay khi gõ, trước khi chạy.",
  ],
  expectedErrors: [
    "year = \"hai nghìn không trăm mười hai\";",
  ],
  code: `const language: string = "TypeScript";
let year = 2012; // tự suy luận: number
const tags: string[] = ["typed", "superset", "javascript"];

function describe(lang: string, since: number): string {
  return lang + " ra đời năm " + since;
}

console.log(describe(language, year));
console.log("Tags:", tags);

// Bỏ comment để thấy lỗi kiểu:
// year = "hai nghìn không trăm mười hai";
`,
};
