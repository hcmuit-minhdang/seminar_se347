import { useState, type FormEvent } from 'react'
import { PRIORITY_LABEL, type NewTask, type Priority } from '../types'

// [TS #9] Props có type: truyền sai kiểu/thiếu prop là báo lỗi ngay trong editor
type Props = {
  onAdd: (task: NewTask) => void
}

export function TaskForm({ onAdd }: Props) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd({ title: trimmed, priority })
    setTitle('')
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nhập công việc mới..."
        aria-label="Tên công việc"
      />
      <select
        value={priority}
        // Ép kiểu có kiểm soát: giá trị <option> do chính ta khai báo từ PRIORITY_LABEL
        onChange={(e) => setPriority(e.target.value as Priority)}
        aria-label="Độ ưu tiên"
      >
        {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
          <option key={p} value={p}>
            {PRIORITY_LABEL[p]}
          </option>
        ))}
      </select>
      <button type="submit">Thêm</button>
    </form>
  )
}
