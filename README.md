# PickleCity Tournament Manager V4.12.2 Rules Logic

## Đã sửa
- Cấu hình luật thi đấu đúng logic, không còn mô tả lệch với dữ liệu thật.
- Preset cập nhật đầy đủ toàn bộ luật:
  - Weekly Open
  - DUPR
  - MLP
- Chuyển "hơn 2 điểm" từ combobox sang nút Có/Không dễ bấm hơn.
- Dòng mô tả luật được sinh từ cấu hình thật.
- Có cảnh báo nếu điểm tối đa nhỏ hơn điểm thắng hoặc cấu hình chưa hợp lý.
- Weekly Open chuẩn:
  - 1 game
  - đến 11 điểm
  - hơn 2 điểm
  - tối đa 15 điểm

## Cách update
Commit gợi ý: `V4.12.2 - Rules Logic`

## Test
/api/ping => version: 4.12.2-rules-logic
