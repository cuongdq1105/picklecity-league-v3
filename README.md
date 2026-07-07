# PickleCity Tournament Manager V4.11.0 Public UX Upgrade

## Đã cập nhật theo yêu cầu
### Tab Danh sách & Bảng đấu
- Tab Bảng đấu: gộp từng Bảng A/B/C thành card riêng, dễ nhìn hơn.
- Bỏ dòng "Bảng đấu đã công bố..." và ghi chú số điện thoại gây rối.

### Tab Giờ thi đấu
- Bỏ dòng "Lịch thi đấu vòng bảng do BTC xếp".
- Bổ sung lịch/khung trận Tứ kết, Bán kết, Tranh hạng 3, Chung kết.

### Tab Kết quả
- Bổ sung tab con: Tất cả, Vòng bảng, Tứ kết, Bán kết, Tranh hạng 3, Chung kết.
- Mỗi đội hiển thị kèm tên VĐV.

### Tab BXH
- Bổ sung phần tổng hợp Knockout: Tứ kết, Bán kết, Tranh hạng 3, Chung kết.
- Nếu đã có kết quả Chung kết/Tranh hạng 3, hiển thị podium Vô địch / Á quân / Hạng 3.

### Tab Nhánh đấu
- Hiển thị tên VĐV trong các cặp Tứ kết, Bán kết, Tranh hạng 3, Chung kết.
- Nếu vòng trước đã có kết quả, vòng sau tự hiển thị đội thật + tên VĐV.

## Cách update bằng GitHub Desktop
1. Giải nén ZIP.
2. Copy toàn bộ nội dung vào thư mục project GitHub hiện tại.
3. Commit: `V4.11.0 - Public UX Upgrade`
4. Push origin.

## Test
/api/ping => version: 4.11.0-public-ux-upgrade
