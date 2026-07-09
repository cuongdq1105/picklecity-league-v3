
import { useMemo, useState } from "react";
import { Eye, RefreshCw, ClipboardCopy, ListChecks, Table2, Clock, Trophy, GitBranch, Medal } from "lucide-react";
import PaymentBadge from "../components/PaymentBadge";
import { genderLabel, phoneHref } from "../utils/format";
import { calcStandings } from "../utils/draw";
import { DEFAULT_RULES } from "../utils/matchRules";

function scoreText(m){
  return (m.games||[]).filter(g=>g.saved).map(g=>`${g.home}-${g.away}`).join(", ");
}
function matchDone(m){ return (m.games||[]).some(g=>g.saved) || m.status==="DONE"; }
function shortPhone(p){ const s=String(p?.phone||"").replace(/\D/g,""); return s ? s.slice(-4) : ""; }
function displayPlayerName(p, dupNames=new Set()){
  const name = p?.full_name || "";
  if(!dupNames.has(name)) return name;
  const tail = shortPhone(p);
  return tail ? `${name} (${tail})` : name;
}
function groupPlayers(t, dupNames=new Set()){ return (t?.players||[]).map(p=>displayPlayerName(p,dupNames)).join(" + "); }
function teamPlayersArray(t, dupNames=new Set()){ return (t?.players||[]).map(p=>displayPlayerName(p,dupNames)); }
function duplicateNameSetFromList(list=[]){
  const counts={};
  (list||[]).forEach(p=>{ const n=p.full_name||""; if(n) counts[n]=(counts[n]||0)+1; });
  return new Set(Object.entries(counts).filter(([,c])=>c>1).map(([n])=>n));
}

