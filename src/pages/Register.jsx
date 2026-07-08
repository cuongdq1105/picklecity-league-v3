import { useState } from "react";

import { Trophy, CreditCard, Users, Copy, CheckCircle2, ShieldCheck } from "lucide-react";
import { money } from "../utils/format";

const BANK = {
  bin: "970436",
  account: "2022026868",
  owner: "TRAN THI HOAI THANH",
  bank: "Vietcombank"
};

function paymentCode(form){
  const phone = String(form.phone || "").replace(/\D/g,"");
  if(phone) return `PCL${phone.slice(-6)}`;
  const name = String(form.full_name || "PICKLECITY").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^A-Z0-9]/gi,"").toUpperCase().slice(0,8);
  return `PCL${name || "DANGKY"}`;
}

function vietQrUrl(amount, content){
  const params = new URLSearchParams({
    amount: String(Number(amount)||0),
    addInfo: content,
    accountName: BANK.owner
  });
  return `https://img.vietqr.io/image/${BANK.bin}-${BANK.account}-compact2.png?${params.toString()}`;
}

function copyText(text) {
  try { navigator.clipboard.writeText(text); } catch {}
}

function titleCaseVietnamese(value=""){
  return String(value)
    .toLowerCase()
    .replace(/(^|\s|-)(\p{L})/gu, (m, sep, ch) => sep + ch.toUpperCase())
    .replace(/\s+/g, " ")
    .trimStart();
}

function defaultGenderForEvent(name=""){
  const s=String(name||"").toLowerCase();
  if(s.includes("nữ")) return "female";
  if(s.includes("nam")) return "male";
  return "male";
}

export default function Register({ tournament, form, setForm, onSubmit, onLookupMember }) {
  const fee = Number(tournament?.fee || 0);
  const [knownMember,setKnownMember] = useState(null);
  async function handlePhoneBlur(){
    if(!onLookupMember || !form.phone) return;
    const m = await onLookupMember(form.phone);
    setKnownMember(m);
    if(m?.full_name){
      setForm({...form, full_name: form.full_name || titleCaseVietnamese(m.full_name), gender: m.gender || form.gender});
    }
  }
  const code = paymentCode(form);
  const payContent = code;
  const qrSrc = vietQrUrl(fee, payContent);

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

    <section className="card paymentCardV41026">
      <div className="paymentHeaderV41026">
        <div>
          <div className="card-title"><CreditCard/> Thanh toán lệ phí</div>
          <p><ShieldCheck size={16}/> QR đã gồm số tiền và mã thanh toán.</p>
        </div>
        <div className="feePillV497">{money(fee)}</div>
      </div>

      <div className="qrOnlyBoxV41026">
        <img src={qrSrc} alt="QR thanh toán động"/>
      </div>

      <div className="paymentCodeV41026">
        <span>Mã thanh toán</span>
        <b>{payContent}</b>
        <button type="button" onClick={()=>copyText(payContent)}><Copy size={15}/> Sao chép</button>
      </div>

      <label className="paidConfirmV41026">
        <input type="checkbox" checked={form.marked_paid} onChange={e=>setForm({...form,marked_paid:e.target.checked})}/>
        <span><CheckCircle2 size={22}/> Tôi đã chuyển khoản</span>
      </label>
    </section>

    <section className="card registerFormCardV497">
      <div className="card-title"><Users/> Form đăng ký</div>
      {Number(tournament?.list_locked)===1 ? <div className="lockedBox">🔒 Danh sách đã khóa. Vui lòng liên hệ BTC.</div> :
      <form onSubmit={onSubmit} className={!form.marked_paid ? "formRequirePaid" : ""}>
        <label>Họ và tên<input required value={form.full_name} onChange={e=>setForm({...form,full_name:titleCaseVietnamese(e.target.value)})}/></label>
        <label>Số điện thoại<input required value={form.phone} onChange={e=>{setForm({...form,phone:e.target.value});setKnownMember(null);}} onBlur={handlePhoneBlur}/></label>
        {knownMember && <div className="knownMemberBoxV4112">✓ Đã nhận diện hồ sơ: <b>{knownMember.full_name}</b>. Bạn chỉ cần xác nhận đăng ký giải này.</div>}
        <label>Giới tính<select value={form.gender || defaultGenderForEvent(tournament?.event_name)} onChange={e=>setForm({...form,gender:e.target.value})}><option value="male">Nam</option><option value="female">Nữ</option></select></label>
        <button className="primary" disabled={!form.marked_paid}>Hoàn thành đăng ký</button>
        {!form.marked_paid && <p className="paidRequiredText">Vui lòng chuyển khoản và tích “Tôi đã chuyển khoản” để hoàn tất đăng ký.</p>}
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
