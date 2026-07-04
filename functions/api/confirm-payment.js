import { json, ensureAll, openTournament, audit } from './_utils.js';

export async function onRequestPost({request,env}){
  try{
    await ensureAll(env);
    const t = await openTournament(env);
    const b=await request.json();
    const id=Number(b.registration_id);
    if(!id)return json({ok:false,error:'Thiếu registration_id'},{status:400});
    await env.DB.prepare('UPDATE registrations SET payment_status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?')
      .bind(b.status||'BTC_CONFIRMED',id).run();
    await audit(env, t?.id, "PAYMENT", `Registration ${id}: ${b.status||'BTC_CONFIRMED'}`);
    return json({ok:true});
  }catch(e){return json({ok:false,error:e.message},{status:500});}
}
