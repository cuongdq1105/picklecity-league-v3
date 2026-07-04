# PickleCity Tournament Manager V2.6.1 Finalize Public

Sửa lỗi:
- Nút **Chốt** hoạt động ngay sau khi bốc thăm nháp, không bắt buộc phải bấm Lưu nháp trước.
- Nút **Công bố** cũng có thể lưu/chốt kết quả đang hiển thị.
- Bảng đấu công khai sau khi công bố **ẩn hạng VĐV A/B/C**, chỉ hiện tên VĐV.
- Giữ cơ chế bốc thăm theo tất cả VĐV hoặc chỉ VĐV đã xác nhận.
- Giữ cơ chế chia bảng: cân bằng bảng, chia lần lượt, chia ngẫu nhiên.

Test sau deploy:
- /api/ping phải trả version: 2.6.1-finalize-public

Cloudflare:
- Build command: npm install && npm run build
- Output: dist
- D1 binding: DB -> picklecity-db

Mật khẩu BTC: PTC2026
STK: 202.202.6868
