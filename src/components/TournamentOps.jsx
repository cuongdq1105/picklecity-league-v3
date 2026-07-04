
import { useMemo, useState } from "react";
import { Activity, CalendarDays, Trophy, ClipboardCopy, Save, Settings, CheckCircle2, PlayCircle, ListChecks, BarChart3, GitBranch, FileText } from "lucide-react";
import { makeSchedule, makeKnockout, calcStandings, koNextRound, exportScheduleText } from "../utils/draw";
import { DEFAULT_RULES, targetForMatch, validateGameScore, scoreSummary, formatRulesText } from "../utils/matchRules";

function nowText(){
  const d=new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
}
function pct(done,total){ return total ? Math.round(done*100/total) : 0; }

export default function TournamentOps({groups, config, setConfig, schedule, setSchedule, knockout, setKnockout, setMsg}) {
  const [opsTab,setOpsTab]=useState("control");
  const [selectedId,setSelectedId]=useState("");
  const rules={...DEFAULT_RULES,...(config.rules||{})};
  const standings=calcStandings(groups||[],schedule||[],rules);
  const semis=koNextRound(knockout||[],"Bán kết","SF");
  const finals=koNextRound(semis,"Chung kết","FINAL");
  const selectedMatch=useMemo(()=> (schedule||[]).find(m=>m.id===selectedId)||(schedule||[]).find(m=>m.status==="LIVE")||(schedule||[]).find(m=>m.status!=="DONE")||(schedule||[])[0]||null,[schedule,selectedId]);
  const live=(schedule||[]).filter(m=>m.status==="LIVE").length;
  const done=(schedule||[]).filter(m=>m.status==="DONE").length;
  const pending=(schedule||[]).filter(m=>m.status!=="DONE").length;
  const nextMatches=(schedule||[]).filter(m=>m.status!=="DONE").slice(0,8);
  const totalTeams=(groups||[]).reduce((s,g)=>s+(g.teams?.length||0),0);
  const progress=pct(done,schedule.length);
  const rulesText=formatRulesText(rules);

  function setRules(patch){ setConfig({...config,rules:{...rules,...patch}}); }
  function genSchedule(){
    if(!groups.length){setMsg("Chưa có bảng đấu để xếp lịch.");return;}
    const s=makeSchedule(groups,{courtCount:config.courtCount,startTime:config.startTime,minutesPerMatch:config.minutesPerMatch});
    setSchedule(s); setSelectedId(s[0]?.id||""); setMsg(`Đã xếp ${s.length} trận vòng bảng.`);
  }
  function copySchedule(){ navigator.clipboard.writeText(exportScheduleText(schedule)); setMsg("Đã copy lịch thi đấu."); }
  function genKO(){
    if(!groups.length){setMsg("Chưa có bảng đấu.");return;}
    const pairs=makeKnockout(groups,config,standings);
    setKnockout(pairs); setMsg(`Đã sinh ${pairs.length} trận Tứ kết theo BXH hiện tại.`);
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
  function addGame(id){ setSchedule((schedule||[]).map(m=>m.id===id?{...m,games:[...(m.games||[]),{home:"",away:"",saved:false}]}:m)); }
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
  function addKoGame(id){ setKnockout((knockout||[]).map(m=>m.id===id?{...m,games:[...(m.games||[]),{home:"",away:"",saved:false}]}:m)); }
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

  return <section className="opsClean">
    <div className="opsCleanHead">
      <div>
        <h2>Điều hành giải</h2>
        <p>Tách riêng cấu hình thể thức, giờ thi đấu, nhập kết quả, BXH và nhánh đấu để BTC thao tác nhanh trong ngày giải.</p>
      </div>
      <div className="opsMiniStats"><b>{progress}%</b><span>Tiến độ</span></div>
    </div>

    <div className="opsKpiClean">
      <div><ListChecks/><b>{totalTeams}</b><span>Đội</span></div>
      <div><CalendarDays/><b>{schedule.length}</b><span>Trận</span></div>
      <div><PlayCircle/><b>{live}</b><span>LIVE</span></div>
      <div><CheckCircle2/><b>{done}</b><span>Hoàn thành</span></div>
      <div><FileText/><b>{pending}</b><span>Chưa nhập</span></div>
    </div>

    <div className="opsTabsClean">
      <button className={opsTab==="rules"?"active":""} onClick={()=>setOpsTab("rules")}><Settings size={15}/> Cấu hình thể thức</button>
      <button className={opsTab==="control"?"active":""} onClick={()=>setOpsTab("control")}><Activity size={15}/> Điều hành giải</button>
      <button className={opsTab==="schedule"?"active":""} onClick={()=>setOpsTab("schedule")}><CalendarDays size={15}/> Giờ thi đấu</button>
      <button className={opsTab==="results"?"active":""} onClick={()=>setOpsTab("results")}><Save size={15}/> Cập nhật kết quả</button>
      <button className={opsTab==="standings"?"active":""} onClick={()=>setOpsTab("standings")}><BarChart3 size={15}/> BXH</button>
      <button className={opsTab==="bracket"?"active":""} onClick={()=>setOpsTab("bracket")}><GitBranch size={15}/> Nhánh đấu</button>
    </div>

    {opsTab==="rules" && <RulesScreen rules={rules} setRules={setRules} rulesText={rulesText} config={config} setConfig={setConfig}/>}
    {opsTab==="control" && <ControlScreen schedule={schedule} rules={rules} selectedMatch={selectedMatch} setSelectedId={setSelectedId} nextMatches={nextMatches} config={config} genSchedule={genSchedule} copySchedule={copySchedule} genKO={genKO} groups={groups}/>}
    {opsTab==="schedule" && <ScheduleScreen schedule={schedule} genSchedule={genSchedule} copySchedule={copySchedule} config={config} setConfig={setConfig}/>}
    {opsTab==="results" && <ResultsScreen schedule={schedule} selectedMatch={selectedMatch} setSelectedId={setSelectedId} rules={rules} updateDraft={updateDraft} saveGame={saveGame} addGame={addGame} finishMatch={finishMatch}/>}
    {opsTab==="standings" && <StandingsScreen standings={standings} schedule={schedule}/>}
    {opsTab==="bracket" && <BracketScreen knockout={knockout} semis={semis} finals={finals} genKO={genKO} rules={rules} updateKoDraft={updateKoDraft} saveKoGame={saveKoGame} addKoGame={addKoGame} finishKo={finishKo}/>}
  </section>
}

function RulesScreen({rules,setRules,rulesText,config,setConfig}) {
  return <section className="panelClean">
    <div className="panelTitle"><h3>Cấu hình thể thức thi đấu</h3><p>Cấu hình một lần trước giải, sau đó BTC chỉ cần nhập điểm.</p></div>
    <div className="ruleSummaryBig"><div>{rulesText.group}</div><div>{rulesText.ko}</div></div>
    <div className="ruleGrid">
      <label>Vòng bảng<select value={rules.groupFormat} onChange={e=>setRules({groupFormat:e.target.value})}><option value="ROUND_ROBIN">Đấu vòng tròn tính điểm</option></select></label>
      <label>Điểm vòng bảng<input type="number" min="1" value={rules.groupPointTarget} onChange={e=>setRules({groupPointTarget:e.target.value})}/></label>
      <label className="checkLine"><input type="checkbox" checked={rules.groupWinByTwo!==false} onChange={e=>setRules({groupWinByTwo:e.target.checked})}/> Thắng cách 2 điểm</label>
      <label>Vòng loại trực tiếp<input value="Tứ kết, Bán kết, Tranh giải 3, Chung kết" readOnly /></label>
      <label>Điểm loại trực tiếp<input type="number" min="1" value={rules.knockoutPointTarget} onChange={e=>setRules({knockoutPointTarget:e.target.value})}/></label>
      <label className="checkLine"><input type="checkbox" checked={rules.knockoutWinByTwo!==false} onChange={e=>setRules({knockoutWinByTwo:e.target.checked})}/> Thắng cách 2 điểm</label>
      <label className="checkLine"><input type="checkbox" checked={rules.thirdPlace!==false} onChange={e=>setRules({thirdPlace:e.target.checked})}/> Có trận tranh giải 3</label>
      <label>Số sân<input type="number" min="1" value={config.courtCount||3} onChange={e=>setConfig({...config,courtCount:e.target.value})}/></label>
      <label>Giờ bắt đầu<input value={config.startTime||"08:00"} onChange={e=>setConfig({...config,startTime:e.target.value})}/></label>
      <label>Phút/trận<input type="number" min="5" value={config.minutesPerMatch||20} onChange={e=>setConfig({...config,minutesPerMatch:e.target.value})}/></label>
    </div>
  </section>
}

function ControlScreen({schedule,rules,selectedMatch,setSelectedId,nextMatches,config,genSchedule,copySchedule,genKO,groups}) {
  const courts = Array.from({length:Number(config.courtCount||3)},(_,i)=>i+1);
  return <section className="controlGridClean">
    <div className="panelClean">
      <div className="panelTitle"><h3>Điều hành theo sân</h3><p>BTC nhìn nhanh trạng thái từng sân.</p></div>
      <div className="courtGridClean">{courts.map(c=>{
        const m=(schedule||[]).find(x=>Number(x.court)===c && x.status!=="DONE");
        const ss=m?scoreSummary(m,rules):null;
        return <button className={`courtClean ${m?.status==="LIVE"?"live":""}`} key={c} onClick={()=>m&&setSelectedId(m.id)}>
          <b>Sân {c}</b>
          {m ? <><span>{m.status==="LIVE"?"LIVE":"Chờ"}</span><strong>{m.home.name} vs {m.away.name}</strong><em>{ss?.scoreText || m.time}</em></> : <p>Trống</p>}
        </button>
      })}</div>
    </div>
    <div className="panelClean">
      <div className="panelTitle"><h3>Trận tiếp theo / chưa nhập điểm</h3><p>Chọn trận để cập nhật nhanh.</p></div>
      <div className="matchListClean">{nextMatches.length ? nextMatches.map(m=>{const ss=scoreSummary(m,rules);return <button className={`matchRowClean ${selectedMatch?.id===m.id?"active":""}`} key={m.id} onClick={()=>setSelectedId(m.id)}><b>{m.time} · Sân {m.court}</b><span>{m.group}: {m.home.name} vs {m.away.name}</span><em>{ss.scoreText||"Chưa nhập"}</em></button>}) : <p className="muted">Chưa có lịch hoặc đã hoàn thành tất cả.</p>}</div>
    </div>
    <div className="panelClean quickOpsClean">
      <h3>Thao tác nhanh</h3>
      <button className="primary" onClick={genSchedule}>Xếp lịch vòng bảng</button>
      <button className="mini" onClick={copySchedule}>Copy lịch</button>
      <button className="mini" onClick={genKO}>Sinh tứ kết</button>
      <p className="hint">Ngày mai chỉ cần: chốt bảng → xếp lịch → vào Cập nhật kết quả để nhập điểm.</p>
    </div>
  </section>
}

function ScheduleScreen({schedule,genSchedule,copySchedule,config,setConfig}) {
  return <section className="panelClean">
    <div className="panelTitle"><h3>Giờ thi đấu</h3><p>Tách riêng để BTC xem lịch theo giờ, sân, bảng.</p></div>
    <div className="scheduleToolsClean">
      <label>Số sân<input type="number" value={config.courtCount||3} onChange={e=>setConfig({...config,courtCount:e.target.value})}/></label>
      <label>Giờ bắt đầu<input value={config.startTime||"08:00"} onChange={e=>setConfig({...config,startTime:e.target.value})}/></label>
      <label>Phút/trận<input type="number" value={config.minutesPerMatch||20} onChange={e=>setConfig({...config,minutesPerMatch:e.target.value})}/></label>
      <button className="primary" onClick={genSchedule}>Xếp lịch</button>
      <button className="mini" onClick={copySchedule}>Copy lịch</button>
    </div>
    <div className="tablewrap"><table><thead><tr><th>#</th><th>Giờ</th><th>Sân</th><th>Bảng</th><th>Trận</th><th>Trạng thái</th></tr></thead><tbody>{(schedule||[]).map((m,i)=><tr key={m.id}><td>{i+1}</td><td><b>{m.time}</b></td><td>Sân {m.court}</td><td>{m.group}</td><td>{m.home.name} vs {m.away.name}</td><td>{m.status==="DONE"?"Hoàn thành":m.status==="LIVE"?"LIVE":"Chờ"}</td></tr>)}</tbody></table></div>
  </section>
}

function ResultsScreen({schedule,selectedMatch,setSelectedId,rules,updateDraft,saveGame,addGame,finishMatch}) {
  return <section className="resultsGridClean">
    <div className="panelClean">
      <div className="panelTitle"><h3>Danh sách trận</h3><p>Chọn trận cần nhập điểm.</p></div>
      <div className="matchListClean">{(schedule||[]).map(m=>{const ss=scoreSummary(m,rules);return <button className={`matchRowClean ${selectedMatch?.id===m.id?"active":""}`} key={m.id} onClick={()=>setSelectedId(m.id)}><b>{m.time} · Sân {m.court}</b><span>{m.group}: {m.home.name} vs {m.away.name}</span><em>{m.status==="DONE"?"✓ "+ss.scoreText:ss.scoreText||"Chưa nhập"}</em></button>})}</div>
    </div>
    <div className="panelClean">
      <div className="panelTitle"><h3>Cập nhật tỷ số từng game</h3><p>Mỗi game có nút Lưu riêng. Game đã lưu sẽ khóa.</p></div>
      {selectedMatch ? <MatchScoreCard match={selectedMatch} rules={rules} onDraft={updateDraft} onSaveGame={saveGame} onAddGame={addGame} onFinish={finishMatch}/> : <p className="muted">Chưa có trận.</p>}
    </div>
  </section>
}

function StandingsScreen({standings,schedule}) {
  return <section className="panelClean">
    <div className="panelTitle"><h3>Bảng xếp hạng</h3><p>Tự tính theo trận thắng, hiệu số game, hiệu số điểm.</p></div>
    {schedule.length ? Object.entries(standings).map(([group,rows])=><div className="standingGroup" key={group}><h4>{group}</h4><div className="tablewrap"><table><thead><tr><th>Hạng</th><th>Đội</th><th>Trận</th><th>Thắng</th><th>Thua</th><th>Game</th><th>HS điểm</th></tr></thead><tbody>{rows.map(r=><tr key={r.name}><td>{r.rank}</td><td>{r.name}</td><td>{r.played}</td><td>{r.win}</td><td>{r.loss}</td><td>{r.gameFor}-{r.gameAgainst}</td><td>{r.diff}</td></tr>)}</tbody></table></div></div>) : <p className="muted">Chưa có lịch thi đấu.</p>}
  </section>
}

function BracketScreen({knockout,semis,finals,genKO,rules,updateKoDraft,saveKoGame,addKoGame,finishKo}) {
  return <section className="panelClean">
    <div className="panelTitle"><h3>Nhánh đấu</h3><p>Sinh tứ kết theo BXH, sau đó nhập điểm để ra bán kết/chung kết.</p></div>
    <button className="primary" onClick={genKO}>Sinh / cập nhật nhánh Tứ kết</button>
    {knockout.length>0 && <div className="koGridClean">{knockout.map(m=><KoScoreCard key={m.id} match={m} rules={rules} onDraft={updateKoDraft} onSaveGame={saveKoGame} onAddGame={addKoGame} onFinish={finishKo}/>)}</div>}
    {semis.length>0 && <><h3>Bán kết dự kiến</h3>{semis.map(k=><p key={k.id}><b>{k.name}:</b> {k.a.slot} vs {k.b.slot}</p>)}</>}
    {finals.length>0 && <><h3>Chung kết dự kiến</h3>{finals.map(k=><p key={k.id}><b>{k.name}:</b> {k.a.slot} vs {k.b.slot}</p>)}</>}
  </section>
}

function MatchScoreCard({match,rules,onDraft,onSaveGame,onAddGame,onFinish,compact=false}) {
  const ss=scoreSummary(match,rules);
  const rule=targetForMatch(match,rules);
  return <div className={`scoreCard scoreCardV47 ${match.status==="DONE"?"done":""} ${compact?"compact":""}`}>
    <div className="scoreHead"><b>{match.time} · Sân {match.court}</b><span>{match.group} · {rule.label}</span><em>{match.status==="DONE"?"✓ Hoàn thành":match.status==="LIVE"?"LIVE":"Chờ điểm"}</em></div>
    <div className="scoreTeams"><b>{match.home.name}</b><span>vs</span><b>{match.away.name}</b></div>
    {(match.games||[{home:"",away:"",saved:false}]).map((g,i)=><div className={`gameLine ${g.saved?"saved":""}`} key={i}>
      <span>Game {i+1}</span><input disabled={g.saved} value={g.home} onChange={e=>onDraft(match.id,i,"home",e.target.value)} placeholder="0"/><b>-</b><input disabled={g.saved} value={g.away} onChange={e=>onDraft(match.id,i,"away",e.target.value)} placeholder="0"/>
      <button className="saveGameBtn" disabled={g.saved} onClick={()=>onSaveGame(match.id,i)}><Save size={14}/> {g.saved?"Đã lưu":"Lưu Game "+(i+1)}</button>{g.saved&&<small>{g.savedAt}</small>}
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
      <span>Game {i+1}</span><input disabled={g.saved} value={g.home} onChange={e=>onDraft(match.id,i,"home",e.target.value)} placeholder="0"/><b>-</b><input disabled={g.saved} value={g.away} onChange={e=>onDraft(match.id,i,"away",e.target.value)} placeholder="0"/>
      <button className="saveGameBtn" disabled={g.saved} onClick={()=>onSaveGame(match.id,i)}><Save size={14}/> {g.saved?"Đã lưu":"Lưu Game "+(i+1)}</button>{g.saved&&<small>{g.savedAt}</small>}
    </div>)}
    <div className="scoreActions"><button className="mini" onClick={()=>onAddGame(match.id)}>+ Game</button><button className="mini primary" onClick={()=>onFinish(match.id)}><CheckCircle2 size={14}/> Kết thúc trận</button>{ss.winner&&<strong>Thắng: {ss.winner}</strong>}</div>
  </div>
}
