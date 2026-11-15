# KẾ HOẠCH LÀM SLIDE – SEMINAR TYPESCRIPT

> Tài liệu giao cho thành viên làm slide. Mỗi slide đã có: **tiêu đề, nội dung cần đưa, hình/code minh họa, lời thuyết trình gợi ý**.
> Demo web nằm trong thư mục `ts-task-demo/` (các đoạn code trong slide lấy từ đó).

## 0. Thông tin chung

| Mục | Giá trị |
|---|---|
| Chủ đề | TypeScript: kiến thức, kỹ thuật, công cụ tích hợp phát triển web + demo |
| Thời lượng | ~15–20 phút (có thể rút gọn, xem mục 4) |
| Số slide | 16 slide (không tính slide bìa và slide cảm ơn) |
| Tỉ lệ | 16:9 |
| Ngôn ngữ | Tiếng Việt, giữ nguyên thuật ngữ tiếng Anh (type, interface, generic...) |

### Quy tắc thiết kế (để các slide đồng nhất)
- Màu chủ đạo: **xanh TypeScript `#3178C6`**, nền trắng hoặc xám rất nhạt, chữ đen/xám đậm. Màu nhấn lỗi: đỏ `#D64545`, màu đúng: xanh lá `#2E9D5B`.
- Font: Segoe UI / Inter cho chữ; **JetBrains Mono / Consolas** cho code.
- Mỗi slide **tối đa 5 gạch đầu dòng**, mỗi dòng không quá 12 từ. Chi tiết để người nói trình bày.
- Code trong slide: **tối đa 10 dòng**, cỡ chữ ≥ 18pt, tô sáng (highlight) dòng quan trọng. Nên chụp ảnh code từ VS Code (theme sáng hoặc Dark+) hoặc dùng carbon.now.sh.
- Mỗi slide có **số trang** và (nếu có) **nguồn** ở chân slide.
- Không chép nguyên văn tài liệu; viết lại ngắn gọn bằng lời của mình.

### Phân công gợi ý (3–4 người)
| Người | Slide |
|---|---|
| A | Bìa, 1–4 (mở đầu + kiến thức cốt lõi) |
| B | 5–9 (kỹ thuật nâng cao) |
| C | 10–13 (công cụ + tích hợp web) |
| D (người demo) | 14–16, cảm ơn, kiểm tra tổng thể, xuất PDF |

---

## 1. Chi tiết từng slide

### Slide bìa
- Tiêu đề: **TypeScript – JavaScript có kiểu dữ liệu cho phát triển web**
- Phụ đề: Seminar giữa kì · Tên môn · Tên nhóm · Danh sách thành viên + MSSV · Giảng viên
- Hình: logo TypeScript (TS nền xanh vàng).

---

### PHẦN 1 – GIỚI THIỆU

**Slide 1 – Vấn đề của JavaScript**
- JavaScript là ngôn ngữ **động**: kiểu dữ liệu chỉ được xác định khi chạy.
- Lỗi chỉ lộ ra **lúc chạy (runtime)**, thường là khi người dùng đã dùng.
- Dự án lớn: khó đọc, khó refactor, khó làm việc nhóm.
- Hình/code minh họa (2 cột "JS thuần"):
  ```js
  function total(price, qty) { return price * qty }
  total("100", 2)      // 200  (đúng do ép kiểu ngầm)
  total("abc", 2)      // NaN  (không báo lỗi!)
  user.nmae            // undefined (gõ sai tên, không báo lỗi)
  ```
- Lời nói: "Các lỗi này JS không báo, chương trình vẫn chạy và cho kết quả sai."

