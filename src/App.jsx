
import React, { useEffect, useState } from "react";
import { api, post, ADMIN_PIN } from "./services/api";
import Register from "./pages/Register";
import Public from "./pages/Public";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import Referee from "./pages/Referee";
import EditPlayerModal from "./components/EditPlayerModal";

const LOCAL_KEYS = {
  matchConfig: "ptm_v491_match_config",
  schedule: "ptm_v491_schedule",
  knockout: "ptm_v491_knockout",
  lastSaved: "ptm_v491_last_saved"
};

function readLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    localStorage.setItem(LOCAL_KEYS.lastSaved, new Date().toLocaleString("vi-VN"));
  } catch {}
}


export default function App() {
  const [tab,setTab] = useState("register");
  const [tournament,setTournament] = useState(null);
  const [tForm,setTForm] = useState({});
  const [msg,setMsg] = useState("");
  const [form,setForm] = useState({full_name:"",phone:"",gender:"male",marked_paid:false});
  const [publicList,setPublicList] = useState([]);
  const [publicDraw,setPublicDraw] = useState(null);
  const [adminAuthed,setAdminAuthed] = useState(localStorage.getItem("ptm_admin")==="1");
  const [pin,setPin] = useState("");
  const [admin,setAdmin] = useState({registrations:[],stats:{total:0,confirmed:0,pending:0},loading:false});
  const [editing,setEditing] = useState(null);
  const [draw,setDraw] = useState({source:"confirmed",method:"balanced",groupMethod:"balancedGroups",tableCount:2,teams:[],groups:[],leftover:[],savedStatus:""});
  const [manualPair,setManualPair] = useState({group:"Bảng A",p1:"",p1phone:"",p2:"",p2phone:"",teamName:""});
  const [matchConfig,setMatchConfig] = useState(()=>readLocal(LOCAL_KEYS.matchConfig, {qualifyTop:2,bestRank:3,bestCount:2,quarterTeams:8,courtCount:3,startTime:"08:00",minutesPerMatch:20,rules:{groupFormat:"ROUND_ROBIN",rankingCriteria:["win","pointDiff","pointFor","headToHead","draw"],groupPointTarget:11,groupWinByTwo:true,knockoutPointTarget:15,knockoutWinByTwo:true,thirdPlace:true}}));
  const [schedule,setSchedule] = useState(()=>readLocal(LOCAL_KEYS.schedule, []));
  const [knockout,setKnockout] = useState(()=>readLocal(LOCAL_KEYS.knockout, []));
  const [serverLoaded,setServerLoaded] = useState(false);
  const [syncing,setSyncing] = useState(false);
  const [serverSavedAt,setServerSavedAt] = useState(localStorage.getItem("ptm_v492_server_saved_at") || "chưa đồng bộ");
  const [mc,setMc] = useState(null);
  const [filters,setFilters] = useState({quick:"all",payment:"all",level:"all",gender:"all",sort:"newest",search:""});

  function hydrateTournament(t) {
    setTournament(t);
    if (t) setTForm({
      name:t.name||"", event_name:t.event_name||"Đôi nam", fee:t.fee||150000, max_players:t.max_players||40,
      start_time:t.start_time||"", draw_time:t.draw_time||"", register_deadline:t.register_deadline||"",
      first_prize:t.first_prize||0, second_prize:t.second_prize||0, third_prize:t.third_prize||0,
      third_prize_count:t.third_prize_count||2, sponsor_note:t.sponsor_note||""
    });
  }

  async function loadTournament(){ try { hydrateTournament((await api("/tournament")).tournament); } catch(e){ setMsg(e.message); } }
  async function loadPublic(){
    try {
      setPublicList((await api("/public-registrations")).registrations||[]);
      setPublicDraw((await api("/draw?public=1")).draw);
      const st = await api("/state");
      if (st.state) {
        if (st.state.matchConfig) setMatchConfig(st.state.matchConfig);
        if (Array.isArray(st.state.schedule)) setSchedule(st.state.schedule);
        if (Array.isArray(st.state.knockout)) setKnockout(st.state.knockout);
        setServerSavedAt(st.updated_at || st.state.savedAt || "đã tải");
        localStorage.setItem("ptm_v492_server_saved_at", st.updated_at || st.state.savedAt || "đã tải");
      }
      setServerLoaded(true);
    } catch(e){ setMsg(e.message); }
  }

  async function loadMatchStateFromServer(){
    try {
      const st = await api("/state");
      if (st.state) {
        if (st.state.matchConfig) setMatchConfig(st.state.matchConfig);
        if (Array.isArray(st.state.schedule)) setSchedule(st.state.schedule);
        if (Array.isArray(st.state.knockout)) setKnockout(st.state.knockout);
        setMsg("Đã tải lịch/kết quả/nhánh từ server.");
        setServerSavedAt(st.updated_at || st.state.savedAt || "đã tải");
        localStorage.setItem("ptm_v492_server_saved_at", st.updated_at || st.state.savedAt || "đã tải");
      } else {
        setMsg("Server chưa có lịch/kết quả/nhánh. Có thể bấm Xếp lịch rồi Đồng bộ cho VĐV.");
      }
      setServerLoaded(true);
    } catch(e){ setMsg(e.message); }
  }

  async function saveMatchStateToServer(showMsg=true){
    try {
      setSyncing(true);
      const d = await post("/state", { matchConfig, schedule, knockout });
      const stamp = new Date().toLocaleString("vi-VN");
      setServerSavedAt(stamp);
      localStorage.setItem("ptm_v492_server_saved_at", stamp);
      if(showMsg) setMsg("Đã đồng bộ lịch/kết quả/nhánh lên server. VĐV có thể xem trên điện thoại sau khi bấm Tải lại.");
      return d;
    } catch(e) {
      if(showMsg) setMsg("Lỗi đồng bộ server: " + e.message);
    } finally {
      setSyncing(false);
    }
  }
  async function loadAdmin(){
    setAdmin(a=>({...a,loading:true}));
    try {
      const d = await api("/registrations");
      setAdmin({registrations:d.registrations||[],stats:d.stats||{},loading:false});
      const dr = await api("/draw");
      if (dr.draw) setDraw(x=>({...x,groups:dr.draw.groups||[],savedStatus:dr.draw.status,teams:(dr.draw.groups||[]).flatMap(g=>g.teams||[])}));
    } catch(e) { setAdmin(a=>({...a,loading:false})); setMsg(e.message); }
  }

  useEffect(()=>{ loadTournament(); loadPublic(); },[]);
  useEffect(()=>{ writeLocal(LOCAL_KEYS.matchConfig, matchConfig); },[matchConfig]);
  useEffect(()=>{ writeLocal(LOCAL_KEYS.schedule, schedule); },[schedule]);
  useEffect(()=>{ writeLocal(LOCAL_KEYS.knockout, knockout); },[knockout]);
  useEffect(()=>{ if(adminAuthed && serverLoaded) { const t=setTimeout(()=>saveMatchStateToServer(false), 800); return ()=>clearTimeout(t); } },[matchConfig,schedule,knockout,adminAuthed,serverLoaded]);
  useEffect(()=>{ if(tab==="public") loadPublic(); if(tab==="admin"&&adminAuthed) { loadAdmin(); loadMatchStateFromServer(); } },[tab,adminAuthed]);

  async function submit(e){
    e.preventDefault();
    if(!form.marked_paid){
      setMsg("Vui lòng hoàn thiện chuyển khoản và tích 'Tôi đã chuyển khoản' trước khi gửi đăng ký.");
      return;
    }
    setMsg("Đang gửi đăng ký...");
    try {
      await post("/register", form);
      setMsg("Đăng ký thành công. BTC sẽ kiểm tra tài khoản và xác nhận thanh toán.");
      setForm({full_name:"",phone:"",gender:"male",marked_paid:false});
      loadPublic(); loadTournament(); if(adminAuthed) loadAdmin();
    } catch(err){ setMsg(err.message); }
  }

  function login(e){
    e.preventDefault();
    if(pin===ADMIN_PIN){ localStorage.setItem("ptm_admin","1"); setAdminAuthed(true); setPin(""); setMsg("Đã đăng nhập BTC."); }
    else setMsg("Sai mật khẩu BTC.");
  }
  function logout(){ localStorage.removeItem("ptm_admin"); setAdminAuthed(false); setTab("register"); }

  async function saveTournament(e){ e.preventDefault(); try { const d=await post("/update-tournament", tForm); hydrateTournament(d.tournament); setMsg("Đã cập nhật cấu hình giải."); } catch(err){ setMsg(err.message); } }
  async function lockList(locked=true){ try { await post("/lock-list", {locked}); setMsg(locked?"Đã khóa danh sách đăng ký.":"Đã mở khóa danh sách."); loadTournament(); } catch(e){ setMsg(e.message); } }
  async function setPayment(x,status){ try { await post("/confirm-payment",{registration_id:x.registration_id,status}); loadAdmin(); loadPublic(); } catch(e){ setMsg(e.message); } }
  async function saveEdit(e){ e.preventDefault(); try { await post("/update-player", editing); setEditing(null); setMsg("Đã cập nhật thông tin VĐV."); loadAdmin(); loadPublic(); } catch(err){ setMsg(err.message); } }
  async function cancelReg(x){ if(!confirm(`Xóa ${x.full_name} khỏi danh sách đăng ký?`)) return; try { await post("/cancel-registration",{registration_id:x.registration_id}); setMsg("Đã xóa VĐV khỏi danh sách."); loadAdmin(); loadPublic(); } catch(e){ setMsg(e.message); } }
  async function updateLevel(x){ try { await post("/update-player", x); loadAdmin(); } catch(e){ setMsg(e.message); } }

  function addManualPair(){
    if(!manualPair.p1.trim()||!manualPair.p2.trim()){ setMsg("Cần nhập đủ tên 2 VĐV bổ sung."); return; }
    const groups=[...(draw.groups||[])];
    if(!groups.length){ setMsg("Chưa có bảng đấu để gán cặp bổ sung. Hãy bốc thăm/chia bảng trước."); return; }
    let idx=groups.findIndex(g=>g.name===manualPair.group); if(idx<0) idx=0;
    const nextNo=groups.reduce((sum,g)=>sum+(g.teams||[]).length,0)+1;
    const team={name:manualPair.teamName.trim()||`Đội bổ sung ${nextNo}`,manual:true,players:[
      {full_name:manualPair.p1.trim(),phone:manualPair.p1phone.trim(),gender:"male",level_group:"SUPPLEMENT"},
      {full_name:manualPair.p2.trim(),phone:manualPair.p2phone.trim(),gender:"male",level_group:"SUPPLEMENT"}
    ]};
    groups[idx]={...groups[idx],teams:[...(groups[idx].teams||[]),team]};
    setDraw(d=>({...d,groups,teams:groups.flatMap(g=>g.teams||[]),savedStatus:"DRAFT_LOCAL"}));
    setManualPair({group:groups[idx].name,p1:"",p1phone:"",p2:"",p2phone:"",teamName:""});
    setMsg(`Đã gán cặp bổ sung vào ${groups[idx].name}. Cần bấm Chốt/Công bố lại để cập nhật công khai.`);
  }

  function startMC(){
    const teams=draw.groups.flatMap(g=>g.teams||[]);
    if(!teams.length){ setMsg("Chưa có kết quả bốc thăm nháp."); return; }
    let i=0; setMc({i:0,team:teams[0]});
    const timer=setInterval(()=>{ i++; if(i>=teams.length){ clearInterval(timer); setTimeout(()=>setMc(null),1200); } else setMc({i,team:teams[i]}); },1800);
  }

  async function saveDraft(){
    if(!draw.groups.length){ setMsg("Chưa có kết quả bốc thăm."); return; }
    try { await post("/draw",{action:"save_draft",groups:draw.groups}); setDraw(d=>({...d,savedStatus:"DRAFT"})); setMsg("Đã lưu bản bốc thăm nháp. Chỉ BTC thấy."); loadAdmin(); } catch(e){ setMsg(e.message); }
  }
  async function finalizeDraw(){
    try { if(draw.groups.length) await post("/draw",{action:"save_draft",groups:draw.groups}); await post("/draw",{action:"finalize"}); setDraw(d=>({...d,savedStatus:"FINALIZED"})); setMsg("Đã chốt kết quả bốc thăm."); loadAdmin(); } catch(e){ setMsg(e.message); }
  }
  async function publishDraw(){
    try { if(draw.groups.length){ await post("/draw",{action:"save_draft",groups:draw.groups}); await post("/draw",{action:"finalize"}); } await post("/draw",{action:"publish"}); setDraw(d=>({...d,savedStatus:"PUBLISHED"})); setMsg("Đã công bố bảng đấu cho VĐV/khán giả. Màn hình công khai không hiển thị hạng nội bộ."); loadAdmin(); loadPublic(); } catch(e){ setMsg(e.message); }
  }


  function clearLocalTournamentData(){
    if(!confirm("Xóa lịch, kết quả, nhánh đấu đã lưu trên trình duyệt này?")) return;
    localStorage.removeItem(LOCAL_KEYS.schedule);
    localStorage.removeItem(LOCAL_KEYS.knockout);
    localStorage.removeItem(LOCAL_KEYS.matchConfig);
    localStorage.removeItem(LOCAL_KEYS.lastSaved);
    setSchedule([]);
    setKnockout([]);
    setMatchConfig({qualifyTop:2,bestRank:3,bestCount:2,quarterTeams:8,courtCount:3,startTime:"08:00",minutesPerMatch:20,rules:{groupFormat:"ROUND_ROBIN",rankingCriteria:["win","pointDiff","pointFor","headToHead","draw"],groupPointTarget:11,groupWinByTwo:true,knockoutPointTarget:15,knockoutWinByTwo:true,thirdPlace:true}});
    setMsg("Đã xóa dữ liệu lịch/kết quả/nhánh lưu cục bộ trên trình duyệt này.");
  }

  function exportLocalTournamentData(){
    const data = {matchConfig, schedule, knockout, exportedAt:new Date().toISOString()};
    const text = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(text);
    setMsg("Đã copy dữ liệu giải vào clipboard. Có thể dán lưu vào Zalo/Notepad để dự phòng.");
  }

  return <div className="app">
    <header className="hero">
      <div className="brand">PickleCity League</div>
      <h1>PickleCity Weekly Open</h1>
      <p>Đăng ký • Khóa danh sách • Bốc thăm • Lịch đấu • Kết quả</p>
      <div className="version">V4.10.21 Referee Round Selector</div>
    </header>

    <nav className="tabs">
      <button className={tab==="register"?"active":""} onClick={()=>setTab("register")}>Đăng ký</button>
      <button className={tab==="public"?"active":""} onClick={()=>setTab("public")}>Danh sách & bảng đấu</button>
      <button className={tab==="admin"?"active":""} onClick={()=>setTab("admin")}>BTC</button>
      <button className={tab==="referee"?"active":""} onClick={()=>setTab("referee")}>Trọng tài</button>
    </nav>

    {adminAuthed && <div className="notice syncNotice cleanSync">💾 Đã lưu cục bộ: {localStorage.getItem(LOCAL_KEYS.lastSaved)||"chưa có"} · ☁️ {syncing ? "Đang đồng bộ..." : "Đã đồng bộ: " + serverSavedAt}</div>}
    {msg && <div className="notice">{msg}</div>}

    {tab==="register" && <Register tournament={tournament} form={form} setForm={setForm} onSubmit={submit}/>}
    {tab==="public" && <Public list={publicList} draw={publicDraw} schedule={schedule} knockout={knockout} onRefresh={loadPublic}/>}
    {tab==="admin" && !adminAuthed && <AdminLogin pin={pin} setPin={setPin} onLogin={login}/>}
    {tab==="referee" && <Referee
      schedule={schedule}
      setSchedule={setSchedule}
      knockout={knockout}
      setKnockout={setKnockout}
      config={matchConfig}
      setMsg={setMsg}
      onBack={()=>setTab("public")}
    />}

    {tab==="admin" && adminAuthed && <Admin
      tournament={tournament} tForm={tForm} setTForm={setTForm} onSaveTournament={saveTournament}
      onRefresh={()=>{loadTournament();loadAdmin();}} onLogout={logout}
      admin={admin} filters={filters} setFilters={setFilters}
      onLock={lockList} onSetPayment={setPayment} onEdit={setEditing} onCancel={cancelReg} onUpdateLevel={updateLevel}
      draw={draw} setDraw={setDraw} onSaveDraft={saveDraft} onFinalize={finalizeDraw} onPublish={publishDraw}
      manualPair={manualPair} setManualPair={setManualPair} onAddManualPair={addManualPair} onStartMC={startMC}
      matchConfig={matchConfig} setMatchConfig={setMatchConfig}
      schedule={schedule} setSchedule={setSchedule} knockout={knockout} setKnockout={setKnockout}
      setMsg={setMsg}
    />}

    <EditPlayerModal player={editing} setPlayer={setEditing} onSave={saveEdit} onClose={()=>setEditing(null)}/>

    {mc && <div className="mc">
      <h2>🎲 ĐANG BỐC THĂM</h2>
      <div className="mcTeam">Đội {mc.i+1}</div>
      <div className="mcNames">{mc.team.players.map(p=>p.full_name).join(" + ")}</div>
      <p>Không hiển thị phân hạng VĐV trên màn hình quay.</p>
    </div>}
  </div>
}
