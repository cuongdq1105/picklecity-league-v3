# PickleCity Tournament Manager V3.0 Tournament Settings

Tính năng mới:
- Thêm mục **Cấu hình giải đấu** trong Dashboard BTC.
- BTC có thể cập nhật:
  - Tên giải
  - Nội dung: Đôi nam, Đôi nữ, Đôi nam nữ, Đôi vợ chồng, Đơn nam, Đơn nữ
  - Lệ phí
  - Quy mô VĐV
  - Thời gian thi đấu
  - Thời gian bốc thăm
  - Hạn đăng ký
  - Giải nhất / nhì / ba / số giải ba
  - Ghi chú tài trợ, giải thưởng
- Các thông tin cập nhật sẽ hiển thị ra màn hình đăng ký/công khai.

Giữ các chức năng:
- Khóa danh sách
- Bốc thăm, chốt, công bố
- Đăng ký bổ sung / gán cặp thủ công
- Xếp lịch vòng bảng
- Sinh nhánh tứ kết

Test sau deploy:
- /api/ping phải trả version: 3.0-tournament-settings

Cloudflare:
- Build command: npm install && npm run build
- Output: dist
- D1 binding: DB -> picklecity-db

Mật khẩu BTC: PTC2026
STK: 202.202.6868
