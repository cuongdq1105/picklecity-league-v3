# PickleCity League V3.2 Complete

Bản này được sửa trực tiếp trên source thật của repo `picklecity-league-v3`.

## Tính năng chính
- Đăng ký VĐV
- Dashboard BTC tổng quan
- Cấu hình giải đấu: nội dung, lệ phí, quy mô, thời gian, hạn đăng ký, bốc thăm, giải thưởng, ghi chú
- Quản lý VĐV: sửa, xóa, tìm kiếm, lọc, phân hạng, xác nhận thanh toán
- Khóa / mở khóa danh sách
- Bốc thăm ghép cặp
- Chia bảng
- Lưu nháp / Chốt / Công bố
- Màn hình công khai ẩn hạng A/B/C
- Hiển thị số điện thoại đầy đủ + nút Gọi
- Copy bảng đấu công khai để gửi Zalo
- Đăng ký bổ sung / gán cặp thủ công vào bảng, không làm thay đổi cặp cũ
- Xếp lịch vòng bảng theo số sân, giờ bắt đầu, số phút/trận
- Nhập tỷ số từng trận
- Tự tính BXH vòng bảng
- Sinh nhánh Tứ kết theo cấu hình: top mỗi bảng + đội hạng 3/nhì xuất sắc nhất
- Responsive mobile

## Test sau deploy
Mở:

/api/ping

Phải thấy:

version: 3.2-complete

## Cloudflare
- Build command: npm install && npm run build
- Output: dist
- D1 binding: DB -> picklecity-db

## Mật khẩu BTC
PTC2026
