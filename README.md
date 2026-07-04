# PickleCity Tournament Manager V4.9.4 Ranking Rules

Bản cập nhật tiêu chí xếp hạng phục vụ giải 1 game/trận.

## Điểm mới
- Cập nhật mục Cấu hình thể thức thi đấu.
- Vòng bảng:
  - Đấu vòng tròn tính điểm
  - 11 điểm, cách 2
- Loại trực tiếp:
  - 15 điểm, cách 2
- Tiêu chí xếp hạng vòng bảng:
  1. Số trận thắng
  2. Hiệu số điểm
  3. Tổng điểm ghi được
  4. Đối đầu trực tiếp nếu chỉ có 2 đội bằng nhau
  5. Bốc thăm nếu vẫn hòa hoàn toàn

## Thay đổi quan trọng
Vì mỗi trận chỉ đánh 1 game, hệ thống bỏ tiêu chí hiệu số game khi xếp hạng, để BXH dễ hiểu và phù hợp với thể thức giải.

## Đồng bộ
Giữ cơ chế tự đồng bộ từ V4.9.3:
- BTC xếp lịch / nhập điểm / sinh nhánh
- Hệ thống tự lưu lên server
- VĐV xem lịch/kết quả trên điện thoại ở màn hình công khai

## Test sau deploy
/api/ping => version: 4.9.4-ranking-rules
