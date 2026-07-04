
import { Activity, CalendarDays, Trophy, ClipboardCopy } from "lucide-react";
import { makeSchedule, makeKnockout, calcStandings, koNextRound, scoreSummary, exportScheduleText } from "../utils/draw";

export default function TournamentOps({groups, config, setConfig, schedule, setSchedule, knockout, setKnockout, setMsg}) {
  const standings = calcStandings(groups||[], schedule||[]);
  const semis = koNextRound(knockout||[], "Bán kết", "SF");
  const finals = koNextRound(semis, "Chung kết", "FINAL");

  function genSchedule(){
    if(!groups.length){setMsg("Chưa có bảng đấu để xếp lịch.");return;}
    const s=makeSchedule(groups,{courtCount:config.courtCount,startTime:config.startTime,minutesPerMatch:config.minutesPerMatch});
    setSchedule(s);
    setMsg(`Đã xếp ${s.length} trận vòng bảng.`);
  }
  function updateGame(id, idx, side, value){
    setSchedule((schedule||[]).map(m=>{
      if(m.id!==id)return m;
      const games=[...(m.games||[{home:"",away:""}])];
      games[idx]={...games[idx],[side]:value};
      const ns={...m,games};
      const ss=scoreSummary(ns);
      return {...ns,winner:ss.winner,status:ss.winner?"DONE":"SCHEDULED"};
    }));
  }
  function addGame(id){
    setSchedule((schedule||[]).map(m=>m.id===id?{...m,games:[...(m.games||[]),{home:"",away:""}]}:m));
  }
  function genKO(){
    if(!groups.length){setMsg("Chưa có bảng đấu.");return;}
    const pairs=makeKnockout(groups,config,standings);
    setKnockout(pairs);
    setMsg(`Đã sinh ${pairs.length} trận Tứ kết theo BXH hiện tại.`);
  }
  function updateKoGame(id, idx, side, value){
    setKnockout((knockout||[]).map(m=>{
      if(m.id!==id)return m;
      const games=[...(m.games||[{home:"",away:""}])];
      games[idx]={...games[idx],[side]:value};
      const homeTeam={name:m.a.slot}, awayTeam={name:m.b.slot};
      const ns={...m,home:homeTeam,away:awayTeam,games};
      const ss=scoreSummary(ns);
      return {...m,games,winner:ss.winner,status:ss.winner?"DONE":"SCHEDULED"};
    }));
  }
  function addKoGame(id){
    setKnockout((knockout||[]).map(m=>m.id===id?{...m,games:[...(m.games||[]),{home:"",away:""}]}:m));
  }
  function copySchedule(){navigator.clipboard.writeText(exportScheduleText(schedule));setMsg("Đã copy lịch thi đấu.");}

  const nextMatches=(schedule||[]).filter(m=>m.status!=="DONE").slice(0,6);
  const done=(schedule||[]).filter(m=>m.status==="DONE").length;

  return <section className="opsBox">
    <div className="card-title"><Activity/> Điều hành thi đấu</div>
    <p className="hint">BTC nhập điểm từng trận, hệ thống tự tính BXH và sinh nhánh loại trực tiếp.</p>

    <div className="opsStats">
      <div><b>{schedule.length}</b><span>Trận vòng bảng</span></div>
      <div><b>{done}</b><span>Đã nhập điểm</span></div>
      <div><b>{nextMatches.length}</b><span>Trận chờ</span></div>
      <div><b>{knockout.length}</b><span>Trận tứ kết</span></div>
    </div>

    <div className="configGrid">
      <label>Số sân<input type="number" min="1" value={config.courtCount||3} onChange={e=>setConfig({...config,courtCount:e.target.value})}/></label>
      <label>Giờ bắt đầu<input value={config.startTime||"08:00"} onChange={e=>setConfig({...config,startTime:e.target.value})}/></label>
      <label>Phút/trận<input type="number" min="5" value={config.minutesPerMatch||20} onChange={e=>setConfig({...config,minutesPerMatch:e.target.value})}/></label>
      <label>Top mỗi bảng<input type="number" min="1" value={config.qualifyTop||2} onChange={e=>setConfig({...config,qualifyTop:e.target.value})}/></label>
      <label>Lấy thêm hạng<input type="number" min="2" value={config.bestRank||3} onChange={e=>setConfig({...config,bestRank:e.target.value})}/></label>
      <label>Số đội hạng đó<input type="number" min="0" value={config.bestCount||2} onChange={e=>setConfig({...config,bestCount:e.target.value})}/></label>
    </div>

    <div className="configActions">
      <button className="mini" onClick={genSchedule}><CalendarDays size={14}/> Xếp lịch vòng bảng</button>
      {schedule.length>0 && <button className="mini" onClick={copySchedule}><ClipboardCopy size={14}/> Copy lịch</button>}
      <button className="mini" onClick={genKO}><Trophy size={14}/> Sinh tứ kết</button>
    </div>

    {nextMatches.length>0 && <div className="nextBox">
      <h3>Trận tiếp theo / chưa nhập điểm</h3>
      {nextMatches.map(m=><p key={m.id}><b>{m.time} - Sân {m.court}</b> · {m.group}: {m.home.name} vs {m.away.name}</p>)}
    </div>}

    {schedule.length>0 && <div className="scoreBoard">
      <h3>Nhập điểm vòng bảng</h3>
      {(schedule||[]).map(m=>{
        const ss=scoreSummary(m);
        return <div className={`scoreCard ${m.status==="DONE"?"done":""}`} key={m.id}>
          <div className="scoreHead"><b>{m.time} · Sân {m.court}</b><span>{m.group}</span><em>{m.status==="DONE"?"✓ Hoàn thành":"Chờ điểm"}</em></div>
          <div className="scoreTeams"><b>{m.home.name}</b><span>vs</span><b>{m.away.name}</b></div>
          {(m.games||[{home:"",away:""}]).map((g,i)=><div className="gameLine" key={i}>
            <span>Game {i+1}</span>
            <input value={g.home} onChange={e=>updateGame(m.id,i,"home",e.target.value)} placeholder="0"/>
            <b>-</b>
            <input value={g.away} onChange={e=>updateGame(m.id,i,"away",e.target.value)} placeholder="0"/>
          </div>)}
          <div className="scoreActions">
            <button className="mini" onClick={()=>addGame(m.id)}>+ Game</button>
            {ss.winner && <strong>Thắng: {ss.winner}</strong>}
          </div>
        </div>
      })}
    </div>}

    {Object.keys(standings).length>0 && schedule.length>0 && <div className="standingsBox">
      <h3>BXH vòng bảng</h3>
      {Object.entries(standings).map(([group,rows])=><div className="standingGroup" key={group}>
        <h4>{group}</h4>
        <div className="tablewrap"><table><thead><tr><th>Hạng</th><th>Đội</th><th>Trận</th><th>Thắng</th><th>Thua</th><th>Game</th><th>HS điểm</th></tr></thead>
          <tbody>{rows.map(r=><tr key={r.name}><td>{r.rank}</td><td>{r.name}</td><td>{r.played}</td><td>{r.win}</td><td>{r.loss}</td><td>{r.gameFor}-{r.gameAgainst}</td><td>{r.diff}</td></tr>)}</tbody>
        </table></div>
      </div>)}
    </div>}

    {knockout.length>0 && <div className="knockoutBox">
      <h3>Nhập điểm Tứ kết</h3>
      {knockout.map(m=>{
        const ss=scoreSummary({...m,home:{name:m.a.slot},away:{name:m.b.slot}});
        return <div className={`scoreCard ${m.status==="DONE"?"done":""}`} key={m.id}>
          <div className="scoreHead"><b>{m.name}</b><em>{m.status==="DONE"?"✓ Hoàn thành":"Chờ điểm"}</em></div>
          <div className="scoreTeams"><b>{m.a.slot}</b><span>vs</span><b>{m.b.slot}</b></div>
          {(m.games||[{home:"",away:""}]).map((g,i)=><div className="gameLine" key={i}>
            <span>Game {i+1}</span><input value={g.home} onChange={e=>updateKoGame(m.id,i,"home",e.target.value)} placeholder="0"/><b>-</b><input value={g.away} onChange={e=>updateKoGame(m.id,i,"away",e.target.value)} placeholder="0"/>
          </div>)}
          <div className="scoreActions"><button className="mini" onClick={()=>addKoGame(m.id)}>+ Game</button>{ss.winner && <strong>Thắng: {ss.winner}</strong>}</div>
        </div>
      })}
      {semis.length>0 && <><h3>Bán kết dự kiến</h3>{semis.map(k=><p key={k.id}><b>{k.name}:</b> {k.a.slot} vs {k.b.slot}</p>)}</>}
      {finals.length>0 && <><h3>Chung kết dự kiến</h3>{finals.map(k=><p key={k.id}><b>{k.name}:</b> {k.a.slot} vs {k.b.slot}</p>)}</>}
    </div>}
  </section>
}
