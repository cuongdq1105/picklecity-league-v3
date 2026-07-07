# PickleCity Tournament Manager V4.10.23 KO Slot Winner Fix

## Đã sửa
- Sửa lỗi đội thắng ở Knockout lưu theo slot như `Best3-2`, `C1`, `C2` nên không đẩy được tên VĐV sang Bán kết/Chung kết.
- Hệ thống giờ nhận diện cả tên đội thật và slot hiển thị.
- Bán kết, Chung kết, Tranh giải 3 nhận đúng tên đội + danh sách VĐV.
- Áp dụng cho Trọng tài, Nhập điểm BTC và Nhánh đấu.

## Lưu ý
Nếu dữ liệu cũ đã lưu sai: Mở sửa trận Tứ kết/Bán kết → Lưu lại game → Kết thúc lại trận để hệ thống repair dữ liệu.

## Test
/api/ping => version: 4.10.23-ko-slot-winner-fix
