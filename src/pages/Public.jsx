
import { useState } from "react";
import { Eye, RefreshCw, ClipboardCopy, ListChecks, Table2, Clock } from "lucide-react";
import PaymentBadge from "../components/PaymentBadge";
import DrawView from "../components/DrawView";
import { genderLabel, phoneHref } from "../utils/format";

export default function Public({ list, draw, schedule = [], knockout = [], onRefresh }) {
  const [publicTab, setPublicTab] = useState("list");
  const total = list.length;
  const confirmed = list.filter(x=>x.payment_status==="BTC_CONFIRMED").length;
  const pending = total - confirmed;

  function copyPublicDraw() {
    if (!draw) return;
    const lines = [];
    (draw.groups || []).forEach(g => {
      lines.push(g.name);
      (g.teams || []).forEach(t => lines.push(`${t.manual ? "Cặp bổ sung" : t.name}: ${(t.players || []).map(p => `${p.full_name}${p.phone ? " - " + p.phone : ""}`).join(" + ")}`));
      lines.push("");
    });
    navigator.clipboard.writeText(lines.join("\n"));
  }

  function copySchedule() {
    const lines = (schedule || []).map((m,i)=>`${i+1}. ${m.time ? m.time + " - " : ""}Sân ${m.court || ""} - ${m.group}: ${m.home?.name} vs ${m.away?.name}`);
    navigator.clipboard.writeText(lines.join("\n"));
  }

  return <main className="card wide">
    <div className="card-title"><Eye/> Công khai giải đấu <button className="mini" onClick={onRefresh}><RefreshCw size={14}/> Tải lại</button></div>
    <p className="muted">Khu vực công khai tách riêng: Danh sách, Bảng đấu và Giờ thi đấu. Không hiển thị phân hạng nội bộ của BTC.</p>

    <div className="publicStats">
      <div><b>{total}</b><span>Tổng VĐV</span></div>
      <div><b>{confirmed}</b><span>Đã BTC xác nhận</span></div>
      <div><b>{pending}</b><span>Chưa xác nhận</span></div>
    </div>

    <div className="publicSubTabs">
      <button className={publicTab==="list"?"active":""} onClick={()=>setPublicTab("list")}><ListChecks size={15}/> Danh sách</button>
      <button className={publicTab==="groups"?"active":""} onClick={()=>setPublicTab("groups")}><Table2 size={15}/> Bảng đấu</button>
      <button className={publicTab==="schedule"?"active":""} onClick={()=>setPublicTab("schedule")}><Clock size={15}/> Giờ thi đấu</button>
    </div>

    {publicTab==="list" && <section>
      <h2>Danh sách VĐV</h2>
      <div className="tablewrap"><table><thead><tr><th>#</th><th>Họ tên</th><th>SĐT</th><th>Giới tính</th><th>Thanh toán</th></tr></thead>
        <tbody>{list.map((x,i)=><tr key={x.registration_id}>
          <td>{i+1}</td><td>{x.full_name}</td>
          <td><div className="phoneCell"><span>{x.phone}</span>{x.phone && <a className="callBtn" href={phoneHref(x.phone)}>☎ Gọi</a>}</div></td>
          <td>{genderLabel(x.gender)}</td><td><PaymentBadge status={x.payment_status}/></td>
        </tr>)}</tbody></table></div>
    </section>}

    {publicTab==="groups" && <section>
      <h2>Bảng đấu đã công bố</h2>
      {draw ? <>
        <p className="contactNote">Số điện thoại được hiển thị đầy đủ để các VĐV trong cùng cặp và cùng bảng chủ động liên hệ. <button className="inlineBtn" onClick={copyPublicDraw}><ClipboardCopy size={14}/> Copy bảng đấu</button></p>
        <DrawView groups={draw.groups} publicMode={true}/>
      </> : <p className="muted">BTC chưa công bố kết quả bốc thăm.</p>}
    </section>}

    {publicTab==="schedule" && <section>
      <h2>Giờ thi đấu</h2>
      {schedule && schedule.length > 0 ? <>
        <p className="contactNote">Lịch thi đấu vòng bảng do BTC xếp. <button className="inlineBtn" onClick={copySchedule}><ClipboardCopy size={14}/> Copy lịch</button></p>
        <div className="tablewrap"><table>
          <thead><tr><th>#</th><th>Giờ</th><th>Sân</th><th>Bảng</th><th>Trận</th><th>Tỷ số</th></tr></thead>
          <tbody>{schedule.map((m,i)=><tr key={m.id||i}>
            <td>{i+1}</td>
            <td><b>{m.time}</b></td>
            <td>Sân {m.court}</td>
            <td>{m.group}</td>
            <td>{m.home?.name} vs {m.away?.name}</td>
            <td>{m.homeScore!=="" || m.awayScore!=="" ? `${m.homeScore || 0} - ${m.awayScore || 0}` : "Chưa đấu"}</td>
          </tr>)}</tbody>
        </table></div>
        {knockout && knockout.length > 0 && <div className="publicKnockout">
          <h3>Nhánh tứ kết dự kiến</h3>
          {knockout.map(k=><p key={k.name}><b>{k.name}:</b> {k.a.slot} vs {k.b.slot}</p>)}
        </div>}
      </> : <p className="muted">BTC chưa xếp lịch thi đấu.</p>}
    </section>}
  </main>
}
