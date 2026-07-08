
import { json, ensureAll } from './_utils.js';

export async function onRequestGet({request, env}) {
  try {
    await ensureAll(env);
    const url = new URL(request.url);
    const phone = String(url.searchParams.get("phone") || "").trim();
    if(!phone) return json({ok:true, member:null});
    const m = await env.DB.prepare("SELECT id, full_name, phone, gender, level_group, level_score FROM members WHERE phone=? LIMIT 1").bind(phone).first();
    return json({ok:true, member:m || null});
  } catch(e) {
    return json({ok:false,error:e.message,member:null},{status:500});
  }
}
