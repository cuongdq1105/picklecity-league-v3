# PickleCity Tournament Manager V4.11.9 Player Names Sync

## Đã sửa
- Đồng bộ hiển thị tên VĐV thay cho `Đội 1`, `Đội 2` ở các module điều hành.
- BTC → Nhập điểm: khi dữ liệu lịch cũ chỉ còn tên đội, hệ thống tự map lại từ bảng đấu để hiện tên VĐV.
- BTC → Điều hành giải / Giờ thi đấu / Copy lịch: ưu tiên tên VĐV thay vì tên đội nội bộ.
- Public copy lịch cũng dùng tên VĐV.
- Giữ nguyên team_id/tên đội trong dữ liệu nội bộ để tính điểm và nhánh đấu.

## Cách update
Commit gợi ý: `V4.11.9 - Player Names Sync`

## Test
/api/ping => version: 4.11.9-player-names-sync
