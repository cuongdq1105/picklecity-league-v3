# PickleCity Tournament Manager V4.5 Match Ops

Bản bổ sung module Điều hành thi đấu.

## Tính năng chính
- Xếp lịch vòng bảng theo số sân, giờ bắt đầu, số phút/trận
- BTC cập nhật điểm số từng trận
- Hỗ trợ nhiều game trong một trận
- Tự xác định đội thắng
- Tự tính BXH vòng bảng theo:
  - số trận thắng
  - hiệu số game
  - hiệu số điểm
  - tổng điểm ghi được
- Sinh nhánh Tứ kết theo BXH
- Nhập điểm Tứ kết
- Tự tạo Bán kết/Chung kết dự kiến từ đội thắng
- Public vẫn tách: Danh sách / Bảng đấu / Giờ thi đấu
- Màn hình công khai ẩn hạng nội bộ

## Test sau deploy
/api/ping phải trả:

version: 4.5-match-ops

## Lưu ý Cloudflare
Không có package-lock.json để tránh lỗi npm clean-install.

Mật khẩu BTC: PTC2026
