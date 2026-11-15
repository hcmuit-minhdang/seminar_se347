import { useMemo, useReducer, useEffect, useState } from 'react'
import { z } from 'zod'
import './App.css'
import { TaskForm } from './components/TaskForm'
import { TaskItem } from './components/TaskItem'
import { useLocalStorage } from './hooks/useLocalStorage'
import { taskReducer } from './taskReducer'
import { STATUS_LABEL, TaskSchema, type Filter, type Status, type Task } from './types'

const TasksSchema = z.array(TaskSchema)
const FILTERS: Filter[] = ['all', 'todo', 'doing', 'done']

export default function App() {
  const [saved, setSaved] = useLocalStorage<Task[]>('ts-demo-tasks', TasksSchema, [])
  const [tasks, dispatch] = useReducer(taskReducer, saved)
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => setSaved(tasks), [tasks, setSaved])

  const visible = useMemo(
    () => (filter === 'all' ? tasks : tasks.filter((t) => t.status === filter)),
    [tasks, filter],
  )

  // Record<Status, number>: TS bắt buộc đủ 3 khóa todo/doing/done
  const counts = useMemo(() => {
    const c: Record<Status, number> = { todo: 0, doing: 0, done: 0 }
    for (const t of tasks) c[t.status]++
    return c
  }, [tasks])

  return (
    <main className="app">
      <header>
        <h1>TS Task Manager</h1>
        <p className="sub">Demo seminar TypeScript · React + Vite + Zod</p>
      </header>

      <TaskForm onAdd={(payload) => dispatch({ type: 'add', payload })} />

      <nav className="filters">
        {FILTERS.map((f) => (
          <button key={f} className={f === filter ? 'active' : ''} onClick={() => setFilter(f)}>
            {f === 'all' ? `Tất cả (${tasks.length})` : `${STATUS_LABEL[f]} (${counts[f]})`}
          </button>
        ))}
      </nav>

      <ul className="list">
        {visible.map((t) => (
          <TaskItem
            key={t.id}
            task={t}
            onStatusChange={(id, status) => dispatch({ type: 'setStatus', id, status })}
            onRemove={(id) => dispatch({ type: 'remove', id })}
          />
        ))}
        {visible.length === 0 && <li className="empty">Chưa có công việc nào.</li>}
      </ul>

      {counts.done > 0 && (
        <button className="clear" onClick={() => dispatch({ type: 'clearDone' })}>
          Xóa các việc đã hoàn thành
        </button>
      )}
    </main>
  )
}
