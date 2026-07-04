# PickleCity Tournament Manager V4.9.3 Auto Sync Clean

Bản dùng cho ngày thi đấu, đã ẩn các nút kỹ thuật để tránh BTC/VĐV bấm nhầm.

## Đã sửa
- Ẩn các nút:
  - Đồng bộ cho VĐV
  - Tải từ server
  - Copy backup
  - Xóa cục bộ
- Chỉ hiển thị trạng thái:
  - Đã lưu cục bộ
  - Đã đồng bộ / Đang đồng bộ
- Hệ thống vẫn tự đồng bộ lên server khi BTC thay đổi:
  - Xếp lịch
  - Sinh nhánh
  - Cập nhật tỷ số
  - Cấu hình thể thức

## Cách dùng
1. BTC đăng nhập.
2. Xếp lịch / cập nhật điểm như bình thường.
3. Chờ dòng trạng thái báo đã đồng bộ.
4. VĐV vào màn hình công khai và bấm Tải lại nếu chưa thấy lịch mới.

## Test sau deploy
/api/ping => version: 4.9.3-auto-sync-clean
