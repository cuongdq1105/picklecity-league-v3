
import { Trophy, CreditCard, Users, Copy, CheckCircle2, Landmark, QrCode, ShieldCheck, Bell } from "lucide-react";
import { money } from "../utils/format";

const BANK = {
  account: "2022026868",
  owner: "TRẦN THỊ HOÀI THANH",
  bank: "Vietcombank",
  qr: localStorage.getItem("picklecity_payment_qr") || "/qr-vcb-compact.png"
};

function copyText(text) {
  try { navigator.clipboard.writeText(text); } catch {}
}

export default function Register({ tournament, form, setForm, onSubmit }) {
  const fee = Number(tournament?.fee || 0);
  const payContent = `${form.full_name || "Họ tên"} ${form.phone || "Số điện thoại"}`.trim();

  return <main className="grid registerGridV497">
    <section className="card tournamentInfoCard">
      <div className="card-title"><Trophy/> Giải đang mở</div>
      {tournament ? <>
        <h2>{tournament.name}</h2>
        <div className="infoList">
          <p><b>Nội dung:</b> {tournament.event_name || "Đôi nam"}</p>
          <p><b>Lệ phí:</b> {money(tournament.fee)}</p>
          <p><b>Quy mô:</b> {tournament.max_players} VĐV</p>
          <p><b>Trạng thái:</b> {Number(tournament.list_locked)===1 ? "🔒 Đã khóa danh sách" : "🟢 Đang mở đăng ký"}</p>
          <p><b>Thời gian:</b> {tournament.start_time}</p>
          {tournament.draw_time && <p><b>Bốc thăm:</b> {tournament.draw_time}</p>}
          <p><b>Hạn đăng ký:</b> {tournament.register_deadline}</p>
        </div>
        <div className="prizeBoxV495">
          <div>🥇 <span>Giải nhất</span><b>{money(tournament.first_prize)}</b></div>
          <div>🥈 <span>Giải nhì</span><b>{money(tournament.second_prize)}</b></div>
          <div>🥉 <span>Giải ba</span><b>{money(tournament.third_prize)}</b></div>
        </div>
        {tournament.sponsor_note && <p className="muted sponsorNote">{tournament.sponsor_note}</p>}
      </> : <p>Đang tải...</p>}
    </section>

    <section className="card paymentCardV497">
      <div className="paymentTopV497">
        <div>
          <div className="card-title"><CreditCard/> Thanh toán lệ phí</div>
          <p><ShieldCheck size={16}/> Chuyển khoản đúng thông tin để BTC xác nhận nhanh.</p>
        </div>
        <div className="feePillV497">{money(fee)}</div>
      </div>

      <div className="paymentMainV497 paymentMainSingleQR">
        <div className="qrBlockV497">
          <div className="bankLogoV497"><Landmark size={22}/> VIETCOMBANK</div>
          <p>Quét QR để chuyển khoản nhanh</p>
          <div className="qrFrameV497">
            <img src={BANK.qr} alt="QR chuyển khoản Vietcombank"/>
          </div>
        </div></div>

      <div className="transferBoxV497">
        <div>
          <h3>Nội dung chuyển khoản</h3>
          <p>Ghi đúng nội dung để BTC xác nhận nhanh chóng</p>
        </div>
        <div className="transferValueV497">
          <b>{payContent}</b>
          <button type="button" onClick={()=>copyText(payContent)}><Copy size={15}/> Sao chép</button>
        </div>
        <p className="exampleV497">Ví dụ: <b>Nguyễn Văn A 0901234567</b></p>
      </div>

      <div className="noteBoxV497">
        <Bell size={18}/>
        <div>
          <b>Lưu ý</b>
          <ul>
            <li>Sau khi chuyển khoản, vui lòng chụp màn hình giao dịch.</li>
            <li>BTC sẽ xác nhận trong thời gian sớm nhất.</li>
          </ul>
        </div>
      </div>

      <label className="paidConfirmV497">
        <input type="checkbox" checked={form.marked_paid} onChange={e=>setForm({...form,marked_paid:e.target.checked})}/>
        <span><CheckCircle2 size={24}/> Tôi đã chuyển khoản</span>
      </label>
    </section>

    <section className="card registerFormCardV497">
      <div className="card-title"><Users/> Form đăng ký</div>
      {Number(tournament?.list_locked)===1 ? <div className="lockedBox">🔒 Danh sách đã khóa. Vui lòng liên hệ BTC.</div> :
      <form onSubmit={onSubmit}>
        <label>Họ và tên<input required value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})}/></label>
        <label>Số điện thoại<input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label>
        <label>Giới tính<select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}><option value="male">Nam</option><option value="female">Nữ</option></select></label>
        <button className="primary">Đăng ký tham gia</button>
      </form>}
    </section>
  </main>
}

function PaymentRow({ label, value, copy=false }) {
  return <div className="payRowV497">
    <span>{label}</span>
    <b>{value}</b>
    {copy && <button type="button" onClick={()=>copyText(value)}><Copy size={15}/> Sao chép</button>}
  </div>
}
