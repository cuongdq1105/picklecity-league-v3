
import { Trophy, CreditCard, Users, Copy, CheckCircle2, Landmark, QrCode } from "lucide-react";
import { money } from "../utils/format";

const BANK = {
  account: "2022026868",
  owner: "TRẦN THỊ HOÀI THANH",
  bank: "Vietcombank",
  qr: "/qr-vcb-real.png"
};

function copyText(text) {
  try { navigator.clipboard.writeText(text); } catch {}
}

export default function Register({ tournament, form, setForm, onSubmit }) {
  const fee = Number(tournament?.fee || 0);
  const payContent = `${form.full_name || "HO TEN"} ${form.phone || "SDT"}`.trim();

  return <main className="grid registerGridV495">
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

    <section className="card paymentCardV495">
      <div className="paymentHeaderV495">
        <div>
          <div className="card-title"><CreditCard/> Thanh toán lệ phí</div>
          <p>Quét QR hoặc chuyển khoản theo thông tin bên dưới.</p>
        </div>
        <div className="feePillV495">{money(fee)}</div>
      </div>

      <div className="paymentLayoutV495">
        <div className="qrFrameV495">
          <div className="qrLabelV495"><QrCode size={16}/> QR chuyển khoản</div>
          <img src={BANK.qr} alt="QR chuyển khoản Vietcombank"/>
        </div>

        <div className="bankInfoV495">
          <div className="bankTitleV495"><Landmark size={18}/> {BANK.bank}</div>

          <div className="payRowV495">
            <span>Số tài khoản</span>
            <b>{BANK.account}</b>
            <button type="button" onClick={()=>copyText(BANK.account)}><Copy size={14}/> Copy</button>
          </div>

          <div className="payRowV495">
            <span>Chủ tài khoản</span>
            <b>{BANK.owner}</b>
          </div>

          <div className="payRowV495 highlight">
            <span>Nội dung CK</span>
            <b>{payContent}</b>
            <button type="button" onClick={()=>copyText(payContent)}><Copy size={14}/> Copy</button>
          </div>

          <div className="paymentStepsV495">
            <p><CheckCircle2 size={15}/> Bước 1: Chuyển khoản đúng lệ phí.</p>
            <p><CheckCircle2 size={15}/> Bước 2: Nội dung ghi <b>Họ tên + SĐT</b>.</p>
            <p><CheckCircle2 size={15}/> Bước 3: Tích “Tôi đã chuyển khoản” rồi đăng ký.</p>
          </div>
        </div>
      </div>

      <div className="paymentWarningV495">
        BTC sẽ kiểm tra tài khoản và xác nhận thanh toán trên danh sách. Sau khi chuyển khoản, vui lòng chụp màn hình giao dịch để đối chiếu khi cần.
      </div>
    </section>

    <section className="card registerFormCardV495">
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
