# PickleCity Tournament Manager V4.11.2 PickleCity Stable

## Mục tiêu
Bản ổn định tạm thời để PickleCity tổ chức giải trong khi phát triển V5.

## Đã sửa
- Sửa các chỗ còn hiển thị "Thắng: Đội xx" ở Trọng tài, Nhập điểm, Nhánh đấu công khai.
- Người thắng ưu tiên hiển thị cặp VĐV thay vì tên đội nội bộ.
- Tab BXH được làm an toàn hơn để tránh lỗi render khi dữ liệu thiếu.
- Bỏ slot A1/B1/Best3 trên nhánh khi đã có tên VĐV.

## Đã bổ sung
- BTC có nút **+ Tạo giải mới**.
- Tạo giải mới sẽ đóng giải hiện tại và mở giải mới, giữ lại cấu hình cơ bản.
- Hồ sơ VĐV được giữ lại theo số điện thoại.
- VĐV cũ nhập số điện thoại sẽ được nhận diện và tự điền tên/giới tính nếu đã có hồ sơ.

## Lưu ý
- Đây chưa phải kiến trúc multi-tournament hoàn chỉnh của V5.
- Bản này phù hợp để dùng tạm cho PickleCity.
- V5 sẽ tách dữ liệu theo sân/đơn vị/giải đấu bài bản hơn.

## Cách update bằng GitHub Desktop
1. Giải nén ZIP.
2. Copy toàn bộ nội dung vào thư mục project hiện tại.
3. Commit: `V4.11.2 - PickleCity Stable`
4. Push origin.

## Test
/api/ping => version: 4.11.2-picklecity-stable
