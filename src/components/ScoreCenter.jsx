
import { useMemo, useState } from "react";
import { Save, CheckCircle2, Trophy, Table2, RefreshCw, GitBranch } from "lucide-react";
import { scoreSummary, targetForMatch, validateGameScore, DEFAULT_RULES } from "../utils/matchRules";

function nowText(){
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
}
function koTeamName(x){ return koRealTeamName(x); }
function koPlayers(x){ return x?.playerNames || (x?.team?.players || x?.row?.team?.players || []).map(p=>p.full_name).join(" + "); }
function koRealTeamName(x){ return x?.team?.name || x?.row?.team?.name || x?.teamName || x?.winnerName || x?.slot || "—"; }
function isPlaceholderName(name){ return /^(Winner|Loser|Best3|A\d|B\d|C\d|D\d|E\d|F\d)/i.test(String(name||"").trim()); }
function hasRealTeam(x){ return !!(x?.team?.name || x?.row?.team?.name || (x?.teamName && !isPlaceholderName(x.teamName)) || koPlayers(x)); }
function slotMatchesWinner(slotObj,winner){
  const w = String(winner||"").trim();
  if(!w) return false;
  const candidates = [slotObj?.slot,slotObj?.displaySlot,slotObj?.originalSlot,slotObj?.teamName,slotObj?.winnerName,slotObj?.team?.name,slotObj?.row?.team?.name]
    .filter(Boolean).map(x=>String(x).trim());
  return candidates.includes(w);
}
function groupPlayers(t){ return (t?.players||[]).map(p=>p.full_name).join(" + "); }
function makeKoScoreable(m){ return {...m, home:{name:koTeamName(m.a), players:m.a?.team?.players||m.a?.row?.team?.players||[]}, away:{name:koTeamName(m.b), players:m.b?.team?.players||m.b?.row?.team?.players||[]}}; }
function koRoundLabel(m){
  if(m.id?.startsWith("QF")) return "Tứ kết";
  if(m.id?.startsWith("SF")) return "Bán kết";
  if(m.id?.startsWith("FINAL")) return "Chung kết";
  if(m.id?.startsWith("THIRD")) return "Tranh giải 3";
  return m.round || "Knockout";
}
function cloneSlotWithLabel(slotObj,label){
  if(!slotObj) return {slot:label};
  const players = slotObj?.playerNames || (slotObj?.team?.players || slotObj?.row?.team?.players || []).map(p=>p.full_name).join(" + ");
  const realName = koRealTeamName(slotObj);
  return {
    ...slotObj,
    slot: label,
    teamName: realName,
    winnerName: realName,
    playerNames: players
  };
}
function winnerSlot(m){
  if(!m?.winner) return null;
  if(m.winnerTeam) return m.winnerTeam;
  const aName=koTeamName(m.a), bName=koTeamName(m.b);
  if(m.winner===aName) return m.a;
  if(m.winner===bName) return m.b;
  return {slot:m.winner, teamName:m.winner, winnerName:m.winner, playerNames:""};
}
function loserSlot(m){
  if(!m?.winner) return null;
  const aName=koTeamName(m.a), bName=koTeamName(m.b);
  if(m.winner===aName) return m.b;
  if(m.winner===bName) return m.a;
  return null;
}
function adv(label, m){
  const w=winnerSlot(m);
  return w ? cloneSlotWithLabel(w,label) : {slot:label};
}
function loser(label, m){
  const l=loserSlot(m);
  return l ? cloneSlotWithLabel(l,label) : {slot:label};
}
function mergeKeep(base, old){
  if(!old) return base;
  return {...base, games:old.games||base.games, status:old.status||base.status, winner:old.winner||"", finishedAt:old.finishedAt||"", editing:old.editing||false};
}
function normalizeKnockout(list=[]){
  const qfs=(list||[]).filter(m=>String(m.id||"").startsWith("QF"));
  const old=Object.fromEntries((list||[]).map(m=>[m.id,m]));
  const sfBase=[
    {id:"SF-1",name:"Bán kết 1",type:"KO",round:"SF",status:"SCHEDULED",a:adv("Winner QF1",old["QF-1"]),b:adv("Winner QF4",old["QF-4"]),games:[{home:"",away:"",saved:false}],winner:""},
    {id:"SF-2",name:"Bán kết 2",type:"KO",round:"SF",status:"SCHEDULED",a:adv("Winner QF2",old["QF-2"]),b:adv("Winner QF3",old["QF-3"]),games:[{home:"",away:"",saved:false}],winner:""}
  ];
  const sfs=sfBase.map(m=>mergeKeep(m,old[m.id]));
  const finalBase={id:"FINAL-1",name:"Chung kết",type:"KO",round:"FINAL",status:"SCHEDULED",a:adv("Winner BK1",sfs[0]),b:adv("Winner BK2",sfs[1]),games:[{home:"",away:"",saved:false}],winner:""};
  const thirdBase={id:"THIRD-1",name:"Tranh giải 3",type:"KO",round:"THIRD",status:"SCHEDULED",a:loser("Loser BK1",sfs[0]),b:loser("Loser BK2",sfs[1]),games:[{home:"",away:"",saved:false}],winner:""};
  return [...qfs, ...sfs, mergeKeep(finalBase,old["FINAL-1"]), mergeKeep(thirdBase,old["THIRD-1"])];
}
function canPlayKo(m){
  return hasRealTeam(m.a) && hasRealTeam(m.b);
}

