
import { phoneHref } from "../utils/format";

function shortPhone(p){ const s=String(p?.phone||"").replace(/\D/g,""); return s ? s.slice(-4) : ""; }
function displayName(p, dupNames=new Set()) {
  const name = p?.full_name || "";
  if(!dupNames.has(name)) return name;
  const tail = shortPhone(p);
  return tail ? `${name} (${tail})` : name;
}
function duplicateNameSet(groups=[]){
  const counts={};
  groups.forEach(g=>(g.teams||[]).forEach(t=>(t.players||[]).forEach(p=>{
    const n=p.full_name||""; if(n) counts[n]=(counts[n]||0)+1;
  })));
  return new Set(Object.entries(counts).filter(([,c])=>c>1).map(([n])=>n));
}

export default function DrawView({ groups, publicMode=false }) {
  const dupNames = duplicateNameSet(groups||[]);
  return <div className="groups playerDisplaySystemV4111">
    {(groups || []).map(g => <div className="group" key={g.name}>
      <h3>{g.name}</h3>
      {(g.teams || []).map((t,ti) => <div className="teamLine playerPairLineV4111" key={t.name || ti}>
        <div className="teamPlayers">
          {(t.players || []).map((p, idx) => <div className="playerContact playerNameRowV4111" key={idx}>
            <span>👤 {publicMode ? displayName(p, dupNames) : `${displayName(p, dupNames)} (${p.level_group || "UNRANKED"})`}</span>
            {publicMode && p.phone && <a className="callBtn" href={phoneHref(p.phone)}>☎ Gọi</a>}
            {publicMode && p.phone && <small>{p.phone}</small>}
          </div>)}
        </div>
      </div>)}
    </div>)}
  </div>
}
