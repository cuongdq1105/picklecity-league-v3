
export const DEFAULT_RULES = {
  groupFormat: "ROUND_ROBIN",
  groupPointTarget: 11,
  groupWinByTwo: true,
  knockoutPointTarget: 15,
  knockoutWinByTwo: true,
  thirdPlace: true
};

export function targetForMatch(match, rules = DEFAULT_RULES) {
  const isKo = match?.type === "KO";
  const target = Number(isKo ? (rules.knockoutPointTarget || 15) : (rules.groupPointTarget || 11));
  const winByTwo = isKo ? rules.knockoutWinByTwo !== false : rules.groupWinByTwo !== false;
  return { target, winByTwo, label: `${target} điểm${winByTwo ? " · cách 2" : ""}` };
}

export function validateGameScore(home, away, rule) {
  const h = Number(home);
  const a = Number(away);
  if (!Number.isFinite(h) || !Number.isFinite(a)) return { ok:false, message:"Điểm không hợp lệ." };
  if (h < 0 || a < 0) return { ok:false, message:"Điểm không được âm." };
  if (h === a) return { ok:false, message:"Hai đội không thể bằng điểm khi lưu game." };
  const high = Math.max(h, a);
  const low = Math.min(h, a);
  if (high < Number(rule.target || 11)) return { ok:false, message:`Đội thắng phải đạt tối thiểu ${rule.target} điểm.` };
  if (rule.winByTwo && high - low < 2) return { ok:false, message:"Phải thắng cách 2 điểm." };
  return { ok:true, winner: h > a ? "home" : "away" };
}

export function scoreSummary(match, rules = DEFAULT_RULES) {
  const games = (match.games || []).filter(g => g.saved).map(g => ({home:Number(g.home), away:Number(g.away), savedAt:g.savedAt || ""}));
  let homeGames = 0, awayGames = 0, homePts = 0, awayPts = 0;
  games.forEach(g => {
    homePts += g.home; awayPts += g.away;
    if (g.home > g.away) homeGames++;
    else if (g.away > g.home) awayGames++;
  });
  const homeName = match.home?.name || match.a?.slot || "";
  const awayName = match.away?.name || match.b?.slot || "";
  const winner = homeGames > awayGames ? homeName : awayGames > homeGames ? awayName : "";
  return {games, homeGames, awayGames, homePts, awayPts, winner, scoreText: games.map(g => `${g.home}-${g.away}`).join(", ")};
}

export function formatRulesText(rules = DEFAULT_RULES) {
  return {
    group: `Vòng bảng: đấu vòng tròn tính điểm · ${rules.groupPointTarget || 11} điểm${rules.groupWinByTwo !== false ? " cách 2" : ""}`,
    ko: `Loại trực tiếp: Tứ kết, Bán kết${rules.thirdPlace !== false ? ", Tranh giải 3" : ""}, Chung kết · ${rules.knockoutPointTarget || 15} điểm${rules.knockoutWinByTwo !== false ? " cách 2" : ""}`
  };
}
