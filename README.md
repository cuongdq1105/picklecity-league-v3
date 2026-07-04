# PickleCity Tournament Manager V4.7 Admin Layout

Bản này sắp xếp lại tab BTC cho khoa học hơn:
- Sidebar điều hành giải rõ ràng
- Khu KPI tổng quan ở đầu
- Khối Điều hành nhanh
- Khối Trận đang diễn ra / tiếp theo
- Khối Cấu hình thể thức thi đấu gọn
- Khối Cập nhật tỷ số riêng
- Khối BXH nhanh / trận chưa nhập kết quả
- Tổng quan các sân

Giữ nguyên tính năng V4.6:
- Cấu hình thể thức thi đấu
- Mỗi game có nút Lưu riêng
- Game đã lưu bị khóa
- Tự tính đội thắng, BXH, nhánh Tứ kết

Test sau deploy:
/api/ping => version: 4.7-admin-layout

Không có package-lock.json để tránh lỗi Cloudflare npm clean-install.
