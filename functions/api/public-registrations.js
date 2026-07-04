import { json, ensureAll, openTournament, memberColumn } from './_utils.js';

export async function onRequestGet({env}) {
  try {
    await ensureAll(env);
    const t = await openTournament(env);
    if (!t) return json({ok:true,registrations:[]});
    const col = await memberColumn(env);
    const rs = await env.DB.prepare(`
      SELECT r.id AS registration_id,r.payment_status,r.created_at,m.full_name,m.phone,m.gender
      FROM registrations r
      LEFT JOIN members m ON m.id=r.${col}
      WHERE r.tournament_id=? AND COALESCE(r.status,'ACTIVE')!='CANCELLED'
      ORDER BY r.id DESC
    `).bind(t.id).all();
    return json({ok:true,registrations:(rs.results||[]).map(x=>({
      registration_id:x.registration_id,
      full_name:x.full_name,
      phone:x.phone,
      phone_masked:x.phone,
      gender:x.gender,
      payment_status:x.payment_status,
      created_at:x.created_at
    }))});
  } catch(e) {
    return json({ok:false,error:e.message,registrations:[]},{status:500});
  }
}
