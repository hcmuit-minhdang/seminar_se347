# TS Task Manager – Demo seminar TypeScript

React + Vite + TypeScript + Zod. Quản lý công việc (thêm, xóa, đổi trạng thái, lọc, lưu localStorage).

## Chạy

```bash
npm install
npm run dev          # chạy web (mặc định http://localhost:5173)
npm run typecheck    # tsc kiểm tra kiểu (Vite KHÔNG kiểm tra kiểu)
npm run build        # tsc -b && vite build
npm run demo:error   # trình diễn: tsc báo 4 lỗi trong demo-errors/errors.ts
```

## Các kỹ thuật TypeScript (tìm comment `[TS #n]` trong code)

| File | Kỹ thuật |
|---|---|
| `src/types.ts` | union/literal type, `Record`, `Omit`, `z.infer` |
| `src/taskReducer.ts` | discriminated union, type narrowing, kiểm tra `never` |
| `src/hooks/useLocalStorage.ts` | generic `<T>` + validate dữ liệu bằng Zod |
| `src/components/*.tsx` | props có type, event type |
| `demo-errors/errors.ts` | 4 lỗi cố ý để trình diễn `tsc` |

## Kịch bản demo (3–5 phút)
1. `npm run dev`, thêm vài việc, đổi trạng thái, lọc.
2. Mở `types.ts`, `taskReducer.ts`: chỉ các kỹ thuật ở bảng trên.
3. Trong `taskReducer.ts`, thêm `| { type: 'archive' }` vào `TaskAction` → editor báo đỏ ở nhánh `default` (kiểm tra `never`). Hoàn tác sau khi demo.
4. Mở `demo-errors/errors.ts` và chạy `npm run demo:error`.
