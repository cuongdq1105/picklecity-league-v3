
export default function PaymentBadge({status}) {
  if (status === "BTC_CONFIRMED") return <span className="badge ok">✓ Đã xác nhận</span>;
  if (status === "PLAYER_MARKED_PAID") return <span className="badge warn">VĐV báo đã CK</span>;
  return <span className="badge pending">Pending</span>;
}
