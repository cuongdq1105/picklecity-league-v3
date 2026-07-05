# PickleCity Tournament Manager V4.10.16 BTC Confirmed Only

## Đã cập nhật cơ chế thanh toán/đăng ký hợp lệ

- VĐV vẫn phải chuyển khoản và tích **Tôi đã chuyển khoản** mới gửi được đăng ký.
- Trạng thái sau khi VĐV gửi là **chờ BTC xác nhận**.
- Chỉ những VĐV được BTC bấm **Xác nhận thanh toán** mới được xem là đăng ký hợp lệ.
- Khi bốc thăm/chia bảng, hệ thống chỉ lấy VĐV có trạng thái **BTC_CONFIRMED**.
- Người bấm giả “Tôi đã chuyển khoản” sẽ không ảnh hưởng giải vì chưa được đưa vào bốc thăm.

## Quy trình
1. VĐV chuyển khoản.
2. VĐV tích “Tôi đã chuyển khoản” và gửi đăng ký.
3. BTC kiểm tra tài khoản.
4. BTC bấm xác nhận thanh toán.
5. VĐV mới được đưa vào bốc thăm/chia bảng.

## Test
/api/ping => version: 4.10.16-btc-confirmed-only
