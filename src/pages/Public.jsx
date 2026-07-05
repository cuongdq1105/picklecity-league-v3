
import { useMemo, useState } from "react";
import { Eye, RefreshCw, ClipboardCopy, ListChecks, Table2, Clock, Trophy } from "lucide-react";
import PaymentBadge from "../components/PaymentBadge";
import DrawView from "../components/DrawView";
import { genderLabel, phoneHref } from "../utils/format";

function scoreText(m){
  return (m.games||[]).filter(g=>g.saved).map(g=>`${g.home}-${g.away}`).join(", ");
}
function matchDone(m){ return (m.games||[]).some(g=>g.saved); }
function bracketName(x){
  return x?.team?.name || x?.row?.team?.name || x?.slot || "—";
}
function bracketPlayers(x){
  return (x?.team?.players || x?.row?.team?.players || []).map(p=>p.full_name).join(" + ");
}
function makeResultTabs(schedule=[], knockout=[]){
  const tabs=[{key:"all",label:"Tất cả",count:schedule.filter(matchDone).length}];
  const groups=[...new Set((schedule||[]).map(m=>m.group).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"vi"));
  groups.forEach(g=>tabs.push({key:g,label:g.replace("Bảng ","Bảng "),count:schedule.filter(m=>m.group===g && matchDone(m)).length}));
  if((knockout||[]).length) tabs.push({key:"QF",label:"Tứ kết",count:knockout.filter(matchDone).length});
  return tabs;
}

export default function Public({ list, draw, schedule = [], knockout = [], onRefresh }) {
  const [publicTab, setPublicTab] = useState("list");
  const [resultFilter, setResultFilter] = useState("all");
  const [scheduleFilter, setScheduleFilter] = useState("all");

  const total = list.length;
  const confirmed = list.filter(x=>x.payment_status==="BTC_CONFIRMED").length;
  const pending = total - confirmed;

  const resultTabs = useMemo(()=>makeResultTabs(schedule, knockout),[schedule,knockout]);
  const scheduleTabs = useMemo(()=>{
    const groups=[...new Set((schedule||[]).map(m=>m.group).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"vi"));
    return [{key:"all",label:"Tất cả",count:schedule.length}, ...groups.map(g=>({key:g,label:g,count:schedule.filter(m=>m.group===g).length}))];
  },[schedule]);

  const visibleSchedule = useMemo(()=>{
    return (schedule||[]).filter(m=>scheduleFilter==="all" || m.group===scheduleFilter);
  },[schedule,scheduleFilter]);

  const visibleResults = useMemo(()=>{
    if(resultFilter==="QF") return [];
    return (schedule||[]).filter(m=>matchDone(m) && (resultFilter==="all" || m.group===resultFilter));
  },[schedule,resultFilter]);

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
    const lines = (visibleSchedule || []).map((m,i)=>`${i+1}. ${m.time ? m.time + " - " : ""}Sân ${m.court || ""} - ${m.group}: ${m.home?.name} vs ${m.away?.name}`);
    navigator.clipboard.writeText(lines.join("\n"));
  }

  return <main className="card wide">
    <div className="card-title"><Eye/> Công khai giải đấu <button className="mini" onClick={onRefresh}><RefreshCw size={14}/> Tải lại</button></div>
    <p className="muted">Khu vực công khai tách riêng: Danh sách, Bảng đấu, Giờ thi đấu, Kết quả và Nhánh đấu.</p>

    <div className="publicStats">
      <div><b>{total}</b><span>Tổng VĐV</span></div>
      <div><b>{confirmed}</b><span>Đã BTC xác nhận</span></div>
      <div><b>{pending}</b><span>Chưa xác nhận</span></div>
    </div>

    <div className="publicSubTabs">
      <button className={publicTab==="list"?"active":""} onClick={()=>setPublicTab("list")}><ListChecks size={15}/> Danh sách</button>
      <button className={publicTab==="groups"?"active":""} onClick={()=>setPublicTab("groups")}><Table2 size={15}/> Bảng đấu</button>
      <button className={publicTab==="schedule"?"active":""} onClick={()=>setPublicTab("schedule")}><Clock size={15}/> Giờ thi đấu</button>
      <button className={publicTab==="results"?"active":""} onClick={()=>setPublicTab("results")}><Trophy size={15}/> Kết quả</button>
      <button className={publicTab==="bracket"?"active":""} onClick={()=>setPublicTab("bracket")}><Trophy size={15}/> Nhánh đấu</button>
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
        <div className="publicFilterTabs">
          {scheduleTabs.map(t=><button key={t.key} className={scheduleFilter===t.key?"active":""} onClick={()=>setScheduleFilter(t.key)}>{t.label} <b>{t.count}</b></button>)}
        </div>
        <p className="contactNote">Lịch thi đấu vòng bảng do BTC xếp. <button className="inlineBtn" onClick={copySchedule}><ClipboardCopy size={14}/> Copy lịch</button></p>
        <div className="tablewrap"><table>
          <thead><tr><th>#</th><th>Giờ</th><th>Sân</th><th>Bảng</th><th>Trận</th><th>Tỷ số</th></tr></thead>
          <tbody>{visibleSchedule.map((m,i)=><tr key={m.id||i}>
            <td>{i+1}</td><td><b>{m.time}</b></td><td>Sân {m.court}</td><td>{m.group}</td><td>{m.home?.name} vs {m.away?.name}</td><td>{scoreText(m)||"Chưa đấu"}</td>
          </tr>)}</tbody>
        </table></div>
      </> : <p className="muted">BTC chưa xếp lịch thi đấu.</p>}
    </section>}

    {publicTab==="results" && <section>
      <h2>Kết quả thi đấu</h2>
      <div className="publicFilterTabs resultTabs">
        {resultTabs.map(t=><button key={t.key} className={resultFilter===t.key?"active":""} onClick={()=>setResultFilter(t.key)}>{t.label} <b>{t.count}</b></button>)}
      </div>

      {resultFilter==="QF" ? <KnockoutResults knockout={knockout}/> :
      (visibleResults.length > 0 ? <div className="resultCardsPublic">
        {visibleResults.map((m,i)=><div className="publicResultCard" key={m.id||i}>
          <div><b>{m.group}</b><span>{m.time} · Sân {m.court}</span></div>
          <h3>{m.home?.name} <small>vs</small> {m.away?.name}</h3>
          <strong>{scoreText(m)}</strong>
          <em>{m.status==="DONE" ? "Hoàn thành" : "Đang cập nhật"}</em>
        </div>)}
      </div> : <p className="muted">Chưa có kết quả trong mục này.</p>)}
    </section>}

    {publicTab==="bracket" && <section>
      <h2>Nhánh đấu</h2>
      <PublicBracket knockout={knockout}/>
    </section>}
  </main>
}

