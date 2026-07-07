
import { useMemo, useState } from "react";
import { Save, CheckCircle2, RefreshCw, LogOut, Smartphone } from "lucide-react";
import { scoreSummary, targetForMatch, validateGameScore, DEFAULT_RULES } from "../utils/matchRules";

function nowText(){
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
}
function teamPlayers(t){ return (t?.players||[]).map(p=>p.full_name).join(" + "); }
function koTeamName(x){ return koRealTeamName(x); }
function koPlayers(x){ return x?.playerNames || (x?.team?.players || x?.row?.team?.players || []).map(p=>p.full_name).join(" + "); }
function koRealTeamName(x){
  return x?.team?.name || x?.row?.team?.name || x?.teamName || x?.winnerName || x?.slot || "—";
}
function isPlaceholderName(name){
  return /^(Winner|Loser|Best3|A\d|B\d|C\d|D\d|E\d|F\d)/i.test(String(name||"").trim());
}
function hasRealTeam(x){
  const nm = koRealTeamName(x);
  return !!(x?.team?.name || x?.row?.team?.name || (x?.teamName && !isPlaceholderName(x.teamName)) || koPlayers(x));
}
function makeKoScoreable(m){ return {...m, home:{name:koTeamName(m.a)}, away:{name:koTeamName(m.b)}}; }
function koRoundLabel(m){
  if(m.id?.startsWith("QF")) return "Tứ kết";
  if(m.id?.startsWith("SF")) return "Bán kết";
  if(m.id?.startsWith("FINAL")) return "Chung kết";
  if(m.id?.startsWith("THIRD")) return "Tranh giải 3";
  return m.round || "Knockout";
}
function canPlayKo(m){
  if(String(m.id||"").startsWith("QF")) return hasRealTeam(m.a) && hasRealTeam(m.b);
  return hasRealTeam(m.a) && hasRealTeam(m.b);
}
function cloneSlotWithLabel(slotObj,label){
  if(!slotObj) return {slot:label};
  const players = slotObj?.playerNames || (slotObj?.team?.players || slotObj?.row?.team?.players || []).map(p=>p.full_name).join(" + ");
  const realName = koRealTeamName(slotObj);
  return {...slotObj,slot:label,teamName:realName,winnerName:realName,playerNames:players};
}
function adv(label, m){
  if(!m?.winner) return {slot:label};
  if(m.winnerTeam) return cloneSlotWithLabel(m.winnerTeam,label);
  const a=koTeamName(m.a), b=koTeamName(m.b);
  const w = m.winner===a ? m.a : m.winner===b ? m.b : null;
  return w ? cloneSlotWithLabel(w,label) : {slot:label,teamName:m.winner,winnerName:m.winner};
}
function loser(label, m){
  if(!m?.winner) return {slot:label};
  const a=koTeamName(m.a), b=koTeamName(m.b);
  const l = m.winner===a ? m.b : m.winner===b ? m.a : null;
  return l ? cloneSlotWithLabel(l,label) : {slot:label};
}
function mergeKeep(base, old){
  if(!old) return base;
  return {...base,games:old.games||base.games,status:old.status||base.status,winner:old.winner||"",winnerTeam:old.winnerTeam||null,finishedAt:old.finishedAt||"",editing:old.editing||false};
}
function normalizeKnockout(list=[]){
  const old=Object.fromEntries((list||[]).map(m=>[m.id,m]));
  const qfs=(list||[]).filter(m=>String(m.id||"").startsWith("QF"));
  const sfs=[
    mergeKeep({id:"SF-1",name:"Bán kết 1",type:"KO",round:"SF",status:"SCHEDULED",a:adv("Winner QF1",old["QF-1"]),b:adv("Winner QF4",old["QF-4"]),games:[{home:"",away:"",saved:false}],winner:""},old["SF-1"]),
    mergeKeep({id:"SF-2",name:"Bán kết 2",type:"KO",round:"SF",status:"SCHEDULED",a:adv("Winner QF2",old["QF-2"]),b:adv("Winner QF3",old["QF-3"]),games:[{home:"",away:"",saved:false}],winner:""},old["SF-2"])
  ];
  return [
    ...qfs,
    ...sfs,
    mergeKeep({id:"FINAL-1",name:"Chung kết",type:"KO",round:"FINAL",status:"SCHEDULED",a:adv("Winner BK1",sfs[0]),b:adv("Winner BK2",sfs[1]),games:[{home:"",away:"",saved:false}],winner:""},old["FINAL-1"]),
    mergeKeep({id:"THIRD-1",name:"Tranh giải 3",type:"KO",round:"THIRD",status:"SCHEDULED",a:loser("Loser BK1",sfs[0]),b:loser("Loser BK2",sfs[1]),games:[{home:"",away:"",saved:false}],winner:""},old["THIRD-1"])
  ];
}

