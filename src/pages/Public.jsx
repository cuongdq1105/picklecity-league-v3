
import { useMemo, useState } from "react";
import { Eye, RefreshCw, ClipboardCopy, ListChecks, Table2, Clock, Trophy } from "lucide-react";
import PaymentBadge from "../components/PaymentBadge";
import DrawView from "../components/DrawView";
import { genderLabel, phoneHref } from "../utils/format";
import { calcStandings } from "../utils/draw";
import { DEFAULT_RULES } from "../utils/matchRules";

function scoreText(m){
  return (m.games||[]).filter(g=>g.saved).map(g=>`${g.home}-${g.away}`).join(", ");
}
function publicTeamPlayers(t){
  return (t?.players||[]).map(p=>p.full_name).join(" + ");
}
function matchDone(m){ return (m.games||[]).some(g=>g.saved); }
function bracketName(x){
  return x?.teamName || x?.team?.name || x?.row?.team?.name || x?.slot || "—";
}
function bracketPlayers(x){
  return x?.playerNames || (x?.team?.players || x?.row?.team?.players || []).map(p=>p.full_name).join(" + ");
}
function rankLabel(rank){
  if(rank===1) return "🥇 Nhất";
  if(rank===2) return "🥈 Nhì";
  if(rank===3) return "🥉 Ba";
  return "";
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
  const publicStandings = useMemo(()=>calcStandings(draw?.groups||[], schedule||[], DEFAULT_RULES),[draw,schedule]);
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
      <button className={publicTab==="standings"?"active":""} onClick={()=>setPublicTab("standings")}><Trophy size={15}/> BXH</button>
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
            <td>{i+1}</td><td><b>{m.time}</b></td><td>Sân {m.court}</td><td>{m.group}</td><td><div className="scheduleTeamsPublic">
              <b>{m.home?.name}</b><small>{publicTeamPlayers(m.home)}</small>
              <em>vs</em>
              <b>{m.away?.name}</b><small>{publicTeamPlayers(m.away)}</small>
            </div></td><td>{scoreText(m)||"Chưa đấu"}</td>
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
          <h3>{m.home?.name} <small>vs</small> {m.away?.name}</h3><p className="resultPlayersPublic">{publicTeamPlayers(m.home)}<br/>vs<br/>{publicTeamPlayers(m.away)}</p>
          <strong>{scoreText(m)}</strong>
          <em>{m.status==="DONE" ? "Hoàn thành" : "Đang cập nhật"}</em>
        </div>)}
      </div> : <p className="muted">Chưa có kết quả trong mục này.</p>)}
    </section>}

    {publicTab==="standings" && <section>
      <h2>Bảng xếp hạng</h2>
      <PublicStandings standings={publicStandings}/>
    </section>}

    {publicTab==="bracket" && <section>
      <h2>Nhánh đấu</h2>
      <PublicBracket knockout={knockout}/>
    </section>}
  </main>
}

