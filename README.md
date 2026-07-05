# PickleCity Tournament Manager V4.10.7 Edit Score

Bản bổ sung chức năng sửa điểm sau khi đã bấm Kết thúc trận.

## Đã thêm
Trong khu **Cập nhật điểm số**:

- Nếu trận đã hoàn thành, hiện nút **Mở sửa điểm**.
- Bấm **Mở sửa điểm** sẽ:
  - mở khóa các ô điểm
  - chuyển trận về trạng thái đang sửa
  - xóa đội thắng cũ
  - cho phép lưu lại từng game
- Sau khi sửa xong, BTC bấm **Kết thúc trận** lại.
- Có thêm nút **Xóa nhập lại** nếu muốn xóa toàn bộ điểm của trận đó.

## Quy trình
1. Bấm Mở sửa điểm.
2. Sửa tỷ số.
3. Bấm Lưu game.
4. Bấm Kết thúc trận.
5. BXH/kết quả công khai sẽ tự tính lại theo dữ liệu mới.

## Test
/api/ping => version: 4.10.7-edit-score
