
import { CalendarDays, GitBranch } from "lucide-react";
import { makeSchedule, makeKnockout } from "../utils/draw";

export default function ScheduleManager({ groups, config, setConfig, schedule, setSchedule, knockout, setKnockout, setMsg }) {
  function generateSchedule() {
    if (!groups.length) { setMsg("Chưa có bảng đấu để xếp lịch."); return; }
    const all = makeSchedule(groups);
    setSchedule(all);
    setMsg(`Đã xếp ${all.length} trận vòng bảng.`);
  }

  function generateKnockout() {
    if (!groups.length) { setMsg("Chưa có bảng đấu để sinh nhánh."); return; }
    const pairs = makeKnockout(groups, config);
    setKnockout(pairs);
    setMsg(`Đã tạo nhánh tứ kết ${pairs.length} trận theo cấu hình hiện tại.`);
  }

  return <section className="tournamentConfigBox">
    <h3><CalendarDays size={18}/> Cấu hình thi đấu</h3>
    <p className="hint">Dùng để xếp lịch vòng bảng và sinh nhánh tứ kết theo yêu cầu của giải.</p>
    <div className="configGrid">
      <label>Mỗi bảng lấy top<input type="number" min="1" max="4" value={config.qualifyTop} onChange={e=>setConfig({...config,qualifyTop:e.target.value})}/></label>
      <label>Lấy thêm đội hạng<input type="number" min="2" max="5" value={config.bestRank} onChange={e=>setConfig({...config,bestRank:e.target.value})}/></label>
      <label>Số đội hạng đó xuất sắc<input type="number" min="0" max="8" value={config.bestCount} onChange={e=>setConfig({...config,bestCount:e.target.value})}/></label>
      <label>Tổng đội vào Knockout<input type="number" min="4" max="16" value={config.quarterTeams} onChange={e=>setConfig({...config,quarterTeams:e.target.value})}/></label>
    </div>
    <div className="configActions">
      <button className="mini" type="button" onClick={generateSchedule}><CalendarDays size={14}/> Xếp lịch vòng bảng</button>
      <button className="mini" type="button" onClick={generateKnockout}><GitBranch size={14}/> Sinh nhánh tứ kết</button>
    </div>

    {schedule.length > 0 && <div className="scheduleBox"><h3>Lịch thi đấu vòng bảng</h3>{schedule.map((m,i)=><p key={i}><b>{m.group} - Vòng {m.round}:</b> {m.home.name} vs {m.away.name}</p>)}</div>}
    {knockout.length > 0 && <div className="knockoutBox"><h3>Nhánh tứ kết dự kiến</h3>{knockout.map(k=><p key={k.name}><b>{k.name}:</b> {k.a.slot} vs {k.b.slot}</p>)}</div>}
  </section>
}
