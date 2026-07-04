
import { useMemo, useState } from "react";
import { Activity, CalendarDays, Trophy, ClipboardCopy, Save, Settings, CheckCircle2, PlayCircle, ListChecks, BarChart3, GitBranch, Bell, MapPin, FileText } from "lucide-react";
import { makeSchedule, makeKnockout, calcStandings, koNextRound, exportScheduleText } from "../utils/draw";
import { DEFAULT_RULES, targetForMatch, validateGameScore, scoreSummary, formatRulesText } from "../utils/matchRules";

function nowText(){
  const d=new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
}

function pct(done,total){ return total ? Math.round(done*100/total) : 0; }

export default function TournamentOps({groups, config, setConfig, schedule, setSchedule, knockout, setKnockout, setMsg}) {
  const [selectedId,setSelectedId]=useState("");
  const rules={...DEFAULT_RULES,...(config.rules||{})};
  const standings=calcStandings(groups||[],schedule||[],rules);
  const semis=koNextRound(knockout||[],"Bán kết","SF");
  const finals=koNextRound(semis,"Chung kết","FINAL");
  const selectedMatch=useMemo(()=> (schedule||[]).find(m=>m.id===selectedId)||(schedule||[]).find(m=>m.status==="LIVE")||(schedule||[]).find(m=>m.status!=="DONE")||(schedule||[])[0]||null,[schedule,selectedId]);
  const rulesText=formatRulesText(rules);

  const live=(schedule||[]).filter(m=>m.status==="LIVE").length;
  const done=(schedule||[]).filter(m=>m.status==="DONE").length;
  const pending=(schedule||[]).filter(m=>m.status!=="DONE").length;
  const nextMatches=(schedule||[]).filter(m=>m.status!=="DONE").slice(0,6);
  const totalTeams=(groups||[]).reduce((s,g)=>s+(g.teams?.length||0),0);
  const totalSchedule=schedule.length;
  const progress=pct(done,totalSchedule);

  const setRules=(patch)=>setConfig({...config,rules:{...rules,...patch}});

  function genSchedule(){
    if(!groups.length){setMsg("Chưa có bảng đấu để xếp lịch.");return;}
    const s=makeSchedule(groups,{courtCount:config.courtCount,startTime:config.startTime,minutesPerMatch:config.minutesPerMatch});
    setSchedule(s);
    setSelectedId(s[0]?.id||"");
    setMsg(`Đã xếp ${s.length} trận vòng bảng.`);
  }

  function copySchedule(){
    navigator.clipboard.writeText(exportScheduleText(schedule));
    setMsg("Đã copy lịch thi đấu.");
  }

  function genKO(){
    if(!groups.length){setMsg("Chưa có bảng đấu.");return;}
    const pairs=makeKnockout(groups,config,standings);
    setKnockout(pairs);
    setMsg(`Đã sinh ${pairs.length} trận Tứ kết theo BXH hiện tại.`);
  }

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
      msg=`Đã lưu Game ${idx+1}: ${g.home}-${g.away}.`;
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
      return {...m,status:"DONE",winner:ss.winner,finishedAt:nowText()};
    }));
    setMsg(msg);
  }

  function updateKoDraft(id, idx, side, value){
    setKnockout((knockout||[]).map(m=>{
      if(m.id!==id)return m;
      const games=[...(m.games||[{home:"",away:"",saved:false}])];
      games[idx]={...games[idx],[side]:value};
      return {...m,games,status:m.status==="DONE"?"DONE":"LIVE"};
    }));
  }

  function saveKoGame(id, idx){
    let msg="";
    setKnockout((knockout||[]).map(m=>{
      if(m.id!==id)return m;
      const games=[...(m.games||[])];
      const g=games[idx]||{home:"",away:""};
      const fake={...m,home:{name:m.a.slot},away:{name:m.b.slot}};
      const valid=validateGameScore(g.home,g.away,targetForMatch(fake,rules));
      if(!valid.ok){msg=valid.message;return m;}
      games[idx]={...g,saved:true,savedAt:nowText()};
      const ss=scoreSummary({...fake,games},rules);
      msg=`Đã lưu ${m.name} - Game ${idx+1}: ${g.home}-${g.away}.`;
      return {...m,games,status:"LIVE",winner:ss.winner};
    }));
    setMsg(msg||"Đã lưu game.");
  }

  function addKoGame(id){
    setKnockout((knockout||[]).map(m=>m.id===id?{...m,games:[...(m.games||[]),{home:"",away:"",saved:false}]}:m));
  }

  function finishKo(id){
    let msg="";
    setKnockout((knockout||[]).map(m=>{
      if(m.id!==id)return m;
      const ss=scoreSummary({...m,home:{name:m.a.slot},away:{name:m.b.slot}},rules);
      if(!ss.winner){msg="Chưa đủ game đã lưu để kết thúc trận.";return m;}
      msg=`Đã kết thúc ${m.name}. Đội thắng: ${ss.winner}`;
      return {...m,status:"DONE",winner:ss.winner,finishedAt:nowText()};
    }));
    setMsg(msg);
  }

  return <section className="adminOpsV47">
    <aside className="opsSideV47">
      <div className="sideBlockTitle">ĐIỀU HÀNH GIẢI</div>
      <button className="active"><Activity size={16}/> Tổng quan</button>
      <button><PlayCircle size={16}/> Trận đang diễn ra <b>{live}</b></button>
      <button><CalendarDays size={16}/> Lịch thi đấu</button>
      <button><Save size={16}/> Nhập kết quả <b>{pending}</b></button>
      <button><BarChart3 size={16}/> Bảng xếp hạng</button>
      <button><GitBranch size={16}/> Nhánh đấu</button>
      <button><Bell size={16}/> Thông báo</button>
      <div className="sideBlockTitle configTitle">CẤU HÌNH GIẢI</div>
      <button><FileText size={16}/> Thông tin giải</button>
      <button><Settings size={16}/> Thể thức thi đấu</button>
      <button><MapPin size={16}/> Sân thi đấu</button>
      <div className="supportBox"><b>Hỗ trợ BTC</b><span>0904 626 959</span></div>
    </aside>

    <div className="opsWorkspaceV47">
      <div className="opsTopTitle">
        <div>
          <h2>Điều hành giải</h2>
          <p>Quản lý lịch thi đấu, cập nhật tỷ số, bảng xếp hạng và nhánh loại trực tiếp.</p>
        </div>
        <div className="configActions topQuick">
          <button className="mini" onClick={genSchedule}><CalendarDays size={14}/> Xếp lịch</button>
          {schedule.length>0 && <button className="mini" onClick={copySchedule}><ClipboardCopy size={14}/> Copy lịch</button>}
          <button className="mini" onClick={genKO}><Trophy size={14}/> Sinh tứ kết</button>
        </div>
      </div>

      <div className="opsKpiV47">
        <div><ListChecks/><b>{totalTeams}</b><span>Đội thi đấu</span></div>
        <div><PlayCircle/><b>{live}</b><span>Đang diễn ra</span></div>
        <div><CalendarDays/><b>{pending}</b><span>Trận chờ / chưa nhập</span></div>
        <div><CheckCircle2/><b>{done}</b><span>Đã hoàn thành</span></div>
        <div className="progressKpi"><b>{progress}%</b><span>Tiến độ giải đấu</span><em><i style={{width:`${progress}%`}}/></em></div>
      </div>

      <div className="opsMainGridV47">
        <section className="panelV47 actionListPanel">
          <div className="panelHead"><h3>Điều hành nhanh</h3><a>Xem chi tiết →</a></div>
          <QuickAction icon={<PlayCircle/>} title="Trận đang diễn ra" desc="Theo dõi và cập nhật tỷ số các trận đang diễn ra" badge={live}/>
          <QuickAction icon={<CalendarDays/>} title="Lịch thi đấu" desc="Xem lịch thi đấu theo sân, theo thời gian"/>
          <QuickAction icon={<Save/>} title="Nhập kết quả" desc="Cập nhật tỷ số từng game và kết quả trận đấu" badge={pending}/>
          <QuickAction icon={<BarChart3/>} title="Bảng xếp hạng" desc="Xem bảng xếp hạng các bảng đấu"/>
          <QuickAction icon={<GitBranch/>} title="Nhánh đấu" desc="Xem và cập nhật kết quả vòng loại trực tiếp"/>
        </section>

        <section className="panelV47 liveMatchesPanel">
          <div className="panelHead"><h3>Trận đang diễn ra / tiếp theo</h3><a>Xem tất cả →</a></div>
          {nextMatches.length ? nextMatches.map(m=>{
            const ss=scoreSummary(m,rules);
            return <button className={`matchPickV47 ${selectedMatch?.id===m.id?"active":""}`} key={m.id} onClick={()=>setSelectedId(m.id)}>
              <div><b>{m.home.name}</b><span>{m.group} · Lượt {m.round}</span></div>
              <strong>{ss.scoreText || "0 - 0"}</strong>
              <div><b>{m.away.name}</b><span>Sân {m.court} · {m.time}</span></div>
            </button>
          }) : <p className="muted">Chưa có lịch hoặc tất cả trận đã hoàn thành.</p>}
        </section>

        <section className="panelV47 rulesPanelV47">
          <div className="panelHead"><h3>Cấu hình thể thức thi đấu</h3><button className="mini"><Settings size={14}/> Chỉnh sửa</button></div>
          <div className="ruleCards">
            <div>
              <h4>Vòng bảng</h4>
              <ul>
                <li>Thể thức: Đấu vòng tròn tính điểm</li>
                <li>Điểm số: {rules.groupPointTarget || 11} điểm {rules.groupWinByTwo!==false ? "cách 2" : ""}</li>
                <li>Xếp hạng: Thắng → hiệu số game → hiệu số điểm</li>
              </ul>
            </div>
            <div>
              <h4>Loại trực tiếp</h4>
              <ul>
                <li>Từ Tứ kết đến Chung kết</li>
                <li>Điểm số: {rules.knockoutPointTarget || 15} điểm {rules.knockoutWinByTwo!==false ? "cách 2" : ""}</li>
                <li>{rules.thirdPlace!==false ? "Có tranh giải 3" : "Không tranh giải 3"}</li>
              </ul>
            </div>
          </div>
          <details className="ruleEditBox">
            <summary>Mở cấu hình chi tiết</summary>
            <div className="ruleGrid">
              <label>Vòng bảng<select value={rules.groupFormat} onChange={e=>setConfig({...config,rules:{...rules,groupFormat:e.target.value}})}><option value="ROUND_ROBIN">Đấu vòng tròn tính điểm</option></select></label>
              <label>Điểm vòng bảng<input type="number" min="1" value={rules.groupPointTarget} onChange={e=>setConfig({...config,rules:{...rules,groupPointTarget:e.target.value}})}/></label>
              <label className="checkLine"><input type="checkbox" checked={rules.groupWinByTwo!==false} onChange={e=>setConfig({...config,rules:{...rules,groupWinByTwo:e.target.checked}})}/> Cách 2 điểm</label>
              <label>Điểm loại trực tiếp<input type="number" min="1" value={rules.knockoutPointTarget} onChange={e=>setConfig({...config,rules:{...rules,knockoutPointTarget:e.target.value}})}/></label>
              <label className="checkLine"><input type="checkbox" checked={rules.knockoutWinByTwo!==false} onChange={e=>setConfig({...config,rules:{...rules,knockoutWinByTwo:e.target.checked}})}/> Cách 2 điểm</label>
              <label className="checkLine"><input type="checkbox" checked={rules.thirdPlace!==false} onChange={e=>setConfig({...config,rules:{...rules,thirdPlace:e.target.checked}})}/> Có tranh giải 3</label>
            </div>
          </details>
        </section>

        <section className="panelV47 scorePanelWide">
          <div className="panelHead"><h3>Cập nhật tỷ số</h3><span>{selectedMatch ? `${selectedMatch.group} · Sân ${selectedMatch.court}` : "Chưa chọn trận"}</span></div>
          {selectedMatch ? <MatchScoreCard match={selectedMatch} rules={rules} onDraft={updateDraft} onSaveGame={saveGame} onAddGame={addGame} onFinish={finishMatch}/> : <p className="muted">Chưa có trận để nhập điểm.</p>}
        </section>

        <section className="panelV47 rightStackPanel">
          <h3>BXH nhanh</h3>
          {Object.entries(standings).slice(0,1).map(([group,rows])=><div key={group}>
            <h4>{group}</h4>
            <table className="compactTable"><thead><tr><th>#</th><th>Đội</th><th>T</th><th>HS</th></tr></thead><tbody>{rows.map(r=><tr key={r.name}><td>{r.rank}</td><td>{r.name}</td><td>{r.win}</td><td>{r.diff}</td></tr>)}</tbody></table>
          </div>)}
          <h3>Trận chưa nhập kết quả ({pending})</h3>
          {nextMatches.slice(0,6).map(m=><p className="pendingLine" key={m.id}>{m.group} · {m.home.name} vs {m.away.name}</p>)}
        </section>
      </div>

      <section className="courtOverviewV47 panelV47">
        <div className="panelHead"><h3>Tổng quan các sân</h3><a>Xem lịch đầy đủ →</a></div>
        <div className="courtGrid">
          {Array.from({length:Number(config.courtCount||3)},(_,i)=>{
            const court=i+1;
            const m=(schedule||[]).find(x=>Number(x.court)===court && x.status!=="DONE");
            const ss=m?scoreSummary(m,rules):null;
            return <div className="courtCard" key={court}>
              <b>Sân {court}</b>
              {m ? <>
                <span className={m.status==="LIVE"?"liveTag":"waitTag"}>{m.status==="LIVE"?"Đang diễn ra":"Chờ"}</span>
                <strong>{m.home.name} vs {m.away.name}</strong>
                <em>{ss?.scoreText || m.time}</em>
              </> : <p>Chưa có trận</p>}
            </div>
          })}
        </div>
      </section>

      {schedule.length>0 && <section className="scoreBoard panelV47">
        <h3>Toàn bộ trận vòng bảng</h3>
        {schedule.map(m=><MatchScoreCard key={m.id} match={m} rules={rules} compact onDraft={updateDraft} onSaveGame={saveGame} onAddGame={addGame} onFinish={finishMatch}/>)}
      </section>}

      {Object.keys(standings).length>0 && schedule.length>0 && <section className="standingsBox panelV47">
        <h3>Bảng xếp hạng vòng bảng</h3>
        {Object.entries(standings).map(([group,rows])=><div className="standingGroup" key={group}>
          <h4>{group}</h4>
          <div className="tablewrap"><table><thead><tr><th>Hạng</th><th>Đội</th><th>Trận</th><th>Thắng</th><th>Thua</th><th>Game</th><th>HS điểm</th></tr></thead><tbody>{rows.map(r=><tr key={r.name}><td>{r.rank}</td><td>{r.name}</td><td>{r.played}</td><td>{r.win}</td><td>{r.loss}</td><td>{r.gameFor}-{r.gameAgainst}</td><td>{r.diff}</td></tr>)}</tbody></table></div>
        </div>)}
      </section>}

      {knockout.length>0 && <section className="knockoutBox panelV47">
        <h3>Nhập điểm Tứ kết</h3>
        {knockout.map(m=><KoScoreCard key={m.id} match={m} rules={rules} onDraft={updateKoDraft} onSaveGame={saveKoGame} onAddGame={addKoGame} onFinish={finishKo}/>)}
        {semis.length>0 && <><h3>Bán kết dự kiến</h3>{semis.map(k=><p key={k.id}><b>{k.name}:</b> {k.a.slot} vs {k.b.slot}</p>)}</>}
        {finals.length>0 && <><h3>Chung kết dự kiến</h3>{finals.map(k=><p key={k.id}><b>{k.name}:</b> {k.a.slot} vs {k.b.slot}</p>)}</>}
      </section>}
    </div>
  </section>
}

