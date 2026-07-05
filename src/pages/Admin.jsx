
import { Shield, RefreshCw } from "lucide-react";
import TournamentSettings from "../components/TournamentSettings";
import RegistrationManager from "../components/RegistrationManager";
import DrawManager from "../components/DrawManager";
import TournamentOps from "../components/TournamentOps";
import PrintCenter from "../components/PrintCenter";
import ScoreCenter from "../components/ScoreCenter";
import StandingsCenter from "../components/StandingsCenter";

export default function Admin(props) {
  const {
    tournament, tForm, setTForm, onSaveTournament, onRefresh, onLogout,
    admin, filters, setFilters, onLock, onSetPayment, onEdit, onCancel, onUpdateLevel,
    draw, setDraw, onSaveDraft, onFinalize, onPublish,
    manualPair, setManualPair, onAddManualPair, onStartMC,
    matchConfig, setMatchConfig, schedule, setSchedule, knockout, setKnockout, setMsg
  } = props;

  return <main className="card wide">
    <div className="topline">
      <div className="card-title"><Shield/> Dashboard BTC</div>
      <button className="mini" onClick={onRefresh}><RefreshCw size={14}/> Tải lại</button>
      <button className="mini" onClick={onLogout}>Đăng xuất</button>
    </div>

    <div className="flow">
      <span>Đăng ký</span><span>Thanh toán</span><span>Phân hạng</span>
      <span className={Number(tournament?.list_locked)===1?"done":""}>Khóa DS</span>
      <span className={draw.savedStatus?"done":""}>Bốc thăm</span>
      <span className={draw.savedStatus==="FINALIZED"||draw.savedStatus==="PUBLISHED"?"done":""}>Chốt</span>
      <span className={draw.savedStatus==="PUBLISHED"?"done":""}>Công bố</span>
    </div>

    <TournamentSettings form={tForm} setForm={setTForm} onSave={onSaveTournament}/>

    <div className="adminGrid">
      <RegistrationManager
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
      />
      <div>
        <DrawManager
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
        />
        <ScoreCenter
          groups={draw.groups}
          schedule={schedule}
          setSchedule={setSchedule}
          config={matchConfig}
          setMsg={setMsg}
        />

        <StandingsCenter
          groups={draw.groups}
          schedule={schedule}
          config={matchConfig}
          setMsg={setMsg}
        />

        <TournamentOps
          groups={draw.groups}
          config={matchConfig}
          setConfig={setMatchConfig}
          schedule={schedule}
          setSchedule={setSchedule}
          knockout={knockout}
          setKnockout={setKnockout}
          setMsg={setMsg}
        />
        <PrintCenter tournament={tournament} registrations={admin.registrations} groups={draw.groups} schedule={schedule} knockout={knockout} config={matchConfig} />
      </div>
    </div>
  </main>
}