function koName(x){ return koPlayers(x) || x?.team?.name || x?.row?.team?.name || x?.teamName || x?.winnerName || x?.slot || "—"; }
function koPlayers(x){ return x?.playerNames || (x?.team?.players || x?.row?.team?.players || []).map(p=>p.full_name).join(" + "); }
function cloneSlot(slot,label){
  if(!slot) return {slot:label};
  const name=koName(slot), players=koPlayers(slot);
  return {...slot, slot:label, teamName:name, winnerName:name, playerNames:players};
}
function slotMatches(slot,winner){
  const w=String(winner||"").trim();
  const arr=[slot?.slot,slot?.displaySlot,slot?.originalSlot,slot?.teamName,slot?.winnerName,slot?.team?.name,slot?.row?.team?.name].filter(Boolean).map(x=>String(x).trim());
  return arr.includes(w);
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
  return {...base, games:old.games||base.games, status:old.status||base.status, winner:old.winner||"", winnerTeam:old.winnerTeam||null, finishedAt:old.finishedAt||""};
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
function koRoundLabel(m){
  if(String(m.id||"").startsWith("QF")) return "Tứ kết";
  if(String(m.id||"").startsWith("SF")) return "Bán kết";
  if(String(m.id||"").startsWith("FINAL")) return "Chung kết";
  if(String(m.id||"").startsWith("THIRD")) return "Tranh hạng 3";
  return m.round || "Knockout";
}
function roundKey(m){
  if(String(m.id||"").startsWith("QF")) return "QF";
  if(String(m.id||"").startsWith("SF")) return "SF";
  if(String(m.id||"").startsWith("FINAL")) return "FINAL";
  if(String(m.id||"").startsWith("THIRD")) return "THIRD";
  return "KO";
}
function rankLabel(rank){
  if(rank===1) return "🥇 Nhất bảng";
  if(rank===2) return "🥈 Nhì bảng";
  if(rank===3) return "🥉 Ba bảng";
  return "";
}
function statusLabel(m){
  if(m.status==="DONE") return "Hoàn thành";
  if(m.status==="LIVE") return "Đang cập nhật";
  return "Chưa đấu";
}

function displayWinner(m){
  if(!m?.winner) return "";
  const isKo = m.a || m.b || m.type==="KO" || m._kind==="KO";
  if(isKo){
    const aWon = m.winner===koName(m.a) || slotMatches(m.a,m.winner);
    const bWon = m.winner===koName(m.b) || slotMatches(m.b,m.winner);
    const slot = aWon ? m.a : bWon ? m.b : m.winnerTeam;
    const players = koPlayers(slot);
    return players || m.winner;
  }
  if(m.winner===m.home?.name) return groupPlayers(m.home);
  if(m.winner===m.away?.name) return groupPlayers(m.away);
  return m.winner;
}

function koTeamForCard(x, isWinner=false){
  const players = koPlayers(x);
  return <div className={`pubTeamBox ${isWinner ? "winnerSideV4117" : ""}`}>
    {isWinner && <b className="winnerBadgeV4116">✓ Thắng</b>}
    {players ? <PlayerNameBlock names={players.split(" + ").filter(Boolean)}/> : <b>{koName(x)}</b>}
    {x?.slot && !players && <em>{x.slot}</em>}
  </div>
}
function PlayerNameBlock({names=[]}){
  return <div className="playerNameBlockV4111">{names.map((n,i)=><span key={i}>👤 {n}</span>)}</div>
}
function GroupTeamBox({team, duplicateNames=new Set(), isWinner=false}){
  const names = teamPlayersArray(team, duplicateNames);
  return <div className={`pubTeamBox ${isWinner ? "winnerSideV4117" : ""}`}>
    {isWinner && <b className="winnerBadgeV4116">✓ Thắng</b>}
    {names.length ? <PlayerNameBlock names={names}/> : <b>{team?.name || "—"}</b>}
  </div>
}
function isKoWinnerSide(m, side){
  const slot = side==="home" ? m.a : m.b;
  return !!m?.winner && (m.winner===koName(slot) || slotMatches(slot,m.winner));
}
function isGroupWinnerSide(m, side){
  return !!m?.winner && (side==="home" ? m.winner===m.home?.name : m.winner===m.away?.name);
}

export default function Public({ list=[], draw, schedule = [], knockout = [], onRefresh }) {
  const [publicTab, setPublicTab] = useState("list");
  const [resultFilter, setResultFilter] = useState("all");
  const [scheduleFilter, setScheduleFilter] = useState("all");

  const total = list.length;
  const confirmed = list.filter(x=>x.payment_status==="BTC_CONFIRMED").length;
  const pending = total - confirmed;
  const groupMatches = useMemo(()=> (schedule||[]).filter(m=>m.type!=="KO"),[schedule]);
  const hasGroupScores = groupMatches.some(m=>matchDone(m));
  const groupStageComplete = groupMatches.length > 0 && groupMatches.every(m=>m.status==="DONE");
  const koList = useMemo(()=> groupStageComplete ? normalizeKnockout(knockout||[]) : [],[knockout,groupStageComplete]);
  const duplicateNames = useMemo(()=>duplicateNameSetFromList(list||[]),[list]);
  const publicStandings = useMemo(()=>calcStandings(draw?.groups||[], schedule||[], DEFAULT_RULES),[draw,schedule]);

  const scheduleTabs = useMemo(()=>{
    const groups=[...new Set((schedule||[]).map(m=>m.group).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"vi"));
    return [{key:"all",label:"Tất cả",count:schedule.length+koList.length}, ...groups.map(g=>({key:g,label:g,count:schedule.filter(m=>m.group===g).length})),
      {key:"QF",label:"Tứ kết",count:koList.filter(m=>roundKey(m)==="QF").length},
      {key:"SF",label:"Bán kết",count:koList.filter(m=>roundKey(m)==="SF").length},
      {key:"THIRD",label:"Tranh 3",count:koList.filter(m=>roundKey(m)==="THIRD").length},
      {key:"FINAL",label:"Chung kết",count:koList.filter(m=>roundKey(m)==="FINAL").length}
    ].filter(t=>t.key==="all" || t.count>0);
  },[schedule,koList]);

  const visibleSchedule = useMemo(()=>{
    if(scheduleFilter==="all") return [...schedule, ...koList];
    if(["QF","SF","THIRD","FINAL"].includes(scheduleFilter)) return koList.filter(m=>roundKey(m)===scheduleFilter);
    return (schedule||[]).filter(m=>m.group===scheduleFilter);
  },[schedule,koList,scheduleFilter]);

  const resultTabs = useMemo(()=>{
    const doneGroup=schedule.filter(matchDone);
    return [
      {key:"all",label:"Tất cả",count:doneGroup.length+koList.filter(matchDone).length},
      {key:"GROUP",label:"Vòng bảng",count:doneGroup.length},
      {key:"QF",label:"Tứ kết",count:koList.filter(m=>roundKey(m)==="QF"&&matchDone(m)).length},
      {key:"SF",label:"Bán kết",count:koList.filter(m=>roundKey(m)==="SF"&&matchDone(m)).length},
      {key:"THIRD",label:"Tranh hạng 3",count:koList.filter(m=>roundKey(m)==="THIRD"&&matchDone(m)).length},
      {key:"FINAL",label:"Chung kết",count:koList.filter(m=>roundKey(m)==="FINAL"&&matchDone(m)).length}
    ];
  },[schedule,koList]);

  const visibleResults = useMemo(()=>{
    const groupDone=(schedule||[]).filter(matchDone).map(m=>({...m,_kind:"GROUP"}));
    const koDone=koList.filter(matchDone).map(m=>({...m,_kind:"KO"}));
    if(resultFilter==="all") return [...groupDone,...koDone];
    if(resultFilter==="GROUP") return groupDone;
    return koDone.filter(m=>roundKey(m)===resultFilter);
  },[schedule,koList,resultFilter]);

  function copyPublicDraw() {
    if (!draw) return;
    const lines = [];
    (draw.groups || []).forEach(g => {
      lines.push(g.name);
      (g.teams || []).forEach(t => lines.push(`${t.name}: ${(t.players || []).map(p => p.full_name).join(" + ")}`));
      lines.push("");
    });
    navigator.clipboard.writeText(lines.join("\n"));
  }

  function copySchedule() {
    const lines = (visibleSchedule || []).map((m,i)=>`${i+1}. ${m.time ? m.time + " - " : ""}${m.court? "Sân "+m.court+" - ":""}${m.group||koRoundLabel(m)}: ${groupPlayers(m.home, duplicateNames)||koPlayers(m.a)||koName(m.a)} gặp ${groupPlayers(m.away, duplicateNames)||koPlayers(m.b)||koName(m.b)}`);
    navigator.clipboard.writeText(lines.join("\n"));
  }

  return <main className="card wide publicUxV4110">
    <div className="card-title"><Eye/> Công khai giải đấu <button className="mini" onClick={onRefresh}><RefreshCw size={14}/> Tải lại</button></div>

    <div className="publicStats">
      <div><b>{total}</b><span>Tổng VĐV</span></div>
      <div><b>{confirmed}</b><span>Đăng ký hợp lệ</span></div>
      <div><b>{pending}</b><span>Chờ BTC xác nhận</span></div>
    </div>

    <div className="publicSubTabs">
      <button className={publicTab==="list"?"active":""} onClick={()=>setPublicTab("list")}><ListChecks size={15}/> Danh sách</button>
      <button className={publicTab==="groups"?"active":""} onClick={()=>setPublicTab("groups")}><Table2 size={15}/> Bảng đấu</button>
      <button className={publicTab==="schedule"?"active":""} onClick={()=>setPublicTab("schedule")}><Clock size={15}/> Giờ thi đấu</button>
      <button className={publicTab==="results"?"active":""} onClick={()=>setPublicTab("results")}><Trophy size={15}/> Kết quả</button>
      <button className={publicTab==="standings"?"active":""} onClick={()=>setPublicTab("standings")}><Medal size={15}/> BXH</button>
      <button className={publicTab==="bracket"?"active":""} onClick={()=>setPublicTab("bracket")}><GitBranch size={15}/> Nhánh đấu</button>
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
      <div className="sectionHeadV4110"><h2>Bảng đấu</h2><button className="inlineBtn" onClick={copyPublicDraw}><ClipboardCopy size={14}/> Copy bảng đấu</button></div>
      {draw ? <PublicGroups groups={draw.groups||[]} duplicateNames={duplicateNames}/> : <p className="muted">BTC chưa công bố kết quả bốc thăm.</p>}
    </section>}

    {publicTab==="schedule" && <section>
      <div className="sectionHeadV4110"><h2>Giờ thi đấu</h2><button className="inlineBtn" onClick={copySchedule}><ClipboardCopy size={14}/> Copy lịch</button></div>
      {visibleSchedule.length > 0 ? <>
        <div className="publicFilterTabs">
          {scheduleTabs.map(t=><button key={t.key} className={scheduleFilter===t.key?"active":""} onClick={()=>setScheduleFilter(t.key)}>{t.label} <b>{t.count}</b></button>)}
        </div>
        <ScheduleList matches={visibleSchedule} duplicateNames={duplicateNames}/>
      </> : <p className="muted">BTC chưa xếp lịch thi đấu.</p>}
    </section>}

    {publicTab==="results" && <section>
      <h2>Kết quả thi đấu</h2>
      <div className="publicFilterTabs resultTabs">
        {resultTabs.map(t=><button key={t.key} className={resultFilter===t.key?"active":""} onClick={()=>setResultFilter(t.key)}>{t.label} <b>{t.count}</b></button>)}
      </div>
      {visibleResults.length ? <div className="resultCardsPublic">
        {visibleResults.map((m,i)=><MatchResultCard key={m.id||i} match={m} duplicateNames={duplicateNames}/>)}
      </div> : <p className="muted">Chưa có kết quả trong mục này.</p>}
    </section>}

    {publicTab==="standings" && <section>
      <h2>Bảng xếp hạng</h2>
      <PublicStandings standings={publicStandings} knockout={koList} duplicateNames={duplicateNames} hasGroupScores={hasGroupScores}/>
    </section>}

    {publicTab==="bracket" && <section>
      <h2>Nhánh đấu</h2>
      <PublicBracket knockout={koList} duplicateNames={duplicateNames} hasGroupScores={hasGroupScores} groupStageComplete={groupStageComplete}/>
    </section>}
  </main>
}

