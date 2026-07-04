
import { Eye, RefreshCw } from "lucide-react";
import PaymentBadge from "../components/PaymentBadge";
import DrawView from "../components/DrawView";
import { genderLabel, phoneHref } from "../utils/format";

export default function Public({ list, draw, onRefresh }) {
  const total = list.length;
  const confirmed = list.filter(x=>x.payment_status==="BTC_CONFIRMED").length;
  const pending = total - confirmed;

  return <main className="card wide">
    <div className="card-title"><Eye/> Danh sách & bảng đấu công khai <button className="mini" onClick={onRefresh}><RefreshCw size={14}/> Tải lại</button></div>
    <p className="muted">Công khai không hiển thị phân hạng nội bộ của BTC. SĐT hiển thị đầy đủ để VĐV/partner liên hệ.</p>

    <div className="publicStats">
      <div><b>{total}</b><span>Tổng VĐV</span></div>
      <div><b>{confirmed}</b><span>Đã BTC xác nhận</span></div>
      <div><b>{pending}</b><span>Chưa xác nhận</span></div>
    </div>

    <h2>Danh sách VĐV</h2>
    <div className="tablewrap"><table><thead><tr><th>#</th><th>Họ tên</th><th>SĐT</th><th>Giới tính</th><th>Thanh toán</th></tr></thead>
      <tbody>{list.map((x,i)=><tr key={x.registration_id}>
        <td>{i+1}</td><td>{x.full_name}</td>
        <td><div className="phoneCell"><span>{x.phone}</span>{x.phone && <a className="callBtn" href={phoneHref(x.phone)}>☎ Gọi</a>}</div></td>
        <td>{genderLabel(x.gender)}</td><td><PaymentBadge status={x.payment_status}/></td>
      </tr>)}</tbody></table></div>

    <h2>Bảng đấu đã công bố</h2>
    {draw ? <>
      <p className="contactNote">Số điện thoại được hiển thị đầy đủ để các VĐV trong cùng cặp và cùng bảng chủ động liên hệ.</p>
      <DrawView groups={draw.groups} publicMode={true}/>
    </> : <p className="muted">BTC chưa công bố kết quả bốc thăm.</p>}
  </main>
}
