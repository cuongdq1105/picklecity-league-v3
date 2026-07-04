
export const ADMIN_PIN = "PTC2026";
export const API = "/api";

export async function api(path, options) {
  const res = await fetch(API + path, options);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error("API không trả JSON. Kiểm tra deployment."); }
  if (!res.ok || data.ok === false) throw new Error(data.error || "Có lỗi xảy ra");
  return data;
}

export function post(path, body = {}) {
  return api(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}
