type Child = Node | string | null | undefined | false;

interface ElOptions<K extends keyof HTMLElementTagNameMap> {
  class?: string;
  text?: string;
  attrs?: Record<string, string>;
  props?: Partial<HTMLElementTagNameMap[K]>;
  on?: {
    [E in keyof HTMLElementEventMap]?: (ev: HTMLElementEventMap[E]) => void;
  };
}

/** Tạo phần tử DOM có kiểu: tên thẻ quyết định kiểu trả về (generics + mapped types). */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: ElOptions<K> = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (options.class) node.className = options.class;
  if (options.text) node.textContent = options.text;
  if (options.attrs) {
    for (const [k, v] of Object.entries(options.attrs)) node.setAttribute(k, v);
  }
  if (options.props) Object.assign(node, options.props);
  if (options.on) {
    for (const [name, handler] of Object.entries(options.on)) {
      node.addEventListener(name, handler as EventListener);
    }
  }
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child);
  }
  return node;
}

export function $<T extends Element>(selector: string, root: ParentNode = document): T {
  const found = root.querySelector<T>(selector);
  if (!found) throw new Error(`Không tìm thấy phần tử: ${selector}`);
  return found;
}
