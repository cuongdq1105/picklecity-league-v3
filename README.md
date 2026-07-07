# PickleCity Tournament Manager V4.10.22 KO Referee Player Names

## Đã sửa
- Module Trọng tài hiển thị tên cặp VĐV ở Bán kết, Chung kết, Tranh giải 3 khi đã có kết quả vòng trước.
- Không cho nhập điểm Bán kết/Chung kết/Tranh 3 khi vòng trước chưa có đội thật sự.
- Cơ chế truyền đội thắng ưu tiên dữ liệu thật của đội: tên đội + danh sách VĐV, không chỉ dùng nhãn Best3/C1/C2.
- Đồng bộ logic hiển thị với module Nhập điểm của BTC.

## Cách update bằng GitHub Desktop
1. Giải nén file ZIP này.
2. Copy toàn bộ nội dung vào thư mục project GitHub hiện tại.
3. Mở GitHub Desktop.
4. Commit: `V4.10.22 - KO Referee Player Names`
5. Push origin.
6. Cloudflare Pages tự deploy.

## Test
/api/ping => version: 4.10.22-ko-referee-player-names
