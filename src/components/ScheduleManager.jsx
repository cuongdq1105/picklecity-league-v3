
import { CalendarDays, GitBranch, ClipboardCopy, Trophy } from "lucide-react";
import { makeSchedule, makeKnockout, calcStandings, nextRound, exportScheduleText } from "../utils/draw";

export default function ScheduleManager({ groups, config, setConfig, schedule, setSchedule, knockout, setKnockout, setMsg }) {
  const standings = calcStandings(groups || [], schedule || []);
  const semis = nextRound(knockout, "Bán kết");
  const finals = nextRound(semis, "Chung kết");

  function generateSchedule() {
    if (!groups.length) { setMsg("Chưa có bảng đấu để xếp lịch."); return; }
    const all = makeSchedule(groups, { courtCount: config.courtCount, startTime: config.startTime, minutesPerMatch: config.minutesPerMatch });
    setSchedule(all);
    setMsg(`Đã xếp ${all.length} trận vòng bảng.`);
  }

  function generateKnockout() {
    if (!groups.length) { setMsg("Chưa có bảng đấu để sinh nhánh."); return; }
    const hasScores = (schedule || []).some(m => m.homeScore !== "" && m.awayScore !== "");
    const pairs = makeKnockout(groups, config, hasScores ? standings : null);
    setKnockout(pairs);
    setMsg(`Đã tạo nhánh tứ kết ${pairs.length} trận theo cấu hình hiện tại.`);
  }

  function updateScore(id, field, value) {
    setSchedule((schedule || []).map(m => m.id === id ? {...m, [field]:value} : m));
  }

  function updateWinner(name, value) {
    setKnockout((knockout || []).map(m => m.name === name ? {...m, winner:value} : m));
  }

  function copySchedule() {
    navigator.clipboard.writeText(exportScheduleText(schedule));
    setMsg("Đã copy lịch thi đấu.");
  }

  return <section className="tournamentConfigBox">
    <h3><CalendarDays size={18}/> Lịch thi đấu, kết quả & nhánh loại trực tiếp</h3>
    <p className="hint">Hoàn thiện các giai đoạn: xếp lịch vòng bảng, nhập tỷ số, tự tính BXH và sinh nhánh Tứ kết/Bán kết/Chung kết.</p>

    <div className="configGrid">
      <label>Mỗi bảng lấy top<input type="number" min="1" max="4" value={config.qualifyTop} onChange={e=>setConfig({...config,qualifyTop:e.target.value})}/></label>
      <label>Lấy thêm đội hạng<input type="number" min="2" max="5" value={config.bestRank} onChange={e=>setConfig({...config,bestRank:e.target.value})}/></label>
      <label>Số đội hạng đó xuất sắc<input type="number" min="0" max="8" value={config.bestCount} onChange={e=>setConfig({...config,bestCount:e.target.value})}/></label>
      <label>Tổng đội vào Knockout<input type="number" min="4" max="16" value={config.quarterTeams} onChange={e=>setConfig({...config,quarterTeams:e.target.value})}/></label>
      <label>Số sân thi đấu<input type="number" min="1" max="20" value={config.courtCount||3} onChange={e=>setConfig({...config,courtCount:e.target.value})}/></label>
      <label>Giờ bắt đầu<input value={config.startTime||"08:00"} onChange={e=>setConfig({...config,startTime:e.target.value})} placeholder="08:00"/></label>
      <label>Phút/trận<input type="number" min="5" max="120" value={config.minutesPerMatch||20} onChange={e=>setConfig({...config,minutesPerMatch:e.target.value})}/></label>
    </div>

    <div className="configActions">
      <button className="mini" type="button" onClick={generateSchedule}><CalendarDays size={14}/> Xếp lịch vòng bảng</button>
      <button className="mini" type="button" onClick={generateKnockout}><GitBranch size={14}/> Sinh nhánh tứ kết</button>
      {schedule.length > 0 && <button className="mini" type="button" onClick={copySchedule}><ClipboardCopy size={14}/> Copy lịch</button>}
      <button className="mini" type="button" onClick={()=>window.print()}><Trophy size={14}/> In lịch/BXH</button>
    </div>

    {schedule.length > 0 && <div className="scheduleBox">
      <h3>Lịch thi đấu vòng bảng / Nhập tỷ số</h3>
      <div className="tablewrap"><table><thead><tr><th>#</th><th>Giờ</th><th>Sân</th><th>Bảng</th><th>Trận</th><th>Tỷ số</th></tr></thead>
        <tbody>{schedule.map((m,i)=><tr key={m.id}>
          <td>{i+1}</td><td>{m.time}</td><td>{m.court}</td><td>{m.group}</td>
          <td><b>{m.home.name}</b> vs <b>{m.away.name}</b></td>
          <td className="scoreInputs"><input value={m.homeScore} onChange={e=>updateScore(m.id,"homeScore",e.target.value)} placeholder="0"/><span>-</span><input value={m.awayScore} onChange={e=>updateScore(m.id,"awayScore",e.target.value)} placeholder="0"/></td>
        </tr>)}</tbody>
      </table></div>
    </div>}

    {Object.keys(standings).length > 0 && schedule.length > 0 && <div className="standingsBox">
      <h3>Bảng xếp hạng tạm tính</h3>
      {Object.entries(standings).map(([group, rows])=><div className="standingGroup" key={group}>
        <h4>{group}</h4>
        <div className="tablewrap"><table><thead><tr><th>Hạng</th><th>Đội</th><th>Trận</th><th>Thắng</th><th>Thua</th><th>Điểm+</th><th>Điểm-</th><th>HS</th></tr></thead>
          <tbody>{rows.map(r=><tr key={r.name}><td>{r.rank}</td><td>{r.name}</td><td>{r.played}</td><td>{r.win}</td><td>{r.loss}</td><td>{r.pf}</td><td>{r.pa}</td><td>{r.diff}</td></tr>)}</tbody>
        </table></div>
      </div>)}
    </div>}

    {knockout.length > 0 && <div className="knockoutBox">
      <h3>Nhánh Tứ kết</h3>
      {knockout.map(k=><div className="koMatch" key={k.name}>
        <b>{k.name}:</b> {k.a.slot} vs {k.b.slot}
        <select value={k.winner||""} onChange={e=>updateWinner(k.name,e.target.value)}>
          <option value="">Chọn đội thắng</option>
          <option value={k.a.slot}>{k.a.slot}</option>
          <option value={k.b.slot}>{k.b.slot}</option>
        </select>
      </div>)}
      {semis.length > 0 && <><h3>Bán kết dự kiến</h3>{semis.map(k=><p key={k.name}><b>{k.name}:</b> {k.a.slot} vs {k.b.slot}</p>)}</>}
      {finals.length > 0 && <><h3>Chung kết dự kiến</h3>{finals.map(k=><p key={k.name}><b>{k.name}:</b> {k.a.slot} vs {k.b.slot}</p>)}</>}
      <p className="hint">Nếu đã nhập tỷ số vòng bảng, hệ thống sinh nhánh theo BXH tạm tính. Nếu chưa nhập tỷ số, hệ thống dùng thứ tự đội hiện tại trong bảng.</p>
    </div>}
  </section>
}
