
import { Settings } from "lucide-react";

const EVENT_TYPES = ["Đôi nam", "Đôi nữ", "Đôi nam nữ", "Đôi vợ chồng", "Đơn nam", "Đơn nữ"];

export default function TournamentSettings({ form, setForm, onSave }) {
  return <section className="settingsBox">
    <div className="card-title"><Settings/> Cấu hình giải đấu</div>
    <form onSubmit={onSave}>
      <div className="settingsGrid">
        <label>Tên giải<input value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})}/></label>
        <label>Nội dung<select value={form.event_name||"Đôi nam"} onChange={e=>setForm({...form,event_name:e.target.value})}>{EVENT_TYPES.map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Lệ phí<input type="number" value={form.fee||0} onChange={e=>setForm({...form,fee:e.target.value})}/></label>
        <label>Quy mô VĐV<input type="number" value={form.max_players||0} onChange={e=>setForm({...form,max_players:e.target.value})}/></label>
        <label>Thời gian thi đấu<input value={form.start_time||""} onChange={e=>setForm({...form,start_time:e.target.value})} placeholder="2026-07-05 08:00"/></label>
        <label>Thời gian bốc thăm<input value={form.draw_time||""} onChange={e=>setForm({...form,draw_time:e.target.value})} placeholder="2026-07-04 20:00"/></label>
        <label>Hạn đăng ký<input value={form.register_deadline||""} onChange={e=>setForm({...form,register_deadline:e.target.value})}/></label>
        <label>Giải nhất<input type="number" value={form.first_prize||0} onChange={e=>setForm({...form,first_prize:e.target.value})}/></label>
        <label>Giải nhì<input type="number" value={form.second_prize||0} onChange={e=>setForm({...form,second_prize:e.target.value})}/></label>
        <label>Giải ba<input type="number" value={form.third_prize||0} onChange={e=>setForm({...form,third_prize:e.target.value})}/></label>
        <label>Số giải ba<input type="number" value={form.third_prize_count||2} onChange={e=>setForm({...form,third_prize_count:e.target.value})}/></label>
        <label>Ghi chú tài trợ / giải thưởng<input value={form.sponsor_note||""} onChange={e=>setForm({...form,sponsor_note:e.target.value})}/></label>
      </div>
      <button className="saveSettingsBtn">Lưu cấu hình giải</button>
    </form>
  </section>
}
