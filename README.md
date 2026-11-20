# Seminar TypeScript (SE347, Nhóm 3)

- `demo/` – Sổ điểm viết bằng TypeScript (không cần framework): tính điểm trung bình môn theo tỉ lệ % riêng từng môn, GPA từng học kỳ, GPA tích lũy, xếp loại, môn học lại.
- `.github/workflows/pages.yml` – tự deploy `demo/` lên GitHub Pages khi push vào `main`.

## Chạy demo

```bash
cd demo
npm ci
npm run build        # biên dịch src/main.ts ra dist/main.js
```

Sau đó mở `demo/index.html` bằng trình duyệt (không cần server). Khi sửa code: `npm run watch`. Chỉ kiểm tra kiểu, không sinh file: `npm run check`.

Phiên bản TypeScript được ghim ở 7.0.2.

