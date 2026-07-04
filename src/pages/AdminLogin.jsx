
import { Shield } from "lucide-react";

export default function AdminLogin({ pin, setPin, onLogin }) {
  return <main className="card login">
    <div className="card-title"><Shield/> Đăng nhập BTC</div>
    <form onSubmit={onLogin}>
      <label>Mật khẩu BTC<input type="password" value={pin} onChange={e=>setPin(e.target.value)} autoFocus/></label>
      <button className="primary">Đăng nhập</button>
    </form>
    <p className="muted">Mật khẩu mặc định: PTC2026</p>
  </main>
}
