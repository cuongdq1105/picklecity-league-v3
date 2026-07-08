
import { useMemo, useState } from "react";
import { Trophy, Table2, Medal, RefreshCw, GitBranch } from "lucide-react";
import { calcStandings } from "../utils/draw";
import { DEFAULT_RULES } from "../utils/matchRules";

function shortGroup(g){ return String(g||"").replace("Bảng ",""); }
function rankLabel(rank){
  if(rank===1) return "🥇 Nhất bảng";
  if(rank===2) return "🥈 Nhì bảng";
  if(rank===3) return "🥉 Hạng ba";
  return "";
}
function scoreText(m){ return (m.games||[]).filter(g=>g.saved).map(g=>`${g.home}-${g.away}`).join(", "); }
function matchDone(m){ return (m.games||[]).some(g=>g.saved) || m.status==="DONE"; }
function koName(x){ return x?.team?.name || x?.row?.team?.name || x?.teamName || x?.winnerName || x?.slot || "—"; }
function koPlayers(x){ return x?.playerNames || (x?.team?.players || x?.row?.team?.players || []).map(p=>p.full_name).join(" + "); }
function slotMatches(slot,winner){
  const w=String(winner||"").trim();
  const arr=[slot?.slot,slot?.displaySlot,slot?.originalSlot,slot?.teamName,slot?.winnerName,slot?.team?.name,slot?.row?.team?.name].filter(Boolean).map(x=>String(x).trim());
  return arr.includes(w);
}
function cloneSlot(slot,label){
  if(!slot) return {slot:label};
  const name=koName(slot), players=koPlayers(slot);
  return {...slot,slot:label,teamName:name,winnerName:name,playerNames:players};
}
function adv(label,m){
  if(!m?.winner) return {slot:label};
  if(m.winnerTeam) return cloneSlot(m.winnerTeam,label);
  const a=koName(m.a), b=koName(m.b);
  const w=(m.winner===a||slotMatches(m.a,m.winner))?m.a:(m.winner===b||slotMatches(m.b,m.winner))?m.b:null;
  return w?cloneSlot(w,label):{slot:label,teamName:m.winner,winnerName:m.winner};
}
function loser(label,m){
  if(!m?.winner) return {slot:label};
  const a=koName(m.a), b=koName(m.b);
  const aWon=m.winner===a||slotMatches(m.a,m.winner);
  const bWon=m.winner===b||slotMatches(m.b,m.winner);
  const l=aWon?m.b:bWon?m.a:null;
  return l?cloneSlot(l,label):{slot:label};
}
function keep(base, old){
  if(!old) return base;
  return {...base,games:old.games||base.games,status:old.status||base.status,winner:old.winner||"",winnerTeam:old.winnerTeam||null,finishedAt:old.finishedAt||""};
}
function normalizeKnockout(list=[]){
  const old=Object.fromEntries((list||[]).map(m=>[m.id,m]));
  const qfs=(list||[]).filter(m=>String(m.id||"").startsWith("QF"));
  const sfs=[
    keep({id:"SF-1",name:"Bán kết 1",type:"KO",round:"SF",status:"SCHEDULED",a:adv("Winner QF1",old["QF-1"]),b:adv("Winner QF4",old["QF-4"]),games:[{home:"",away:"",saved:false}],winner:""},old["SF-1"]),
    keep({id:"SF-2",name:"Bán kết 2",type:"KO",round:"SF",status:"SCHEDULED",a:adv("Winner QF2",old["QF-2"]),b:adv("Winner QF3",old["QF-3"]),games:[{home:"",away:"",saved:false}],winner:""},old["SF-2"])
  ];
  return [
    ...qfs,
    ...sfs,
    keep({id:"FINAL-1",name:"Chung kết",type:"KO",round:"FINAL",status:"SCHEDULED",a:adv("Winner BK1",sfs[0]),b:adv("Winner BK2",sfs[1]),games:[{home:"",away:"",saved:false}],winner:""},old["FINAL-1"]),
    keep({id:"THIRD-1",name:"Tranh hạng 3",type:"KO",round:"THIRD",status:"SCHEDULED",a:loser("Loser BK1",sfs[0]),b:loser("Loser BK2",sfs[1]),games:[{home:"",away:"",saved:false}],winner:""},old["THIRD-1"])
  ];
}
function roundKey(m){
  if(String(m.id||"").startsWith("QF")) return "QF";
  if(String(m.id||"").startsWith("SF")) return "SF";
  if(String(m.id||"").startsWith("FINAL")) return "FINAL";
  if(String(m.id||"").startsWith("THIRD")) return "THIRD";
  return "KO";
}
function roundLabelByKey(key){
  return {QF:"Tứ kết",SF:"Bán kết",THIRD:"Tranh hạng 3",FINAL:"Chung kết"}[key] || "Knockout";
}
function teamBlock(x, isWinner=false){
  const players=koPlayers(x);
  return <div className={`koStandingTeamV4113 ${isWinner ? "winnerTeamV4115" : ""}`}>
    {isWinner && <b className="winnerBadgeV4115">✓ Thắng</b>}
    {players ? players.split(" + ").filter(Boolean).map((p,i)=><span key={i}>{p}</span>) : <span>{koName(x)}</span>}
  </div>
}
function isWinnerSlot(slot,m){
  if(!m?.winner || !slot) return false;
  return m.winner===koName(slot) || slotMatches(slot,m.winner);
}

