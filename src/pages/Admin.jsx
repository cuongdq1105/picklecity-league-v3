
import { useState } from "react";
import { Shield, RefreshCw, Settings, Users, Shuffle, CalendarClock, Trophy, GitBranch, Printer, QrCode } from "lucide-react";
import TournamentSettings from "../components/TournamentSettings";
import RegistrationManager from "../components/RegistrationManager";
import DrawManager from "../components/DrawManager";
import TournamentOps from "../components/TournamentOps";
import PrintCenter from "../components/PrintCenter";
import ScoreCenter from "../components/ScoreCenter";
import StandingsCenter from "../components/StandingsCenter";
import PaymentQrSettings from "../components/PaymentQrSettings";

export default function Admin(props) {
  const {
    tournament, tForm, setTForm, onSaveTournament, onRefresh, onLogout,
    admin, filters, setFilters, onLock, onSetPayment, onEdit, onCancel, onUpdateLevel,
    draw, setDraw, onSaveDraft, onFinalize, onPublish,
    manualPair, setManualPair, onAddManualPair, onStartMC,
    matchConfig, setMatchConfig, schedule, setSchedule, knockout, setKnockout, setMsg
  } = props;

  const [active,setActive] = useState("overview");

  const tabs = [
    {key:"overview", label:"Tổng quan", icon:<Shield size={16}/>},
    {key:"settings", label:"Cấu hình giải", icon:<Settings size={16}/>},
    {key:"players", label:"VĐV / Thanh toán", icon:<Users size={16}/>},
    {key:"draw", label:"Bốc thăm / Bảng", icon:<Shuffle size={16}/>},
    {key:"score", label:"Nhập điểm", icon:<CalendarClock size={16}/>},
    {key:"standings", label:"BXH", icon:<Trophy size={16}/>},
    {key:"bracket", label:"Nhánh đấu", icon:<GitBranch size={16}/>},
    {key:"print", label:"In ấn", icon:<Printer size={16}/>},
    {key:"qr", label:"QR thanh toán", icon:<QrCode size={16}/>}
  ];

  return <main className="card wide btcDashboardV41013">
    <div className="topline btcToplineV41013">
      <div className="card-title"><Shield/> Dashboard BTC</div>
      <div className="btcTopActionsV41013">
        <button className="mini" onClick={onRefresh}><RefreshCw size={14}/> Tải lại</button>
        <button className="mini" onClick={onLogout}>Đăng xuất</button>
      </div>
    </div>

    <div className="btcStatusFlowV41013">
      <span>Đăng ký</span><span>Thanh toán</span><span>Phân hạng</span>
      <span className={Number(tournament?.list_locked)===1?"done":""}>Khóa DS</span>
      <span className={draw.savedStatus?"done":""}>Bốc thăm</span>
      <span className={draw.savedStatus==="FINALIZED"||draw.savedStatus==="PUBLISHED"?"done":""}>Chốt</span>
      <span className={draw.savedStatus==="PUBLISHED"?"done":""}>Công bố</span>
    </div>

    <div className="btcLayoutV41013">
      <aside className="btcSideNavV41013">
        <h3>Điều hành giải</h3>
        {tabs.map(t=><button key={t.key} className={active===t.key?"active":""} onClick={()=>setActive(t.key)}>
          {t.icon}<span>{t.label}</span>
        </button>)}
      </aside>

      <section className="btcMainPanelV41013">
        {active==="overview" && <OverviewPanel tournament={tournament} admin={admin} draw={draw} schedule={schedule} knockout={knockout} setActive={setActive}/>}

        {active==="settings" && <TournamentSettings form={tForm} setForm={setTForm} onSave={onSaveTournament}/>}

        {active==="players" && <RegistrationManager
          registrations={admin.registrations}
          stats={admin.stats}
          filters={filters}
          setFilters={setFilters}
          locked={Number(tournament?.list_locked)===1}
          onLock={onLock}
          onSetPayment={onSetPayment}
          onEdit={onEdit}
          onCancel={onCancel}
          onUpdateLevel={onUpdateLevel}
        />}

        {active==="draw" && <DrawManager
          registrations={admin.registrations}
          draw={draw}
          setDraw={setDraw}
          onSaveDraft={onSaveDraft}
          onFinalize={onFinalize}
          onPublish={onPublish}
          manualPair={manualPair}
          setManualPair={setManualPair}
          onAddManualPair={onAddManualPair}
          onStartMC={onStartMC}
          setMsg={setMsg}
        />}

        {active==="score" && <ScoreCenter
          groups={draw.groups}
          schedule={schedule}
          setSchedule={setSchedule}
          config={matchConfig}
          setMsg={setMsg}
        />}

        {active==="standings" && <StandingsCenter
          groups={draw.groups}
          schedule={schedule}
          config={matchConfig}
          setMsg={setMsg}
        />}

        {active==="bracket" && <TournamentOps
          groups={draw.groups}
          config={matchConfig}
          setConfig={setMatchConfig}
          schedule={schedule}
          setSchedule={setSchedule}
          knockout={knockout}
          setKnockout={setKnockout}
          setMsg={setMsg}
        />}

        {active==="print" && <PrintCenter tournament={tournament} registrations={admin.registrations} groups={draw.groups} schedule={schedule} knockout={knockout} config={matchConfig} />}

        {active==="qr" && <PaymentQrSettings setMsg={setMsg} />}
      </section>
    </div>
  </main>
}