function PublicGroups({groups=[], duplicateNames=new Set()}) {
  return <div className="pubGroupGridV4110">
    {groups.map(g=><div className="pubGroupCardV4110" key={g.name}>
      <h3>{g.name}<span>{(g.teams||[]).length} đội</span></h3>
      <div className="pubTeamListV4110">
        {(g.teams||[]).map((t,i)=><div className="pubTeamItemV4110" key={t.name||i}>
          <div>{(t.players||[]).map((p,idx)=><span key={idx}>👤 {displayPlayerName(p, duplicateNames)}{p.phone ? <small>{p.phone}</small> : null}</span>)}</div>
        </div>)}
      </div>
    </div>)}
  </div>
}

function ScheduleList({matches=[], duplicateNames=new Set()}) {
  return <div className="scheduleTimelineV4110">
    {matches.map((m,i)=><div className="scheduleRowV4110" key={m.id||i}>
      <div className="scheduleTimeV4110"><b>{m.time || "Chưa giờ"}</b><span>{m.court ? `Sân ${m.court}` : koRoundLabel(m)}</span></div>
      <div className="scheduleContentV4110">
        <em>{m.group || koRoundLabel(m)}</em>
        <div className="scheduleTeamsPublic">
          {m._kind==="KO" || m.type==="KO" || m.a ? <>
            {koTeamForCard(m.a,isKoWinnerSide(m,"home"))}<strong className="vsHiddenV4118">vs</strong>{koTeamForCard(m.b,isKoWinnerSide(m,"away"))}
          </> : <>
            <GroupTeamBox team={m.home} duplicateNames={duplicateNames} isWinner={isGroupWinnerSide(m,"home")}/><strong className="vsHiddenV4118">vs</strong><GroupTeamBox team={m.away} duplicateNames={duplicateNames} isWinner={isGroupWinnerSide(m,"away")}/>
          </>}
        </div>
        <span className="scoreSmallV4110">{scoreText(m)||statusLabel(m)}</span>
      </div>
    </div>)}
  </div>
}