export default function StandingsCenter({ groups=[], schedule=[], knockout=[], config={}, setMsg }) {
  const [tab,setTab] = useState("all");
  const rules = {...DEFAULT_RULES,...(config.rules||{})};
  const standings = useMemo(()=>calcStandings(groups||[], schedule||[], rules), [groups,schedule,config]);
  const koList = useMemo(()=>normalizeKnockout(knockout||[]),[knockout]);
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
  const hasGroupScores = (schedule||[]).some(m=>m.type!=="KO" && matchDone(m));

  return <section className="standingsCenter">
    <div className="standingsHead">
      <div>
        <h2><Trophy/> Bảng xếp hạng & kết quả loại trực tiếp</h2>
        <p>Vòng bảng xếp hạng theo tiêu chí; các vòng Tứ kết, Bán kết, Tranh hạng 3, Chung kết hiển thị kết quả riêng bên dưới.</p>
      </div>
      <button className="mini" onClick={()=>setMsg?.("BXH và kết quả loại trực tiếp đã được tính lại.")}><RefreshCw size={14}/> Tính lại</button>
    </div>

    <div className="standingRuleBox">
      <b>Tiêu chí xếp hạng vòng bảng:</b>
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
      <button className={tab==="QF"?"active":""} onClick={()=>setTab("QF")}>Tứ kết</button>
      <button className={tab==="SF"?"active":""} onClick={()=>setTab("SF")}>Bán kết</button>
      <button className={tab==="THIRD"?"active":""} onClick={()=>setTab("THIRD")}>Tranh hạng 3</button>
      <button className={tab==="FINAL"?"active":""} onClick={()=>setTab("FINAL")}>Chung kết</button>
    </div>

    {tab==="best3" ? (hasGroupScores ? <BestThirdTable rows={top3}/> : <EmptyStandingsNotice/>) :
    ["QF","SF","THIRD","FINAL"].includes(tab) ? <KnockoutStandings knockout={koList} filter={tab} compact /> :
    <>
      {hasGroupScores ? <div className="standingGrid">
        {visibleGroups.map(group=><GroupStandingCard key={group} group={group} rows={standings[group]||[]}/>)}
      </div> : <EmptyStandingsNotice/>}
      <KnockoutStandings knockout={koList}/>
    </>}
  </section>
}

function EmptyStandingsNotice(){
  return <div className="emptyStandingsV4120">
    <b>Chưa có kết quả thi đấu</b>
    <span>BXH sẽ tự động hiển thị sau khi BTC hoặc trọng tài nhập điểm và kết thúc trận đầu tiên.</span>
  </div>
}

function GroupStandingCard({group,rows}) {
  return <div className="standingCard">
    <div className="standingCardHead">
      <h3>{group}</h3>
      <span>{rows.length} đội</span>
    </div>
    <table className="standingTable">
      <thead><tr><th>Hạng</th><th>Xét hạng</th><th>Tên VĐV</th><th>Trận</th><th>Thắng</th><th>Thua</th><th>HS</th><th>Điểm</th></tr></thead>
      <tbody>{rows.map(r=><tr key={r.name} className={r.rank<=3 ? `rank rank${r.rank}` : ""}>
        <td><b>{r.rank}</b></td>
        <td><span className={`rankPill rankPill${r.rank}`}>{rankLabel(r.rank)}</span></td>
        <td><small className="standingPlayers standingPlayersPrimaryV4111">{r.players}</small></td>
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
      <thead><tr><th>Thứ tự</th><th>Bảng</th><th>Tên VĐV</th><th>Trận</th><th>Thắng</th><th>Thua</th><th>HS</th><th>Điểm</th></tr></thead>
      <tbody>{rows.map((r,i)=><tr key={`${r.group}-${r.name}`} className={i<2 ? "qualified3" : ""}>
        <td><b>{i+1}</b>{i<2 && <em> vào nhánh</em>}</td>
        <td>{shortGroup(r.group)}</td>
        <td><small className="standingPlayers standingPlayersPrimaryV4111">{r.players}</small></td>
        <td>{r.played}</td>
        <td className="winCol">{r.win}</td>
        <td>{r.loss}</td>
        <td className={r.diff>=0?"positive":"negative"}>{r.diff>0?`+${r.diff}`:r.diff}</td>
        <td>{r.pf}</td>
      </tr>)}</tbody>
    </table>
  </div>
}

function KnockoutStandings({knockout=[], filter="", compact=false}) {
  const rounds=[["QF","Tứ kết"],["SF","Bán kết"],["THIRD","Tranh hạng 3"],["FINAL","Chung kết"]];
  const activeRounds = filter ? rounds.filter(([key])=>key===filter) : rounds;
  const any=activeRounds.some(([key])=>knockout.some(m=>roundKey(m)===key));
  if(!any) return <div className="koStandingBlockV4113"><p className="muted">Chưa có dữ liệu vòng này.</p></div>;
  return <div className={`koStandingBlockV4113 ${compact?"compactKoV4114":""}`}>
    {!compact && <div className="koStandingHeadV4113"><h2><GitBranch/> Kết quả loại trực tiếp</h2><span>Tứ kết · Bán kết · Tranh hạng 3 · Chung kết</span></div>}
    {activeRounds.map(([key,label])=>{
      const rows=knockout.filter(m=>roundKey(m)===key);
      if(!rows.length) return null;
      return <div className="koStandingRoundV4113" key={key}>
        <h3>{label}</h3>
        <div className="koStandingCardsV4113">
          {rows.map((m,idx)=><div className={`koStandingCardV4113 ${matchDone(m)?"done":""}`} key={m.id}>
            <div className="koStandingTitleV4113"><b>{m.name || `${label} ${idx+1}`}</b></div>
            <div className="koStandingVsV4113 koUnifiedV4118">{teamBlock(m.a,isWinnerSlot(m.a,m))}{scoreText(m) && <strong className="scorePillV4118">{scoreText(m)}</strong>}{teamBlock(m.b,isWinnerSlot(m.b,m))}</div>
          </div>)}
        </div>
      </div>
    })}
  </div>
}