function PublicStandings({standings={}}) {
  const groups = Object.entries(standings||{});
  if(!groups.length) return <p className="muted">BTC chưa công bố bảng xếp hạng.</p>;
  return <div className="publicStandingGrid">
    {groups.map(([group,rows])=><div className="publicStandingCard" key={group}>
      <h3>{group}</h3>
      <table><thead><tr><th>Hạng</th><th>Xét hạng</th><th>Tên đội / VĐV</th><th>Thắng</th><th>Thua</th><th>HS</th><th>Điểm</th></tr></thead>
        <tbody>{rows.map(r=><tr key={r.name} className={r.rank<=3?"ranked":""}>
          <td><b>{r.rank}</b></td><td><span className={`rankPill rankPill${r.rank}`}>{rankLabel(r.rank)}</span></td><td><b className="teamNameStanding">{r.name}</b><small className="standingPlayers">{r.players}</small></td><td>{r.win}</td><td>{r.loss}</td><td>{r.diff>0?`+${r.diff}`:r.diff}</td><td>{r.pf}</td>
        </tr>)}</tbody>
      </table>
    </div>)}
  </div>
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


function publicBuildSemis(qfs=[]){
  const byId=Object.fromEntries((qfs||[]).map(m=>[m.id,m]));
  const adv=(id,label)=>byId[id]?.winner?{slot:label,teamName:byId[id].winner,winnerName:byId[id].winner}:{slot:label};
  return [
    {id:"SF-1",name:"Bán kết 1",a:adv("QF-1","Winner QF1"),b:adv("QF-4","Winner QF4")},
    {id:"SF-2",name:"Bán kết 2",a:adv("QF-2","Winner QF2"),b:adv("QF-3","Winner QF3")}
  ];
}
function publicBuildFinals(semis=[]){
  const adv=(m,label)=>m?.winner?{slot:label,teamName:m.winner,winnerName:m.winner}:{slot:label};
  return [{id:"FINAL-1",name:"Chung kết",a:adv(semis[0],"Winner BK1"),b:adv(semis[1],"Winner BK2")}];
}
function publicBuildThird(semis=[]){
  return [{id:"THIRD-1",name:"Tranh giải 3",a:{slot:"Loser BK1"},b:{slot:"Loser BK2"}}];
}
function PublicBracket({knockout=[]}) {
  const qfs = knockout.length ? knockout : [
    {id:"QF-1",name:"Tứ kết 1",a:{slot:"A1"},b:{slot:"Best3-2"}},
    {id:"QF-2",name:"Tứ kết 2",a:{slot:"B1"},b:{slot:"Best3-1"}},
    {id:"QF-3",name:"Tứ kết 3",a:{slot:"C1"},b:{slot:"A2"}},
    {id:"QF-4",name:"Tứ kết 4",a:{slot:"B2"},b:{slot:"C2"}}
  ];
  const semis = publicBuildSemis(qfs);
  const finals = publicBuildFinals(semis);
  const third = publicBuildThird(semis);
  return <div className="publicBracketTreeWrap">
    <div className="publicBracketLegend">
      <span><b className="dot pending"></b> Chưa đấu</span>
      <span><b className="dot live"></b> Đang cập nhật</span>
      <span><b className="dot done"></b> Hoàn thành</span>
    </div>
    <div className="publicBracketTree">
      <div className="publicBracketRound"><h3>Tứ kết</h3>{qfs.map((m,i)=><PublicBracketMatch key={m.id||i} match={m} code={`QF${i+1}`}/>)}</div>
      <div className="publicBracketRound"><h3>Bán kết</h3>{semis.map((m,i)=><PublicBracketMatch key={m.id} match={m} code={`BK${i+1}`}/>)}</div>
      <div className="publicBracketRound"><h3>Chung kết</h3>{finals.map(m=><PublicBracketMatch key={m.id} match={m} code="CK" champion />)}<h3>Tranh giải 3</h3>{third.map(m=><PublicBracketMatch key={m.id} match={m} code="Hạng 3" />)}</div>
    </div>
    <div className="publicBracketInfo"><b>Công thức:</b> BK1 = Winner QF1 vs Winner QF4 · BK2 = Winner QF2 vs Winner QF3 · Chung kết = Winner BK1 vs Winner BK2.</div>
  </div>
}
function PublicBracketMatch({match,code,champion=false}) {
  const done = match.status==="DONE" || !!match.winner;
  const live = match.status==="LIVE";
  const score = scoreText(match);
  return <div className={`publicTreeMatch ${done?"done":live?"live":"pending"} ${champion?"champion":""}`}>
    <div className="publicTreeMatchHead"><b>{code}</b><span>{match.name}</span></div>
    <div className="publicTreeTeams"><PublicTeamLine item={match.a} winner={match.winner}/><em>vs</em><PublicTeamLine item={match.b} winner={match.winner}/></div>
    {score && <strong className="publicTreeScore">{score}</strong>}
    {match.winner && <p>Thắng: <b>{match.winner}</b></p>}
  </div>
}
function PublicTeamLine({item,winner}) {
  const name = bracketName(item);
  const players = bracketPlayers(item);
  const isWinner = winner && winner === name;
  return <div className={isWinner ? "teamLine winner" : "teamLine"}>
    <small>{item?.slot || ""}</small><b>{name}</b>{players && <span>{players}</span>}
  </div>
}
