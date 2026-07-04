# PickleCity Tournament Manager V3.0.1 Fix Settings

Bản vá lỗi:
- Sửa lỗi `setTForm is not defined`
- Tab BTC chạy lại bình thường
- Giữ mục Cấu hình giải đấu trong BTC

Test sau deploy:
- /api/ping phải trả version: 3.0.1-fix-settings

Cloudflare:
- Build command: npm install && npm run build
- Output: dist
- D1 binding: DB -> picklecity-db

Mật khẩu BTC: PTC2026
