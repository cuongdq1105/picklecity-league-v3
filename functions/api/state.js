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

function isPlaceholderTeamName(name) {
  return /^Đội\s*\d+$/i.test(String(name || '').trim());
}

function realTeamDisplayName(team) {
  const players = (team?.players || []).map(p => p?.full_name).filter(Boolean).join(' + ');
  return players || team?.displayName || team?.name || '';
}

function cloneRealTeam(team) {
  if (!team) return team;
  const displayName = realTeamDisplayName(team);
  return displayName ? { ...team, displayName, name: displayName } : team;
}

function flattenDrawTeams(drawOrGroups=[]) {
  const groups = Array.isArray(drawOrGroups) ? drawOrGroups : (drawOrGroups?.groups || []);
  const teamsFromGroups = (groups || []).flatMap(g => (g?.teams || []).map((t, idx) => ({...t, __groupName:g.name, __groupIndex:idx})));
  const extraTeams = Array.isArray(drawOrGroups?.teams) ? drawOrGroups.teams : [];
  return [...extraTeams, ...teamsFromGroups];
}

function buildTeamLookup(drawOrGroups=[]) {
  const allTeams = flattenDrawTeams(drawOrGroups);
  const map = new Map();
  const add = (key, team) => {
    const k = String(key || '').trim().toLowerCase();
    if (!k || map.has(k)) return;
    map.set(k, cloneRealTeam(team));
  };
  allTeams.forEach((team, i) => {
    add(team?.name, team);
    add(team?.displayName, team);
    add(team?.teamName, team);
    add(team?.id, team);
    add(team?.team_id, team);
    add(team?.teamNo, team);
    add(team?.team_no, team);
    add(team?.number, team);
    add(`Đội ${i + 1}`, team);
    add(`Doi ${i + 1}`, team);
    const players = (team?.players || []).map(p => p?.full_name).filter(Boolean).join(' + ');
    add(players, team);
  });
  return map;
}

function hydrateTeam(team, lookup) {
  if (!team || !lookup?.size) return team;
  const currentDisplay = realTeamDisplayName(team);
  const hasRealPlayers = Array.isArray(team.players) && team.players.some(p => p?.full_name);
  if (hasRealPlayers && !isPlaceholderTeamName(currentDisplay)) return cloneRealTeam(team);
  const keys = [team.name, team.displayName, team.teamName, team.id, team.team_id, team.teamNo, team.team_no, team.number];
  for (const key of keys) {
    const found = lookup.get(String(key || '').trim().toLowerCase());
    if (found) return found;
  }
  return team;
}

function hydrateMatches(matches=[], drawOrGroups=[]) {
  const lookup = buildTeamLookup(drawOrGroups);
  if (!lookup.size) return matches || [];
  return (matches || []).map(m => {
    const home = hydrateTeam(m.home, lookup);
    const away = hydrateTeam(m.away, lookup);
    const aTeam = m.a?.team ? hydrateTeam(m.a.team, lookup) : m.a?.row?.team ? hydrateTeam(m.a.row.team, lookup) : null;
    const bTeam = m.b?.team ? hydrateTeam(m.b.team, lookup) : m.b?.row?.team ? hydrateTeam(m.b.row.team, lookup) : null;
    const a = aTeam ? {...m.a, team:aTeam, playerNames:realTeamDisplayName(aTeam), teamName:realTeamDisplayName(aTeam)} : m.a;
    const b = bTeam ? {...m.b, team:bTeam, playerNames:realTeamDisplayName(bTeam), teamName:realTeamDisplayName(bTeam)} : m.b;
    return {...m, home, away, a, b};
  });
}

async function latestDraw(env, tournamentId) {
  const row = await env.DB.prepare("SELECT groups_json FROM tournament_draws WHERE tournament_id=? ORDER BY id DESC LIMIT 1").bind(tournamentId).first();
  if (!row) return null;
  try { return {groups: JSON.parse(row.groups_json || '[]')}; } catch { return null; }
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
    const dr = await latestDraw(env, t.id);
    if (state && dr) {
      if (Array.isArray(state.schedule)) state.schedule = hydrateMatches(state.schedule, dr);
      if (Array.isArray(state.knockout)) state.knockout = hydrateMatches(state.knockout, dr);
    }
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
    const dr = await latestDraw(env, t.id);
    const state = {
      matchConfig: b.matchConfig || {},
      schedule: Array.isArray(b.schedule) ? hydrateMatches(b.schedule, dr || []) : [],
      knockout: Array.isArray(b.knockout) ? hydrateMatches(b.knockout, dr || []) : [],
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
