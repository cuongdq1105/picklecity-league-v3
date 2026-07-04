# PickleCity Tournament Manager V4.9.1 Local Save

Bản khẩn cấp để phục vụ giải ngày mai.

## Sửa lỗi mất lịch khi đóng trình duyệt
- Lịch thi đấu được lưu vào localStorage của trình duyệt.
- Nhánh đấu được lưu vào localStorage.
- Cấu hình thể thức được lưu vào localStorage.
- Tắt Chrome/mở lại trên cùng máy, cùng trình duyệt sẽ vẫn còn lịch và nhánh.

## Có thêm
- Thanh trạng thái "Lưu cục bộ".
- Nút Copy backup để copy dữ liệu dự phòng ra Zalo/Notepad.
- Nút Xóa dữ liệu cục bộ khi cần làm lại.

## Lưu ý rất quan trọng
Đây là bản lưu cục bộ trên máy đang điều hành, chưa phải lưu Cloudflare D1.
- Cùng máy/cùng trình duyệt: giữ dữ liệu.
- Máy khác/điện thoại khác: không tự thấy lịch đã xếp.
- Public trên máy khác chưa đồng bộ lịch nếu chưa có backend D1.

Để dùng ngày mai an toàn:
- Dùng 1 máy chính để xếp lịch và nhập kết quả.
- Không xóa cache trình duyệt.
- Sau khi xếp lịch hoặc nhập nhiều kết quả, bấm Copy backup dán vào Zalo/Notepad dự phòng.

## Test sau deploy
/api/ping => version: 4.9.1-local-save