export default function ScoreCenter({ groups=[], schedule=[], setSchedule, knockout=[], setKnockout, config={}, setMsg }) {
  const rules = {...DEFAULT_RULES,...(config.rules||{})};
  const koList = useMemo(()=>normalizeKnockout(knockout||[]),[knockout]);
  const groupNames = useMemo(()=>["Tất cả", ...(groups||[]).map(g=>g.name), "Tứ kết", "Bán kết", "Tranh giải 3", "Chung kết"], [groups]);
  const [group,setGroup] = useState(groupNames[1] || "Tất cả");
  const [status,setStatus] = useState("all");

  const allMatches = useMemo(()=>{
    const groupMatches=(schedule||[]).map(m=>({...m,_scope:"GROUP",_filter:m.group,_title:m.group,_home:m.home?.name,_away:m.away?.name,_playersHome:groupPlayers(m.home),_playersAway:groupPlayers(m.away)}));
    const koMatches=koList.map(m=>({...m,_scope:"KO",_filter:koRoundLabel(m),_title:koRoundLabel(m),_home:koTeamName(m.a),_away:koTeamName(m.b),_playersHome:koPlayers(m.a),_playersAway:koPlayers(m.b)}));
    return [...groupMatches,...koMatches];
  },[schedule,koList]);

  const filtered = useMemo(()=>{
    return allMatches.filter(m=>{
      const okGroup = group === "Tất cả" || m._filter === group;
      const okStatus = status === "all" || (status === "done" ? m.status==="DONE" : m.status!=="DONE");
      return okGroup && okStatus;
    }).sort((a,b)=>String(a.time||"").localeCompare(String(b.time||"")) || Number(a.court||0)-Number(b.court||0));
  },[allMatches,group,status]);

  const stats = useMemo(()=>{
    const list = group === "Tất cả" ? allMatches : allMatches.filter(m=>m._filter===group);
    return { total:list.length, done:list.filter(m=>m.status==="DONE").length, live:list.filter(m=>m.status==="LIVE").length, pending:list.filter(m=>m.status!=="DONE").length }
  },[allMatches,group]);

  function updateGroupDraft(id, idx, side, value){
    setSchedule((schedule||[]).map(m=>{
      if(m.id!==id)return m;
      const games=[...(m.games||[{home:"",away:"",saved:false}])];
      games[idx]={...games[idx],[side]:value};
      return {...m,games,status:m.status==="DONE"?"DONE":"LIVE"};
    }));
  }
  function saveGroupGame(id, idx){
    let msg="";
    setSchedule((schedule||[]).map(m=>{
      if(m.id!==id)return m;
      const games=[...(m.games||[])], g=games[idx]||{home:"",away:""};
      const valid=validateGameScore(g.home,g.away,targetForMatch(m,rules));
      if(!valid.ok){msg=valid.message;return m;}
      games[idx]={...g,saved:true,savedAt:nowText()};
      const ns={...m,games,status:"LIVE"}, ss=scoreSummary(ns,rules);
      msg=`Đã lưu ${m.group} - ${m.home.name} vs ${m.away.name}: ${g.home}-${g.away}`;
      return {...ns,winner:ss.winner};
    }));
    setMsg(msg||"Đã lưu game.");
  }
  function finishGroupMatch(id){
    let msg="";
    setSchedule((schedule||[]).map(m=>{
      if(m.id!==id)return m;
      const ss=scoreSummary(m,rules);
      if(!ss.winner){msg="Chưa đủ game đã lưu để kết thúc trận.";return m;}
      msg=`Đã kết thúc trận. Đội thắng: ${ss.winner}`;
      return {...m,status:"DONE",winner:ss.winner,finishedAt:nowText(),editing:false};
    }));
    setMsg(msg);
  }
  function mutateKo(fn){
    const base=normalizeKnockout(knockout||[]);
    const next=fn(base);
    setKnockout(normalizeKnockout(next));
  }
  function updateKoDraft(id, idx, side, value){
    mutateKo(list=>list.map(m=>{
      if(m.id!==id)return m;
      const games=[...(m.games||[{home:"",away:"",saved:false}])];
      games[idx]={...games[idx],[side]:value};
      return {...m,games,status:m.status==="DONE"?"DONE":"LIVE"};
    }));
  }
  function saveKoGame(id, idx){
    let msg="";
    mutateKo(list=>list.map(m=>{
      if(m.id!==id)return m;
      if(!canPlayKo(m)){msg="Trận này chưa xác định đủ đội."; return m;}
      const games=[...(m.games||[])], g=games[idx]||{home:"",away:""};
      const fake=makeKoScoreable(m);
      const valid=validateGameScore(g.home,g.away,targetForMatch(fake,rules));
      if(!valid.ok){msg=valid.message;return m;}
      games[idx]={...g,saved:true,savedAt:nowText()};
      const ss=scoreSummary({...fake,games,status:"LIVE"},rules);
      const wSlot = ss.winner === koTeamName(m.a) ? m.a : ss.winner === koTeamName(m.b) ? m.b : null;
      const winnerTeam = wSlot ? cloneSlotWithLabel(wSlot, m.id?.startsWith("QF") ? `Winner ${m.name}` : `Winner ${m.name}`) : null;
      msg=`Đã lưu ${m.name}: ${g.home}-${g.away}`;
      return {...m,games,status:"LIVE",winner:ss.winner,winnerTeam};
    }));
    setMsg(msg||"Đã lưu game.");
  }
  function addGame(match){
    if(match._scope==="KO") mutateKo(list=>list.map(m=>m.id===match.id?{...m,games:[...(m.games||[]),{home:"",away:"",saved:false}]}:m));
    else setSchedule((schedule||[]).map(m=>m.id===match.id?{...m,games:[...(m.games||[]),{home:"",away:"",saved:false}]}:m));
  }
  function finishKo(id){
    let msg="";
    mutateKo(list=>list.map(m=>{
      if(m.id!==id)return m;
      const fake=makeKoScoreable(m), ss=scoreSummary(fake,rules);
      if(!ss.winner){msg="Chưa đủ game đã lưu để kết thúc trận.";return m;}
      const wSlot = ss.winner === koTeamName(m.a) ? m.a : ss.winner === koTeamName(m.b) ? m.b : null;
      const winnerTeam = wSlot ? cloneSlotWithLabel(wSlot, m.id?.startsWith("QF") ? `Winner ${m.name}` : `Winner ${m.name}`) : null;
      msg=`Đã kết thúc ${m.name}. Đội thắng: ${ss.winner}`;
      return {...m,status:"DONE",winner:ss.winner,winnerTeam,finishedAt:nowText(),editing:false};
    }));
    setMsg(msg);
  }
  function unlockMatch(match){
    if(!confirm("Mở sửa điểm trận này? Sau khi sửa cần bấm Lưu lại và Kết thúc trận lại.")) return;
    if(match._scope==="KO") mutateKo(list=>list.map(m=>m.id===match.id?{...m,games:(m.games||[]).map(g=>({...g,saved:false,edited:true})),status:"LIVE",winner:"",winnerTeam:null,finishedAt:"",editing:true}:m));
    else setSchedule((schedule||[]).map(m=>m.id===match.id?{...m,games:(m.games||[]).map(g=>({...g,saved:false,edited:true})),status:"LIVE",winner:"",winnerTeam:null,finishedAt:"",editing:true}:m));
    setMsg("Đã mở sửa điểm. Hãy sửa tỷ số, bấm Lưu từng game, rồi Kết thúc trận lại.");
  }
  function clearMatchScore(match){
    if(!confirm("Xóa toàn bộ điểm trận này để nhập lại?")) return;
    if(match._scope==="KO") mutateKo(list=>list.map(m=>m.id===match.id?{...m,games:[{home:"",away:"",saved:false}],status:"SCHEDULED",winner:"",winnerTeam:null,finishedAt:"",editing:true}:m));
    else setSchedule((schedule||[]).map(m=>m.id===match.id?{...m,games:[{home:"",away:"",saved:false}],status:"SCHEDULED",winner:"",winnerTeam:null,finishedAt:"",editing:true}:m));
    setMsg("Đã xóa điểm trận. Hãy nhập lại Game 1.");
  }

  return <section className="scoreCenter">
    <div className="scoreCenterHead">
      <div>
        <h2><Trophy/> Cập nhật điểm số</h2>
        <p>Nhập điểm vòng bảng, tứ kết, bán kết, tranh giải 3 và chung kết trong cùng một màn hình.</p>
      </div>
      <button className="mini" onClick={()=>setMsg("Đã làm mới khu cập nhật điểm.")}><RefreshCw size={14}/> Làm mới</button>
    </div>
    <div className="scoreFilters">
      <label>Chọn vòng / bảng
        <select value={group} onChange={e=>setGroup(e.target.value)}>
          {groupNames.map(g=><option key={g} value={g}>{g}</option>)}
        </select>
      </label>
      <label>Trạng thái
        <select value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="all">Tất cả trận</option><option value="pending">Chưa hoàn thành</option><option value="done">Đã hoàn thành</option>
        </select>
      </label>
    </div>
    <div className="scoreStats">
      <div><b>{stats.total}</b><span>Tổng trận</span></div><div><b>{stats.pending}</b><span>Chưa xong</span></div><div><b>{stats.live}</b><span>Đang nhập</span></div><div><b>{stats.done}</b><span>Hoàn thành</span></div>
    </div>
    <div className="scoreGroupTabs">
      {groupNames.map(g=><button key={g} className={group===g?"active":""} onClick={()=>setGroup(g)}>{["Tứ kết","Bán kết","Tranh giải 3","Chung kết"].includes(g)?<GitBranch size={14}/>:<Table2 size={14}/>} {g}</button>)}
    </div>
    <div className="scoreMatchList">
      {filtered.length ? filtered.map(m=><ScoreMatchCard key={`${m._scope}-${m.id}`} match={m} rules={rules}
        onDraft={(id,idx,side,val)=>m._scope==="KO"?updateKoDraft(id,idx,side,val):updateGroupDraft(id,idx,side,val)}
        onSaveGame={(id,idx)=>m._scope==="KO"?saveKoGame(id,idx):saveGroupGame(id,idx)}
        onAddGame={()=>addGame(m)}
        onFinish={()=>m._scope==="KO"?finishKo(m.id):finishGroupMatch(m.id)}
        onUnlock={()=>unlockMatch(m)}
        onClear={()=>clearMatchScore(m)}
      />) : <p className="muted">Không có trận phù hợp.</p>}
    </div>
  </section>
}

