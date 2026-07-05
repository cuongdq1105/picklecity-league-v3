
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
  const confirmed = admin?.registrations?.filter(x=>x.payment_status==="BTC_CONFIRMED").length || 0;
  const total = admin?.registrations?.length || 0;
  const done = (schedule||[]).filter(x=>x.status==="DONE").length;
  return <section className="btcOverviewV41013">
    <h2>Tổng quan giải đấu</h2>
    <div className="overviewCardsV41013">
      <button onClick={()=>setActive("players")}><b>{total}</b><span>VĐV đăng ký</span></button>
      <button onClick={()=>setActive("players")}><b>{confirmed}</b><span>Đã xác nhận</span></button>
      <button onClick={()=>setActive("draw")}><b>{draw?.groups?.length || 0}</b><span>Bảng đấu</span></button>
      <button onClick={()=>setActive("score")}><b>{done}/{schedule?.length || 0}</b><span>Trận đã xong</span></button>
      <button onClick={()=>setActive("bracket")}><b>{knockout?.length || 0}</b><span>Trận tứ kết</span></button>
    </div>
    <div className="overviewGuideV41013">
      <h3>Quy trình điều hành nhanh</h3>
      <p>1. Kiểm tra VĐV/Thanh toán → 2. Bốc thăm/Bảng → 3. Nhập điểm → 4. Xem BXH → 5. Sinh nhánh → 6. In ấn.</p>
    </div>
  </section>
}
