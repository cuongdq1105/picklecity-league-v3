import { json, openTournament } from './_utils.js';

export async function onRequestGet({env}) {
  try {
    const t = await openTournament(env);
    if(!t) return json({ok:true,logs:[]});
    const rs = await env.DB.prepare("SELECT * FROM audit_logs WHERE tournament_id=? ORDER BY id DESC LIMIT 50").bind(t.id).all();
    return json({ok:true,logs:rs.results||[]});
  } catch(e) { return json({ok:false,error:e.message,logs:[]},{status:500}); }
}
