# PickleCity Tournament Manager V4.6 Match Control

Bản hoàn thiện module Điều hành giải và Cập nhật kết quả.

## Điểm mới
- Có mục Cấu hình thể thức thi đấu:
  - Vòng bảng: đấu vòng tròn tính điểm
  - Điểm vòng bảng: mặc định 11 điểm, có cách 2
  - Vòng loại trực tiếp: Tứ kết, Bán kết, Tranh giải 3, Chung kết
  - Điểm loại trực tiếp: mặc định 15 điểm, có cách 2
- Có màn hình Điều hành thi đấu riêng cho BTC.
- Có màn hình Cập nhật tỷ số từng trận.
- Mỗi game có nút Lưu riêng.
- Khi đã lưu game, game bị khóa để tránh nhiều người sửa đè.
- Tự xác định đội thắng theo game đã lưu.
- Tự tính BXH vòng bảng.
- Sinh nhánh Tứ kết theo BXH.
- Hỗ trợ nhập điểm Tứ kết.
- Public vẫn tách Danh sách / Bảng đấu / Giờ thi đấu.

## Test sau deploy
/api/ping phải trả:
version: 4.6-match-control

Không có package-lock.json để tránh lỗi npm clean-install.

Mật khẩu BTC: PTC2026