export default function Referee({ schedule=[], setSchedule, knockout=[], setKnockout, config={}, setMsg, onBack }) {
  const [pin,setPin] = useState("");
  const [court,setCourt] = useState(localStorage.getItem("ptm_ref_court") || "1");
  const [authed,setAuthed] = useState(localStorage.getItem("ptm_referee")==="1");
  const [round,setRound] = useState("");
  const [pickerOpen,setPickerOpen] = useState(false);
  const rules={...DEFAULT_RULES,...(config.rules||{})};
  const koList=useMemo(()=>normalizeKnockout(knockout||[]),[knockout]);

  function login(e){
    e.preventDefault();
    const ok = pin === "123456" || pin === "0000" || pin === localStorage.getItem("ptm_ref_pin");
    if(!ok){ setMsg?.("Sai mật khẩu trọng tài."); return; }
    localStorage.setItem("ptm_referee","1");
    localStorage.setItem("ptm_ref_court",court);
    setAuthed(true);
    setMsg?.("Trọng tài đã đăng nhập.");
  }
  function logout(){
    localStorage.removeItem("ptm_referee");
    setAuthed(false);
    setPin("");
  }

  const groupMatches=(schedule||[]).map(m=>({...m,_scope:"GROUP",_round:m.group,_home:m.home?.name,_away:m.away?.name,_ph:teamPlayers(m.home),_pa:teamPlayers(m.away)}));
  const koMatches=koList.map(m=>({...m,_scope:"KO",_round:koRoundLabel(m),_home:koTeamName(m.a),_away:koTeamName(m.b),_ph:koPlayers(m.a),_pa:koPlayers(m.b)}));
  const all=[...groupMatches,...koMatches];
  const groupNames = Array.from(new Set((schedule||[]).map(m=>m.group).filter(Boolean))).sort((a,b)=>String(a).localeCompare(String(b),"vi"));
  const roundOptions = [
    ...groupNames.map(g=>({key:`GROUP:${g}`, label:g, desc:"Vòng bảng"})),
    {key:"QF", label:"Tứ kết", desc:"Knockout"},
    {key:"SF", label:"Bán kết", desc:"Knockout"},
    {key:"FINAL", label:"Chung kết", desc:"Knockout"},
    {key:"THIRD", label:"Tranh giải 3", desc:"Knockout"}
  ];
  const selectedKey = round || roundOptions[0]?.key || "QF";
  const selectedOption = roundOptions.find(x=>x.key===selectedKey) || roundOptions[0] || {label:"Chọn bảng/vòng",desc:""};
  const visible=all.filter(m=>{
    if(selectedKey.startsWith("GROUP:")){
      const g = selectedKey.replace("GROUP:","");
      return m._scope==="GROUP" && m.group===g;
    }
    if(selectedKey==="QF") return m.id?.startsWith("QF");
    if(selectedKey==="SF") return m.id?.startsWith("SF");
    if(selectedKey==="THIRD") return m.id?.startsWith("THIRD");
    if(selectedKey==="FINAL") return m.id?.startsWith("FINAL");
    return true;
  }).sort((a,b)=>(a.status==="DONE")-(b.status==="DONE") || String(a.time||"").localeCompare(String(b.time||"")));

  function mutateKo(fn){
    const next=fn(normalizeKnockout(knockout||[]));
    setKnockout(normalizeKnockout(next));
  }
  function draft(m,idx,side,val){
    if(m._scope==="KO") mutateKo(list=>list.map(x=>x.id===m.id?{...x,games:[...(x.games||[{home:"",away:"",saved:false}])].map((g,i)=>i===idx?{...g,[side]:val}:g),status:x.status==="DONE"?"DONE":"LIVE"}:x));
    else setSchedule((schedule||[]).map(x=>{
      if(x.id!==m.id) return x;
      const games=[...(x.games||[{home:"",away:"",saved:false}])];
      games[idx]={...games[idx],[side]:val};
      return {...x,games,status:x.status==="DONE"?"DONE":"LIVE"};
    }));
  }
  function saveGame(m,idx){
    let msg="";
    if(m._scope==="KO") mutateKo(list=>list.map(x=>{
      if(x.id!==m.id) return x;
      if(!canPlayKo(x)){msg="Trận này chưa xác định đủ đội."; return x;}
      const games=[...(x.games||[])], g=games[idx]||{home:"",away:""};
      const fake=makeKoScoreable(x), valid=validateGameScore(g.home,g.away,targetForMatch(fake,rules));
      if(!valid.ok){msg=valid.message; return x;}
      games[idx]={...g,saved:true,savedAt:nowText()};
      const ss=scoreSummary({...fake,games},rules);
      const leftName = koTeamName(x.a), rightName = koTeamName(x.b);
      const wSlot = ss.winner===leftName ? x.a : ss.winner===rightName ? x.b : null;
      msg=`Đã lưu ${x.name}: ${g.home}-${g.away}`;
      return {...x,games,status:"LIVE",winner:ss.winner,winnerTeam:wSlot?cloneSlotWithLabel(wSlot,`Winner ${x.name}`):null};
    }));
    else setSchedule((schedule||[]).map(x=>{
      if(x.id!==m.id) return x;
      const games=[...(x.games||[])], g=games[idx]||{home:"",away:""};
      const valid=validateGameScore(g.home,g.away,targetForMatch(x,rules));
      if(!valid.ok){msg=valid.message; return x;}
      games[idx]={...g,saved:true,savedAt:nowText()};
      const ss=scoreSummary({...x,games},rules);
      msg=`Đã lưu ${x.home.name} vs ${x.away.name}: ${g.home}-${g.away}`;
      return {...x,games,status:"LIVE",winner:ss.winner};
    }));
    setMsg?.(msg||"Đã lưu game.");
  }
  function addGame(m){
    if(m._scope==="KO") mutateKo(list=>list.map(x=>x.id===m.id?{...x,games:[...(x.games||[]),{home:"",away:"",saved:false}]}:x));
    else setSchedule((schedule||[]).map(x=>x.id===m.id?{...x,games:[...(x.games||[]),{home:"",away:"",saved:false}]}:x));
  }
  function finish(m){
    let msg="";
    if(m._scope==="KO") mutateKo(list=>list.map(x=>{
      if(x.id!==m.id) return x;
      const fake=makeKoScoreable(x), ss=scoreSummary(fake,rules);
      if(!ss.winner){msg="Chưa đủ game đã lưu để kết thúc trận."; return x;}
      const leftName = koTeamName(x.a), rightName = koTeamName(x.b);
      const wSlot = ss.winner===leftName ? x.a : ss.winner===rightName ? x.b : null;
      msg=`Đã kết thúc ${x.name}. Thắng: ${ss.winner}`;
      return {...x,status:"DONE",winner:ss.winner,winnerTeam:wSlot?cloneSlotWithLabel(wSlot,`Winner ${x.name}`):null,finishedAt:nowText(),editing:false};
    }));
    else setSchedule((schedule||[]).map(x=>{
      if(x.id!==m.id) return x;
      const ss=scoreSummary(x,rules);
      if(!ss.winner){msg="Chưa đủ game đã lưu để kết thúc trận."; return x;}
      msg=`Đã kết thúc trận. Thắng: ${ss.winner}`;
      return {...x,status:"DONE",winner:ss.winner,finishedAt:nowText(),editing:false};
    }));
    setMsg?.(msg);
  }
  function unlock(m){
    if(!confirm("Mở sửa điểm trận này?")) return;
    if(m._scope==="KO") mutateKo(list=>list.map(x=>x.id===m.id?{...x,games:(x.games||[]).map(g=>({...g,saved:false})),status:"LIVE",winner:"",winnerTeam:null,finishedAt:"",editing:true}:x));
    else setSchedule((schedule||[]).map(x=>x.id===m.id?{...x,games:(x.games||[]).map(g=>({...g,saved:false})),status:"LIVE",winner:"",finishedAt:"",editing:true}:x));
  }

  if(!authed) return <main className="refPage">
    <section className="refLogin">
      <h1><Smartphone/> Trọng tài nhập điểm</h1>
      <p>Đăng nhập để nhập điểm nhanh trên điện thoại từng sân.</p>
      <form onSubmit={login}>
<label>Mật khẩu trọng tài
          <input type="password" value={pin} onChange={e=>setPin(e.target.value)} placeholder="Nhập mật khẩu trọng tài"/>
        </label>
        <button className="primary">Vào nhập điểm</button>
        <button type="button" className="mini" onClick={onBack}>Quay lại</button>
      </form>
    </section>
  </main>;

  return <main className="refPage">
    <div className="refTop">
      <div><h1>Trọng tài nhập điểm</h1><p>Chọn bảng/vòng đấu rồi nhập điểm nhanh trên điện thoại.</p></div>
      <div><button className="mini" onClick={()=>setMsg?.("Đã làm mới màn hình trọng tài.")}><RefreshCw size={14}/> Làm mới</button><button className="mini" onClick={logout}><LogOut size={14}/> Thoát</button></div>
    </div>

    <button className="refRoundPickerBtn" onClick={()=>setPickerOpen(true)}>
      <span>Đang nhập</span>
      <b>{selectedOption.label}</b>
      <em>{selectedOption.desc} · {visible.length} trận</em>
    </button>

    {pickerOpen && <div className="refPickerOverlay" onClick={()=>setPickerOpen(false)}>
      <div className="refPickerModal" onClick={e=>e.stopPropagation()}>
        <h2>Chọn bảng / vòng đấu</h2>
        <p>Trọng tài chọn đúng bảng hoặc vòng cần nhập điểm.</p>
        <div className="refPickerList">
          {roundOptions.map(opt=><button key={opt.key} className={selectedKey===opt.key?"active":""} onClick={()=>{setRound(opt.key);setPickerOpen(false);}}>
            <b>{opt.label}</b>
            <span>{opt.desc}</span>
          </button>)}
        </div>
        <button className="mini" onClick={()=>setPickerOpen(false)}>Đóng</button>
      </div>
    </div>}
    <div className="refList">
      {visible.length ? visible.map(m=><RefMatchCard key={`${m._scope}-${m.id}`} m={m} rules={rules} onDraft={draft} onSave={saveGame} onAdd={addGame} onFinish={finish} onUnlock={unlock}/>) : <p className="muted">Chưa có trận trong mục này.</p>}
    </div>
  </main>
}

