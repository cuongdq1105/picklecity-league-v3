# PickleCity Tournament Manager V4.10.21 Referee Round Selector

## Đã sửa trong module Trọng tài
- Bỏ tab **Sân 1** và **Tất cả trận**.
- Thay bằng nút/popup **Chọn bảng / vòng đấu**.
- Popup cho phép chọn:
  - Bảng A, Bảng B, Bảng C...
  - Tứ kết
  - Bán kết
  - Chung kết
  - Tranh giải 3
- Sau khi chọn, chỉ hiện các trận thuộc bảng/vòng đó.
- Màn hình trọng tài gọn hơn trên điện thoại.
- Bỏ phần chọn sân ở màn hình đăng nhập trọng tài.

## Knockout
- Tiếp tục giữ cơ chế hiển thị tên đội + tên VĐV ở Bán kết, Chung kết, Tranh giải 3 khi đã có kết quả vòng trước.

## Cách update bằng GitHub Desktop
1. Giải nén file ZIP này.
2. Copy toàn bộ nội dung vào thư mục project GitHub hiện tại.
3. Mở GitHub Desktop.
4. Commit: `V4.10.21 - Referee Round Selector`
5. Push origin.
6. Cloudflare Pages tự deploy.

## Test
/api/ping => version: 4.10.21-referee-round-selector
