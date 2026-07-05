
import { useMemo, useState } from "react";
import { Save, CheckCircle2, Trophy, Table2, RefreshCw } from "lucide-react";
import { scoreSummary, targetForMatch, validateGameScore, DEFAULT_RULES } from "../utils/matchRules";

function nowText(){
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
}

export default function ScoreCenter({ groups=[], schedule=[], setSchedule, config={}, setMsg }) {
  const rules = {...DEFAULT_RULES,...(config.rules||{})};
  const groupNames = useMemo(()=>["Tất cả", ...(groups||[]).map(g=>g.name)], [groups]);
  const [group,setGroup] = useState(groupNames[1] || "Tất cả");
  const [status,setStatus] = useState("all");

  const filtered = useMemo(()=>{
    return (schedule||[]).filter(m=>{
      const okGroup = group === "Tất cả" || m.group === group;
      const okStatus = status === "all" || (status === "done" ? m.status==="DONE" : m.status!=="DONE");
      return okGroup && okStatus;
    }).sort((a,b)=>String(a.time||"").localeCompare(String(b.time||"")) || Number(a.court||0)-Number(b.court||0));
  },[schedule,group,status]);

  const stats = useMemo(()=>{
    const list = group === "Tất cả" ? (schedule||[]) : (schedule||[]).filter(m=>m.group===group);
    return {
      total:list.length,
      done:list.filter(m=>m.status==="DONE").length,
      live:list.filter(m=>m.status==="LIVE").length,
      pending:list.filter(m=>m.status!=="DONE").length
    }
  },[schedule,group]);

  function updateDraft(id, idx, side, value){
    setSchedule((schedule||[]).map(m=>{
      if(m.id!==id)return m;
      const games=[...(m.games||[{home:"",away:"",saved:false}])];
      games[idx]={...games[idx],[side]:value};
      return {...m,games,status:m.status==="DONE"?"DONE":"LIVE"};
    }));
  }

  function saveGame(id, idx){
    let msg="";
    setSchedule((schedule||[]).map(m=>{
      if(m.id!==id)return m;
      const games=[...(m.games||[])];
      const g=games[idx]||{home:"",away:""};
      const valid=validateGameScore(g.home,g.away,targetForMatch(m,rules));
      if(!valid.ok){msg=valid.message;return m;}
      games[idx]={...g,saved:true,savedAt:nowText()};
      const ns={...m,games,status:"LIVE"};
      const ss=scoreSummary(ns,rules);
      msg=`Đã lưu ${m.group} - ${m.home.name} vs ${m.away.name}: ${g.home}-${g.away}`;
      return {...ns,winner:ss.winner};
    }));
    setMsg(msg||"Đã lưu game.");
  }

  function addGame(id){
    setSchedule((schedule||[]).map(m=>m.id===id?{...m,games:[...(m.games||[]),{home:"",away:"",saved:false}]}:m));
  }

  function finishMatch(id){
    let msg="";
    setSchedule((schedule||[]).map(m=>{
      if(m.id!==id)return m;
      const ss=scoreSummary(m,rules);
      if(!ss.winner){msg="Chưa đủ game đã lưu để kết thúc trận.";return m;}
      msg=`Đã kết thúc trận. Đội thắng: ${ss.winner}`;
      return {...m,status:"DONE",winner:ss.winner,finishedAt:nowText(), editing:false};
    }));
    setMsg(msg);
  }

  function unlockMatch(id){
    if(!confirm("Mở sửa điểm trận này? Sau khi sửa cần bấm Lưu lại và Kết thúc trận lại.")) return;
    setSchedule((schedule||[]).map(m=>{
      if(m.id!==id)return m;
      const games=(m.games||[]).map(g=>({...g,saved:false, edited:true}));
      return {...m,games,status:"LIVE",winner:"",finishedAt:"",editing:true};
    }));
    setMsg("Đã mở sửa điểm. Hãy sửa tỷ số, bấm Lưu từng game, rồi Kết thúc trận lại.");
  }

  function clearMatchScore(id){
    if(!confirm("Xóa toàn bộ điểm trận này để nhập lại?")) return;
    setSchedule((schedule||[]).map(m=>m.id===id?{...m,games:[{home:"",away:"",saved:false}],status:"SCHEDULED",winner:"",finishedAt:"",editing:true}:m));
    setMsg("Đã xóa điểm trận. Hãy nhập lại Game 1.");
  }

  return <section className="scoreCenter">
    <div className="scoreCenterHead">
      <div>
        <h2><Trophy/> Cập nhật điểm số</h2>
        <p>Chọn từng bảng để nhập kết quả nhanh. Mỗi game có nút Lưu riêng.</p>
      </div>
      <button className="mini" onClick={()=>setMsg("Đã làm mới khu cập nhật điểm.")}><RefreshCw size={14}/> Làm mới</button>
    </div>

    <div className="scoreFilters">
      <label>Chọn bảng
        <select value={group} onChange={e=>setGroup(e.target.value)}>
          {groupNames.map(g=><option key={g} value={g}>{g}</option>)}
        </select>
      </label>
      <label>Trạng thái
        <select value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="all">Tất cả trận</option>
          <option value="pending">Chưa hoàn thành</option>
          <option value="done">Đã hoàn thành</option>
        </select>
      </label>
    </div>

    <div className="scoreStats">
      <div><b>{stats.total}</b><span>Tổng trận</span></div>
      <div><b>{stats.pending}</b><span>Chưa xong</span></div>
      <div><b>{stats.live}</b><span>Đang nhập</span></div>
      <div><b>{stats.done}</b><span>Hoàn thành</span></div>
    </div>

    <div className="scoreGroupTabs">
      {groupNames.map(g=><button key={g} className={group===g?"active":""} onClick={()=>setGroup(g)}><Table2 size={14}/>{g}</button>)}
    </div>

    <div className="scoreMatchList">
      {filtered.length ? filtered.map(m=><ScoreMatchCard key={m.id} match={m} rules={rules} onDraft={updateDraft} onSaveGame={saveGame} onAddGame={addGame} onFinish={finishMatch} onUnlock={unlockMatch} onClear={clearMatchScore}/>) : <p className="muted">Không có trận phù hợp.</p>}
    </div>
  </section>
}

