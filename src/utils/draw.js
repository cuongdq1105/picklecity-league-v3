
export const LEVELS = ["UNRANKED", "A+", "A", "B+", "B", "C"];
export const LV = { "A+":6, "A":5, "B+":4, "B":3, "C":2, "UNRANKED":1, "SUPPLEMENT":1 };

export function strength(p) {
  return LV[p.level_group || "UNRANKED"] || 1;
}

export function shuffle(a) {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function makeTeams(players, method = "balanced") {
  let list = [...players];
  const teams = [];
  const leftover = [];
  if (method === "balanced") {
    list = shuffle(list).sort((a,b) => strength(b) - strength(a));
    while (list.length >= 2) {
      const a = list.shift();
      const b = list.pop();
      teams.push({ name: `Đội ${teams.length + 1}`, players: [a,b], score: strength(a) + strength(b) });
    }
    leftover.push(...list);
  } else {
    list = shuffle(list);
    while (list.length >= 2) {
      const a = list.shift();
      const b = list.shift();
      teams.push({ name: `Đội ${teams.length + 1}`, players: [a,b], score: strength(a) + strength(b) });
    }
    leftover.push(...list);
  }
  return { teams, leftover };
}

export function groupTeams(teams, count = 2, method = "balancedGroups") {
  let pool = [...teams];
  if (method === "balancedGroups") pool = pool.sort((a,b)=>(b.score||0)-(a.score||0));
  if (method === "randomGroups") pool = shuffle(pool);
  const groups = Array.from({length: Math.max(1, Number(count)||1)}, (_,i)=>({
    name: `Bảng ${String.fromCharCode(65+i)}`,
    teams:[]
  }));
  if (method === "balancedGroups") {
    pool.forEach((team, i) => {
      const round = Math.floor(i / groups.length);
      const idx = round % 2 === 0 ? i % groups.length : groups.length - 1 - (i % groups.length);
      groups[idx].teams.push(team);
    });
  } else {
    pool.forEach((team,i)=>groups[i % groups.length].teams.push(team));
  }
  return groups;
}

export function makeRoundRobin(teams) {
  const list = [...teams];
  if (list.length % 2 === 1) list.push({ name: "Nghỉ", bye: true, players: [] });
  const n = list.length;
  const rounds = [];
  let arr = [...list];
  for (let r = 0; r < n - 1; r++) {
    const matches = [];
    for (let i = 0; i < n / 2; i++) {
      const a = arr[i], b = arr[n - 1 - i];
      if (!a.bye && !b.bye) matches.push({ home:a, away:b });
    }
    rounds.push(matches);
    arr = [arr[0], arr[n - 1], ...arr.slice(1, n - 1)];
  }
  return rounds;
}

export function makeSchedule(groups) {
  const all = [];
  groups.forEach(g => {
    makeRoundRobin(g.teams || []).forEach((matches, ri) => {
      matches.forEach((m, mi) => all.push({ group:g.name, round:ri+1, match:mi+1, home:m.home, away:m.away }));
    });
  });
  return all;
}

export function makeKnockout(groups, cfg) {
  const candidates = [];
  groups.forEach(g => {
    const teams = g.teams || [];
    for (let i=0; i<Number(cfg.qualifyTop || 2) && i<teams.length; i++) {
      candidates.push({ slot: `${g.name} - ${i===0?'Nhất':i===1?'Nhì':`Hạng ${i+1}`}`, team: teams[i] });
    }
    const rank = Number(cfg.bestRank || 3) - 1;
    if (rank >= 0 && teams[rank]) candidates.push({ slot: `${g.name} - Hạng ${cfg.bestRank}`, team: teams[rank] });
  });
  const selected = candidates.slice(0, Number(cfg.quarterTeams || 8));
  const pairs = [];
  for (let i=0; i<Math.floor(selected.length / 2); i++) {
    const a = selected[i], b = selected[selected.length - 1 - i];
    if (a && b) pairs.push({ name:`Tứ kết ${i+1}`, a, b });
  }
  return pairs;
}
