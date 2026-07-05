# PickleCity Tournament Manager V4.10.15 Paid Register Only

## Đã sửa
- VĐV chỉ hoàn tất đăng ký sau khi đã tích **Tôi đã chuyển khoản**.
- Nút **Hoàn thành đăng ký** bị khóa nếu chưa xác nhận đã chuyển khoản.
- API `/register` cũng kiểm tra `marked_paid`, tránh gửi đăng ký bỏ qua giao diện.

## Quy trình mới
1. VĐV nhập thông tin.
2. Quét QR/chuyển khoản.
3. Tích **Tôi đã chuyển khoản**.
4. Bấm **Hoàn thành đăng ký**.

## Test
/api/ping => version: 4.10.15-paid-register-only
