import { json, openTournament } from './_utils.js';
export async function onRequestPost({request,env}) {
  try {
    const b = await request.json().catch(()=>({}));
    const t = await openTournament(env);
    if(!t) return json({ok:false,error:'Không có giải đang mở'},{status:400});
    const locked = b.locked === false ? 0 : 1;
    await env.DB.prepare("UPDATE tournaments SET list_locked=? WHERE id=?").bind(locked,t.id).run();
    return json({ok:true,list_locked:locked});
  } catch(e) { return json({ok:false,error:e.message},{status:500}); }
}
