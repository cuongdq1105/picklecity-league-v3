# PickleCity Tournament Manager V4.9.10 Bracket Consistent

Bản sửa lỗi đồng nhất nhánh tứ kết ở tất cả màn hình.

## Đã sửa lỗi
Trước đó hệ thống có thể hiển thị sai/lặp:
- C1 xuất hiện 2 lần
- C2 gặp C2
- Các màn hình hiển thị không đồng nhất

Nguyên nhân: thuật toán nhận diện bảng A/B/C bị nhầm vì chữ "B" trong từ "Bảng".

## Công thức cố định hiện tại
- Tứ kết 1: A1 vs Best3-2
- Tứ kết 2: B1 vs Best3-1
- Tứ kết 3: C1 vs A2
- Tứ kết 4: B2 vs C2

## Các vị trí đã đồng nhất
- Card nhánh tứ kết
- Khu nhập kết quả tứ kết
- Màn hình công khai/giờ thi đấu

## Test sau deploy
/api/ping => version: 4.9.10-bracket-consistent
