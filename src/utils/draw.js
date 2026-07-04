
import { scoreSummary } from "./matchRules";

export const LEVELS = ["UNRANKED", "A+", "A", "B+", "B", "C"];
export const LV = { "A+":6, "A":5, "B+":4, "B":3, "C":2, "UNRANKED":1, "SUPPLEMENT":1 };

export function strength(p) { return LV[p.level_group || "UNRANKED"] || 1; }
export function shuffle(a) { const arr=[...a]; for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];} return arr; }
export function teamLabel(team){ return (team?.players||[]).map(p=>p.full_name).join(" + ") || team?.name || ""; }

export function makeTeams(players, method="balanced") {
  let list=[...players]; const teams=[]; const leftover=[];
  if(method==="balanced"){ list=shuffle(list).sort((a,b)=>strength(b)-strength(a)); while(list.length>=2){const a=list.shift(), b=list.pop(); teams.push({name:`Đội ${teams.length+1}`,players:[a,b],score:strength(a)+strength(b)});} leftover.push(...list);}
  else { list=shuffle(list); while(list.length>=2){const a=list.shift(), b=list.shift(); teams.push({name:`Đội ${teams.length+1}`,players:[a,b],score:strength(a)+strength(b)});} leftover.push(...list);}
  return {teams,leftover};
}

export function groupTeams(teams,count=2,method="balancedGroups"){
  let pool=[...teams]; if(method==="balancedGroups") pool=pool.sort((a,b)=>(b.score||0)-(a.score||0)); if(method==="randomGroups") pool=shuffle(pool);
  const groups=Array.from({length:Math.max(1,Number(count)||1)},(_,i)=>({name:`Bảng ${String.fromCharCode(65+i)}`,teams:[]}));
  if(method==="balancedGroups") pool.forEach((team,i)=>{const round=Math.floor(i/groups.length); const idx=round%2===0?i%groups.length:groups.length-1-(i%groups.length); groups[idx].teams.push(team);});
  else pool.forEach((team,i)=>groups[i%groups.length].teams.push(team));
  return groups;
}

export function makeRoundRobin(teams){
  const list=[...teams]; if(list.length%2===1) list.push({name:"Nghỉ",bye:true,players:[]});
  const n=list.length, rounds=[]; let arr=[...list];
  for(let r=0;r<n-1;r++){const matches=[]; for(let i=0;i<n/2;i++){const a=arr[i], b=arr[n-1-i]; if(!a.bye&&!b.bye) matches.push({home:a,away:b});} rounds.push(matches); arr=[arr[0],arr[n-1],...arr.slice(1,n-1)];}
  return rounds;
}
function addMinutes(timeText, mins){ if(!timeText) return ""; const m=String(timeText).match(/(\d{1,2}):(\d{2})/); if(!m)return timeText; const d=new Date(2000,0,1,Number(m[1]),Number(m[2])); d.setMinutes(d.getMinutes()+mins); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; }

export function makeSchedule(groups,options={}){
  const all=[]; const courtCount=Math.max(1,Number(options.courtCount||3)); const startTime=options.startTime||"08:00"; const minutesPerMatch=Math.max(5,Number(options.minutesPerMatch||20)); let index=0;
  (groups||[]).forEach(g=>makeRoundRobin(g.teams||[]).forEach((matches,ri)=>matches.forEach((m,mi)=>{const court=(index%courtCount)+1; const slot=Math.floor(index/courtCount); all.push({id:`${g.name}-${ri+1}-${mi+1}-${index+1}`,type:"GROUP",status:"SCHEDULED",group:g.name,round:ri+1,match:mi+1,court,time:addMinutes(startTime,slot*minutesPerMatch),home:m.home,away:m.away,games:[{home:"",away:"",saved:false}],winner:""}); index++;})));
  return all;
}

