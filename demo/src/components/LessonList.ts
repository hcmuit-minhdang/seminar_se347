import type { Lesson } from "../types";
import { el } from "../lib/dom";

export interface LessonListInstance {
  setActive(id: string): void;
}

export function createLessonList(
  container: HTMLElement,
  lessons: readonly Lesson[],
  onSelect: (l: Lesson) => void
): LessonListInstance {
  const itemsMap = new Map<string, HTMLElement>();

  function setActive(id: string): void {
    for (const [lessonId, itemEl] of itemsMap.entries()) {
      if (lessonId === id) {
        itemEl.classList.add("active");
        itemEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      } else {
        itemEl.classList.remove("active");
      }
    }
  }

  const header = el(
    "div",
    { class: "lesson-list-header" },
    el("h2", { class: "lesson-list-title", text: "Danh sách bài học" }),
    el("span", {
      class: "lesson-count-badge",
      text: `${lessons.length}`,
    })
  );

  const lessonItems = lessons.map((lesson) => {
    const itemBtn = el(
      "button",
      {
        class: "lesson-item",
        attrs: {
          type: "button",
          "data-id": lesson.id,
          title: lesson.title,
        },
        on: {
          click: () => {
            setActive(lesson.id);
            onSelect(lesson);
          },
        },
      },
      el("div", { class: "lesson-item-title", text: lesson.title }),
      el("div", { class: "lesson-item-summary", text: lesson.summary })
    );

    itemsMap.set(lesson.id, itemBtn);
    return itemBtn;
  });

  const listContainer = el("div", { class: "lesson-list-items" }, ...lessonItems);
  const root = el("div", { class: "lesson-list-container" }, header, listContainer);

  container.replaceChildren(root);

  return {
    setActive,
  };
}
