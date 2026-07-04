
import { LEVELS } from "../utils/draw";

export default function EditPlayerModal({ player, setPlayer, onSave, onClose }) {
  if (!player) return null;
  return <div className="modalBackdrop">
    <form className="modal" onSubmit={onSave}>
      <h2>Sửa thông tin VĐV</h2>
      <label>Họ tên<input value={player.full_name||""} onChange={e=>setPlayer({...player,full_name:e.target.value})}/></label>
      <label>SĐT<input value={player.phone||""} onChange={e=>setPlayer({...player,phone:e.target.value})}/></label>
      <label>Giới tính<select value={player.gender||"male"} onChange={e=>setPlayer({...player,gender:e.target.value})}><option value="male">Nam</option><option value="female">Nữ</option></select></label>
      <label>Hạng nội bộ<select value={player.level_group||"UNRANKED"} onChange={e=>setPlayer({...player,level_group:e.target.value})}>{LEVELS.map(l=><option key={l}>{l}</option>)}</select></label>
      <label>Điểm trình<input type="number" value={player.level_score||1000} onChange={e=>setPlayer({...player,level_score:e.target.value})}/></label>
      <div className="modalActions"><button type="button" onClick={onClose}>Hủy</button><button className="primary">Lưu</button></div>
    </form>
  </div>
}