export function calcStandings(groups, schedule, rules={}){
  const byGroup={};
  (groups||[]).forEach(g=>{byGroup[g.name]=(g.teams||[]).map(t=>({group:g.name,team:t,name:t.name,players:teamLabel(t),played:0,win:0,loss:0,gameFor:0,gameAgainst:0,pf:0,pa:0,diff:0,gameDiff:0,rank:0}));});
  const find=(group,name)=>(byGroup[group]||[]).find(r=>r.name===name);
  (schedule||[]).filter(m=>m.type!=="KO").forEach(m=>{const s=scoreSummary(m,rules); if(!s.games.length||!s.winner)return; const h=find(m.group,m.home?.name), a=find(m.group,m.away?.name); if(!h||!a)return; h.played++; a.played++; h.gameFor+=s.homeGames; h.gameAgainst+=s.awayGames; a.gameFor+=s.awayGames; a.gameAgainst+=s.homeGames; h.pf+=s.homePts; h.pa+=s.awayPts; a.pf+=s.awayPts; a.pa+=s.homePts; if(s.winner===m.home?.name){h.win++; a.loss++;} else {a.win++; h.loss++;}});
  Object.values(byGroup).forEach(rows=>{rows.forEach(r=>{r.diff=r.pf-r.pa; r.gameDiff=r.gameFor-r.gameAgainst;}); rows.sort((a,b)=>b.win-a.win||b.gameDiff-a.gameDiff||b.diff-a.diff||b.pf-a.pf||a.players.localeCompare(b.players,"vi")); rows.forEach((r,i)=>r.rank=i+1);});
  return byGroup;
}

export function selectQualified(standingsByGroup,cfg){
  const qualifyTop=Number(cfg.qualifyTop||2), bestRank=Number(cfg.bestRank||3), bestCount=Number(cfg.bestCount||2), quarterTeams=Number(cfg.quarterTeams||8);
  const direct=[], bestPool=[];
  Object.entries(standingsByGroup||{}).forEach(([group,rows])=>rows.forEach(r=>{if(r.rank<=qualifyTop)direct.push({slot:`${group} - Hạng ${r.rank}`,row:r,team:r.team}); else if(r.rank===bestRank)bestPool.push({slot:`${group} - Hạng ${bestRank}`,row:r,team:r.team});}));
  bestPool.sort((a,b)=>b.row.win-a.row.win||b.row.gameDiff-a.row.gameDiff||b.row.diff-a.row.diff||b.row.pf-a.row.pf||a.row.players.localeCompare(b.row.players,"vi"));
  return [...direct,...bestPool.slice(0,bestCount)].slice(0,quarterTeams);
}

export function makeKnockout(groups,cfg,standingsByGroup=null){
  let selected;
  if(standingsByGroup) selected=selectQualified(standingsByGroup,cfg);
  else { const fake={}; (groups||[]).forEach(g=>fake[g.name]=(g.teams||[]).map((team,i)=>({group:g.name,rank:i+1,team,players:teamLabel(team),win:0,gameDiff:0,diff:0,pf:0}))); selected=selectQualified(fake,cfg); }
  const pairs=[]; for(let i=0;i<Math.floor(selected.length/2);i++){const a=selected[i], b=selected[selected.length-1-i]; if(a&&b)pairs.push({id:`QF-${i+1}`,name:`Tứ kết ${i+1}`,type:"KO",round:"QF",status:"SCHEDULED",a,b,games:[{home:"",away:"",saved:false}],winner:""});}
  return pairs;
}

export function koNextRound(matches,label,round){
  const winners=(matches||[]).filter(m=>m.winner).map(m=>({slot:m.winner,team:{name:m.winner,players:[]}})); const pairs=[];
  for(let i=0;i<Math.floor(winners.length/2);i++) pairs.push({id:`${round}-${i+1}`,name:`${label} ${i+1}`,type:"KO",round,status:"SCHEDULED",a:winners[i],b:winners[winners.length-1-i],games:[{home:"",away:"",saved:false}],winner:""});
  return pairs;
}

export function exportScheduleText(schedule){ return (schedule||[]).map((m,i)=>`${i+1}. ${m.time?m.time+" - ":""}Sân ${m.court||""} - ${m.group||m.round}: ${m.home?.name||m.a?.slot} vs ${m.away?.name||m.b?.slot}`).join("\\n"); }