**Slide 2 – TypeScript là gì?**
- **Superset** của JavaScript: mọi code JS hợp lệ đều là code TS hợp lệ.
- Thêm **hệ thống kiểu tĩnh (static typing)**, kiểm tra lúc viết code/biên dịch.
- Do Microsoft phát triển, ra mắt 2012, mã nguồn mở (tác giả chính: Anders Hejlsberg, cha đẻ C#).
- Trình duyệt **không chạy TS trực tiếp** → biên dịch (transpile) ra JS.
- Hình: sơ đồ `file.ts → tsc (kiểm tra kiểu + biên dịch) → file.js → Trình duyệt / Node.js`. Vẽ bằng 4 hộp nối bằng mũi tên.

**Slide 3 – Vì sao nên dùng TypeScript?**
- Bắt lỗi **ngay khi gõ code**, không đợi đến lúc chạy.
- **Autocomplete/IntelliSense** mạnh hơn, code tự làm tài liệu.
- **Refactor an toàn**: đổi tên, đổi cấu trúc dữ liệu, editor chỉ ra mọi chỗ bị ảnh hưởng.
- Phù hợp dự án lớn và làm việc nhóm.
- Hình: 3 icon + 3 cụm từ ngắn: "Bắt lỗi sớm / Gợi ý thông minh / Refactor an toàn".
- *(Tuỳ chọn)* Thêm 1 số liệu về mức độ phổ biến, **lấy từ Stack Overflow Developer Survey hoặc State of JS mới nhất** và ghi rõ nguồn + năm. Không dùng số liệu chưa kiểm chứng.

**Slide 4 – Kiểu cơ bản và Type Inference**
- Kiểu nguyên thủy: `string`, `number`, `boolean`, `null`, `undefined`.
- Mảng, tuple: `string[]`, `[string, number]`.
- **Type inference**: TS tự suy ra kiểu, không cần khai báo thừa.
- `any` (tắt kiểm tra, nên tránh) vs `unknown` (an toàn hơn, phải kiểm tra kiểu trước khi dùng).
- Code:
  ```ts
  let name: string = "An"
  let age = 20                    // TS tự suy ra: number
  let tags: string[] = ["ts", "web"]
  age = "hai mươi"                // ❌ Lỗi: string không gán được cho number
  ```

---

### PHẦN 2 – KIẾN THỨC CỐT LÕI VÀ KỸ THUẬT NÂNG CAO

**Slide 5 – `interface` và `type`**
- Dùng để mô tả **hình dạng (shape)** của object.
- `interface`: mở rộng bằng `extends`, có thể khai báo gộp (declaration merging).
- `type`: linh hoạt hơn, dùng được cho union, tuple, kiểu tính toán.
- Quy ước thường gặp: object dùng `interface`, còn lại dùng `type`. Cả hai đều dùng được, nhóm nên thống nhất một quy ước.
- Code (2 cột so sánh):
  ```ts
  interface User { id: number; name: string }
  interface Admin extends User { role: "admin" }

  type Point = { x: number; y: number }
  type ID = string | number
  ```
- Bảng nhỏ so sánh: `extends` / union / merging / tuple.

**Slide 6 – Union, Literal types và Type Narrowing**
- **Union** (`|`): một giá trị có thể là một trong nhiều kiểu.
- **Literal type**: giới hạn đúng các giá trị cho phép → thay cho "chuỗi tự do".
- **Narrowing**: TS thu hẹp kiểu trong từng nhánh `if` (`typeof`, `in`, `===`).
- Code **lấy từ demo** `src/types.ts`:
  ```ts
  type Status = 'todo' | 'doing' | 'done'
  type Filter = Status | 'all'

  function show(id: string | number) {
    if (typeof id === 'string') id.toUpperCase()   // id: string
    else id.toFixed(2)                              // id: number
  }
  ```

**Slide 7 – Generics**
- "Tham số hóa kiểu": viết **một lần**, dùng cho **nhiều kiểu** mà vẫn an toàn.
- Giải thích bằng ví dụ đời thường: "cái hộp đựng `T`".
- Có thể ràng buộc: `<T extends { id: string }>`.
- Code:
  ```ts
  function first<T>(arr: T[]): T | undefined { return arr[0] }
  first([1, 2, 3])       // number | undefined
  first(["a", "b"])      // string | undefined
  ```
- Liên hệ demo: hook `useLocalStorage<T>` trong `src/hooks/useLocalStorage.ts`.

**Slide 8 – Utility Types**
- Kiểu có sẵn giúp **biến đổi** type cũ thành type mới, không phải viết lại.
- Các loại hay dùng: `Partial<T>`, `Required<T>`, `Pick<T,K>`, `Omit<T,K>`, `Record<K,V>`, `Readonly<T>`.
- Hình: bảng "Type gốc → Utility → Kết quả". Ví dụ với `Task`:
  ```ts
  type NewTask = Omit<Task, 'id' | 'createdAt' | 'status'>   // chỉ còn title, priority
  type TaskPatch = Partial<Task>                              // mọi trường đều tùy chọn
  const label: Record<Status, string> = { todo: '...', doing: '...', done: '...' }
  ```
- Lưu ý: `Record<Status, string>` **bắt buộc đủ 3 khóa**, thiếu là lỗi. Nhắc lại ở demo.

**Slide 9 – Discriminated Union và Exhaustive Check**
- Mỗi biến thể có một trường "nhãn" (`type`) để TS biết đang là biến thể nào.
- Dùng rất nhiều trong state management (reducer, Redux).
- Kiểm tra `never`: thêm biến thể mới mà quên xử lý → **lỗi biên dịch**.
- Code **lấy từ demo** `src/taskReducer.ts` (cắt gọn):
  ```ts
  type TaskAction =
    | { type: 'add'; payload: NewTask }
    | { type: 'remove'; id: string }
    | { type: 'clearDone' }

  switch (action.type) {
    case 'add':    action.payload   // TS biết payload tồn tại
    case 'remove': action.id
    default: const _x: never = action   // quên case mới là báo lỗi
  }
  ```

---

### PHẦN 3 – CÔNG CỤ VÀ TÍCH HỢP PHÁT TRIỂN WEB

**Slide 10 – Trình biên dịch `tsc` và `tsconfig.json`**
- `npm i -D typescript` → `npx tsc` biên dịch/kiểm tra kiểu.
- `tsconfig.json` quyết định cách biên dịch.
- Tùy chọn quan trọng nhất: **`"strict": true`** (bật toàn bộ kiểm tra nghiêm ngặt; khuyến nghị bật ở mọi dự án).
- Các tùy chọn khác: `target`, `module`, `jsx`, `noUnusedLocals`.
- Code: trích `tsconfig.app.json` của demo (khoảng 8 dòng).
- Nói thêm: TS có bản trình biên dịch mới viết lại bằng ngôn ngữ hiệu năng cao nên nhanh hơn rất nhiều (demo đang dùng TypeScript 7). **Kiểm tra lại thông tin phiên bản trên trang chính thức trước khi đưa vào slide.**

**Slide 11 – Công cụ build và chạy**
- **Vite**: dev server nhanh, hỗ trợ TS sẵn (dùng esbuild/Rolldown để chuyển TS → JS).
- Lưu ý: bundler **chỉ xóa type, không kiểm tra type** → vẫn cần `tsc --noEmit` (script `typecheck` trong demo).
- Chạy TS trực tiếp trên Node: `tsx`, `ts-node`.
- Hình: bảng 3 cột: Công cụ | Vai trò | Lệnh ví dụ.

**Slide 12 – Chất lượng code: ESLint, Prettier, Testing**
- **typescript-eslint**: luật lint hiểu type (cấm `any` bừa bãi, bắt promise không `await`...).
- **Prettier**: format thống nhất cho cả nhóm.
- **Vitest / Jest** (+ Testing Library): test có type.
- Demo dùng `oxlint` (có sẵn trong template Vite mới), nói "ESLint/oxlint đều được".
- Hình: logo các công cụ xếp hàng ngang (lấy logo từ trang chính thức).

**Slide 13 – Hệ sinh thái và tích hợp với framework**
- **Thư viện JS cũ**: gói type từ **DefinitelyTyped** (`npm i -D @types/lodash`), nhiều thư viện mới có type sẵn.
- **Frontend**: React (`.tsx`), Next.js, Vue 3, **Angular** (viết hoàn toàn bằng TS).
- **Backend**: Node.js + Express/**NestJS**; **Prisma** (ORM sinh type từ DB); **tRPC** (chia sẻ type FE ↔ BE).
- **Zod**: kiểm tra dữ liệu lúc chạy và suy ra type (xem demo).
- Hình: sơ đồ 3 tầng: *Frontend ↔ API ↔ Database*, đặt dòng "một bộ type dùng chung" ở giữa.

---

### PHẦN 4 – DEMO VÀ KẾT LUẬN

**Slide 14 – Giới thiệu demo: TS Task Manager**
- Ứng dụng quản lý công việc: React + Vite + TypeScript + Zod.
- Chức năng: thêm/xóa việc, đổi trạng thái, lọc, lưu `localStorage`.
- Chụp **1 ảnh màn hình** ứng dụng đang chạy (đã có dữ liệu mẫu).
- Hình: cây thư mục rút gọn và "bản đồ" các kỹ thuật TS được dùng:

  | File | Kỹ thuật |
  |---|---|
  | `src/types.ts` | union, literal, Record, Omit, `z.infer` |
  | `src/taskReducer.ts` | discriminated union, narrowing, `never` |
  | `src/hooks/useLocalStorage.ts` | generic + validate bằng Zod |
  | `src/components/*.tsx` | props có type, event type |

**Slide 15 – Kịch bản demo trực tiếp (slide chuyển sang màn hình thật)**
Slide chỉ ghi gọn 4 bước để người nói theo dõi; phần còn lại làm trên máy:
1. Chạy `npm run dev`, thao tác thêm/lọc việc (30 giây).
2. Mở `types.ts` và `taskReducer.ts` chỉ ra các kỹ thuật trên.
3. **Bắt lỗi trực tiếp** (điểm nhấn): sửa `status: 'finished'` hoặc gõ `t.titel` → editor gạch đỏ. Chạy `npm run demo:error` để xem `tsc` báo 4 lỗi mà JS thuần không báo gì.
4. Thêm một action mới vào `TaskAction` mà chưa xử lý → `tsc` báo lỗi nhờ kiểm tra `never`.

**Slide 16 – Ưu/nhược điểm và khi nào nên dùng**
- Bảng 2 cột:

  | Ưu điểm | Nhược điểm |
  |---|---|
  | Bắt lỗi sớm, code dễ đọc, refactor an toàn | Thêm bước biên dịch/cấu hình |
  | Gợi ý code mạnh, hệ sinh thái lớn | Cần thời gian học (generic, utility types) |
  | Phù hợp dự án lớn, làm nhóm | Type chỉ có lúc build, không bảo vệ dữ liệu lúc chạy (cần Zod) |

- Dòng kết: "Dự án nhỏ/script nhanh: JS vẫn ổn. Dự án lớn, nhiều người: nên dùng TS."

### Slide cảm ơn / Q&A
- "Cảm ơn thầy/cô và các bạn đã lắng nghe"
- Link GitHub demo + QR code.
- **Tài liệu tham khảo**: typescriptlang.org/docs, TypeScript Handbook, vite.dev, zod.dev, DefinitelyTyped.

---

## 2. Câu hỏi dự kiến và đáp án ngắn (để người nói chuẩn bị, có thể làm slide phụ)

| Câu hỏi | Trả lời ngắn |
|---|---|
| TS khác JS thế nào? | TS thêm kiểu tĩnh, được biên dịch ra JS; JS động và chạy trực tiếp. |
| `any` vs `unknown`? | `any` tắt kiểm tra; `unknown` buộc phải kiểm tra kiểu trước khi dùng. |
| `interface` vs `type`? | Gần như tương đương cho object; `interface` có declaration merging, `type` linh hoạt hơn (union, tuple). |
| Type có tồn tại lúc chạy không? | Không, bị xóa khi biên dịch → dùng Zod để validate dữ liệu từ bên ngoài. |
| Vì sao Vite không báo lỗi type? | Vite chỉ chuyển TS sang JS; kiểm tra type do `tsc`/editor đảm nhiệm. |
| Khi nào không nên dùng TS? | Script nhỏ, prototype nhanh, đội chưa quen và deadline gấp. |

## 3. Checklist hoàn thiện slide
- [ ] Đủ slide theo kế hoạch, thứ tự đúng, có số trang
- [ ] Mọi đoạn code đã **chạy thử** (copy vào VS Code, không có lỗi ngoài ý muốn)
- [ ] Số liệu/phiên bản có nguồn và năm
- [ ] Ảnh chụp demo rõ nét, không lộ thông tin cá nhân
- [ ] Đã xuất bản **PDF dự phòng** và copy vào USB/Drive
- [ ] Cả nhóm xem lại 1 lượt, **tập nói thử đủ thời gian**

## 4. Nếu thời gian bị giới hạn (≤ 10 phút)
Giữ: Bìa, 1, 2, 3, 6, 8, 9, 13, 14–15, 16. Bỏ: 4, 5, 7, 10, 11, 12 (chuyển thành slide phụ để trả lời câu hỏi).
