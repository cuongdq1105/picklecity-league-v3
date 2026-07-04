
import { Search, Filter, Lock, Unlock, CheckCircle, RotateCcw, Pencil, Trash2 } from "lucide-react";
import PaymentBadge from "./PaymentBadge";
import { LEVELS, strength } from "../utils/draw";
import { genderLabel } from "../utils/format";

export default function RegistrationManager({
  registrations, stats, filters, setFilters, onLock, locked,
  onSetPayment, onEdit, onCancel, onUpdateLevel
}) {
  function setQuick(q) {
    let next = {...filters, quick:q, payment:"all", level:"all"};
    if (q === "confirmed") next.payment = "confirmed";
    if (q === "pending") next.payment = "pending";
    if (["A+","A","B+","B","C","UNRANKED"].includes(q)) next.level = q;
    setFilters(next);
  }

  const filtered = [...registrations].filter(x => {
    const s = filters.search.trim().toLowerCase();
    if (s && !(String(x.full_name||"").toLowerCase().includes(s) || String(x.phone||"").includes(s))) return false;
    if (filters.payment === "confirmed" && x.payment_status !== "BTC_CONFIRMED") return false;
    if (filters.payment === "pending" && x.payment_status === "BTC_CONFIRMED") return false;
    if (filters.level !== "all" && (x.level_group || "UNRANKED") !== filters.level) return false;
    if (filters.gender !== "all" && x.gender !== filters.gender) return false;
    return true;
  }).sort((a,b)=>{
    if(filters.sort==="oldest") return (a.registration_id||0)-(b.registration_id||0);
    if(filters.sort==="level") return strength(b)-strength(a)||String(a.full_name).localeCompare(String(b.full_name),"vi");
    if(filters.sort==="name") return String(a.full_name).localeCompare(String(b.full_name),"vi");
    if(filters.sort==="confirmed") return (b.payment_status==="BTC_CONFIRMED")-(a.payment_status==="BTC_CONFIRMED");
    if(filters.sort==="pending") return (a.payment_status==="BTC_CONFIRMED")-(b.payment_status==="BTC_CONFIRMED");
    return (b.registration_id||0)-(a.registration_id||0);
  });

  const fConfirmed = filtered.filter(x=>x.payment_status==="BTC_CONFIRMED").length;

  return <section>
    <div className="sectionHead">
      <h2>Danh sách VĐV</h2>
      {locked ? <button className="mini" onClick={()=>onLock(false)}><Unlock size={14}/> Mở khóa DS</button> : <button className="mini" onClick={()=>onLock(true)}><Lock size={14}/> Khóa danh sách</button>}
    </div>

    <div className="stats compact">
      <div><b>{stats.total||0}</b><span>Tổng</span></div>
      <div><b>{stats.confirmed||0}</b><span>Đã xác nhận</span></div>
      <div><b>{stats.pending||0}</b><span>Chờ</span></div>
      <div><b>{filtered.length}</b><span>Đang hiển thị</span></div>
      <div><b>{fConfirmed}</b><span>Hiển thị đã xác nhận</span></div>
    </div>

    <div className="quickFilters">
      {["all","A","B","confirmed","pending"].map(q => <button key={q} className={filters.quick===q?"on":""} onClick={()=>setQuick(q)}>
        {q==="all"?"Tất cả":q==="confirmed"?"Đã xác nhận":q==="pending"?"Chưa xác nhận":`Hạng ${q}`}
      </button>)}
    </div>

    <div className="filterBar">
      <label><Search size={14}/> Tìm kiếm<input value={filters.search} onChange={e=>setFilters({...filters,search:e.target.value})} placeholder="Tên hoặc SĐT"/></label>
      <label><Filter size={14}/> Thanh toán<select value={filters.payment} onChange={e=>setFilters({...filters,payment:e.target.value,quick:"custom"})}><option value="all">Tất cả</option><option value="confirmed">Đã BTC xác nhận</option><option value="pending">Chưa xác nhận</option></select></label>
      <label>Hạng<select value={filters.level} onChange={e=>setFilters({...filters,level:e.target.value,quick:"custom"})}><option value="all">Tất cả</option>{LEVELS.map(l=><option key={l}>{l}</option>)}</select></label>
      <label>Giới tính<select value={filters.gender} onChange={e=>setFilters({...filters,gender:e.target.value,quick:"custom"})}><option value="all">Tất cả</option><option value="male">Nam</option><option value="female">Nữ</option></select></label>
      <label>Sắp xếp<select value={filters.sort} onChange={e=>setFilters({...filters,sort:e.target.value})}><option value="newest">Đăng ký mới nhất</option><option value="oldest">Đăng ký cũ nhất</option><option value="level">Theo hạng VĐV</option><option value="confirmed">Đã xác nhận trước</option><option value="pending">Chưa xác nhận trước</option><option value="name">Theo tên A-Z</option></select></label>
    </div>

    <div className="tablewrap"><table><thead><tr><th>#</th><th>Họ tên</th><th>SĐT</th><th>GT</th><th>Hạng</th><th>Thanh toán</th><th>Thao tác</th></tr></thead>
      <tbody>{filtered.map((x,i)=><tr key={x.registration_id}>
        <td>{i+1}</td><td>{x.full_name}</td><td>{x.phone}</td><td>{genderLabel(x.gender)}</td>
        <td><select value={x.level_group||"UNRANKED"} onChange={e=>onUpdateLevel({...x,level_group:e.target.value})}>{LEVELS.map(l=><option key={l}>{l}</option>)}</select></td>
        <td><PaymentBadge status={x.payment_status}/></td>
        <td className="actions">
          {x.payment_status==="BTC_CONFIRMED" ? <button onClick={()=>onSetPayment(x,"PLAYER_MARKED_PAID")}><RotateCcw size={14}/> Hoàn tác</button> : <button onClick={()=>onSetPayment(x,"BTC_CONFIRMED")}><CheckCircle size={14}/> Xác nhận</button>}
          <button onClick={()=>onEdit({...x})}><Pencil size={14}/> Sửa</button>
          <button className="danger" onClick={()=>onCancel(x)}><Trash2 size={14}/> Xóa</button>
        </td>
      </tr>)}</tbody></table></div>
  </section>
}