function PlayerNameBlockV4111({text}){
  const names = String(text||"").split(" + ").filter(Boolean);
  return names.length ? <div className="playerNameBlockV4111">{names.map((n,i)=><span key={i}>👤 {n}</span>)}</div> : null;
}
function ScoreMatchCard({match,rules,onDraft,onSaveGame,onAddGame,onFinish,onUnlock,onClear}) {
  const scoreable = match._scope==="KO" ? makeKoScoreable(match) : match;
  const ss=scoreSummary(scoreable,rules);
  const rule=targetForMatch(scoreable,rules);
  const canPlay = match._scope!=="KO" || canPlayKo(match);
  return <div className={`scoreMatchCard ${match.status==="DONE"?"done":""} ${match._scope==="KO"?"koMatchCard":""}`}>
    <div className="scoreMatchTop">
      <div>
        <b>{match._title} · {match.time || "Chưa giờ"} {match.court ? `· Sân ${match.court}` : ""}</b>
        <span>{rule.label}</span>
      </div>
      <em>{match.editing?"Đang sửa":match.status==="DONE"?"✓ Hoàn thành":match.status==="LIVE"?"LIVE":"Chờ điểm"}</em>
    </div>
    <div className="scoreMatchTeams scoreMatchTeamsFull">
      <strong>{match._playersHome ? <PlayerNameBlockV4111 text={match._playersHome}/> : match._home}</strong>
      <span>vs</span>
      <strong>{match._playersAway ? <PlayerNameBlockV4111 text={match._playersAway}/> : match._away}</strong>
    </div>
    {!canPlay && <p className="warnLine">Trận này chưa xác định đủ đội. Hãy kết thúc vòng trước để hệ thống tự điền đội.</p>}
    {(match.games||[{home:"",away:"",saved:false}]).map((g,i)=><div className={`scoreGameLine ${g.saved?"saved":""}`} key={i}>
      <span>Game {i+1}</span>
      <input disabled={g.saved || !canPlay} value={g.home} onChange={e=>onDraft(match.id,i,"home",e.target.value)} placeholder="0"/>
      <b>-</b>
      <input disabled={g.saved || !canPlay} value={g.away} onChange={e=>onDraft(match.id,i,"away",e.target.value)} placeholder="0"/>
      <button disabled={g.saved || !canPlay} onClick={()=>onSaveGame(match.id,i)}><Save size={14}/> {g.saved?"Đã lưu":"Lưu"}</button>
      {g.saved && <small>{g.savedAt}</small>}
    </div>)}
    <div className="scoreMatchActions">
      {match.status==="DONE" ? <>
        <button className="mini editScoreBtn" onClick={onUnlock}>✎ Mở sửa điểm</button>
        <button className="mini dangerScoreBtn" onClick={onClear}>Xóa nhập lại</button>
      </> : <>
        <button className="mini" disabled={!canPlay} onClick={onAddGame}>+ Game</button>
        <button className="mini primary" disabled={!canPlay} onClick={onFinish}><CheckCircle2 size={14}/> Kết thúc trận</button>
      </>}
      {ss.winner && <strong>Thắng: {ss.winner}</strong>}
      {match.editing && <em className="editingBadge">Đang sửa điểm</em>}
    </div>
  </div>
}
