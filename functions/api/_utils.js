
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
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS event_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT,
      name TEXT NOT NULL
    )
  `).run();

  const events = await env.DB.prepare("SELECT COUNT(*) AS c FROM event_types").first();
  if (!events || Number(events.c) === 0) {
    const names = ["Đôi nam", "Đôi nữ", "Đôi nam nữ", "Đôi vợ chồng", "Đơn nam", "Đơn nữ"];
    for (const name of names) {
      await env.DB.prepare("INSERT INTO event_types (code, name) VALUES (?, ?)").bind(
        name.toLowerCase().replaceAll(" ", "-"),
        name
      ).run();
    }
  }

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT DEFAULT 'PickleCity Weekly Open',
      event_type_id INTEGER,
      status TEXT DEFAULT 'OPEN',
      fee INTEGER DEFAULT 150000,
      max_players INTEGER DEFAULT 40,
      start_time TEXT,
      draw_time TEXT,
      register_deadline TEXT,
      first_prize INTEGER DEFAULT 0,
      second_prize INTEGER DEFAULT 0,
      third_prize INTEGER DEFAULT 0,
      third_prize_count INTEGER DEFAULT 2,
      sponsor_note TEXT,
      list_locked INTEGER DEFAULT 0,
      draw_locked INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  const tour = await env.DB.prepare("SELECT COUNT(*) AS c FROM tournaments").first();
  if (!tour || Number(tour.c) === 0) {
    const event = await env.DB.prepare("SELECT id FROM event_types WHERE name='Đôi nam' LIMIT 1").first();
    await env.DB.prepare(`
      INSERT INTO tournaments
      (name, event_type_id, status, fee, max_players, start_time, register_deadline, first_prize, second_prize, third_prize, sponsor_note)
      VALUES (?, ?, 'OPEN', 150000, 40, '', '', 0, 0, 0, '')
    `).bind("PickleCity Weekly Open", event?.id || 1).run();
  }

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      phone TEXT,
      gender TEXT DEFAULT 'male',
      level_group TEXT DEFAULT 'UNRANKED',
      level_score INTEGER DEFAULT 1000,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT
    )
  `).run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      member_id INTEGER NOT NULL,
      payment_amount INTEGER DEFAULT 0,
      payment_status TEXT DEFAULT 'PLAYER_MARKED_PAID',
      status TEXT DEFAULT 'ACTIVE',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT
    )
  `).run();

  const rc = await cols(env, "registrations");
  if (!rc.includes("status")) { try { await env.DB.prepare("ALTER TABLE registrations ADD COLUMN status TEXT DEFAULT 'ACTIVE'").run(); } catch(e) {} }
  if (!rc.includes("updated_at")) { try { await env.DB.prepare("ALTER TABLE registrations ADD COLUMN updated_at TEXT").run(); } catch(e) {} }
  if (!rc.includes("member_id") && rc.includes("player_id")) { /* legacy mode handled by memberColumn */ }

  const tc = await cols(env, "tournaments");
  if (!tc.includes("draw_time")) { try { await env.DB.prepare("ALTER TABLE tournaments ADD COLUMN draw_time TEXT").run(); } catch(e) {} }
  if (!tc.includes("list_locked")) { try { await env.DB.prepare("ALTER TABLE tournaments ADD COLUMN list_locked INTEGER DEFAULT 0").run(); } catch(e) {} }
  if (!tc.includes("draw_locked")) { try { await env.DB.prepare("ALTER TABLE tournaments ADD COLUMN draw_locked INTEGER DEFAULT 0").run(); } catch(e) {} }
  if (!tc.includes("third_prize_count")) { try { await env.DB.prepare("ALTER TABLE tournaments ADD COLUMN third_prize_count INTEGER DEFAULT 2").run(); } catch(e) {} }

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

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER,
      action TEXT,
      detail TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

export async function audit(env, tournamentId, action, detail = "") {
  try {
    await env.DB.prepare("INSERT INTO audit_logs (tournament_id, action, detail) VALUES (?, ?, ?)")
      .bind(tournamentId || null, action, detail).run();
  } catch(e) {}
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
      manual: !!t.manual,
      players: (t.players || []).map(p => ({
        full_name: p.full_name,
        gender: p.gender,
        phone: p.phone || ""
      }))
    }))
  }));
}
