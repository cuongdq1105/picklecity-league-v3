# PickleCity Tournament Manager V4.9.2 Public Schedule

Bản khẩn cấp để BTC xếp lịch và VĐV xem được trên điện thoại.

## Điểm mới quan trọng
- Có API `/api/state` lưu lịch thi đấu, kết quả, nhánh đấu, cấu hình lên Cloudflare D1.
- BTC bấm **Đồng bộ cho VĐV** để đẩy lịch/kết quả/nhánh lên server.
- Trang công khai trên điện thoại VĐV bấm **Tải lại** sẽ đọc lịch/kết quả từ server.
- Vẫn giữ localStorage trên máy BTC để dự phòng.

## Cách dùng ngày mai
1. BTC vào tab BTC.
2. Xếp lịch vòng bảng.
3. Sinh nhánh nếu cần.
4. Bấm nút **Đồng bộ cho VĐV** ở thanh thông báo trên cùng.
5. VĐV mở trang công khai trên điện thoại, vào **Giờ thi đấu**, bấm **Tải lại**.

## Lưu ý
- Bản này đã lưu lên D1 thông qua bảng `tournament_states`.
- Nếu BTC nhập điểm, sau khi lưu game hệ thống sẽ tự đồng bộ sau khoảng 1 giây khi đang đăng nhập BTC.
- Nếu muốn chắc chắn, bấm **Đồng bộ cho VĐV** sau mỗi vòng đấu.

## Test sau deploy
/api/ping => version: 4.9.2-public-schedule
