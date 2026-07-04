import { json, openTournament, audit } from './_utils.js';

export async function onRequestPost({request,env}) {
  try {
    const b = await request.json().catch(()=>({}));
    const t = await openTournament(env);
    if(!t) return json({ok:false,error:'Không có giải đang mở'},{status:400});
    const locked = b.locked === false ? 0 : 1;
    await env.DB.prepare("UPDATE tournaments SET list_locked=? WHERE id=?").bind(locked,t.id).run();
    await audit(env, t.id, locked ? "LOCK_LIST" : "UNLOCK_LIST", locked ? "Khóa danh sách" : "Mở khóa danh sách");
    return json({ok:true,list_locked:locked});
  } catch(e) { return json({ok:false,error:e.message},{status:500}); }
}
