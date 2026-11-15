# TypeScript Demo

Web demo giới thiệu TypeScript, viết bằng Vanilla TypeScript (Vite). Chạy hoàn toàn trên trình duyệt, không cần backend.

## Chạy

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # kiểm tra kiểu + build production vào dist/
```

## Tính năng

- **Giới thiệu**: TypeScript là gì, vì sao dùng, bảng so sánh với JavaScript.
- **Playground**: editor Monaco báo lỗi kiểu theo thời gian thực. Nút Chạy (Ctrl+Enter) chạy code trong Web Worker bên trong iframe sandbox, có nút Dừng và tự dừng sau 5 giây (vòng lặp vô hạn không làm treo trang).
- **8 bài demo**: kiểu cơ bản, interface, generics, union/narrowing, enum/tuple, class/decorator, utility types, async. Nút "Bật dòng lỗi" gỡ comment các dòng cố tình sai kiểu.
- **So sánh JS/TS**: 4 ví dụ "JS chạy sai im lặng, TS báo lỗi" (chạy JS thật, kiểm tra kiểu thật), và xem JS thật sự được sinh ra từ code bài hiện tại.
- **Đố vui**: 8 câu "đoạn code này có lỗi kiểu không?", chạm để trả lời, xem giải thích và mở đoạn code trong tab Code.
- **Giao diện điện thoại** (mobile-first): thanh tab ở đáy, danh sách bài là một màn riêng, nút Chạy nổi trong tầm ngón cái, code tự xuống dòng và mặc định chỉ để xem (bấm "Sửa code" mới hiện bàn phím). Trang giới thiệu có mã QR để khán giả quét. Có manifest PWA nên thêm được vào màn hình chính.
- Chia sẻ code qua URL (`#code=...`), router theo hash (`#intro`, `#playground`, `#compare`, `#lesson=<id>`), giao diện sáng/tối, responsive.
- Monaco (~4 MB) được tải lười sau khi trang giới thiệu đã hiện.

## Deploy

`.github/workflows/pages.yml` (ở gốc repo) build thư mục `demo` và đưa `dist/` lên GitHub Pages khi push vào `main`. Cần bật Settings > Pages > Source: GitHub Actions. `base: "./"` trong `vite.config.ts` đã sẵn sàng cho việc này. Workflow chưa được chạy thử.

## Giới hạn

- Code người dùng chạy trong worker nên không có DOM. `import`/`require` chưa được hỗ trợ.
- Log tối đa 1000 dòng mỗi lần chạy.

## Cấu trúc

```
src/
  main.ts            ghép giao diện và logic
  types.ts           Lesson, RunState (discriminated union), SandboxMessage...
  lessons/           mỗi bài một file, index.ts gom lại; traps.ts là các ví dụ cho tab So sánh
  components/        Editor, Console, LessonList, Compare, Intro
  lib/               runner (biên dịch + sandbox), share (URL), dom (helper có kiểu)
```

Thêm bài mới: tạo một file `Lesson` trong `src/lessons/` rồi thêm vào mảng ở `src/lessons/index.ts`.
