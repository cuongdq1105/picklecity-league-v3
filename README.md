# PickleCity Tournament Manager V2.5 Dashboard Filter

Tính năng mới:
- Danh sách công khai có tổng VĐV, đã BTC xác nhận, chưa xác nhận
- Dashboard BTC có bộ lọc theo thanh toán, hạng, giới tính
- Tìm kiếm theo tên/SĐT
- Sắp xếp theo hạng, xác nhận, chưa xác nhận, tên, mới/cũ
- Tab nhanh: Tất cả, Hạng A, Hạng B, Đã xác nhận, Chưa xác nhận
- Thống kê động theo danh sách đang lọc
- Tối ưu mobile

Test sau deploy:
- /api/ping phải trả version: 2.5-dashboard-filter

Cloudflare:
- Build command: npm install && npm run build
- Output: dist
- D1 binding: DB -> picklecity-db

Mật khẩu BTC: PTC2026
STK: 202.202.6868
