# PickleCity Tournament Manager V2.6 Draw Options

Tính năng mới:
- Khi bốc thăm, mặc định tính **tất cả VĐV trong danh sách**, bao gồm cả người chưa được BTC xác nhận.
- Có lựa chọn nguồn VĐV:
  - Tất cả VĐV trong danh sách
  - Chỉ VĐV đã BTC xác nhận
- Có thêm cơ chế chia bảng:
  - Cân bằng bảng theo tổng trình
  - Chia lần lượt theo thứ tự đội
  - Chia bảng ngẫu nhiên
- Giữ các tính năng V2.5: lọc/sắp xếp Dashboard BTC, khóa danh sách, bốc thăm, chốt, công bố.

Test sau deploy:
- /api/ping phải trả version: 2.6-draw-options

Cloudflare:
- Build command: npm install && npm run build
- Output: dist
- D1 binding: DB -> picklecity-db

Mật khẩu BTC: PTC2026
STK: 202.202.6868
