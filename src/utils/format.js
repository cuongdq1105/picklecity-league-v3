
export function money(n){ return Number(n||0).toLocaleString("vi-VN") + "đ"; }
export function genderLabel(g){ return g === "female" ? "Nữ" : "Nam"; }
export function phoneHref(phone){ return `tel:${String(phone||"").replaceAll(" ","")}`; }
