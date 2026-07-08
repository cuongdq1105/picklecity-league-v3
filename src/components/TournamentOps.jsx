
import { useMemo, useState } from "react";
import { Activity, CalendarDays, Trophy, ClipboardCopy, Save, Settings, CheckCircle2, PlayCircle, ListChecks, BarChart3, GitBranch } from "lucide-react";
import { makeSchedule, makeKnockout, calcStandings, koNextRound, exportScheduleText } from "../utils/draw";
import { DEFAULT_RULES, targetForMatch, validateGameScore, scoreSummary, formatRulesText } from "../utils/matchRules";

function nowText(){ const d=new Date(); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`; }
function pct(done,total){ return total ? Math.round(done*100/total) : 0; }
function playersOfTeamV4119(t){ return (t?.players||[]).map(p=>p.full_name).join(" + ") || t?.name || "—"; }
function matchNameV4119(m){
  if(m?.home || m?.away) return `${playersOfTeamV4119(m.home)} gặp ${playersOfTeamV4119(m.away)}`;
  return "";
}

export default function TournamentOps({groups, config, setConfig, schedule, setSchedule, knockout, setKnockout, setMsg}) {
  const [opsTab,setOpsTab]=useState("control");
  const [selectedId,setSelectedId]=useState("");
  const rules={...DEFAULT_RULES,...(config.rules||{})};
  const standings=calcStandings(groups||[],schedule||[],rules);
  const qfMatches=(knockout||[]).filter(m=>String(m.id||"").startsWith("QF"));
  const semis=(knockout||[]).filter(m=>String(m.id||"").startsWith("SF"));
  const finals=(knockout||[]).filter(m=>String(m.id||"").startsWith("FINAL"));
  const thirdPlace=(knockout||[]).filter(m=>String(m.id||"").startsWith("THIRD"));
  const koForDisplay = (qfMatches.length? qfMatches : (knockout||[]));
  const selectedMatch=useMemo(()=> (schedule||[]).find(m=>m.id===selectedId)||(schedule||[]).find(m=>m.status==="LIVE")||(schedule||[]).find(m=>m.status!=="DONE")||(schedule||[])[0]||null,[schedule,selectedId]);
  const live=(schedule||[]).filter(m=>m.status==="LIVE").length;
  const done=(schedule||[]).filter(m=>m.status==="DONE").length;
  const pending=(schedule||[]).filter(m=>m.status!=="DONE").length;
  const nextMatches=(schedule||[]).filter(m=>m.status!=="DONE").slice(0,8);
  const totalTeams=(groups||[]).reduce((s,g)=>s+(g.teams?.length||0),0);
  const progress=pct(done,schedule.length);
  const rulesText=formatRulesText(rules);

  function setRules(patch){ setConfig({...config,rules:{...rules,...patch}}); }
  function genSchedule(){ if(!groups.length){setMsg("Chưa có bảng đấu để xếp lịch.");return;} const s=makeSchedule(groups,{courtCount:config.courtCount,startTime:config.startTime,minutesPerMatch:config.minutesPerMatch}); setSchedule(s); setSelectedId(s[0]?.id||""); setMsg(`Đã xếp ${s.length} trận vòng bảng theo kiểu xen kẽ A/B/C trên các sân.`); }
  function copySchedule(){ navigator.clipboard.writeText(exportScheduleText(schedule)); setMsg("Đã copy lịch thi đấu."); }
  function genKO(){
    if(!groups.length){setMsg("Chưa có bảng đấu.");return;}
    const pairs=makeKnockout(groups,config,standings);
    const sf=buildSemis(pairs);
    const fn=buildFinals(sf);
    const th=buildThirdPlace(sf);
    setKnockout([...pairs,...sf,...fn,...th]);
    setMsg(`Đã sinh nhánh đấu đầy đủ: ${pairs.length} Tứ kết, Bán kết, Chung kết và Tranh giải 3.`);
  }
  function updateDraft(id, idx, side, value){ setSchedule((schedule||[]).map(m=>{ if(m.id!==id)return m; const games=[...(m.games||[{home:"",away:"",saved:false}])]; games[idx]={...games[idx],[side]:value}; return {...m,games,status:m.status==="DONE"?"DONE":"LIVE"}; })); }
  function saveGame(id, idx){ let msg=""; setSchedule((schedule||[]).map(m=>{ if(m.id!==id)return m; const games=[...(m.games||[])]; const g=games[idx]||{home:"",away:""}; const valid=validateGameScore(g.home,g.away,targetForMatch(m,rules)); if(!valid.ok){msg=valid.message;return m;} games[idx]={...g,saved:true,savedAt:nowText()}; const ns={...m,games,status:"LIVE"}; const ss=scoreSummary(ns,rules); msg=`Đã lưu Game ${idx+1}: ${g.home}-${g.away}.`; return {...ns,winner:ss.winner}; })); setMsg(msg||"Đã lưu game."); }
  function addGame(id){ setSchedule((schedule||[]).map(m=>m.id===id?{...m,games:[...(m.games||[]),{home:"",away:"",saved:false}]}:m)); }
  function finishMatch(id){ let msg=""; setSchedule((schedule||[]).map(m=>{ if(m.id!==id)return m; const ss=scoreSummary(m,rules); if(!ss.winner){msg="Chưa đủ game đã lưu để kết thúc trận.";return m;} msg=`Đã kết thúc trận. Đội thắng: ${ss.winner}`; return {...m,status:"DONE",winner:ss.winner,finishedAt:nowText()}; })); setMsg(msg); }
  function updateKoDraft(id, idx, side, value){ setKnockout((knockout||[]).map(m=>{ if(m.id!==id)return m; const games=[...(m.games||[{home:"",away:"",saved:false}])]; games[idx]={...games[idx],[side]:value}; return {...m,games,status:m.status==="DONE"?"DONE":"LIVE"}; })); }
  function saveKoGame(id, idx){ let msg=""; setKnockout((knockout||[]).map(m=>{ if(m.id!==id)return m; const games=[...(m.games||[])]; const g=games[idx]||{home:"",away:""}; const fake={...m,home:{name:m.a.slot},away:{name:m.b.slot}}; const valid=validateGameScore(g.home,g.away,targetForMatch(fake,rules)); if(!valid.ok){msg=valid.message;return m;} games[idx]={...g,saved:true,savedAt:nowText()}; const ss=scoreSummary({...fake,games},rules); msg=`Đã lưu ${m.name} - Game ${idx+1}: ${g.home}-${g.away}.`; return {...m,games,status:"LIVE",winner:ss.winner}; })); setMsg(msg||"Đã lưu game."); }
  function addKoGame(id){ setKnockout((knockout||[]).map(m=>m.id===id?{...m,games:[...(m.games||[]),{home:"",away:"",saved:false}]}:m)); }
  function finishKo(id){ let msg=""; setKnockout((knockout||[]).map(m=>{ if(m.id!==id)return m; const ss=scoreSummary({...m,home:{name:m.a.slot},away:{name:m.b.slot}},rules); if(!ss.winner){msg="Chưa đủ game đã lưu để kết thúc trận.";return m;} msg=`Đã kết thúc ${m.name}. Đội thắng: ${ss.winner}`; return {...m,status:"DONE",winner:ss.winner,finishedAt:nowText()}; })); setMsg(msg); }

  return <section className="opsClean">
    <div className="opsCleanHead"><div><h2>Điều hành giải</h2><p>Giao diện gọn cho BTC: cấu hình, lịch, điều hành, nhập điểm, BXH và nhánh đấu.</p></div><div className="opsMiniStats"><b>{progress}%</b><span>Tiến độ</span></div></div>
    <div className="opsKpiClean"><div><ListChecks/><b>{totalTeams}</b><span>Đội</span></div><div><CalendarDays/><b>{schedule.length}</b><span>Trận</span></div><div><PlayCircle/><b>{live}</b><span>LIVE</span></div><div><CheckCircle2/><b>{done}</b><span>Hoàn thành</span></div><div><Save/><b>{pending}</b><span>Chưa nhập</span></div></div>
    <div className="opsTabsClean">
      <button className={opsTab==="rules"?"active":""} onClick={()=>setOpsTab("rules")}><Settings size={15}/> Cấu hình thể thức</button>
      <button className={opsTab==="control"?"active":""} onClick={()=>setOpsTab("control")}><Activity size={15}/> Điều hành giải</button>
      <button className={opsTab==="schedule"?"active":""} onClick={()=>setOpsTab("schedule")}><CalendarDays size={15}/> Giờ thi đấu</button>
      <button className={opsTab==="results"?"active":""} onClick={()=>setOpsTab("results")}><Save size={15}/> Cập nhật kết quả</button>
      <button className={opsTab==="standings"?"active":""} onClick={()=>setOpsTab("standings")}><BarChart3 size={15}/> BXH</button>
      <button className={opsTab==="bracket"?"active":""} onClick={()=>setOpsTab("bracket")}><GitBranch size={15}/> Nhánh đấu</button>
    </div>
    {opsTab==="rules" && <RulesScreen rules={rules} setRules={setRules} rulesText={rulesText} config={config} setConfig={setConfig}/>}
    {opsTab==="control" && <ControlScreen schedule={schedule} rules={rules} selectedMatch={selectedMatch} setSelectedId={setSelectedId} nextMatches={nextMatches} config={config} genSchedule={genSchedule} copySchedule={copySchedule} genKO={genKO}/>}
    {opsTab==="schedule" && <ScheduleScreen schedule={schedule} genSchedule={genSchedule} copySchedule={copySchedule} config={config} setConfig={setConfig}/>}
    {opsTab==="results" && <ResultsScreen schedule={schedule} selectedMatch={selectedMatch} setSelectedId={setSelectedId} rules={rules} updateDraft={updateDraft} saveGame={saveGame} addGame={addGame} finishMatch={finishMatch}/>}
    {opsTab==="standings" && <StandingsScreen standings={standings} schedule={schedule}/>}
    {opsTab==="bracket" && <BracketScreen knockout={qfMatches.length?qfMatches:koForDisplay} semis={semis.length?semis:buildSemis(qfMatches)} finals={finals.length?finals:buildFinals(semis.length?semis:buildSemis(qfMatches))} thirdPlace={thirdPlace.length?thirdPlace:buildThirdPlace(semis.length?semis:buildSemis(qfMatches))} genKO={genKO} rules={rules} updateKoDraft={updateKoDraft} saveKoGame={saveKoGame} addKoGame={addKoGame} finishKo={finishKo}/>}
  </section>
}

function RulesScreen({rules,setRules,rulesText,config,setConfig}) {
  return <section className="panelClean"><div className="panelTitle"><h3>Cấu hình thể thức thi đấu</h3><p>Vòng bảng 11 điểm cách 2. Xếp hạng: số trận thắng → hiệu số điểm → tổng điểm ghi được → đối đầu trực tiếp → bốc thăm.</p></div>
    <div className="ruleSummaryBig"><div>{rulesText.group}</div><div>{rulesText.ko}</div></div><div className="rankingRuleBox"><h4>Tiêu chí xếp hạng vòng bảng</h4><ol><li>Số trận thắng</li><li>Hiệu số điểm</li><li>Tổng điểm ghi được</li><li>Đối đầu trực tiếp nếu chỉ có 2 đội bằng nhau</li><li>Bốc thăm nếu vẫn hòa hoàn toàn</li></ol><p>Vì mỗi trận chỉ đánh 1 game, hệ thống bỏ tiêu chí hiệu số game để BXH dễ hiểu hơn.</p></div>
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
    </div></section>
}

function ControlScreen({schedule,rules,selectedMatch,setSelectedId,nextMatches,config,genSchedule,copySchedule,genKO}) {
  const courts = Array.from({length:Number(config.courtCount||3)},(_,i)=>i+1);
  return <section className="controlGridClean"><div className="panelClean"><div className="panelTitle"><h3>Điều hành theo sân</h3><p>Nhìn nhanh trạng thái từng sân.</p></div><div className="courtGridClean">{courts.map(c=>{const m=(schedule||[]).find(x=>Number(x.court)===c && x.status!=="DONE"); const ss=m?scoreSummary(m,rules):null; return <button className={`courtClean ${m?.status==="LIVE"?"live":""}`} key={c} onClick={()=>m&&setSelectedId(m.id)}><b>Sân {c}</b>{m ? <><span>{m.status==="LIVE"?"LIVE":"Chờ"}</span><strong>{playersOfTeamV4119(m.home)} vs {playersOfTeamV4119(m.away)}</strong><em>{ss?.scoreText || m.time}</em></> : <p>Trống</p>}</button>})}</div></div>
    <div className="panelClean"><div className="panelTitle"><h3>Trận tiếp theo / chưa nhập điểm</h3><p>Chọn trận để cập nhật nhanh.</p></div><div className="matchListClean">{nextMatches.length ? nextMatches.map(m=>{const ss=scoreSummary(m,rules);return <button className={`matchRowClean ${selectedMatch?.id===m.id?"active":""}`} key={m.id} onClick={()=>setSelectedId(m.id)}><b>{m.time} · Sân {m.court}</b><span>{m.group}: {playersOfTeamV4119(m.home)} vs {playersOfTeamV4119(m.away)}</span><em>{ss.scoreText||"Chưa nhập"}</em></button>}) : <p className="muted">Chưa có lịch hoặc đã hoàn thành tất cả.</p>}</div></div>
    <div className="panelClean quickOpsClean"><h3>Thao tác nhanh</h3><button className="primary" onClick={genSchedule}>Xếp lịch vòng bảng</button><button className="mini" onClick={copySchedule}>Copy lịch</button><button className="mini" onClick={genKO}>Sinh tứ kết</button><p className="hint">Ngày thi đấu: chốt bảng → xếp lịch → cập nhật kết quả → xem BXH/nhánh.</p></div></section>
}
function ScheduleScreen({schedule,genSchedule,copySchedule,config,setConfig}) {return <section className="panelClean"><div className="panelTitle"><h3>Giờ thi đấu</h3><p>Lịch riêng để BTC và khán giả theo dõi. Hệ thống xếp xen kẽ các bảng trên cùng cung giờ.</p></div><div className="scheduleToolsClean"><label>Số sân<input type="number" value={config.courtCount||3} onChange={e=>setConfig({...config,courtCount:e.target.value})}/></label><label>Giờ bắt đầu<input value={config.startTime||"08:00"} onChange={e=>setConfig({...config,startTime:e.target.value})}/></label><label>Phút/trận<input type="number" value={config.minutesPerMatch||20} onChange={e=>setConfig({...config,minutesPerMatch:e.target.value})}/></label><button className="primary" onClick={genSchedule}>Xếp lịch</button><button className="mini" onClick={copySchedule}>Copy lịch</button></div><div className="tablewrap"><table><thead><tr><th>#</th><th>Giờ</th><th>Sân</th><th>Bảng</th><th>Trận</th><th>Trạng thái</th></tr></thead><tbody>{(schedule||[]).map((m,i)=><tr key={m.id}><td>{i+1}</td><td><b>{m.time}</b></td><td>Sân {m.court}</td><td>{m.group}</td><td>{playersOfTeamV4119(m.home)} vs {playersOfTeamV4119(m.away)}</td><td>{m.status==="DONE"?"Hoàn thành":m.status==="LIVE"?"LIVE":"Chờ"}</td></tr>)}</tbody></table></div></section>}
function ResultsScreen({schedule,selectedMatch,setSelectedId,rules,updateDraft,saveGame,addGame,finishMatch}) {return <section className="resultsGridClean"><div className="panelClean"><div className="panelTitle"><h3>Danh sách trận</h3><p>Chọn trận cần nhập điểm.</p></div><div className="matchListClean">{(schedule||[]).map(m=>{const ss=scoreSummary(m,rules);return <button className={`matchRowClean ${selectedMatch?.id===m.id?"active":""}`} key={m.id} onClick={()=>setSelectedId(m.id)}><b>{m.time} · Sân {m.court}</b><span>{m.group}: {playersOfTeamV4119(m.home)} vs {playersOfTeamV4119(m.away)}</span><em>{m.status==="DONE"?"✓ "+ss.scoreText:ss.scoreText||"Chưa nhập"}</em></button>})}</div></div><div className="panelClean"><div className="panelTitle"><h3>Cập nhật tỷ số từng game</h3><p>Mỗi game có nút Lưu riêng. Game đã lưu sẽ khóa.</p></div>{selectedMatch ? <MatchScoreCard match={selectedMatch} rules={rules} onDraft={updateDraft} onSaveGame={saveGame} onAddGame={addGame} onFinish={finishMatch}/> : <p className="muted">Chưa có trận.</p>}</div></section>}
function StandingsScreen({standings,schedule}) {return <section className="panelClean"><div className="panelTitle"><h3>Bảng xếp hạng</h3><p>Tự tính theo trận thắng, hiệu số game, hiệu số điểm.</p></div>{schedule.length ? Object.entries(standings).map(([group,rows])=><div className="standingGroup" key={group}><h4>{group}</h4><div className="tablewrap"><table><thead><tr><th>Hạng</th><th>Đội</th><th>Trận</th><th>Thắng</th><th>Thua</th><th>Điểm ghi</th><th>HS điểm</th></tr></thead><tbody>{rows.map(r=><tr key={r.name}><td>{r.rank}</td><td>{r.name}</td><td>{r.played}</td><td>{r.win}</td><td>{r.loss}</td><td>{r.pf}</td><td>{r.diff}</td></tr>)}</tbody></table></div></div>) : <p className="muted">Chưa có lịch thi đấu.</p>}</section>}

function bracketTeamName(slotObj){
  return slotObj?.teamName || slotObj?.team?.name || slotObj?.row?.team?.name || slotObj?.winnerName || slotObj?.slot || "—";
}
function bracketPlayers(slotObj){
  if(slotObj?.playerNames) return slotObj.playerNames;
  const players = slotObj?.team?.players || slotObj?.row?.team?.players || [];
  return players.map(p=>p.full_name).join(" + ");
}
function bracketSlotLabel(slotObj){
  return slotObj?.slot || "—";
}
function cloneBracketSlot(slotObj,label){
  if(!slotObj) return {slot:label, team:null};
  const players = slotObj?.playerNames || (slotObj?.team?.players || slotObj?.row?.team?.players || []).map(p=>p.full_name).join(" + ");
  return {...slotObj, slot:label, teamName:bracketTeamName(slotObj), winnerName:bracketTeamName(slotObj), playerNames:players};
}
function slotMatchesBracketWinner(slotObj,winner){
  const w = String(winner||"").trim();
  if(!w) return false;
  const candidates = [slotObj?.slot,slotObj?.displaySlot,slotObj?.originalSlot,slotObj?.teamName,slotObj?.winnerName,slotObj?.team?.name,slotObj?.row?.team?.name]
    .filter(Boolean).map(x=>String(x).trim());
  return candidates.includes(w);
}
function makeAdvancer(label, sourceMatch){
  if(!sourceMatch?.winner) return {slot: label, team:null};
  if(sourceMatch.winnerTeam) return cloneBracketSlot(sourceMatch.winnerTeam,label);
  const aName = bracketTeamName(sourceMatch.a);
  const bName = bracketTeamName(sourceMatch.b);
  const winner = (sourceMatch.winner === aName || slotMatchesBracketWinner(sourceMatch.a,sourceMatch.winner)) ? sourceMatch.a : (sourceMatch.winner === bName || slotMatchesBracketWinner(sourceMatch.b,sourceMatch.winner)) ? sourceMatch.b : null;
  return winner ? cloneBracketSlot(winner,label) : {slot:label, teamName:sourceMatch.winner, winnerName:sourceMatch.winner, playerNames:""};
}
function makeLoser(label, sourceMatch){
  if(!sourceMatch?.winner) return {slot: label, team:null};
  const aName = bracketTeamName(sourceMatch.a);
  const bName = bracketTeamName(sourceMatch.b);
  const aWon = sourceMatch.winner === aName || slotMatchesBracketWinner(sourceMatch.a,sourceMatch.winner);
  const bWon = sourceMatch.winner === bName || slotMatchesBracketWinner(sourceMatch.b,sourceMatch.winner);
  const loser = aWon ? sourceMatch.b : bWon ? sourceMatch.a : null;
  return loser ? cloneBracketSlot(loser,label) : {slot: label, team:null};
}

function BracketScreen({knockout,semis,finals,thirdPlace,genKO,rules,updateKoDraft,saveKoGame,addKoGame,finishKo}) {
  const qfs = knockout || [];
  const demoQf = [
    {id:"demo1",name:"Tứ kết 1",a:{slot:"A1"},b:{slot:"Best3-2"}},
    {id:"demo2",name:"Tứ kết 2",a:{slot:"B1"},b:{slot:"Best3-1"}},
    {id:"demo3",name:"Tứ kết 3",a:{slot:"C1"},b:{slot:"A2"}},
    {id:"demo4",name:"Tứ kết 4",a:{slot:"B2"},b:{slot:"C2"}}
  ];
  const qfShow = qfs.length ? qfs : demoQf;
  return <section className="bracketScreenV499 fullBracketV4104">
    <div className="bracketHeroV499">
      <div>
        <div className="bracketTitleV499">
          <GitBranch size={34}/>
          <div>
            <h3>Nhánh đấu loại trực tiếp <span>Tứ kết → Bán kết → Chung kết</span></h3>
            <p>Sinh toàn bộ cây đấu, tự đẩy đội thắng lên vòng sau.</p>
          </div>
        </div>
      </div>
      <button className="regenBracketV499" onClick={genKO}>↻ Tạo lại nhánh</button>
    </div>

    <div className="bracketExplainV499">
      <h4>Công thức nhánh</h4>
      <p><b>QF1:</b> A1 vs Best3-2 · <b>QF2:</b> B1 vs Best3-1 · <b>QF3:</b> C1 vs A2 · <b>QF4:</b> B2 vs C2</p>
      <p><b>BK1:</b> Winner QF1 vs Winner QF4 · <b>BK2:</b> Winner QF2 vs Winner QF3</p>
      <p><b>Chung kết:</b> Winner BK1 vs Winner BK2 · <b>Tranh giải 3:</b> Loser BK1 vs Loser BK2</p>
    </div>

    <div className="bracketTreeV4104">
      <div className="bracketRoundV4104">
        <h3>Tứ kết</h3>
        {qfShow.map((m,i)=><QuarterCardV499 key={m.id||i} match={m} index={i}/>)}
      </div>
      <div className="bracketRoundV4104">
        <h3>Bán kết</h3>
        {semis.map((m,i)=><RoundCardV4104 key={m.id} match={m} label={`BK${i+1}`}/>)}
      </div>
      <div className="bracketRoundV4104 finalRoundV4104">
        <h3>Chung kết</h3>
        {finals.map(m=><RoundCardV4104 key={m.id} match={m} label="FINAL" champion />)}
        <h3>Tranh giải 3</h3>
        {thirdPlace.map(m=><RoundCardV4104 key={m.id} match={m} label="3RD" />)}
      </div>
    </div>

    <div className="bracketNoteV499">
      <b>⚠️ Cách cập nhật</b>
      <p>Việc nhập điểm Tứ kết, Bán kết, Tranh giải 3 và Chung kết đã được chuyển sang tab Nhập điểm. Nhánh này tự cập nhật theo kết quả đã lưu.</p>
    </div>
  </section>
}

function RoundCardV4104({match,label,champion=false}) {
  return <div className={`roundCardV4104 ${champion?"champion":""}`}>
    <div className="roundBadgeV4104">{label}</div>
    <h4>{match.name}</h4>
    <div className="roundTeamsV4104 roundTeamsNamesV4105">
      <span><em>{bracketSlotLabel(match.a)}</em><strong>{bracketTeamName(match.a)}</strong><small>{bracketPlayers(match.a)}</small></span>
      <b>vs</b>
      <span><em>{bracketSlotLabel(match.b)}</em><strong>{bracketTeamName(match.b)}</strong><small>{bracketPlayers(match.b)}</small></span>
    </div>
    {champion && <p>🏆 Đội thắng là vô địch</p>}
  </div>
}

function QuarterCardV499({match,index}) {
  const subtitles = [
    "Nhất Bảng A vs Hạng 3 tốt thứ hai",
    "Nhất Bảng B vs Hạng 3 tốt nhất",
    "Nhất Bảng C vs Nhì Bảng A",
    "Nhì Bảng B vs Nhì Bảng C"
  ];
  const left = bracketSlotLabel(match.a);
  const right = bracketSlotLabel(match.b);
  const winner = match.winner || "";
  return <div className="qfCardV499">
    <div className="qfBadgeV499">QF{index+1}</div>
    <div className="qfBodyV499">
      <h4>{match.name || `Tứ kết ${index+1}`}</h4>
      <div className="qfTeamsV499 qfTeamsNamesV4105">
        <span><em>{left}</em><strong>{bracketTeamName(match.a)}</strong><small>{bracketPlayers(match.a)}</small></span>
        <b>vs</b>
        <span className={String(right).includes("Best3") ? "best3" : ""}><em>{right}</em><strong>{bracketTeamName(match.b)}</strong><small>{bracketPlayers(match.b)}</small></span>
      </div>
      <p>{winner ? `Thắng: ${winner}` : (subtitles[index] || "")}</p>
    </div>
  </div>
}

function buildSemis(qfs=[]){
  const byId=Object.fromEntries((qfs||[]).map(m=>[m.id,m]));
  const adv = (id,label) => makeAdvancer(label, byId[id]);
  return [
    {id:"SF-1",name:"Bán kết 1",type:"KO",round:"SF",status:"SCHEDULED",a:adv("QF-1","Winner QF1"),b:adv("QF-4","Winner QF4"),games:[{home:"",away:"",saved:false}],winner:""},
    {id:"SF-2",name:"Bán kết 2",type:"KO",round:"SF",status:"SCHEDULED",a:adv("QF-2","Winner QF2"),b:adv("QF-3","Winner QF3"),games:[{home:"",away:"",saved:false}],winner:""}
  ];
}
function buildFinals(semis=[]){
  const adv = (m,label) => makeAdvancer(label, m);
  return [{id:"FINAL-1",name:"Chung kết",type:"KO",round:"FINAL",status:"SCHEDULED",a:adv(semis[0],"Winner BK1"),b:adv(semis[1],"Winner BK2"),games:[{home:"",away:"",saved:false}],winner:""}];
}
function buildThirdPlace(semis=[]){
  return [{id:"THIRD-1",name:"Tranh giải 3",type:"KO",round:"THIRD",status:"SCHEDULED",a:makeLoser("Loser BK1",semis[0]),b:makeLoser("Loser BK2",semis[1]),games:[{home:"",away:"",saved:false}],winner:""}];
}

function KoScoreCard({match,rules,onDraft,onSaveGame,onAddGame,onFinish}) {const fake={...match,home:{name:bracketTeamName(match.a)},away:{name:bracketTeamName(match.b)}}; const ss=scoreSummary(fake,rules); const rule=targetForMatch(fake,rules); return <div className={`scoreCard scoreCardV47 ${match.status==="DONE"?"done":""}`}><div className="scoreHead"><b>{match.name}</b><span>{rule.label}</span><em>{match.status==="DONE"?"✓ Hoàn thành":match.status==="LIVE"?"LIVE":"Chờ điểm"}</em></div><div className="scoreTeams"><b>{bracketTeamName(match.a)}</b><span>vs</span><b>{bracketTeamName(match.b)}</b></div>{(match.games||[{home:"",away:"",saved:false}]).map((g,i)=><div className={`gameLine ${g.saved?"saved":""}`} key={i}><span>Game {i+1}</span><input disabled={g.saved} value={g.home} onChange={e=>onDraft(match.id,i,"home",e.target.value)} placeholder="0"/><b>-</b><input disabled={g.saved} value={g.away} onChange={e=>onDraft(match.id,i,"away",e.target.value)} placeholder="0"/><button className="saveGameBtn" disabled={g.saved} onClick={()=>onSaveGame(match.id,i)}><Save size={14}/> {g.saved?"Đã lưu":"Lưu Game "+(i+1)}</button>{g.saved&&<small>{g.savedAt}</small>}</div>)}<div className="scoreActions"><button className="mini" onClick={()=>onAddGame(match.id)}>+ Game</button><button className="mini primary" onClick={()=>onFinish(match.id)}><CheckCircle2 size={14}/> Kết thúc trận</button>{ss.winner&&<strong>Thắng: {ss.winner}</strong>}</div></div>}