function RefMatchCard({m,rules,onDraft,onSave,onAdd,onFinish,onUnlock}) {
  const scoreable=m._scope==="KO"?makeKoScoreable(m):m;
  const ss=scoreSummary(scoreable,rules);
  const can=m._scope!=="KO" || canPlayKo(m);
  return <section className={`refMatch ${m.status==="DONE"?"done":""}`}>
    <div className="refMatchHead"><b>{m._round} {m.time?`· ${m.time}`:""}</b><span>{m.status==="DONE"?"✓ Xong":m.status==="LIVE"?"LIVE":"Chờ"}</span></div>
    <div className="refTeams">
      <div><b>{m._home}</b><small>{m._ph}</small></div><em>vs</em><div><b>{m._away}</b><small>{m._pa}</small></div>
    </div>
    {!can && <p className="warnLine">Trận chưa đủ đội.</p>}
    {(m.games||[{home:"",away:"",saved:false}]).map((g,i)=><div className="refGame" key={i}>
      <span>G{i+1}</span><input disabled={g.saved||!can} value={g.home} onChange={e=>onDraft(m,i,"home",e.target.value)} placeholder="0"/><b>-</b><input disabled={g.saved||!can} value={g.away} onChange={e=>onDraft(m,i,"away",e.target.value)} placeholder="0"/>
      <button disabled={g.saved||!can} onClick={()=>onSave(m,i)}><Save size={13}/> {g.saved?"Đã lưu":"Lưu"}</button>
    </div>)}
    <div className="refActions">
      {m.status==="DONE" ? <button className="mini editScoreBtn" onClick={()=>onUnlock(m)}>Mở sửa</button> : <>
        <button className="mini" disabled={!can} onClick={()=>onAdd(m)}>+ Game</button>
        <button className="mini primary" disabled={!can} onClick={()=>onFinish(m)}><CheckCircle2 size={14}/> Kết thúc</button>
      </>}
      {ss.winner && <strong>Thắng: {ss.winner}</strong>}
    </div>
  </section>
}
