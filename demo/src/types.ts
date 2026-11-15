import { z } from 'zod'

// [TS #1] Union type (literal types): chỉ cho phép đúng các giá trị này
export type Status = 'todo' | 'doing' | 'done'
export type Priority = 'low' | 'medium' | 'high'

// [TS #2] Zod schema: kiểm tra dữ liệu LÚC CHẠY (type của TS bị xóa sau khi build)
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  status: z.enum(['todo', 'doing', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  createdAt: z.number(),
})

// [TS #3] Suy ra type từ schema: viết 1 lần, dùng cho cả runtime lẫn compile time
export type Task = z.infer<typeof TaskSchema>

// [TS #4] Utility types: Omit để tạo type "dữ liệu nhập" từ Task
export type NewTask = Omit<Task, 'id' | 'createdAt' | 'status'>

// [TS #5] Filter: union của "all" và Status
export type Filter = Status | 'all'

export const STATUS_LABEL: Record<Status, string> = {
  todo: 'Cần làm',
  doing: 'Đang làm',
  done: 'Hoàn thành',
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: 'Thấp',
  medium: 'Vừa',
  high: 'Cao',
}
