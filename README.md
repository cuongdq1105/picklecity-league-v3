# PickleCity Tournament Manager V3.0.2 Fix BTC Imports

Bản vá lỗi:
- Sửa lỗi tab BTC không chạy do thiếu import icon Settings / CalendarDays / GitBranch.
- Giữ bản vá setTForm.
- Giữ mục Cấu hình giải đấu trong BTC.

Test sau deploy:
- /api/ping phải trả version: 3.0.2-fix-btc-imports

Cloudflare:
- Build command: npm install && npm run build
- Output: dist
- D1 binding: DB -> picklecity-db

Mật khẩu BTC: PTC2026
