
import { Trophy, CreditCard, Users } from "lucide-react";
import { money } from "../utils/format";

export default function Register({ tournament, form, setForm, onSubmit }) {
  return <main className="grid">
    <section className="card">
      <div className="card-title"><Trophy/> Giải đang mở</div>
      {tournament ? <>
        <h2>{tournament.name}</h2>
        <p><b>Nội dung:</b> {tournament.event_name || "Đôi nam"}</p>
        <p><b>Lệ phí:</b> {money(tournament.fee)}</p>
        <p><b>Quy mô:</b> {tournament.max_players} VĐV</p>
        <p><b>Trạng thái:</b> {Number(tournament.list_locked)===1 ? "🔒 Đã khóa danh sách" : "🟢 Đang mở đăng ký"}</p>
        <p><b>Thời gian:</b> {tournament.start_time}</p>
        {tournament.draw_time && <p><b>Thời gian bốc thăm:</b> {tournament.draw_time}</p>}
        <p><b>Hạn đăng ký:</b> {tournament.register_deadline}</p>
        <hr/>
        <p>🥇 Giải nhất: <b>{money(tournament.first_prize)}</b></p>
        <p>🥈 Giải nhì: <b>{money(tournament.second_prize)}</b></p>
        <p>🥉 Giải ba: <b>{money(tournament.third_prize)}</b></p>
        <p className="muted">{tournament.sponsor_note}</p>
      </> : <p>Đang tải...</p>}
    </section>

    <section className="card">
      <div className="card-title"><CreditCard/> Thanh toán</div>
      <div className="qrbox"><img src="/qr-vcb.svg"/></div>
      <p><b>STK:</b> 202.202.6868</p>
      <p><b>Chủ TK:</b> TRẦN THỊ HOÀI THANH</p>
      <p><b>Ngân hàng:</b> Vietcombank</p>
      <p><b>Nội dung:</b> Họ tên + SĐT</p>
    </section>

    <section className="card">
      <div className="card-title"><Users/> Form đăng ký</div>
      {Number(tournament?.list_locked)===1 ? <div className="lockedBox">🔒 Danh sách đã khóa. Vui lòng liên hệ BTC.</div> :
      <form onSubmit={onSubmit}>
        <label>Họ và tên<input required value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})}/></label>
        <label>Số điện thoại<input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label>
        <label>Giới tính<select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}><option value="male">Nam</option><option value="female">Nữ</option></select></label>
        <label className="check"><input type="checkbox" checked={form.marked_paid} onChange={e=>setForm({...form,marked_paid:e.target.checked})}/> Tôi đã chuyển khoản lệ phí</label>
        <button className="primary">Đăng ký tham gia</button>
      </form>}
    </section>
  </main>
}
