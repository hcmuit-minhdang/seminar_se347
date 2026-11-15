import { useEffect, useState } from 'react'
import type { ZodType } from 'zod'

// [TS #8] Generic hook: T được suy ra từ schema, dùng lại cho bất kỳ kiểu dữ liệu nào.
// Dữ liệu đọc từ localStorage là "không đáng tin" -> validate bằng Zod trước khi dùng.
export function useLocalStorage<T>(key: string, schema: ZodType<T>, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return initial
      const parsed = schema.safeParse(JSON.parse(raw))
      return parsed.success ? parsed.data : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}