function MatchResultCard({match:m, duplicateNames=new Set()}) {
  const isKo=m._kind==="KO" || m.type==="KO" || m.a;
  const score = scoreText(m);
  return <div className="publicResultCard resultCardUnifiedV4118">
    <div className="resultCardHeadV4118"><b>{isKo?koRoundLabel(m):m.group}</b><span>{m.time || ""}{m.court ? ` · Sân ${m.court}` : ""}</span></div>
    <div className="resultVsV4110 resultUnifiedV4118">
      {isKo ? <>{koTeamForCard(m.a,isKoWinnerSide(m,"home"))}{score && <strong className="scorePillV4118">{score}</strong>}{koTeamForCard(m.b,isKoWinnerSide(m,"away"))}</> :
        <><GroupTeamBox team={m.home} duplicateNames={duplicateNames} isWinner={isGroupWinnerSide(m,"home")}/>{score && <strong className="scorePillV4118">{score}</strong>}<GroupTeamBox team={m.away} duplicateNames={duplicateNames} isWinner={isGroupWinnerSide(m,"away")}/></>}
    </div>
    {!score && <em>{statusLabel(m)}</em>}
  </div>
}

function PublicStandings({standings={}, knockout=[], duplicateNames=new Set(), hasGroupScores=false}) {
  const groups = Object.entries(standings||{});
  const final=knockout.find(m=>roundKey(m)==="FINAL");
  const third=knockout.find(m=>roundKey(m)==="THIRD");
  if(!hasGroupScores) return <div className="stageGateNoticeV4123"><b>Chưa có kết quả vòng bảng</b><span>BXH sẽ hiển thị sau khi có trận đầu tiên được nhập điểm và kết thúc.</span></div>;
  return <>
    {(final?.winner || third?.winner) && <div className="podiumV4110">
      {final?.winner && <div><span>🥇 Vô địch</span><b>{final.winner}</b></div>}
      {final?.winner && <div><span>🥈 Á quân</span><b>{final.winner===koName(final.a)?koName(final.b):koName(final.a)}</b></div>}
      {third?.winner && <div><span>🥉 Hạng 3</span><b>{third.winner}</b></div>}
    </div>}
    <KnockoutSummary knockout={knockout}/>
    {!groups.length ? <p className="muted">BTC chưa công bố bảng xếp hạng.</p> : <div className="publicStandingGrid">
      {groups.map(([group,rows=[]])=><div className="publicStandingCard" key={group}>
        <h3>{group}</h3>
        <table><thead><tr><th>Hạng</th><th>Xét hạng</th><th>Tên đội / VĐV</th><th>Thắng</th><th>Thua</th><th>HS</th><th>Điểm</th></tr></thead>
          <tbody>{rows.map(r=><tr key={r.name} className={r.rank<=3?"ranked":""}>
            <td><b>{r.rank}</b></td><td><span className={`rankPill rankPill${r.rank}`}>{rankLabel(r.rank)}</span></td><td><small className="standingPlayers standingPlayersPrimaryV4111">{r.players}</small></td><td>{r.win}</td><td>{r.loss}</td><td>{r.diff>0?`+${r.diff}`:r.diff}</td><td>{r.pf ?? 0}</td>
          </tr>)}</tbody>
        </table>
      </div>)}
    </div>}
  </>
}

