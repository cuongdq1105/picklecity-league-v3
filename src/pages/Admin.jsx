
import { Shield, RefreshCw } from "lucide-react";
import TournamentSettings from "../components/TournamentSettings";
import RegistrationManager from "../components/RegistrationManager";
import DrawManager from "../components/DrawManager";
import ScheduleManager from "../components/ScheduleManager";

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

    <div className="summaryCardsV31">
      <div><b>{admin.stats?.total||0}</b><span>Tổng VĐV</span></div>
      <div><b>{admin.stats?.confirmed||0}</b><span>Đã xác nhận</span></div>
      <div><b>{admin.stats?.pending||0}</b><span>Chờ xác nhận</span></div>
      <div><b>{draw.groups?.flatMap(g=>g.teams||[]).length||0}</b><span>Đã ghép đội</span></div>
      <div><b>{draw.groups?.length||0}</b><span>Số bảng</span></div>
      <div><b>{draw.savedStatus||"CHƯA"}</b><span>Trạng thái bốc thăm</span></div><div><b>{schedule?.length||0}</b><span>Trận vòng bảng</span></div><div><b>{knockout?.length||0}</b><span>Trận tứ kết</span></div>
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
        <ScheduleManager
          groups={draw.groups}
          config={matchConfig}
          setConfig={setMatchConfig}
          schedule={schedule}
          setSchedule={setSchedule}
          knockout={knockout}
          setKnockout={setKnockout}
          setMsg={setMsg}
        />
      </div>
    </div>
  </main>
}
