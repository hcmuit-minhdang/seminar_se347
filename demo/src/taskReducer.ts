import type { NewTask, Status, Task } from './types'

// [TS #6] Discriminated union: trường `type` giúp TS biết action nào có payload gì
export type TaskAction =
  | { type: 'add'; payload: NewTask }
  | { type: 'remove'; id: string }
  | { type: 'setStatus'; id: string; status: Status }
  | { type: 'rename'; id: string; title: string }
  | { type: 'clearDone' }

export function taskReducer(state: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case 'add':
      // Trong nhánh này TS biết action.payload tồn tại (type narrowing)
      return [
        {
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          status: 'todo',
          ...action.payload,
        },
        ...state,
      ]
    case 'remove':
      return state.filter((t) => t.id !== action.id)
    case 'setStatus':
      return state.map((t) => (t.id === action.id ? { ...t, status: action.status } : t))
    case 'rename':
      return state.map((t) => (t.id === action.id ? { ...t, title: action.title } : t))
    case 'clearDone':
      return state.filter((t) => t.status !== 'done')
    default: {
      // [TS #7] Exhaustive check: thêm action mới mà quên xử lý -> lỗi biên dịch ngay
      const _exhaustive: never = action
      return _exhaustive
    }
  }
}
