# Kim Long Motor – Quản lý Vật Tư BOM

React + TypeScript + Vite, dữ liệu trên Supabase, deploy bằng Vercel.

## Cấu trúc
- `index.html` – trang gốc, nạp `/src/main.tsx`
- `src/main.tsx` – điểm khởi chạy
- `src/assets.ts` – ảnh base64 (icon đơn vị, logo xe buýt, icon dòng xe)
- `src/components/icons.tsx` – bộ icon SVG 3D/neon
- `src/utils.ts` – hằng số dữ liệu mặc định (BOM mẫu, dự án, người dùng, tab theo vai trò...) và hàm tiện ích thuần
- `src/i18n.ts` – từ điển đa ngữ Việt/Trung và bộ máy dịch DOM
- `src/styles.ts` – chuỗi CSS cho màn hình đăng nhập
- `src/supabaseClient.ts` – khởi tạo kết nối Supabase (đọc từ biến môi trường)
- `src/panels.tsx` – toàn bộ màn hình/component con dùng qua props (Đăng nhập, Phân quyền,
  CMS, Góp ý, xuất Excel/PDF...)
- `src/App.tsx` – component `App` chính: state, điều hướng, logic nghiệp vụ (Vật tư, Soạn hàng,
  Kiểm tra xác nhận, Phiếu GN, Báo cáo…)
- `src/index.css` – CSS toàn cục
- `public/` – file tĩnh: `manifest.json`, `favicon.svg`, `icons/`, `.well-known/assetlinks.json`

## Biến môi trường (Vercel / file `.env`, không đưa lên GitHub)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Chạy
```
npm install
npm run dev
npm run build
```
