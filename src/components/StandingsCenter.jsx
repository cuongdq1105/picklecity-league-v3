
import { useMemo, useState } from "react";
import { Trophy, Table2, Medal, RefreshCw } from "lucide-react";
import { calcStandings } from "../utils/draw";
import { DEFAULT_RULES } from "../utils/matchRules";

function shortGroup(g){ return String(g||"").replace("Bảng ",""); }
function rankLabel(rank){
  if(rank===1) return "🥇 Nhất bảng";
  if(rank===2) return "🥈 Nhì bảng";
  if(rank===3) return "🥉 Hạng ba";
  return "";
}

export default function StandingsCenter({ groups=[], schedule=[], config={}, setMsg }) {
  const [tab,setTab] = useState("all");
  const rules = {...DEFAULT_RULES,...(config.rules||{})};
  const standings = useMemo(()=>calcStandings(groups||[], schedule||[], rules), [groups,schedule,config]);
  const groupNames = useMemo(()=>Object.keys(standings||{}).sort((a,b)=>a.localeCompare(b,"vi")), [standings]);
  const allRows = useMemo(()=>{
    const rows=[];
    Object.entries(standings||{}).forEach(([group,rs])=>rs.forEach(r=>rows.push({...r,group})));
    return rows;
  },[standings]);

  const top3 = useMemo(()=>{
    return allRows
      .filter(r=>r.rank===3)
      .sort((a,b)=>b.win-a.win||b.diff-a.diff||b.pf-a.pf||a.players.localeCompare(b.players,"vi"));
  },[allRows]);

  const visibleGroups = tab==="all" ? groupNames : [tab].filter(Boolean);

  return <section className="standingsCenter">
    <div className="standingsHead">
      <div>
        <h2><Trophy/> Bảng xếp hạng & xét hạng</h2>
        <p>Hiển thị tên đội, VĐV, thắng/thua, hiệu số điểm và đánh dấu rõ Nhất bảng, Nhì bảng, Hạng ba.</p>
      </div>
      <button className="mini" onClick={()=>setMsg?.("BXH đã được tính lại theo điểm mới nhất.")}><RefreshCw size={14}/> Tính lại</button>
    </div>

    <div className="standingRuleBox">
      <b>Tiêu chí xếp hạng:</b>
      <span>1. Số trận thắng</span>
      <span>2. Hiệu số điểm</span>
      <span>3. Tổng điểm ghi được</span>
      <span>4. Đối đầu trực tiếp</span>
      <span>5. Bốc thăm</span>
    </div>

    <div className="standingTabs">
      <button className={tab==="all"?"active":""} onClick={()=>setTab("all")}><Table2 size={14}/> Tất cả</button>
      {groupNames.map(g=><button key={g} className={tab===g?"active":""} onClick={()=>setTab(g)}>{g}</button>)}
      <button className={tab==="best3"?"active":""} onClick={()=>setTab("best3")}><Medal size={14}/> Xét hạng 3</button>
    </div>

    {tab==="best3" ? <BestThirdTable rows={top3}/> :
    <div className="standingGrid">
      {visibleGroups.map(group=><GroupStandingCard key={group} group={group} rows={standings[group]||[]}/>)}
    </div>}
  </section>
}

function GroupStandingCard({group,rows}) {
  return <div className="standingCard">
    <div className="standingCardHead">
      <h3>{group}</h3>
      <span>{rows.length} đội</span>
    </div>
    <table className="standingTable">
      <thead><tr><th>Hạng</th><th>Xét hạng</th><th>Tên đội</th><th>VĐV</th><th>Trận</th><th>Thắng</th><th>Thua</th><th>HS</th><th>Điểm</th></tr></thead>
      <tbody>{rows.map(r=><tr key={r.name} className={r.rank<=3 ? `rank rank${r.rank}` : ""}>
        <td><b>{r.rank}</b></td>
        <td><span className={`rankPill rankPill${r.rank}`}>{rankLabel(r.rank)}</span></td>
        <td><b className="teamNameStanding">{r.name}</b></td>
        <td><small>{r.players}</small></td>
        <td>{r.played}</td>
        <td className="winCol">{r.win}</td>
        <td>{r.loss}</td>
        <td className={r.diff>=0?"positive":"negative"}>{r.diff>0?`+${r.diff}`:r.diff}</td>
        <td>{r.pf}</td>
      </tr>)}</tbody>
    </table>
  </div>
}

function BestThirdTable({rows}) {
  return <div className="standingCard bestThird">
    <div className="standingCardHead">
      <h3>Xét các đội hạng 3 tốt nhất</h3>
      <span>Lấy theo cấu hình giải</span>
    </div>
    <table className="standingTable">
      <thead><tr><th>Thứ tự</th><th>Bảng</th><th>Tên đội</th><th>VĐV</th><th>Trận</th><th>Thắng</th><th>Thua</th><th>HS</th><th>Điểm</th></tr></thead>
      <tbody>{rows.map((r,i)=><tr key={`${r.group}-${r.name}`} className={i<2 ? "qualified3" : ""}>
        <td><b>{i+1}</b>{i<2 && <em> vào nhánh</em>}</td>
        <td>{shortGroup(r.group)}</td>
        <td><b className="teamNameStanding">{r.name}</b></td>
        <td><small>{r.players}</small></td>
        <td>{r.played}</td>
        <td className="winCol">{r.win}</td>
        <td>{r.loss}</td>
        <td className={r.diff>=0?"positive":"negative"}>{r.diff>0?`+${r.diff}`:r.diff}</td>
        <td>{r.pf}</td>
      </tr>)}</tbody>
    </table>
  </div>
}
