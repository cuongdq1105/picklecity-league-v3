
import { phoneHref } from "../utils/format";

export default function DrawView({ groups, publicMode=false }) {
  return <div className="groups">
    {(groups || []).map(g => <div className="group" key={g.name}>
      <h3>{g.name}</h3>
      {(g.teams || []).map(t => <div className="teamLine" key={t.name}>
        <b>{t.manual ? "Cặp bổ sung" : t.name}:</b>
        <div className="teamPlayers">
          {(t.players || []).map((p, idx) => <div className="playerContact" key={idx}>
            <span>{publicMode ? p.full_name : `${p.full_name} (${p.level_group || "UNRANKED"})`}</span>
            {publicMode && p.phone && <a className="callBtn" href={phoneHref(p.phone)}>☎ Gọi</a>}
            {publicMode && p.phone && <small>{p.phone}</small>}
          </div>)}
        </div>
      </div>)}
    </div>)}
  </div>
}
