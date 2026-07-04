# PickleCity Tournament Manager V4 Stable

Bản V4 Stable được tách module, không còn dồn toàn bộ vào một file main.jsx.

## Tính năng
- Đăng ký VĐV
- Danh sách công khai
- Dashboard BTC
- Cấu hình giải đấu
- Quản lý VĐV: sửa/xóa/lọc/tìm kiếm/xác nhận thanh toán/phân hạng nội bộ
- Khóa danh sách
- Bốc thăm ghép cặp
- Chia bảng
- Lưu nháp / Chốt / Công bố
- Màn hình công khai ẩn hạng A/B/C
- Hiển thị SĐT đầy đủ và nút Gọi
- Đăng ký bổ sung / gán cặp thủ công
- Xếp lịch vòng bảng
- Sinh nhánh tứ kết
- Audit log backend

## Test sau deploy
/api/ping phải trả:

version: 4.0-stable

## Cloudflare
- Build command: npm install && npm run build
- Output: dist
- D1 binding: DB -> picklecity-db

## Mật khẩu BTC
PTC2026
