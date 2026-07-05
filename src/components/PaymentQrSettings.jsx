
import { useState } from "react";
import { QrCode, Upload, Trash2 } from "lucide-react";
export default function PaymentQrSettings({setMsg}) {
  const [qr,setQr]=useState(localStorage.getItem("picklecity_payment_qr")||"/qr-vcb-compact.png");
  function onFile(e){
    const f=e.target.files?.[0]; if(!f)return;
    const r=new FileReader();
    r.onload=()=>{localStorage.setItem("picklecity_payment_qr",r.result);setQr(r.result);setMsg?.("Đã cập nhật QR thanh toán.");};
    r.readAsDataURL(f);
  }
  function reset(){localStorage.removeItem("picklecity_payment_qr");setQr("/qr-vcb-compact.png");setMsg?.("Đã khôi phục QR mặc định.");}
  return <section className="paymentQrSettings"><div className="settingsTitle"><QrCode/> Cài đặt QR thanh toán</div><p className="muted">BTC có thể thay QR khi cần.</p><div className="qrSettingBox"><img src={qr}/><div><label className="uploadQrBtn"><Upload size={16}/> Chọn QR mới<input type="file" accept="image/*" onChange={onFile}/></label><button className="mini" onClick={reset}><Trash2 size={14}/> QR mặc định</button></div></div></section>
}