function QuickAction({icon,title,desc,badge}) {
  return <div className="quickActionV47">{icon}<div><b>{title}</b><span>{desc}</span></div>{badge ? <em>{badge}</em> : <i>›</i>}</div>
}

function MatchScoreCard({match,rules,onDraft,onSaveGame,onAddGame,onFinish,compact=false}) {
  const ss=scoreSummary(match,rules);
  const rule=targetForMatch(match,rules);
  return <div className={`scoreCard scoreCardV47 ${match.status==="DONE"?"done":""} ${compact?"compact":""}`}>
    <div className="scoreHead"><b>{match.time} · Sân {match.court}</b><span>{match.group} · {rule.label}</span><em>{match.status==="DONE"?"✓ Hoàn thành":match.status==="LIVE"?"LIVE":"Chờ điểm"}</em></div>
    <div className="scoreTeams"><b>{match.home.name}</b><span>vs</span><b>{match.away.name}</b></div>
    {(match.games||[{home:"",away:"",saved:false}]).map((g,i)=><div className={`gameLine ${g.saved?"saved":""}`} key={i}>
      <span>Game {i+1}</span>
      <input disabled={g.saved} value={g.home} onChange={e=>onDraft(match.id,i,"home",e.target.value)} placeholder="0"/>
      <b>-</b>
      <input disabled={g.saved} value={g.away} onChange={e=>onDraft(match.id,i,"away",e.target.value)} placeholder="0"/>
      <button className="saveGameBtn" disabled={g.saved} onClick={()=>onSaveGame(match.id,i)}><Save size={14}/> {g.saved?"Đã lưu":"Lưu Game "+(i+1)}</button>
      {g.saved&&<small>{g.savedAt}</small>}
    </div>)}
    <div className="scoreActions"><button className="mini" onClick={()=>onAddGame(match.id)}>+ Game</button><button className="mini primary" onClick={()=>onFinish(match.id)}><CheckCircle2 size={14}/> Kết thúc trận</button>{ss.winner&&<strong>Thắng: {ss.winner}</strong>}</div>
  </div>
}

