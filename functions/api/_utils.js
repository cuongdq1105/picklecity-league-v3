
export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json; charset=utf-8", ...(init.headers || {}) }
  });
}

export async function cols(env, table) {
  const r = await env.DB.prepare(`PRAGMA table_info(${table})`).all();
  return (r.results || []).map(x => x.name);
}

export async function ensureAll(env) {
  const rc = await cols(env, "registrations");
  if (!rc.includes("status")) { try { await env.DB.prepare("ALTER TABLE registrations ADD COLUMN status TEXT DEFAULT 'ACTIVE'").run(); } catch(e) {} }
  if (!rc.includes("updated_at")) { try { await env.DB.prepare("ALTER TABLE registrations ADD COLUMN updated_at TEXT").run(); } catch(e) {} }

  const mc = await cols(env, "members");
  if (!mc.includes("updated_at")) { try { await env.DB.prepare("ALTER TABLE members ADD COLUMN updated_at TEXT").run(); } catch(e) {} }
  if (!mc.includes("level_score")) { try { await env.DB.prepare("ALTER TABLE members ADD COLUMN level_score INTEGER DEFAULT 1000").run(); } catch(e) {} }
  if (!mc.includes("level_group")) { try { await env.DB.prepare("ALTER TABLE members ADD COLUMN level_group TEXT DEFAULT 'UNRANKED'").run(); } catch(e) {} }

  const tc = await cols(env, "tournaments");
  if (!tc.includes("list_locked")) { try { await env.DB.prepare("ALTER TABLE tournaments ADD COLUMN list_locked INTEGER DEFAULT 0").run(); } catch(e) {} }
  if (!tc.includes("draw_locked")) { try { await env.DB.prepare("ALTER TABLE tournaments ADD COLUMN draw_locked INTEGER DEFAULT 0").run(); } catch(e) {} }

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS tournament_draws (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      status TEXT DEFAULT 'DRAFT',
      groups_json TEXT NOT NULL,
      draw_code TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      published_at TEXT
    )
  `).run();
}

export async function openTournament(env) {
  await ensureAll(env);
  return await env.DB.prepare(`
    SELECT t.*, e.name AS event_name, e.code AS event_code
    FROM tournaments t
    LEFT JOIN event_types e ON e.id=t.event_type_id
    WHERE t.status IN ('OPEN','LOCKED','DRAW_DRAFT','DRAW_PUBLISHED')
    ORDER BY t.id DESC
    LIMIT 1
  `).first();
}

export async function memberColumn(env) {
  const rc = await cols(env, "registrations");
  return rc.includes("member_id") ? "member_id" : "player_id";
}

export function publicGroups(groups) {
  return (groups || []).map(g => ({
    name: g.name,
    teams: (g.teams || []).map(t => ({
      name: t.name,
      players: (t.players || []).map(p => ({ full_name: p.full_name, gender: p.gender }))
    }))
  }));
}
