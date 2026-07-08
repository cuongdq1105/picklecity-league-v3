
import { Settings, SlidersHorizontal } from "lucide-react";

const EVENT_TYPES = ["Đôi nam", "Đôi nữ", "Đôi nam nữ", "Đôi vợ chồng", "Đơn nam", "Đơn nữ"];

const RULE_PRESETS = {
  weekly: {
    label: "Weekly Open",
    values: {
      groupGamesToWin:1, groupPointTarget:11, groupWinByTwo:true, groupMaxPoint:15,
      knockoutGamesToWin:1, knockoutPointTarget:11, knockoutWinByTwo:true, knockoutMaxPoint:15,
      thirdPlace:true
    }
  },
  dupr: {
    label: "DUPR",
    values: {
      groupGamesToWin:1, groupPointTarget:15, groupWinByTwo:true, groupMaxPoint:0,
      knockoutGamesToWin:1, knockoutPointTarget:15, knockoutWinByTwo:true, knockoutMaxPoint:0,
      thirdPlace:true
    }
  },
  mlp: {
    label: "MLP",
    values: {
      groupGamesToWin:1, groupPointTarget:21, groupWinByTwo:false, groupMaxPoint:21,
      knockoutGamesToWin:1, knockoutPointTarget:21, knockoutWinByTwo:false, knockoutMaxPoint:21,
      thirdPlace:true
    }
  }
};

function num(v, fallback=0){
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function describeRule(prefix, rules){
  const games = rules[`${prefix}GamesToWin`] || 1;
  const target = rules[`${prefix}PointTarget`] || 11;
  const winByTwo = rules[`${prefix}WinByTwo`] !== false;
  const maxPoint = num(rules[`${prefix}MaxPoint`], 0);
  return `${games} game · đến ${target} điểm${winByTwo ? " · hơn 2 điểm" : ""}${maxPoint ? " · tối đa " + maxPoint + " điểm" : " · không giới hạn điểm tối đa"}`;
}

function ruleWarning(prefix, rules){
  const target = num(rules[`${prefix}PointTarget`], 11);
  const maxPoint = num(rules[`${prefix}MaxPoint`], 0);
  const winByTwo = rules[`${prefix}WinByTwo`] !== false;
  if(maxPoint && maxPoint < target) return "Điểm tối đa không được nhỏ hơn điểm thắng.";
  if(winByTwo && maxPoint && maxPoint === target) return "Nếu chọn hơn 2 điểm, điểm tối đa nên lớn hơn điểm thắng hoặc là mốc chặn hợp lệ. Ví dụ: đến 11, tối đa 15.";
  return "";
}

export default function TournamentSettings({ form, setForm, onSave, matchConfig={}, setMatchConfig }) {
  const rules = {
    groupGamesToWin:1, groupPointTarget:11, groupWinByTwo:true, groupMaxPoint:15,
    knockoutGamesToWin:1, knockoutPointTarget:11, knockoutWinByTwo:true, knockoutMaxPoint:15,
    ...(matchConfig.rules || {})
  };

  function applyRules(nextRules){
    if(!setMatchConfig) return;
    setMatchConfig({...matchConfig, rules:{...rules,...nextRules}});
  }

  function setRule(key,value){
    applyRules({[key]:value});
  }

  function applyPreset(key){
    applyRules(RULE_PRESETS[key].values);
  }

  function RuleBlock({prefix,title}){
    const warn = ruleWarning(prefix, rules);
    return <div className="ruleBlockV4122">
      <h4>{title}</h4>
      <div className="rulesGridV4122">
        <label>Số game
          <select value={rules[`${prefix}GamesToWin`] ?? 1} onChange={e=>setRule(`${prefix}GamesToWin`,Number(e.target.value))}>
            <option value={1}>1 game</option>
            <option value={2}>Best of 3</option>
            <option value={3}>Best of 5</option>
          </select>
        </label>
        <label>Điểm thắng
          <input type="number" min="1" value={rules[`${prefix}PointTarget`] ?? 11} onChange={e=>setRule(`${prefix}PointTarget`,Number(e.target.value))}/>
        </label>
        <label>Điểm tối đa
          <input type="number" min="0" value={rules[`${prefix}MaxPoint`] ?? 15} onChange={e=>setRule(`${prefix}MaxPoint`,Number(e.target.value))}/>
          <small>Nhập 0 nếu không giới hạn.</small>
        </label>
      </div>
      <div className="winByTwoV4122">
        <span>Thắng cách 2 điểm</span>
        <button type="button" className={rules[`${prefix}WinByTwo`] !== false ? "active" : ""} onClick={()=>setRule(`${prefix}WinByTwo`,true)}>Có</button>
        <button type="button" className={rules[`${prefix}WinByTwo`] === false ? "active" : ""} onClick={()=>setRule(`${prefix}WinByTwo`,false)}>Không</button>
      </div>
      {warn && <div className="ruleWarnV4122">⚠ {warn}</div>}
      <p className="ruleDescV4122">{describeRule(prefix, rules)}</p>
    </div>
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

      <div className="rulesConfigV4122">
        <div className="rulesHeadV4122">
          <h3><SlidersHorizontal size={18}/> Luật thi đấu</h3>
          <div className="presetBtnsV4122">
            {Object.entries(RULE_PRESETS).map(([key,p])=><button key={key} type="button" className="mini" onClick={()=>applyPreset(key)}>{p.label}</button>)}
          </div>
        </div>

        <RuleBlock prefix="group" title="Vòng bảng"/>
        <RuleBlock prefix="knockout" title="Loại trực tiếp"/>

        <div className="rulesSummaryV4122">
          <b>Luật đang áp dụng</b>
          <span>Vòng bảng: {describeRule("group", rules)}</span>
          <span>Knockout: {describeRule("knockout", rules)}</span>
        </div>
      </div>

      <button className="saveSettingsBtn">Lưu cấu hình giải</button>
    </form>
  </section>
}