function KoScoreCard({match,rules,onDraft,onSaveGame,onAddGame,onFinish}) {
  const fake={...match,home:{name:match.a.slot},away:{name:match.b.slot}};
  const ss=scoreSummary(fake,rules);
  const rule=targetForMatch(fake,rules);
  return <div className={`scoreCard scoreCardV47 ${match.status==="DONE"?"done":""}`}>
    <div className="scoreHead"><b>{match.name}</b><span>{rule.label}</span><em>{match.status==="DONE"?"✓ Hoàn thành":match.status==="LIVE"?"LIVE":"Chờ điểm"}</em></div>
    <div className="scoreTeams"><b>{match.a.slot}</b><span>vs</span><b>{match.b.slot}</b></div>
    {(match.games||[{home:"",away:"",saved:false}]).map((g,i)=><div className={`gameLine ${g.saved?"saved":""}`} key={i}>
      <span>Game {i+1}</span>
      <input disabled={g.saved} value={g.home} onChange={e=>onDraft(match.id,i,"home",e.target.value)} placeholder="0"/>
      <b>-</b>
      <input disabled={g.saved} value={g.away} onChange={e=>onDraft(match.id,i,"away",e.target.value)} placeholder="0"/>
      <button className="saveGameBtn" disabled={g.saved} onClick={()=>onSaveGame(match.id,i)}><Save size={14}/> {g.saved?"Đã lưu":"Lưu Game "+(i+1)}</button>
      {g.saved&&<small>{g.savedAt}</small>}
    </div>)}
    <div className="scoreActions"><button className="mini" onClick={()=>onAddGame(match.id)}>+ Game</button><button className="mini primary" onClick={()=>onFinish(match.id)}><CheckCircle2 size={14}/> Kết thúc trận</button>{ss.winner&&<strong>Thắng: {ss.winner}</strong>}</div>
  </div>
}
