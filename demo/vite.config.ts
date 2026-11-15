import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    // Monaco nặng khoảng 4 MB nhưng được tải lười (dynamic import) sau khi trang giới thiệu đã hiện,
    // nên chỉ nâng ngưỡng cảnh báo cho đúng chunk đó.
    chunkSizeWarningLimit: 4500,
  },
});
