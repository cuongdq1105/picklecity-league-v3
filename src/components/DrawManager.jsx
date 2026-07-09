
import { Shuffle, Radio, Copy, Printer, Lock, PartyPopper } from "lucide-react";
import DrawView from "./DrawView";
import { makeTeams, groupTeams } from "../utils/draw";

export default function DrawManager({
  registrations, draw, setDraw, onSaveDraft, onFinalize, onPublish,
  manualPair, setManualPair, onAddManualPair, onStartMC, setMsg
}) {
  function makeDraw() {
    const list = registrations.filter(x => x.payment_status === "BTC_CONFIRMED");
    if (list.length < 2) { setMsg("Cần ít nhất 2 VĐV đã được BTC xác nhận thanh toán để bốc thăm."); return; }
    const {teams, leftover} = makeTeams(list, draw.method);
    const groups = groupTeams(teams, draw.tableCount, draw.groupMethod);
    setDraw(d=>({...d, teams, groups, leftover, savedStatus:"DRAFT_LOCAL"}));
    setMsg(`Đã bốc thăm nháp ${teams.length} đội từ ${list.length} VĐV đã BTC xác nhận, chia ${groups.length} bảng. Chưa công bố.`);
  }

  function copyDraw() {
    const lines = [];
    draw.groups.forEach(g=>{
      lines.push(g.name);
      g.teams.forEach(t=>lines.push(`${t.manual ? "Cặp bổ sung" : t.name}: ${t.players.map(p=>p.full_name).join(" + ")}`));
      lines.push("");
    });
    navigator.clipboard.writeText(lines.join("\\n"));
    setMsg("Đã copy kết quả bốc thăm.");
  }

  return <section className="drawBox">
    <div className="card-title"><Shuffle/> Bốc thăm ghép cặp</div>
    <div className="confirmedOnlyBox">
      <b>Chỉ lấy VĐV hợp lệ</b>
      <p>Hệ thống chỉ đưa vào bốc thăm những VĐV đã được BTC xác nhận thanh toán. VĐV mới bấm “Tôi đã chuyển khoản” nhưng BTC chưa xác nhận sẽ không được xếp cặp.</p>
      <span>{registrations.filter(x=>x.payment_status==="BTC_CONFIRMED").length} đã xác nhận / {registrations.length} tổng đăng ký</span>
    </div>
    <label>Kiểu ghép cặp<select value={draw.method} onChange={e=>setDraw({...draw,method:e.target.value})}><option value="balanced">Cân bằng trình: cao ghép thấp</option><option value="random">Ngẫu nhiên hoàn toàn</option></select></label>
    <label>Cơ chế chia bảng<select value={draw.groupMethod} onChange={e=>setDraw({...draw,groupMethod:e.target.value})}><option value="balancedGroups">Cân bằng bảng theo tổng trình</option><option value="roundRobinGroups">Chia lần lượt theo thứ tự đội</option><option value="randomGroups">Chia bảng ngẫu nhiên</option></select></label>
    <label>Số bảng<input type="number" min="1" max="16" value={draw.tableCount} onChange={e=>setDraw({...draw,tableCount:e.target.value})}/></label>

    <div className="drawButtons">
      <button className="primary" onClick={makeDraw} type="button"><Shuffle size={16}/> Bốc thăm / Bốc lại</button>
      <button className="mini" onClick={onStartMC}><Radio size={14}/> Chế độ quay</button>
      <button className="mini" onClick={onSaveDraft}>Lưu nháp</button>
      <button className="mini" onClick={()=>{ if(confirm("Chốt kết quả bốc thăm? Sau khi chốt, BTC vẫn có thể công bố hoặc bổ sung cặp thủ công nếu phát sinh.")) onFinalize(); }}><Lock size={14}/> Chốt</button>
      <button className="mini" onClick={()=>{ if(confirm("Công bố bảng đấu cho VĐV/khán giả? Màn hình công khai sẽ ẩn hạng A/B/C.")) onPublish(); }}><PartyPopper size={14}/> Công bố</button>
    </div>

    {draw.savedStatus && <p className="statusLine">Trạng thái: <b>{draw.savedStatus}</b></p>}

    <div className="manualAddBox">
      <h3>Đăng ký bổ sung / Gán cặp thủ công</h3>
      <p className="hint">Dùng khi đã chốt danh sách nhưng phát sinh thêm một cặp. BTC nhập tay và chọn bảng để gán cặp đó vào.</p>
      <label>Gán vào bảng<select value={manualPair.group} onChange={e=>setManualPair({...manualPair,group:e.target.value})}>{(draw.groups.length ? draw.groups : [{name:"Bảng A"}]).map(g=><option key={g.name}>{g.name}</option>)}</select></label>
      <label>Tên cặp / đội<input value={manualPair.teamName} onChange={e=>setManualPair({...manualPair,teamName:e.target.value})} placeholder="Có thể bỏ trống, hệ thống tự lấy tên 2 VĐV"/></label>
      <div className="manualGrid">
        <label>VĐV 1<input value={manualPair.p1} onChange={e=>setManualPair({...manualPair,p1:e.target.value})} placeholder="Họ tên VĐV 1"/></label>
        <label>SĐT VĐV 1<input value={manualPair.p1phone} onChange={e=>setManualPair({...manualPair,p1phone:e.target.value})} placeholder="Số điện thoại"/></label>
        <label>VĐV 2<input value={manualPair.p2} onChange={e=>setManualPair({...manualPair,p2:e.target.value})} placeholder="Họ tên VĐV 2"/></label>
        <label>SĐT VĐV 2<input value={manualPair.p2phone} onChange={e=>setManualPair({...manualPair,p2phone:e.target.value})} placeholder="Số điện thoại"/></label>
      </div>
      <button className="manualBtn" type="button" onClick={onAddManualPair}>+ Thêm cặp vào bảng đã chọn</button>
    </div>

    {draw.groups.length > 0 && <div className="drawResult">
      <div className="drawActions">
        <button className="mini" onClick={copyDraw}><Copy size={14}/> Copy</button>
        <button className="mini" onClick={()=>window.print()}><Printer size={14}/> In</button>
      </div>
      <DrawView groups={draw.groups}/>
      {draw.leftover?.length > 0 && <p className="warnLine">VĐV lẻ: {draw.leftover.map(p=>p.full_name).join(", ")}</p>}
    </div>}
  </section>
}
