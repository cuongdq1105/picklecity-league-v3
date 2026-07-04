# PickleCity Tournament Manager V4.9.11 Interleaved Schedule

Bản sửa cách xếp giờ thi đấu vòng bảng.

## Đã sửa
Trước đây lịch bị xếp:
- Bảng A đánh liên tục
- Sau đó tới Bảng B
- Sau đó tới Bảng C

Bản này sửa thành xếp xen kẽ theo cùng cung giờ:
- 08:00: Sân 1 Bảng A, Sân 2 Bảng B, Sân 3 Bảng C
- 08:20: tiếp tục xen kẽ A/B/C
- 08:40: tiếp tục xen kẽ A/B/C

## Mục tiêu
- Các bảng diễn ra song song.
- VĐV không phải chờ quá lâu theo từng bảng.
- BTC dễ điều hành theo 3 sân.
- Public xem lịch hợp lý hơn.

## Giữ nguyên
- Nhánh tứ kết cố định: A1 vs Best3-2, B1 vs Best3-1, C1 vs A2, B2 vs C2.
- Đồng bộ server.
- QR thanh toán.
- Cấu hình thể thức và BXH.

## Test sau deploy
/api/ping => version: 4.9.11-interleaved-schedule
