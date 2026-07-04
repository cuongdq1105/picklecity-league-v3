# PickleCity Tournament Manager V4.8 Tomorrow Ready

Bản sửa nhanh phục vụ giải ngày mai, giữ nền V4 hiện tại nhưng tách màn hình cho gọn.

## Đã sửa theo yêu cầu gần nhất
- Trong BTC tách rõ:
  - Cấu hình thể thức thi đấu
  - Điều hành giải
  - Giờ thi đấu
  - Cập nhật kết quả
  - BXH
  - Nhánh đấu
- Màn hình công khai tách thêm:
  - Giờ thi đấu
  - Kết quả thi đấu
- Giữ tính năng:
  - Vòng bảng 11 điểm cách 2
  - Loại trực tiếp 15 điểm cách 2
  - Mỗi game có nút Lưu riêng
  - Game đã lưu bị khóa
  - Tự tính BXH
  - Sinh Tứ kết

## Test sau deploy
/api/ping phải trả:
version: 4.8-tomorrow-ready

Không có package-lock.json để tránh lỗi Cloudflare npm clean-install.