function KnockoutResults({knockout=[]}) {
  const done = knockout.filter(matchDone);
  if(!done.length) return <p className="muted">Chưa có kết quả tứ kết.</p>;
  return <div className="resultCardsPublic">
    {done.map(k=><div className="publicResultCard" key={k.id}>
      <div><b>{k.name}</b><span>{k.round}</span></div>
      <h3>{bracketName(k.a)} <small>vs</small> {bracketName(k.b)}</h3>
      <strong>{scoreText(k)}</strong>
      <em>{k.status==="DONE" ? "Hoàn thành" : "Đang cập nhật"}</em>
    </div>)}
  </div>
}

function PublicBracket({knockout=[]}) {
  const qfs = knockout.length ? knockout : [
    {id:"demo1",name:"Tứ kết 1",a:{slot:"A1"},b:{slot:"Best3-2"}},
    {id:"demo2",name:"Tứ kết 2",a:{slot:"B1"},b:{slot:"Best3-1"}},
    {id:"demo3",name:"Tứ kết 3",a:{slot:"C1"},b:{slot:"A2"}},
    {id:"demo4",name:"Tứ kết 4",a:{slot:"B2"},b:{slot:"C2"}}
  ];
  return <div className="publicBracketGrid">
    {qfs.map((k,i)=><div className="publicBracketCard" key={k.id||i}>
      <div className="publicBracketBadge">QF{i+1}</div>
      <h3>{k.name}</h3>
      <div className="publicBracketTeams">
        <span><em>{k.a?.slot}</em><b>{bracketName(k.a)}</b><small>{bracketPlayers(k.a)}</small></span>
        <strong>vs</strong>
        <span><em>{k.b?.slot}</em><b>{bracketName(k.b)}</b><small>{bracketPlayers(k.b)}</small></span>
      </div>
      {k.winner && <p>Thắng: <b>{k.winner}</b></p>}
    </div>)}
    <div className="publicBracketInfo">
      <b>Bán kết:</b> Winner QF1 vs Winner QF4 · Winner QF2 vs Winner QF3<br/>
      <b>Chung kết:</b> Winner BK1 vs Winner BK2 · <b>Tranh giải 3:</b> Loser BK1 vs Loser BK2
    </div>
  </div>
}
