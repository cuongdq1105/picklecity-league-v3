# PickleCity League V3.1 Stable

Bản ổn định dùng cho repo đã clone bằng GitHub Desktop.

## Tính năng chính
- Đăng ký VĐV
- Dashboard BTC
- Cấu hình giải đấu
- Quản lý VĐV: sửa, xóa, lọc, tìm kiếm, phân hạng, xác nhận thanh toán
- Khóa/mở khóa danh sách
- Bốc thăm ghép cặp
- Chia bảng
- Lưu nháp / Chốt / Công bố
- Công khai ẩn hạng A/B/C
- Hiển thị SĐT đầy đủ và nút Gọi
- Đăng ký bổ sung / gán cặp thủ công
- Xếp lịch vòng bảng
- Sinh nhánh tứ kết
- Dashboard tổng quan BTC

## Test sau deploy
/api/ping phải trả:

version: 3.1-stable

## Cloudflare
- Build command: npm install && npm run build
- Output: dist
- D1 binding: DB -> picklecity-db

## Mật khẩu BTC
PTC2026
