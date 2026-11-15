import { PRIORITY_LABEL, STATUS_LABEL, type Status, type Task } from '../types'

type Props = {
  task: Task
  onStatusChange: (id: string, status: Status) => void
  onRemove: (id: string) => void
}

const STATUSES = Object.keys(STATUS_LABEL) as Status[]

export function TaskItem({ task, onStatusChange, onRemove }: Props) {
  return (
    <li className={`item item--${task.status}`}>
      <div className="item__main">
        <span className="item__title">{task.title}</span>
        <span className={`badge badge--${task.priority}`}>{PRIORITY_LABEL[task.priority]}</span>
      </div>
      <div className="item__actions">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as Status)}
          aria-label="Trạng thái"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <button className="danger" onClick={() => onRemove(task.id)} aria-label="Xóa">
          Xóa
        </button>
      </div>
    </li>
  )
}
