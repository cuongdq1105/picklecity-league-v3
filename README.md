# PickleCity Tournament Manager V4.9 Stable

Bản cập nhật trên source V4.8, tối ưu cho ngày thi đấu.

## Nội dung đã sửa
- BTC tách rõ các màn hình:
  - Cấu hình thể thức
  - Điều hành giải
  - Giờ thi đấu
  - Cập nhật kết quả
  - BXH
  - Nhánh đấu
- Public có thêm:
  - Giờ thi đấu
  - Kết quả thi đấu
- Cấu hình thể thức:
  - Vòng bảng: đấu vòng tròn, 11 điểm, cách 2
  - Loại trực tiếp: 15 điểm, cách 2
- Cập nhật kết quả:
  - Mỗi game có nút Lưu riêng
  - Game đã lưu bị khóa
  - Có nút Kết thúc trận
- BXH tự tính theo trận thắng, hiệu số game, hiệu số điểm
- Sinh nhánh Tứ kết theo BXH

## Lưu ý quan trọng
Bản này vẫn dùng state frontend như V4.8, chưa phải Auto Save xuống D1. Không F5 hoặc đóng trình duyệt trong khi đang điều hành nếu chưa có bản backend lưu dữ liệu.

## Test sau deploy
/api/ping => version: 4.9-stable

Không có package-lock.json để tránh lỗi Cloudflare npm clean-install.
