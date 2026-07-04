import { json, openTournament, publicGroups } from './_utils.js';
export async function onRequestGet({env, request}) {
  try {
    const url = new URL(request.url);
    const publicOnly = url.searchParams.get('public') === '1';
    const t = await openTournament(env);
    if(!t) return json({ok:true,draw:null});
    let row = await env.DB.prepare("SELECT * FROM tournament_draws WHERE tournament_id=? ORDER BY id DESC LIMIT 1").bind(t.id).first();
    if(!row) return json({ok:true,draw:null});
    if(publicOnly && row.status !== 'PUBLISHED') return json({ok:true,draw:null});
    const groups = JSON.parse(row.groups_json || '[]');
    return json({ok:true,draw:{id:row.id,status:row.status,draw_code:row.draw_code,created_at:row.created_at,published_at:row.published_at,groups:publicOnly?publicGroups(groups):groups}});
  } catch(e) { return json({ok:false,error:e.message,draw:null},{status:500}); }
}
export async function onRequestPost({request,env}) {
  try {
    const b = await request.json();
    const t = await openTournament(env);
    if(!t) return json({ok:false,error:'Không có giải đang mở'},{status:400});
    if(b.action === 'save_draft') {
      const groupsJson = JSON.stringify(b.groups || []);
      const code = 'DRAW-' + String(t.id).padStart(3,'0') + '-' + Date.now().toString().slice(-6);
      await env.DB.prepare("INSERT INTO tournament_draws (tournament_id,status,groups_json,draw_code) VALUES (?,?,?,?)").bind(t.id,'DRAFT',groupsJson,code).run();
      await env.DB.prepare("UPDATE tournaments SET draw_locked=0 WHERE id=?").bind(t.id).run();
      return json({ok:true,status:'DRAFT',draw_code:code});
    }
    if(b.action === 'finalize') {
      const row = await env.DB.prepare("SELECT * FROM tournament_draws WHERE tournament_id=? ORDER BY id DESC LIMIT 1").bind(t.id).first();
      if(!row) return json({ok:false,error:'Chưa có kết quả bốc thăm nháp'},{status:400});
      await env.DB.prepare("UPDATE tournament_draws SET status='FINALIZED',updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(row.id).run();
      await env.DB.prepare("UPDATE tournaments SET draw_locked=1 WHERE id=?").bind(t.id).run();
      return json({ok:true,status:'FINALIZED'});
    }
    if(b.action === 'publish') {
      const row = await env.DB.prepare("SELECT * FROM tournament_draws WHERE tournament_id=? ORDER BY id DESC LIMIT 1").bind(t.id).first();
      if(!row) return json({ok:false,error:'Chưa có kết quả bốc thăm'},{status:400});
      await env.DB.prepare("UPDATE tournament_draws SET status='PUBLISHED',published_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(row.id).run();
      await env.DB.prepare("UPDATE tournaments SET draw_locked=1 WHERE id=?").bind(t.id).run();
      return json({ok:true,status:'PUBLISHED'});
    }
    if(b.action === 'unlock') {
      await env.DB.prepare("UPDATE tournaments SET draw_locked=0 WHERE id=?").bind(t.id).run();
      return json({ok:true,status:'UNLOCKED'});
    }
    return json({ok:false,error:'Action không hợp lệ'},{status:400});
  } catch(e) { return json({ok:false,error:e.message},{status:500}); }
}
