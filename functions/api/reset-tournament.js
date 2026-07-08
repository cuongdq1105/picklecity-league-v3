
import { json, ensureAll, openTournament, audit } from './_utils.js';

export async function onRequestPost({request, env}) {
  try {
    await ensureAll(env);
    const b = await request.json().catch(()=>({}));
    const current = await openTournament(env);
    const copy = Number(b.copy_config ?? 1) === 1;
    const name = String(b.name || "").trim() || `${current?.name || "PickleCity Weekly Open"} - Giải mới`;
    const eventTypeId = copy ? (current?.event_type_id || 1) : 1;
    if(current?.id) {
      await env.DB.prepare("UPDATE tournaments SET status='CLOSED' WHERE id=?").bind(current.id).run();
    }
    await env.DB.prepare(`
      INSERT INTO tournaments
      (name,event_type_id,status,fee,max_players,start_time,draw_time,register_deadline,first_prize,second_prize,third_prize,third_prize_count,sponsor_note,list_locked,draw_locked)
      VALUES (?,?, 'OPEN', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
    `).bind(
      name,
      eventTypeId,
      copy ? (current?.fee || 150000) : 150000,
      copy ? (current?.max_players || 40) : 40,
      copy ? (current?.start_time || "") : "",
      copy ? (current?.draw_time || "") : "",
      copy ? (current?.register_deadline || "") : "",
      copy ? (current?.first_prize || 0) : 0,
      copy ? (current?.second_prize || 0) : 0,
      copy ? (current?.third_prize || 0) : 0,
      copy ? (current?.third_prize_count || 2) : 2,
      copy ? (current?.sponsor_note || "") : ""
    ).run();

    const t = await openTournament(env);
    await audit(env, t?.id, "CREATE_NEW_TOURNAMENT", name);
    return json({ok:true,tournament:t});
  } catch(e) {
    return json({ok:false,error:e.message},{status:500});
  }
}