function OverviewPanel({tournament,admin,draw,schedule,knockout,setActive}) {
  const regs = admin?.registrations || [];
  const confirmed = regs.filter(x=>x.payment_status==="BTC_CONFIRMED").length;
  const total = regs.length;
  const pending = Math.max(0,total-confirmed);
  const done = (schedule||[]).filter(x=>x.status==="DONE").length;
  const totalMatches = schedule?.length || 0;
  const progress = totalMatches ? Math.round(done*100/totalMatches) : 0;
  const upcoming = (schedule||[]).filter(x=>x.status!=="DONE").slice(0,6);
  const finished = (schedule||[]).filter(x=>x.status==="DONE").slice(-5).reverse();
  return <section className="overviewProV41014">
    <div className="overviewHeroV41014">
      <div>
        <p className="eyebrowV41014">PickleCity Tournament Manager</p>
        <h2>{tournament?.name || "Tổng quan giải đấu"}</h2>
        <p className="muted">Bảng điều hành nhanh cho BTC: đăng ký, thanh toán, lịch thi đấu, kết quả và nhánh đấu.</p>
      </div>
      <div className="heroActionsV41014">
        <button onClick={()=>setActive("score")}>Nhập điểm</button>
        <button onClick={()=>setActive("bracket")}>Xem nhánh</button>
        <button onClick={()=>setActive("print")}>In ấn</button>
      </div>
    </div>
    <div className="metricGridV41014">
      <MetricCard title="Tổng VĐV" value={total} sub={`${confirmed} đã xác nhận`} onClick={()=>setActive("players")}/>
      <MetricCard title="Chưa thanh toán" value={pending} sub="Cần BTC kiểm tra" warn onClick={()=>setActive("players")}/>
      <MetricCard title="Bảng đấu" value={draw?.groups?.length || 0} sub="Đã chia bảng" onClick={()=>setActive("draw")}/>
      <MetricCard title="Trận đã xong" value={`${done}/${totalMatches}`} sub={`${progress}% tiến độ`} onClick={()=>setActive("score")}/>
      <MetricCard title="Tứ kết" value={knockout?.length || 0} sub="Nhánh đấu" onClick={()=>setActive("bracket")}/>
    </div>
    <div className="overviewMainGridV41014">
      <div className="overviewPanelV41014">
        <div className="panelHeadV41014"><h3>Tiến độ giải đấu</h3><span>{progress}%</span></div>
        <div className="progressRingWrapV41014">
          <div className="progressRingV41014" style={{"--p": `${progress}%`}}><b>{progress}%</b></div>
          <div className="progressStepsV41014">
            <Step done={total>0} text="Đăng ký"/>
            <Step done={Number(tournament?.list_locked)===1} text="Khóa danh sách"/>
            <Step done={!!draw?.groups?.length} text="Bốc thăm / chia bảng"/>
            <Step done={totalMatches>0} text="Xếp lịch"/>
            <Step done={done>0} text="Thi đấu vòng bảng"/>
            <Step done={(knockout||[]).length>0} text="Nhánh đấu"/>
          </div>
        </div>
      </div>
      <div className="overviewPanelV41014">
        <div className="panelHeadV41014"><h3>Trận sắp diễn ra</h3><button onClick={()=>setActive("score")}>Xem tất cả</button></div>
        <div className="matchListV41014">
          {upcoming.length ? upcoming.map((m,i)=><MiniMatch key={m.id||i} match={m}/>) : <p className="muted">Chưa có trận sắp diễn ra.</p>}
        </div>
      </div>
      <div className="overviewPanelV41014 widePanelV41014">
        <div className="panelHeadV41014"><h3>Kết quả mới nhất</h3><button onClick={()=>setActive("standings")}>Xem BXH</button></div>
        <div className="resultStripV41014">
          {finished.length ? finished.map((m,i)=><ResultMini key={m.id||i} match={m}/>) : <p className="muted">Chưa có kết quả.</p>}
        </div>
      </div>
    </div>
    <div className="quickActionsV41014">
      <button onClick={()=>setActive("settings")}>Cấu hình giải</button><button onClick={()=>setActive("players")}>Thanh toán</button><button onClick={()=>setActive("draw")}>Bốc thăm</button><button onClick={()=>setActive("score")}>Nhập điểm</button><button onClick={()=>setActive("standings")}>BXH</button><button onClick={()=>setActive("qr")}>QR</button>
    </div>
  </section>
}
function MetricCard({title,value,sub,warn,onClick}) {return <button className={warn?"metricCardV41014 warn":"metricCardV41014"} onClick={onClick}><b>{value}</b><span>{title}</span><em>{sub}</em></button>}
function Step({done,text}) {return <div className={done?"stepV41014 done":"stepV41014"}><span>{done?"✓":"○"}</span>{text}</div>}
function MiniMatch({match}) {return <div className="miniMatchV41014"><div><b>{match.time||"--:--"}</b><span>Sân {match.court||"-"}</span></div><p>{match.group||match.round}</p><strong>{match.home?.name||match.a?.slot} <em>vs</em> {match.away?.name||match.b?.slot}</strong></div>}
function ResultMini({match}) {const score=(match.games||[]).filter(g=>g.saved).map(g=>`${g.home}-${g.away}`).join(", ");return <div className="resultMiniV41014"><span>{match.group} · {match.time}</span><b>{match.home?.name} vs {match.away?.name}</b><strong>{score||"Đã xong"}</strong></div>}