function ScoreMatchCard({match,rules,onDraft,onSaveGame,onAddGame,onFinish,onUnlock,onClear}) {
  const ss=scoreSummary(match,rules);
  const rule=targetForMatch(match,rules);
  return <div className={`scoreMatchCard ${match.status==="DONE"?"done":""}`}>
    <div className="scoreMatchTop">
      <div>
        <b>{match.group} · {match.time || "Chưa giờ"} · Sân {match.court || ""}</b>
        <span>{rule.label}</span>
      </div>
      <em>{match.editing?"Đang sửa":match.status==="DONE"?"✓ Hoàn thành":match.status==="LIVE"?"LIVE":"Chờ điểm"}</em>
    </div>

    <div className="scoreMatchTeams">
      <strong>{match.home?.name}</strong>
      <span>vs</span>
      <strong>{match.away?.name}</strong>
    </div>

    {(match.games||[{home:"",away:"",saved:false}]).map((g,i)=><div className={`scoreGameLine ${g.saved?"saved":""}`} key={i}>
      <span>Game {i+1}</span>
      <input disabled={g.saved} value={g.home} onChange={e=>onDraft(match.id,i,"home",e.target.value)} placeholder="0"/>
      <b>-</b>
      <input disabled={g.saved} value={g.away} onChange={e=>onDraft(match.id,i,"away",e.target.value)} placeholder="0"/>
      <button disabled={g.saved} onClick={()=>onSaveGame(match.id,i)}><Save size={14}/> {g.saved?"Đã lưu":"Lưu"}</button>
      {g.saved && <small>{g.savedAt}</small>}
    </div>)}

    <div className="scoreMatchActions">
      {match.status==="DONE" ? <>
        <button className="mini editScoreBtn" onClick={()=>onUnlock(match.id)}>✎ Mở sửa điểm</button>
        <button className="mini dangerScoreBtn" onClick={()=>onClear(match.id)}>Xóa nhập lại</button>
      </> : <>
        <button className="mini" onClick={()=>onAddGame(match.id)}>+ Game</button>
        <button className="mini primary" onClick={()=>onFinish(match.id)}><CheckCircle2 size={14}/> Kết thúc trận</button>
      </>}
      {ss.winner && <strong>Thắng: {ss.winner}</strong>}
      {match.editing && <em className="editingBadge">Đang sửa điểm</em>}
    </div>
  </div>
}