function KnockoutSummary({knockout=[]}) {
  if(!knockout.length) return null;
  const rounds=[["QF","Tứ kết"],["SF","Bán kết"],["THIRD","Tranh hạng 3"],["FINAL","Chung kết"]];
  return <div className="koSummaryV4110">
    {rounds.map(([key,label])=>{
      const rows=knockout.filter(m=>roundKey(m)===key);
      if(!rows.length) return null;
      return <div key={key}><h3>{label}</h3>{rows.map(m=><MatchResultCard key={m.id} match={{...m,_kind:"KO"}} duplicateNames={duplicateNames} />)}</div>
    })}
  </div>
}

function PublicBracket({knockout=[], duplicateNames=new Set(), hasGroupScores=false, groupStageComplete=false}) {
  const qfs = knockout.filter(m=>roundKey(m)==="QF");
  const semis = knockout.filter(m=>roundKey(m)==="SF");
  const finals = knockout.filter(m=>roundKey(m)==="FINAL");
  const third = knockout.filter(m=>roundKey(m)==="THIRD");
  if(!hasGroupScores) return <div className="stageGateNoticeV4123"><b>Chưa có kết quả vòng bảng</b><span>Chưa xếp hạng và chưa xác định các đội vào vòng tiếp theo.</span></div>;
  if(!groupStageComplete) return <div className="stageGateNoticeV4123"><b>Vòng bảng chưa hoàn thành</b><span>Nhánh đấu sẽ hiển thị sau khi toàn bộ trận vòng bảng kết thúc.</span></div>;
  if(!qfs.length && !semis.length && !finals.length && !third.length) return <p className="muted">BTC chưa sinh nhánh đấu.</p>;
  return <div className="publicBracketTreeWrap">
    <div className="publicBracketTree">
      <div className="publicBracketRound"><h3>Tứ kết</h3>{qfs.map((m,i)=><PublicBracketMatch key={m.id||i} match={m} code={`QF${i+1}`}/>)}</div>
      <div className="publicBracketRound"><h3>Bán kết</h3>{semis.map((m,i)=><PublicBracketMatch key={m.id||i} match={m} code={`BK${i+1}`}/>)}</div>
      <div className="publicBracketRound"><h3>Chung kết</h3>{finals.map(m=><PublicBracketMatch key={m.id} match={m} code="CK" champion />)}<h3>Tranh hạng 3</h3>{third.map(m=><PublicBracketMatch key={m.id} match={m} code="Hạng 3" />)}</div>
    </div>
  </div>
}
function PublicBracketMatch({match,code,champion=false}) {
  const done = match.status==="DONE" || !!match.winner;
  const live = match.status==="LIVE";
  const score = scoreText(match);
  return <div className={`publicTreeMatch ${done?"done":live?"live":"pending"} ${champion?"champion":""}`}>
    <div className="publicTreeMatchHead"><b>{code}</b><span>{match.name}</span></div>
    <div className="publicTreeTeams"><PublicTeamLine item={match.a} winner={match.winner}/><em className="vsHiddenV4118">vs</em><PublicTeamLine item={match.b} winner={match.winner}/></div>
    {score && <strong className="publicTreeScore">{score}</strong>}

  </div>
}
function PublicTeamLine({item,winner}) {
  const name = koName(item);
  const players = koPlayers(item);
  const isWinner = winner && (winner === name || slotMatches(item,winner));
  return <div className={isWinner ? "teamLine winner" : "teamLine"}>
    {!players && item?.slot && <small>{item.slot}</small>}
    {players ? <PlayerNameBlock names={players.split(" + ").filter(Boolean)}/> : <b>{name}</b>}
  </div>
}
