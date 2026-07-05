
import { useMemo, useState } from "react";
import { Printer, FileText, CalendarDays, Trophy, Users, Table2, GitBranch, ClipboardList } from "lucide-react";
import { calcStandings } from "../utils/draw";
import { DEFAULT_RULES } from "../utils/matchRules";

function todayText(){ const d=new Date(); return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`; }
function printNow(){ window.print(); }
function groupName(g){ return String(g || "").replace("Bảng ","").trim(); }
function teamPlayers(t){ return (t?.players||[]).map(p => p.full_name + (p.phone ? ` - ${p.phone}` : "")).join(" + "); }
function groupedSchedule(schedule=[]){
  const map={};
  schedule.forEach(m=>{ const g=m.group||"Khác"; if(!map[g]) map[g]=[]; map[g].push(m); });
  Object.values(map).forEach(rows=>rows.sort((a,b)=>(a.round||0)-(b.round||0)||(a.match||0)-(b.match||0)||String(a.time||"").localeCompare(String(b.time||""))));
  return Object.entries(map).sort(([a],[b])=>groupName(a).localeCompare(groupName(b),"vi"));
}
function matchScoreText(m){ return (m.games||[]).filter(g=>g.saved).map(g=>`${g.home}-${g.away}`).join(", "); }
function teamKey(t){ return t?.name || (t?.players||[]).map(p=>p.full_name).join(" + "); }
function matchKey(group,a,b){
  const names=[teamKey(a),teamKey(b)].sort();
  return `${group}::${names[0]}::${names[1]}`;
}
function completeScheduleByGroup(groups=[],schedule=[]){
  const scheduled = new Map();
  schedule.forEach(m => scheduled.set(matchKey(m.group,m.home,m.away), m));
  return (groups||[]).map(g => {
    const rows=[];
    const teams=g.teams||[];
    for(let i=0;i<teams.length;i++){
      for(let j=i+1;j<teams.length;j++){
        const key=matchKey(g.name,teams[i],teams[j]);
        const existing=scheduled.get(key);
        rows.push(existing || {
          id:`print-${g.name}-${i}-${j}`,
          group:g.name,
          round:"",
          match:"",
          time:"",
          court:"",
          home:teams[i],
          away:teams[j],
          games:[]
        });
      }
    }
    rows.sort((a,b)=>
      (String(a.time||"").localeCompare(String(b.time||""))) ||
      (Number(a.court||999)-Number(b.court||999)) ||
      teamKey(a.home).localeCompare(teamKey(b.home),"vi")
    );
    return [g.name, rows];
  });
}

export default function PrintCenter({ tournament, registrations=[], groups=[], schedule=[], knockout=[], config={} }) {
  const [pick,setPick] = useState({players:true,teams:true,schedule:true,scoreSheets:true,standings:true,bracket:true,results:false,report:true});
  const rules = {...DEFAULT_RULES,...(config.rules||{})};
  const standings = useMemo(()=>calcStandings(groups||[],schedule||[],rules),[groups,schedule,config]);
  const confirmed = registrations.filter(x=>x.payment_status==="BTC_CONFIRMED").length;
  const courts = [...new Set((schedule||[]).map(m=>m.court).filter(Boolean))].sort((a,b)=>a-b);
  const scheduleGroups = completeScheduleByGroup(groups, schedule);
  const toggle = k => setPick(p=>({...p,[k]:!p[k]}));
  const setAll = v => setPick(Object.fromEntries(Object.keys(pick).map(k=>[k,v])));

  return <section className="printCenter">
    <div className="printToolbar noPrint">
      <div>
        <h2><Printer/> Trung tâm in ấn</h2>
        <p>Chọn nội dung cần in, sau đó bấm <b>In / Xuất PDF</b>. Lịch thi đấu được in theo từng bảng và tự bổ sung đủ vòng tròn n×(n-1)/2 trận, kể cả khi lịch xếp giờ bị thiếu.</p>
      </div>
      <div className="printActions">
        <button className="mini" onClick={()=>setAll(true)}>Chọn tất cả</button>
        <button className="mini" onClick={()=>setAll(false)}>Bỏ chọn</button>
        <button className="primary" onClick={printNow}><Printer size={17}/> In / Xuất PDF</button>
      </div>
    </div>

    <div className="printOptions noPrint">
      <PrintCheck icon={<Users/>} label="Danh sách VĐV" checked={pick.players} onClick={()=>toggle("players")}/>
      <PrintCheck icon={<Table2/>} label="Đội theo bảng" checked={pick.teams} onClick={()=>toggle("teams")}/>
      <PrintCheck icon={<CalendarDays/>} label="Lịch thi đấu theo bảng" checked={pick.schedule} onClick={()=>toggle("schedule")}/>
      <PrintCheck icon={<ClipboardList/>} label="Phiếu ghi điểm từng sân" checked={pick.scoreSheets} onClick={()=>toggle("scoreSheets")}/>
      <PrintCheck icon={<Trophy/>} label="BXH vòng bảng" checked={pick.standings} onClick={()=>toggle("standings")}/>
      <PrintCheck icon={<GitBranch/>} label="Nhánh đấu" checked={pick.bracket} onClick={()=>toggle("bracket")}/>
      <PrintCheck icon={<FileText/>} label="Kết quả đã nhập" checked={pick.results} onClick={()=>toggle("results")}/>
      <PrintCheck icon={<FileText/>} label="Báo cáo tóm tắt" checked={pick.report} onClick={()=>toggle("report")}/>
    </div>

    <div className="printPreview">
      <section className="printPage printCover">
        <h1>PickleCity Weekly Open</h1>
        <h2>{tournament?.name || "Giải PickleCity"}</h2>
        <p>{tournament?.event_name || "Đôi nam"} · {tournament?.start_time || ""}</p>
        <div className="coverStats">
          <div><b>{registrations.length}</b><span>VĐV</span></div>
          <div><b>{confirmed}</b><span>Đã xác nhận</span></div>
          <div><b>{groups?.length||0}</b><span>Bảng</span></div>
          <div><b>{schedule?.length||0}</b><span>Trận</span></div>
        </div>
        <p className="printNote">Ngày in: {todayText()}</p>
      </section>

      {pick.players && <PrintPage title="Danh sách VĐV" tournament={tournament}>
        <table className="printTable"><thead><tr><th>#</th><th>Họ tên</th><th>SĐT</th><th>Giới tính</th><th>Thanh toán</th><th>Ký tên</th></tr></thead>
          <tbody>{registrations.map((x,i)=><tr key={x.registration_id||i}><td>{i+1}</td><td>{x.full_name}</td><td>{x.phone}</td><td>{x.gender==="female"?"Nữ":"Nam"}</td><td>{x.payment_status==="BTC_CONFIRMED"?"Đã xác nhận":"Chưa xác nhận"}</td><td></td></tr>)}</tbody>
        </table>
      </PrintPage>}

      {pick.teams && <PrintPage title="Danh sách đội theo bảng" tournament={tournament}>
        <div className="printGroupGrid">{(groups||[]).map(g=><div className="printGroupBox" key={g.name}><h3>{g.name}</h3>{(g.teams||[]).map((t,i)=><div className="printTeam" key={t.name||i}><b>{t.name}</b><p>{teamPlayers(t)}</p></div>)}</div>)}</div><div className="printBracketGrid printBracketGridLater"><div className="printBracketCard"><h3>Bán kết 1</h3><div>Winner QF1</div><b>vs</b><div>Winner QF4</div><p>Kết quả: ____________________</p></div><div className="printBracketCard"><h3>Bán kết 2</h3><div>Winner QF2</div><b>vs</b><div>Winner QF3</div><p>Kết quả: ____________________</p></div><div className="printBracketCard"><h3>Chung kết</h3><div>Winner BK1</div><b>vs</b><div>Winner BK2</div><p>Kết quả: ____________________</p></div><div className="printBracketCard"><h3>Tranh giải 3</h3><div>Loser BK1</div><b>vs</b><div>Loser BK2</div><p>Kết quả: ____________________</p></div></div>
      </PrintPage>}

      {pick.schedule && scheduleGroups.map(([group,rows])=><PrintPage key={group} title={`Lịch thi đấu ${group}`} tournament={tournament}>
        <div className="printScheduleSummary"><b>{group}</b><span>{rows.length} trận vòng tròn</span></div>
        <table className="printTable"><thead><tr><th>#</th><th>Giờ</th><th>Sân</th><th>Lượt</th><th>Đội 1</th><th>Đội 2</th><th>Kết quả</th></tr></thead>
          <tbody>{rows.map((m,i)=><tr key={m.id||i}>
            <td>{i+1}</td><td><b>{m.time || "____"}</b></td><td>{m.court ? "Sân " + m.court : "____"}</td><td>{m.round || ""}</td>
            <td>{m.home?.name}<br/><small>{teamPlayers(m.home)}</small></td>
            <td>{m.away?.name}<br/><small>{teamPlayers(m.away)}</small></td>
            <td>{matchScoreText(m)}</td>
          </tr>)}</tbody>
        </table>
      </PrintPage>)}

      {pick.scoreSheets && courts.map(court=><PrintPage key={court} title={`Phiếu ghi điểm - Sân ${court}`} tournament={tournament}>
        <div className="scoreSheetList">{(schedule||[]).filter(m=>Number(m.court)===Number(court)).map((m,i)=><div className="scoreSheet" key={m.id||i}>
          <div><b>{m.time}</b><span>{m.group}</span></div><h3>{m.home?.name} vs {m.away?.name}</h3>
          <p className="scorePlayers">{teamPlayers(m.home)}<br/>vs<br/>{teamPlayers(m.away)}</p><div className="scoreLine"><span>{m.home?.name}</span><em></em></div><div className="scoreLine"><span>{m.away?.name}</span><em></em></div>
          <div className="signLine"><span>Trọng tài:</span><span>BTC:</span></div>
        </div>)}</div>
      </PrintPage>)}

      {pick.standings && <PrintPage title="Bảng xếp hạng vòng bảng" tournament={tournament}>
        {Object.entries(standings||{}).map(([group,rows])=><div className="printStanding" key={group}><h3>{group}</h3>
          <table className="printTable"><thead><tr><th>Hạng</th><th>Đội</th><th>VĐV</th><th>Trận</th><th>Thắng</th><th>HS điểm</th><th>Điểm ghi</th></tr></thead>
            <tbody>{rows.map(r=><tr key={r.name}><td>{r.rank}</td><td>{r.name}</td><td>{r.players}</td><td>{r.played}</td><td>{r.win}</td><td>{r.diff}</td><td>{r.pf}</td></tr>)}</tbody>
          </table></div>)}
      </PrintPage>}

      {pick.bracket && <PrintPage title="Nhánh loại trực tiếp" tournament={tournament}>
        <div className="printBracketRule"><b>Công thức:</b> QF1 A1 vs Best3-2 · QF2 B1 vs Best3-1 · QF3 C1 vs A2 · QF4 B2 vs C2<br/><b>Bán kết:</b> BK1 Winner QF1 vs Winner QF4 · BK2 Winner QF2 vs Winner QF3<br/><b>Chung kết:</b> Winner BK1 vs Winner BK2 · <b>Tranh 3:</b> Loser BK1 vs Loser BK2</div>
        <div className="printBracketGrid">{(knockout && knockout.length ? knockout : [{name:"Tứ kết 1",a:{slot:"A1"},b:{slot:"Best3-2"}},{name:"Tứ kết 2",a:{slot:"B1"},b:{slot:"Best3-1"}},{name:"Tứ kết 3",a:{slot:"C1"},b:{slot:"A2"}},{name:"Tứ kết 4",a:{slot:"B2"},b:{slot:"C2"}}]).map(k=><div className="printBracketCard" key={k.name}><h3>{k.name}</h3><div>{k.a?.slot||"—"}</div><b>vs</b><div>{k.b?.slot||"—"}</div><p>Kết quả: ____________________</p></div>)}</div>
      </PrintPage>}

      {pick.results && <PrintPage title="Kết quả đã nhập" tournament={tournament}>
        <table className="printTable"><thead><tr><th>#</th><th>Giờ</th><th>Sân</th><th>Bảng</th><th>Trận</th><th>Tỷ số</th></tr></thead>
          <tbody>{(schedule||[]).filter(m=>(m.games||[]).some(g=>g.saved)).map((m,i)=><tr key={m.id||i}><td>{i+1}</td><td>{m.time}</td><td>Sân {m.court}</td><td>{m.group}</td><td>{m.home?.name} vs {m.away?.name}</td><td>{(m.games||[]).filter(g=>g.saved).map(g=>`${g.home}-${g.away}`).join(", ")}</td></tr>)}</tbody>
        </table>
      </PrintPage>}

      {pick.report && <PrintPage title="Báo cáo tóm tắt giải đấu" tournament={tournament}>
        <div className="reportGrid"><div><b>{registrations.length}</b><span>Tổng VĐV</span></div><div><b>{confirmed}</b><span>Đã xác nhận</span></div><div><b>{groups.length}</b><span>Số bảng</span></div><div><b>{schedule.length}</b><span>Trận vòng bảng</span></div><div><b>{courts.length}</b><span>Số sân</span></div><div><b>{todayText()}</b><span>Ngày in</span></div></div>
        <p className="printNote">Tài liệu được xuất từ PickleCity Tournament Manager.</p>
      </PrintPage>}
    </div>
  </section>
}

function PrintCheck({icon,label,checked,onClick}){ return <button className={checked?"checked":""} onClick={onClick}>{icon}<span>{label}</span><b>{checked?"✓":""}</b></button> }
function PrintPage({title,tournament,children}){ return <section className="printPage"><div className="printHeader"><div><b>PickleCity</b><span>Tournament Manager</span></div><div>{tournament?.name || "PickleCity Weekly Open"}</div></div><h2>{title}</h2>{children}<div className="printFooter">PickleCity · {todayText()}</div></section> }
