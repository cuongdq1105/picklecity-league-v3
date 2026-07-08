
import { Settings, SlidersHorizontal } from "lucide-react";

const EVENT_TYPES = ["Đôi nam", "Đôi nữ", "Đôi nam nữ", "Đôi vợ chồng", "Đơn nam", "Đơn nữ"];

export default function TournamentSettings({ form, setForm, onSave, matchConfig={}, setMatchConfig }) {
  const rules = matchConfig.rules || {};
  function setRule(key,value){
    setMatchConfig?.({...matchConfig, rules:{...rules,[key]:value}});
  }
  function applyWeeklyOpen(){
    setMatchConfig?.({...matchConfig, rules:{
      ...rules,
      groupGamesToWin:1, groupPointTarget:11, groupWinByTwo:true, groupMaxPoint:15,
      knockoutGamesToWin:1, knockoutPointTarget:11, knockoutWinByTwo:true, knockoutMaxPoint:15,
      thirdPlace:true
    }});
  }
  return <section className="settingsBox">
    <div className="card-title"><Settings/> Cấu hình giải đấu</div>
    <form onSubmit={onSave}>
      <div className="settingsGrid">
        <label>Tên giải<input value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})}/></label>
        <label>Nội dung<select value={form.event_name||"Đôi nam"} onChange={e=>setForm({...form,event_name:e.target.value})}>{EVENT_TYPES.map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Lệ phí<input type="number" value={form.fee||0} onChange={e=>setForm({...form,fee:e.target.value})}/></label>
        <label>Quy mô VĐV<input type="number" value={form.max_players||0} onChange={e=>setForm({...form,max_players:e.target.value})}/></label>
        <label>Thời gian thi đấu<input value={form.start_time||""} onChange={e=>setForm({...form,start_time:e.target.value})} placeholder="2026-07-05 08:00"/></label>
        <label>Thời gian bốc thăm<input value={form.draw_time||""} onChange={e=>setForm({...form,draw_time:e.target.value})} placeholder="2026-07-04 20:00"/></label>
        <label>Hạn đăng ký<input value={form.register_deadline||""} onChange={e=>setForm({...form,register_deadline:e.target.value})}/></label>
        <label>Giải nhất<input type="number" value={form.first_prize||0} onChange={e=>setForm({...form,first_prize:e.target.value})}/></label>
        <label>Giải nhì<input type="number" value={form.second_prize||0} onChange={e=>setForm({...form,second_prize:e.target.value})}/></label>
        <label>Giải ba<input type="number" value={form.third_prize||0} onChange={e=>setForm({...form,third_prize:e.target.value})}/></label>
        <label>Số giải ba<input type="number" value={form.third_prize_count||2} onChange={e=>setForm({...form,third_prize_count:e.target.value})}/></label>
        <label>Ghi chú tài trợ / giải thưởng<input value={form.sponsor_note||""} onChange={e=>setForm({...form,sponsor_note:e.target.value})}/></label>
      </div>
      <div className="rulesConfigV4120">
        <div className="rulesHeadV4120">
          <h3><SlidersHorizontal size={18}/> Luật thi đấu</h3>
          <button type="button" className="mini" onClick={applyWeeklyOpen}>Preset Weekly Open</button>
        </div>
        <div className="rulesGridV4120">
          <label>Vòng bảng - số game
            <select value={rules.groupGamesToWin ?? 1} onChange={e=>setRule("groupGamesToWin",Number(e.target.value))}>
              <option value={1}>1 game</option><option value={2}>Best of 3</option><option value={3}>Best of 5</option>
            </select>
          </label>
          <label>Vòng bảng - điểm thắng
            <input type="number" value={rules.groupPointTarget ?? 11} onChange={e=>setRule("groupPointTarget",Number(e.target.value))}/>
          </label>
          <label>Vòng bảng - hơn 2 điểm
            <select value={rules.groupWinByTwo === false ? "0" : "1"} onChange={e=>setRule("groupWinByTwo",e.target.value==="1")}>
              <option value="1">Có</option><option value="0">Không</option>
            </select>
          </label>
          <label>Vòng bảng - điểm tối đa
            <input type="number" value={rules.groupMaxPoint ?? 15} onChange={e=>setRule("groupMaxPoint",Number(e.target.value))}/>
          </label>

          <label>Knockout - số game
            <select value={rules.knockoutGamesToWin ?? 1} onChange={e=>setRule("knockoutGamesToWin",Number(e.target.value))}>
              <option value={1}>1 game</option><option value={2}>Best of 3</option><option value={3}>Best of 5</option>
            </select>
          </label>
          <label>Knockout - điểm thắng
            <input type="number" value={rules.knockoutPointTarget ?? 11} onChange={e=>setRule("knockoutPointTarget",Number(e.target.value))}/>
          </label>
          <label>Knockout - hơn 2 điểm
            <select value={rules.knockoutWinByTwo === false ? "0" : "1"} onChange={e=>setRule("knockoutWinByTwo",e.target.value==="1")}>
              <option value="1">Có</option><option value="0">Không</option>
            </select>
          </label>
          <label>Knockout - điểm tối đa
            <input type="number" value={rules.knockoutMaxPoint ?? 15} onChange={e=>setRule("knockoutMaxPoint",Number(e.target.value))}/>
          </label>
        </div>
        <p className="rulesNoteV4120">Ví dụ Weekly Open: đánh 1 game, đến 11 điểm, hơn 2 điểm, tối đa 15 điểm.</p>
      </div>

      <button className="saveSettingsBtn">Lưu cấu hình giải</button>
    </form>
  </section>
}
