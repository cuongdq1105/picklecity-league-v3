import { json, ensureAll, openTournament, audit } from './_utils.js';

export async function onRequestPost({request,env}) {
  try {
    await ensureAll(env);
    const t = await openTournament(env);
    const b=await request.json();
    const id=Number(b.member_id);
    const fullName=String(b.full_name||'').trim();
    const phone=String(b.phone||'').trim();
    const gender=b.gender||'male';
    const level=b.level_group||'UNRANKED';
    const score=Number(b.level_score||1000);
    if(!id||!fullName||!phone) return json({ok:false,error:'Thiếu thông tin VĐV'},{status:400});
    await env.DB.prepare('UPDATE members SET full_name=?,phone=?,gender=?,level_group=?,level_score=?,updated_at=CURRENT_TIMESTAMP WHERE id=?')
      .bind(fullName,phone,gender,level,score,id).run();
    await audit(env, t?.id, "UPDATE_PLAYER", fullName);
    return json({ok:true});
  } catch(e) {
    return json({ok:false,error:e.message},{status:500});
  }
}
