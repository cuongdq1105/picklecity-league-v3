import { json, ensureAll, openTournament, audit } from './_utils.js';

export async function onRequestPost({ request, env }) {
  try {
    await ensureAll(env);
    const t = await openTournament(env);
    if (!t) return json({ ok:false, error:'Không có giải đang mở' }, { status:400 });
    const b = await request.json();

    const eventName = String(b.event_name || t.event_name || "Đôi nam").trim();
    let event = await env.DB.prepare("SELECT id FROM event_types WHERE name=? LIMIT 1").bind(eventName).first();
    if (!event) {
      await env.DB.prepare("INSERT INTO event_types (code, name) VALUES (?, ?)").bind(
        eventName.toLowerCase().replaceAll(" ", "-").slice(0,50), eventName
      ).run();
      event = await env.DB.prepare("SELECT id FROM event_types WHERE name=? LIMIT 1").bind(eventName).first();
    }

    await env.DB.prepare(`
      UPDATE tournaments SET
        name=?,
        event_type_id=?,
        fee=?,
        max_players=?,
        start_time=?,
        draw_time=?,
        register_deadline=?,
        first_prize=?,
        second_prize=?,
        third_prize=?,
        third_prize_count=?,
        sponsor_note=?
      WHERE id=?
    `).bind(
      String(b.name || t.name || ""),
      event?.id || t.event_type_id || 1,
      Number(b.fee || 0),
      Number(b.max_players || 0),
      String(b.start_time || ""),
      String(b.draw_time || ""),
      String(b.register_deadline || ""),
      Number(b.first_prize || 0),
      Number(b.second_prize || 0),
      Number(b.third_prize || 0),
      Number(b.third_prize_count || 2),
      String(b.sponsor_note || ""),
      t.id
    ).run();

    await audit(env, t.id, "UPDATE_TOURNAMENT", "BTC cập nhật cấu hình giải");
    return json({ ok:true, tournament: await openTournament(env) });
  } catch(e) {
    return json({ ok:false, error:e.message }, { status:500 });
  }
}
