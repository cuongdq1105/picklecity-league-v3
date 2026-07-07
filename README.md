# PickleCity Tournament Manager V4.10.26 UI Payment Polish

## Đã cập nhật
- Thông báo hệ thống chuyển thành toast: hiện vài giây rồi tự ẩn.
- Bỏ dòng trạng thái lưu cục bộ / đồng bộ khỏi màn hình chính.
- Module Trọng tài: nút chọn bảng/vòng nổi bật hơn, có dấu dropdown và dòng "Nhấn để đổi".
- Màn hình thanh toán gọn lại: tập trung vào QR.
- QR thanh toán được sinh động theo số tiền giải và mã thanh toán riêng.
- Mã thanh toán tạm thời dùng PCL + 6 số cuối điện thoại nếu có.

## Lưu ý thanh toán
- QR động dùng tài khoản Vietcombank hiện tại: 2022026868.
- Nội dung chuyển khoản là mã thanh toán, ví dụ PCL123456.
- Đây là bước chuẩn bị cho Payment Engine sau này.

## Cách update bằng GitHub Desktop
1. Giải nén file ZIP này.
2. Copy toàn bộ nội dung vào thư mục project GitHub hiện tại.
3. Mở GitHub Desktop.
4. Commit: `V4.10.26 - UI Payment Polish`
5. Push origin.

## Test
/api/ping => version: 4.10.26-ui-payment-polish
