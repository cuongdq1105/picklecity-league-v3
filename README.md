# PickleCity Tournament Manager V4.12.0 Stable Fixes

## Đã sửa
1. Sau khi chốt/công bố bốc thăm, hệ thống tự tạo lịch/giờ thi đấu vòng bảng.
2. Màn hình đăng ký tự viết hoa chữ cái đầu của họ và tên VĐV.
3. Giới tính mặc định theo nội dung giải:
   - Đôi nữ / Đơn nữ: mặc định Nữ
   - Đôi nam / Đơn nam: mặc định Nam
4. BTC → BXH không hiển thị bảng xếp hạng khi chưa có trận nào được nhập điểm/kết thúc.

## Đã bổ sung
- Cấu hình luật thi đấu trong Cấu hình giải:
  - Số game
  - Điểm thắng
  - Hơn 2 điểm
  - Điểm tối đa
- Preset Weekly Open:
  - 1 game
  - đến 11 điểm
  - hơn 2 điểm
  - tối đa 15 điểm

## Cách update
Commit gợi ý: `V4.12.0 - Stable Fixes`

## Test
/api/ping => version: 4.12.0-stable-fixes
