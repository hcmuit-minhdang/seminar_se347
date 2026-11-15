# Kế hoạch: Web demo ngôn ngữ TypeScript

## 1. Mục tiêu
- Giúp người xem hiểu TypeScript khác JavaScript ở đâu và bắt lỗi như thế nào.
- Cho người xem tự gõ code và thấy kết quả ngay trên trình duyệt, không cần cài đặt.
- Bản thân web được viết chủ yếu bằng TypeScript (Vanilla TS, không framework), source code cũng là một ví dụ về TS.

## 2. Tính năng
1. **Trang giới thiệu**: TypeScript là gì, vì sao dùng, so sánh nhanh với JS.
2. **Playground**: editor Monaco, báo lỗi kiểu theo thời gian thực, nút Run, panel console.
3. **Bài demo theo chủ đề** (mỗi bài có code mẫu + giải thích ngắn):
   - Kiểu cơ bản và type inference
   - Interface và type alias
   - Generics
   - Union, intersection, narrowing
   - Enum và tuple
   - Class, access modifier, decorators
   - Utility types (`Partial`, `Pick`, `Omit`, `Record`)
4. **So sánh JS và TS** song song: cùng một đoạn code, JS chạy sai im lặng, TS báo lỗi ngay.
5. **Chia sẻ code** qua URL hash.
6. **Giao diện**: dark/light mode, responsive.

## 3. Công nghệ
| Phần | Lựa chọn | Ghi chú |
|---|---|---|
| Build | Vite + TypeScript (`strict: true`) | Nhanh, cấu hình ít |
| UI | Vanilla TS | Component dạng class/hàm, thao tác DOM có kiểu |
| Editor | `monaco-editor` | Gợi ý và báo lỗi như VS Code |
| Compile trong trình duyệt | gói `typescript` | `ts.transpileModule` để chạy, language service của Monaco để báo lỗi |
| Style | CSS thuần | Biến CSS cho dark mode |
| Deploy | GitHub Pages hoặc Vercel | Static site, không cần backend |

## 4. Cấu trúc thư mục
```
src/
  main.ts              // khởi động app, router hash
  types.ts             // Lesson, RunResult, Theme... (interface, union)
  components/
    Editor.ts          // bọc Monaco
    Console.ts         // hiển thị log
    LessonList.ts
    Compare.ts         // so sánh JS vs TS
  lessons/
    index.ts           // Lesson[]
    generics.ts
    unions.ts
    interfaces.ts
    utility-types.ts
  lib/
    runner.ts          // transpile + chạy code trong iframe sandbox
    share.ts           // mã hóa code vào URL hash
    dom.ts             // helper el<K extends keyof HTMLElementTagNameMap>()
  styles.css
index.html
tsconfig.json
vite.config.ts
```

## 5. Điểm nhấn kỹ thuật
- Mỗi bài học là một object có kiểu `Lesson { id; title; explanation; code; expectedErrors? }`; thêm bài mới chỉ cần thêm một file.
- Helper DOM dùng **generics** và **mapped types**.
- Trạng thái app dùng **discriminated union** (`idle | running | error | success`).
- Code người dùng chạy trong **iframe sandbox**, gửi log về bằng `postMessage` (message có kiểu).
- Lazy load Monaco để trang tải nhanh.

## 6. Các giai đoạn
| # | Giai đoạn | Kết quả |
|---|---|---|
| 1 | Khởi tạo | Vite + vanilla-ts, bật `strict`, layout và điều hướng |
| 2 | Playground | Monaco + báo lỗi TS realtime |
| 3 | Runner | Transpile → iframe sandbox → console |
| 4 | Nội dung | 6–8 bài demo + danh sách bài |
| 5 | Tính năng phụ | So sánh JS/TS, chia sẻ URL, dark mode, responsive |
| 6 | Hoàn thiện | Tối ưu tải, deploy, viết README |

## 7. Tiêu chí hoàn thành
- Gõ code sai kiểu thì thấy gạch đỏ và thông báo lỗi ngay.
- Nhấn Run thì thấy output trong console, code lỗi runtime không làm sập trang.
- Chuyển giữa các bài demo mượt, link chia sẻ mở lại đúng code.
- Dùng tốt trên điện thoại, build không có lỗi TS.
- Đã deploy và có link truy cập.

## 8. Rủi ro và lưu ý
- Monaco và gói `typescript` khá nặng: dùng lazy load, chia chunk trong Vite.
- Chạy code người dùng: bắt buộc dùng iframe `sandbox`, không `eval` trong trang chính.
- Decorators cần bật đúng cờ trong compiler options của playground.

## 9. Cần xác nhận trước khi làm
- Nơi đặt project (thư mục nào trên máy).
- Phạm vi: làm đủ như trên hay bản gọn (playground + vài bài mẫu).
