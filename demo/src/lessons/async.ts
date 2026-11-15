import type { Lesson } from "../types";

export const async: Lesson = {
  id: "async",
  title: "Async / Promise có kiểu",
  summary: "Kiểu của giá trị mà Promise trả về.",
  explanation: [
    "async function luôn trả Promise<T>. TypeScript biết await sẽ cho ra kiểu T.",
  ],
  code: `interface Todo {
  id: number;
  title: string;
  done: boolean;
}

function fetchTodo(id: number): Promise<Todo> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id, title: "Học TypeScript", done: false }), 100);
  });
}

async function main(): Promise<void> {
  const todo = await fetchTodo(1); // todo: Todo
  console.log("Nhận được:", todo.title);
  const [a, b] = await Promise.all([fetchTodo(2), fetchTodo(3)]);
  console.log("Hai việc:", a.id, b.id);
}

main();
`,
};
