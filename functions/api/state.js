
import { json, ensureAll, openTournament, audit } from './_utils.js';

async function ensureState(env) {
  await ensureAll(env);
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS tournament_states (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      state_key TEXT NOT NULL,
      state_json TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(tournament_id, state_key)
    )
  `).run();
}

export async function onRequestGet({env}) {
  try {
    await ensureState(env);
    const t = await openTournament(env);
    if (!t) return json({ok:true,state:null});
    const row = await env.DB.prepare(
      "SELECT state_json, updated_at FROM tournament_states WHERE tournament_id=? AND state_key='MATCH_STATE' LIMIT 1"
    ).bind(t.id).first();
    if (!row) return json({ok:true,state:null,updated_at:null});
    let state = null;
    try { state = JSON.parse(row.state_json || '{}'); } catch { state = null; }
    return json({ok:true,state,updated_at:row.updated_at});
  } catch(e) {
    return json({ok:false,error:e.message,state:null},{status:500});
  }
}

export async function onRequestPost({request, env}) {
  try {
    await ensureState(env);
    const t = await openTournament(env);
    if (!t) return json({ok:false,error:'Không có giải đang mở'},{status:400});
    const b = await request.json();
    const state = {
      matchConfig: b.matchConfig || {},
      schedule: Array.isArray(b.schedule) ? b.schedule : [],
      knockout: Array.isArray(b.knockout) ? b.knockout : [],
      savedAt: new Date().toISOString()
    };
    await env.DB.prepare(`
      INSERT INTO tournament_states (tournament_id,state_key,state_json,updated_at)
      VALUES (?,'MATCH_STATE',?,CURRENT_TIMESTAMP)
      ON CONFLICT(tournament_id,state_key) DO UPDATE SET
        state_json=excluded.state_json,
        updated_at=CURRENT_TIMESTAMP
    `).bind(t.id, JSON.stringify(state)).run();
    await audit(env, t.id, "SAVE_MATCH_STATE", `Lưu lịch/kết quả/nhánh: ${state.schedule.length} trận`);
    return json({ok:true,state});
  } catch(e) {
    return json({ok:false,error:e.message},{status:500});
  }
}
