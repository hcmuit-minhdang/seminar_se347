// Dùng để TRÌNH DIỄN lỗi: chạy `npm run demo:error` -> tsc báo lỗi, còn JS thuần thì im lặng.
// File này nằm ngoài thư mục src nên KHÔNG làm hỏng `npm run build`.

type Status = 'todo' | 'doing' | 'done'
interface Task { id: string; title: string; status: Status }

// Lỗi 1: gán giá trị không thuộc union type
const t1: Task = { id: '1', title: 'Học TS', status: 'finished' }

// Lỗi 2: truy cập thuộc tính không tồn tại (gõ nhầm)
console.log(t1.titel)

// Lỗi 3: sai kiểu tham số hàm
function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86400000)
}
addDays('2026-11-16', 1)

// Lỗi 4: có thể null/undefined (strict)
const el = document.getElementById('app')
el.textContent = 'hello'
