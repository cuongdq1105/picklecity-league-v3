import { json, ensureAll, openTournament } from './_utils.js';

export async function onRequestPost({ request, env }) {
  try {
    await ensureAll(env);
    const t = await openTournament(env);
    if (!t) return json({ ok:false, error:'Không có giải đang mở' }, { status:400 });

    const b = await request.json();
    const eventName = String(b.event_name || '').trim();
    const name = String(b.name || '').trim();
    const fee = Number(b.fee || 0);
    const maxPlayers = Number(b.max_players || 0);
    const startTime = String(b.start_time || '').trim();
    const drawTime = String(b.draw_time || '').trim();
    const registerDeadline = String(b.register_deadline || '').trim();
    const firstPrize = Number(b.first_prize || 0);
    const secondPrize = Number(b.second_prize || 0);
    const thirdPrize = Number(b.third_prize || 0);
    const thirdPrizeCount = Number(b.third_prize_count || 2);
    const sponsorNote = String(b.sponsor_note || '').trim();

    await env.DB.prepare(`
      UPDATE tournaments
      SET name=?,
          fee=?,
          max_players=?,
          start_time=?,
          register_deadline=?,
          first_prize=?,
          second_prize=?,
          third_prize=?,
          third_prize_count=?,
          sponsor_note=?
      WHERE id=?
    `).bind(
      name || t.name,
      fee || t.fee,
      maxPlayers || t.max_players,
      startTime || t.start_time,
      registerDeadline || t.register_deadline,
      firstPrize || t.first_prize,
      secondPrize || t.second_prize,
      thirdPrize || t.third_prize,
      thirdPrizeCount || t.third_prize_count || 2,
      sponsorNote || t.sponsor_note || '',
      t.id
    ).run();

    if (eventName) {
      const exists = await env.DB.prepare('SELECT id FROM event_types WHERE name=? LIMIT 1').bind(eventName).first();
      let eventId = exists?.id;
      if (!eventId) {
        const code = eventName.toLowerCase().replaceAll(' ', '-').slice(0, 50);
        await env.DB.prepare('INSERT INTO event_types (name, code) VALUES (?, ?)').bind(eventName, code).run();
        const created = await env.DB.prepare('SELECT id FROM event_types WHERE name=? LIMIT 1').bind(eventName).first();
        eventId = created?.id;
      }
      if (eventId) {
        await env.DB.prepare('UPDATE tournaments SET event_type_id=? WHERE id=?').bind(eventId, t.id).run();
      }
    }

    return json({ ok:true, tournament: await openTournament(env) });
  } catch(e) {
    return json({ ok:false, error:e.message }, { status:500 });
  }
}
