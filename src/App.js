import { useState, useMemo, useEffect, useCallback } from "react";

// ── SUPABASE CONFIG ────────────────────────────────────────────────────────────
const SUPA_URL = "https://akwdijpzdkcvbwrpnxil.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrd2RpanB6ZGtjdmJ3cnBueGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNzE1NDQsImV4cCI6MjA4ODc0NzU0NH0.a4e1kFKOMhKSnRbG7BKAArTV1dqPVJCPZlD9pfOuthg";

const db = {
  headers: { "Content-Type":"application/json", "apikey":SUPA_KEY, "Authorization":`Bearer ${SUPA_KEY}` },
  url: (table, params="") => `${SUPA_URL}/rest/v1/${table}${params}`,
  async get(table, params="") {
    const r = await fetch(this.url(table,params), { headers:{...this.headers,"Accept":"application/json"} });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async post(table, body) {
    const r = await fetch(this.url(table), { method:"POST", headers:{...this.headers,"Prefer":"return=representation"}, body:JSON.stringify(body) });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async patch(table, id, body) {
    const r = await fetch(this.url(table,`?id=eq.${id}`), { method:"PATCH", headers:{...this.headers,"Prefer":"return=representation"}, body:JSON.stringify(body) });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async delete(table, id) {
    const r = await fetch(this.url(table,`?id=eq.${id}`), { method:"DELETE", headers:this.headers });
    if (!r.ok) throw new Error(await r.text());
  },
};

// ── BRANDING ──────────────────────────────────────────────────────────────────
const APP_NAME  = "AR Systemwide Cost Database";
const APP_SHORT = "AR Cost DB";
const LOGO_B64  = "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";

// ── CONSTANTS ──────────────────────────────────────────────────────────────────
const UNITS     = ["EA","SF","LF","CY","CF","TON","GAL","HR","LS","MBF"];
const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
const ROLES     = ["editor","manager","admin"];

// ── HELPERS ───────────────────────────────────────────────────────────────────
const fmt   = (n) => n != null && n !== "" ? `$${Number(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}` : "—";
const today = () => new Date().toISOString().slice(0,10);

const toEntry  = r => ({ id:r.id, officeId:r.office_id, componentNo:r.component_no, componentName:r.component_name, country:r.country, state:r.state, city:r.city, zip:r.zip, unit:r.unit, laborCost:r.labor_cost, materialCost:r.material_cost, totalCost:r.total_cost, notes:r.notes??'', createdBy:r.created_by, updatedAt:r.updated_at });
const toUser   = r => ({ id:r.id, name:r.name, email:r.email, title:r.title??'', password:r.password, officeId:r.office_id, role:r.role });
const toOffice = r => ({ id:r.id, name:r.name });
const fromEntry = (f,userId) => ({ office_id:f.officeId, component_no:f.componentNo, component_name:f.componentName, country:f.country, state:f.state, city:f.city, zip:f.zip, unit:f.unit, labor_cost:f.laborCost||null, material_cost:f.materialCost||null, total_cost:f.totalCost||null, notes:f.notes||'', created_by:userId, updated_at:today() });
const fromUser  = (f) => ({ name:f.name, email:f.email, title:f.title||'', password:f.password, office_id:f.officeId, role:f.role });

function exportCSV(rows, offices) {
  const headers = ["Component #","Component Name","Country","State","City","ZIP","Unit","Labor","Material","Total","Notes","Office","Updated"];
  const lines = rows.map(r=>[
    r.componentNo,r.componentName,r.country,r.state,r.city,r.zip,
    r.unit,r.laborCost,r.materialCost,r.totalCost,r.notes,
    offices.find(o=>o.id===r.officeId)?.name??r.officeId, r.updatedAt
  ].map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(","));
  const csv=[headers.join(","),...lines].join("\n");
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
  a.download=`ar-cost-data-${today()}.csv`;
  a.click();
}

const blankEntry  = (officeId) => ({ componentNo:"",componentName:"",country:"USA",state:"",city:"",zip:"",unit:"EA",laborCost:"",materialCost:"",totalCost:"",notes:"",officeId });
const blankUser   = (officeId) => ({ name:"",email:"",title:"",password:"",officeId,role:"editor" });
const blankOffice = ()         => ({ name:"" });

// ── ROOT ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [offices, setOffices] = useState([]);
  const [users,   setUsers]   = useState([]);
  const [entries, setEntries] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState("costs");
  const [modal,   setModal]   = useState(null);
  const [search,  setSearch]  = useState("");
  const [fState,  setFState]  = useState("");
  const [fOffice, setFOffice] = useState("");
  const [toast,   setToast]   = useState(null);

  const showToast  = (msg,type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3200); };
  const closeModal = () => setModal(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [off,usr,ent] = await Promise.all([
        db.get("offices","?order=name"),
        db.get("users","?order=name"),
        db.get("entries","?order=component_no"),
      ]);
      setOffices(off.map(toOffice));
      setUsers(usr.map(toUser));
      setEntries(ent.map(toEntry));
    } catch(e) { showToast("Failed to load data: "+e.message,"error"); }
    setLoading(false);
  },[]);

  useEffect(()=>{ loadAll(); },[loadAll]);

  const me      = users.find(u=>u.id===session);
  const isAdmin = me?.role==="admin";
  const isMgr   = me?.role==="manager" || isAdmin;
  const myOffice = offices.find(o=>o.id===me?.officeId);

  // ── PERMISSIONS ──────────────────────────────────────────────────────────────
  const canManageUser = (u) => isAdmin || (isMgr && u.officeId===me.officeId);
  const canEditEntry  = (e) => isAdmin || e.officeId===me?.officeId;

  // ── FILTERED ENTRIES — must be before any early returns ───────────────────
  const visibleEntries = useMemo(()=>{
    let rows=entries;
    if (fOffice) rows=rows.filter(r=>r.officeId===fOffice);
    if (fState)  rows=rows.filter(r=>r.state===fState);
    if (search.trim()) {
      const q=search.toLowerCase();
      rows=rows.filter(r=>
        r.componentNo.toLowerCase().includes(q)||
        r.componentName.toLowerCase().includes(q)||
        r.city.toLowerCase().includes(q)||
        r.zip.includes(q)||
        (r.notes||"").toLowerCase().includes(q)
      );
    }
    return rows;
  },[entries,search,fState,fOffice]);

  // ── COST ENTRY ACTIONS ───────────────────────────────────────────────────────
  const saveEntry = async (form,editId) => {
    const req=["componentNo","componentName","state","city","zip","unit"];
    for (const f of req) if (!form[f]?.trim()) { showToast(`"${f}" is required.`,"error"); return false; }
    try {
      if (editId) {
        const rows = await db.patch("entries",editId,{...fromEntry(form,me.id),updated_at:today()});
        setEntries(p=>p.map(e=>e.id===editId?toEntry(rows[0]):e));
        showToast("Entry updated.");
      } else {
        const rows = await db.post("entries",fromEntry(form,me.id));
        setEntries(p=>[...p,toEntry(rows[0])]);
        showToast("Entry added.");
      }
      return true;
    } catch(e) { showToast("Error saving entry: "+e.message,"error"); return false; }
  };

  const deleteEntry = async (id) => {
    try {
      await db.delete("entries",id);
      setEntries(p=>p.filter(e=>e.id!==id));
      showToast("Entry deleted.","error");
    } catch(e) { showToast("Error deleting entry: "+e.message,"error"); }
  };

  // ── OFFICE ACTIONS ───────────────────────────────────────────────────────────
  const saveOffice = async (form,editId) => {
    if (!form.name?.trim()) { showToast("Office name is required.","error"); return false; }
    try {
      if (editId) {
        const rows = await db.patch("offices",editId,{name:form.name});
        setOffices(p=>p.map(o=>o.id===editId?toOffice(rows[0]):o));
        showToast("Office updated.");
      } else {
        const rows = await db.post("offices",{name:form.name});
        setOffices(p=>[...p,toOffice(rows[0])]);
        showToast("Office created.");
      }
      return true;
    } catch(e) { showToast("Error saving office: "+e.message,"error"); return false; }
  };

  const deleteOffice = async (id) => {
    if (users.some(u=>u.officeId===id))   { showToast("Cannot delete — office has users.","error"); return; }
    if (entries.some(e=>e.officeId===id)) { showToast("Cannot delete — office has cost entries.","error"); return; }
    try {
      await db.delete("offices",id);
      setOffices(p=>p.filter(o=>o.id!==id));
      showToast("Office deleted.","error");
    } catch(e) { showToast("Error deleting office: "+e.message,"error"); }
  };

  // ── USER ACTIONS ─────────────────────────────────────────────────────────────
  const saveUser = async (form,editId) => {
    if (!form.name?.trim()||!form.email?.trim()||!form.password?.trim()) {
      showToast("Name, email, and password are required.","error"); return false;
    }
    try {
      if (editId) {
        const rows = await db.patch("users",editId,fromUser(form));
        setUsers(p=>p.map(u=>u.id===editId?toUser(rows[0]):u));
        showToast("User updated.");
      } else {
        const rows = await db.post("users",fromUser(form));
        setUsers(p=>[...p,toUser(rows[0])]);
        showToast("User created.");
      }
      return true;
    } catch(e) { showToast("Error saving user: "+e.message,"error"); return false; }
  };

  const deleteUser = async (id) => {
    if (id===session) { showToast("You cannot delete yourself.","error"); return; }
    try {
      await db.delete("users",id);
      setUsers(p=>p.filter(u=>u.id!==id));
      showToast("User deleted.","error");
    } catch(e) { showToast("Error deleting user: "+e.message,"error"); }
  };

  // ── EARLY RETURNS (after all hooks) ──────────────────────────────────────────
  if (loading)  return <LoadingScreen />;
  if (!session) return <LoginScreen users={users} onLogin={setSession} />;

  return (
    <div style={S.app}>
      <Topbar me={me} myOffice={myOffice} isMgr={isMgr} page={page} setPage={setPage} onLogout={()=>setSession(null)} />
      <div style={S.container}>

        {/* ── COST ENTRIES ── */}
        {page==="costs" && <>
          <div style={S.statsBar}>
            <StatCard label="Total Entries"  value={entries.length} />
            <StatCard label="Your Office"    value={entries.filter(e=>e.officeId===me.officeId).length} />
            <StatCard label="Offices"        value={offices.length} />
            <StatCard label="States Covered" value={[...new Set(entries.map(e=>e.state))].length} />
          </div>
          <div style={S.toolbar}>
            <input style={S.searchInput} placeholder="🔍  Search component, city, ZIP…" value={search} onChange={e=>setSearch(e.target.value)} />
            <select style={S.filterSel} value={fState}  onChange={e=>setFState(e.target.value)}>
              <option value="">All States</option>
              {US_STATES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <select style={S.filterSel} value={fOffice} onChange={e=>setFOffice(e.target.value)}>
              <option value="">All Offices</option>
              {offices.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <button style={S.btnOutline} onClick={()=>exportCSV(visibleEntries,offices)}>⬇ Export CSV</button>
            <button style={S.btnPrimary} onClick={()=>setModal({type:"entry",data:blankEntry(me.officeId),editId:null})}>+ Add Entry</button>
          </div>
          <CostTable entries={visibleEntries} offices={offices} me={me}
            canEdit={canEditEntry}
            onEdit={e=>setModal({type:"entry",data:{...e},editId:e.id})}
            onView={e=>setModal({type:"entryDetail",data:e})} />
          <p style={S.foot}>{visibleEntries.length} result{visibleEntries.length!==1?"s":""}</p>
        </>}

        {/* ── OFFICES ── */}
        {page==="offices" && isMgr && <>
          <div style={S.pageHead}>
            <div>
              <h2 style={S.pageTitle}>LLC Offices</h2>
              <p style={S.pageSub}>{isAdmin?"Manage all offices across the organization.":"View offices. Contact Admin to add or remove offices."}</p>
            </div>
            {isAdmin && <button style={S.btnPrimary} onClick={()=>setModal({type:"office",data:blankOffice(),editId:null})}>+ New Office</button>}
          </div>
          <div style={S.cardGrid}>
            {offices.map(o=>{
              const oUsers   = users.filter(u=>u.officeId===o.id);
              const oEntries = entries.filter(e=>e.officeId===o.id);
              const mgrs     = oUsers.filter(u=>u.role==="manager"||u.role==="admin");
              return (
                <div key={o.id} style={S.officeCard}>
                  <div style={S.officeCardTop}>
                    <div style={S.officeIcon}>🏢</div>
                    <div style={{flex:1}}>
                      <div style={S.officeName}>{o.name}</div>
                      <div style={S.officeMeta}>{oUsers.length} user{oUsers.length!==1?"s":""} &nbsp;·&nbsp; {oEntries.length} entr{oEntries.length!==1?"ies":"y"}</div>
                      {mgrs.length>0 && <div style={S.officeMgr}>Manager{mgrs.length>1?"s":""}: {mgrs.map(m=>m.name).join(", ")}</div>}
                    </div>
                  </div>
                  {isAdmin && (
                    <div style={S.officeCardActions}>
                      <button style={S.btnEdit} onClick={()=>setModal({type:"office",data:{name:o.name},editId:o.id})}>Edit Name</button>
                      <button style={S.btnDel}  onClick={()=>deleteOffice(o.id)}>Delete</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>}

        {/* ── USERS ── */}
        {page==="users" && isMgr && <>
          <div style={S.pageHead}>
            <div>
              <h2 style={S.pageTitle}>Users</h2>
              <p style={S.pageSub}>{isAdmin?"Manage all users.":`Managing users in your office: ${myOffice?.name}.`}</p>
            </div>
            <button style={S.btnPrimary} onClick={()=>setModal({type:"user",data:blankUser(me.officeId),editId:null})}>+ New User</button>
          </div>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead><tr style={S.thead}>
                {["Name","Email","Job Title","Role","Office","Password",""].map(h=><th key={h} style={S.th}>{h}</th>)}
              </tr></thead>
              <tbody>
                {users.filter(u=>isAdmin||u.officeId===me.officeId).map(u=>{
                  const uOffice  = offices.find(o=>o.id===u.officeId);
                  const editable = canManageUser(u);
                  return (
                    <tr key={u.id} style={S.tr}
                      onMouseEnter={e=>e.currentTarget.style.background="#f0f7ff"}
                      onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                      <td style={S.td}><strong>{u.name}</strong>{u.id===session&&<span style={S.youBadge}> you</span>}</td>
                      <td style={S.td}>{u.email}</td>
                      <td style={S.td}>{u.title||"—"}</td>
                      <td style={S.tdCenter}><RoleBadge role={u.role}/></td>
                      <td style={S.td}>{uOffice?.name??u.officeId}</td>
                      <td style={S.tdCenter}><span style={S.pwMask}>••••••••</span></td>
                      <td style={S.tdActions}>
                        {editable
                          ? <><button style={S.btnEdit} onClick={()=>setModal({type:"user",data:{...u},editId:u.id})}>Edit</button>
                              {u.id!==session&&<button style={{...S.btnDel,marginLeft:6}} onClick={()=>deleteUser(u.id)}>Delete</button>}</>
                          : <span style={S.viewOnly}>View only</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>}
      </div>

      {modal?.type==="entry" &&
        <EntryModal form={modal.data} editId={modal.editId} offices={offices} me={me} isAdmin={isAdmin}
          onSave={async (f,id)=>{ if(await saveEntry(f,id)) closeModal(); }} onClose={closeModal} />}
      {modal?.type==="entryDetail" &&
        <EntryDetailModal entry={modal.data} offices={offices} users={users} canEdit={canEditEntry(modal.data)}
          onEdit={()=>setModal({type:"entry",data:{...modal.data},editId:modal.data.id})}
          onDelete={async ()=>{ await deleteEntry(modal.data.id); closeModal(); }} onClose={closeModal} />}
      {modal?.type==="office" &&
        <OfficeModal form={modal.data} editId={modal.editId}
          onSave={async (f,id)=>{ if(await saveOffice(f,id)) closeModal(); }} onClose={closeModal} />}
      {modal?.type==="user" &&
        <UserModal form={modal.data} editId={modal.editId} offices={offices} me={me} isAdmin={isAdmin}
          onSave={async (f,id)=>{ if(await saveUser(f,id)) closeModal(); }} onClose={closeModal} />}

      {toast && <Toast {...toast} />}
    </div>
  );
}

// ── LOADING SCREEN ─────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={S.loginWrap}>
      <div style={{textAlign:"center",color:"#fff"}}>
        <img src={`data:image/jpeg;base64,${LOGO_B64}`} alt="AR logo" style={{width:80,height:80,objectFit:"contain",marginBottom:16}}/>
        <div style={{fontSize:18,fontWeight:600,marginBottom:8}}>{APP_NAME}</div>
        <div style={{fontSize:14,opacity:0.8}}>Connecting to database…</div>
      </div>
    </div>
  );
}

// ── LOGIN ──────────────────────────────────────────────────────────────────────
function LoginScreen({ users, onLogin }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const submit = () => {
    const u=users.find(u=>u.email.toLowerCase()===email.toLowerCase()&&u.password===password);
    if (u) onLogin(u.id); else setError("Invalid email or password.");
  };
  return (
    <div style={S.loginWrap}>
      <div style={S.loginCard}>
        <img src={`data:image/jpeg;base64,${LOGO_B64}`} alt="AR logo" style={S.loginLogoImg}/>
        <h1 style={S.loginTitle}>{APP_NAME}</h1>
        <p style={S.loginSub}>Systemwide Repair &amp; Replacement Cost Database</p>
        <div style={S.loginFields}>
          <div style={S.field}>
            <label style={S.label}>Email</label>
            <input style={S.input} type="email" value={email} onChange={e=>setEmail(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="you@example.com"/>
          </div>
          <div style={S.field}>
            <label style={S.label}>Password</label>
            <input style={S.input} type="password" value={password} onChange={e=>setPassword(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="••••••••"/>
          </div>
          {error && <p style={S.loginError}>{error}</p>}
          <button style={{...S.btnPrimary,width:"100%",marginTop:4}} onClick={submit}>Sign In →</button>
        </div>
      </div>
    </div>
  );
}

// ── TOPBAR ─────────────────────────────────────────────────────────────────────
function Topbar({ me, myOffice, isMgr, page, setPage, onLogout }) {
  const tabs=[{id:"costs",label:"Cost Entries"},...(isMgr?[{id:"offices",label:"Offices"},{id:"users",label:"Users"}]:[])];
  return (
    <header style={S.header}>
      <div style={S.headerInner}>
        <div style={S.brand}>
          <span style={S.brandIcon}><img src={`data:image/jpeg;base64,${LOGO_B64}`} alt="AR logo" style={S.headerLogoImg}/></span>
          <span style={S.brandName}>{APP_SHORT}</span>
          <nav style={S.nav}>
            {tabs.map(t=><button key={t.id} style={{...S.navBtn,...(page===t.id?S.navActive:{})}} onClick={()=>setPage(t.id)}>{t.label}</button>)}
          </nav>
        </div>
        <div style={S.headerRight}>
          <div style={S.userInfo}>
            <div style={S.userName}>{me.name}</div>
            <div style={S.userMeta}>{myOffice?.name} · <RoleBadge role={me.role} small/></div>
          </div>
          <button style={S.btnLogout} onClick={onLogout}>Sign Out</button>
        </div>
      </div>
    </header>
  );
}

// ── COST TABLE ─────────────────────────────────────────────────────────────────
function CostTable({ entries, offices, me, canEdit, onEdit, onView }) {
  if (!entries.length) return <div style={S.empty}>No entries match your search.</div>;
  return (
    <div style={S.tableWrap}>
      <table style={S.table}>
        <thead><tr style={S.thead}>
          {["Comp #","Component Name","State","City","ZIP","Unit","Labor","Material","Total","Office",""].map(h=><th key={h} style={S.th}>{h}</th>)}
        </tr></thead>
        <tbody>
          {entries.map(e=>{
            const own=e.officeId===me.officeId;
            return (
              <tr key={e.id} style={{...S.tr,background:own?"#fff":"#f9f9f7"}}
                onMouseEnter={ev=>ev.currentTarget.style.background=own?"#f0f7ff":"#f0efe9"}
                onMouseLeave={ev=>ev.currentTarget.style.background=own?"#fff":"#f9f9f7"}>
                <td style={{...S.td,fontWeight:600,color:"#1a4b8c",fontFamily:"monospace"}}>{e.componentNo}</td>
                <td style={S.td}><button style={S.linkBtn} onClick={()=>onView(e)}>{e.componentName}</button></td>
                <td style={S.tdCenter}>{e.state}</td>
                <td style={S.td}>{e.city}</td>
                <td style={S.tdCenter}>{e.zip}</td>
                <td style={S.tdCenter}><span style={S.unitBadge}>{e.unit}</span></td>
                <td style={S.tdRight}>{fmt(e.laborCost)}</td>
                <td style={S.tdRight}>{fmt(e.materialCost)}</td>
                <td style={{...S.tdRight,fontWeight:700,color:"#1a7a3c"}}>{fmt(e.totalCost)}</td>
                <td style={S.td}>
                  <span style={{...S.officePill,background:own?"#dbeafe":"#f3f0e8",color:own?"#1e40af":"#7a6a3a"}}>
                    {own?"●":"○"} {offices.find(o=>o.id===e.officeId)?.name.split("–")[0].trim()}
                  </span>
                </td>
                <td style={S.tdActions}>
                  {canEdit(e)?<button style={S.btnEdit} onClick={()=>onEdit(e)}>Edit</button>:<span style={S.viewOnly}>View only</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── MODAL SHELL ────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide }) {
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{...S.modal,...(wide?{maxWidth:720}:{})}} onClick={e=>e.stopPropagation()}>
        <div style={S.modalHead}>
          <h3 style={S.modalTitle}>{title}</h3>
          <button style={S.modalClose} onClick={onClose}>✕</button>
        </div>
        <div style={S.modalBody}>{children}</div>
      </div>
    </div>
  );
}

// ── ENTRY FORM MODAL ───────────────────────────────────────────────────────────
function EntryModal({ form:init, editId, offices, me, isAdmin, onSave, onClose }) {
  const [form,setForm]=useState(init);
  const [saving,setSaving]=useState(false);
  const set=(k,v)=>setForm(p=>{
    const n={...p,[k]:v};
    if(k==="laborCost"||k==="materialCost"){
      const l=parseFloat(n.laborCost)||0,m=parseFloat(n.materialCost)||0;
      if(l+m>0) n.totalCost=(l+m).toFixed(2);
    }
    return n;
  });
  const handleSave=async()=>{ setSaving(true); await onSave(form,editId); setSaving(false); };
  return (
    <Modal title={editId?"Edit Entry":"Add New Entry"} onClose={onClose} wide>
      <div style={S.formGrid}>
        <FF label="Component #*"     value={form.componentNo}   onChange={v=>set("componentNo",v)} />
        <FF label="Component Name*"  value={form.componentName} onChange={v=>set("componentName",v)} span={2} />
        <div style={S.field}>
          <label style={S.label}>Office</label>
          <select style={S.select} value={form.officeId} onChange={e=>set("officeId",e.target.value)} disabled={!isAdmin}>
            {offices.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          {!isAdmin&&<span style={S.hint}>Locked to your office</span>}
        </div>
        <div style={S.field}>
          <label style={S.label}>Country</label>
          <select style={S.select} value={form.country} onChange={e=>set("country",e.target.value)}>
            <option value="USA">USA</option>
          </select>
        </div>
        <div style={S.field}>
          <label style={S.label}>State*</label>
          <select style={S.select} value={form.state} onChange={e=>set("state",e.target.value)}>
            <option value="">— Select —</option>
            {US_STATES.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <FF label="City*"                value={form.city}         onChange={v=>set("city",v)} />
        <FF label="ZIP Code*"            value={form.zip}          onChange={v=>set("zip",v)} />
        <div style={S.field}>
          <label style={S.label}>Unit of Measure*</label>
          <select style={S.select} value={form.unit} onChange={e=>set("unit",e.target.value)}>
            {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <FF label="Labor Cost ($)"           type="number" value={form.laborCost}    onChange={v=>set("laborCost",v)} />
        <FF label="Material Cost ($)"        type="number" value={form.materialCost} onChange={v=>set("materialCost",v)} />
        <FF label="Total Installed Cost ($)" type="number" value={form.totalCost}    onChange={v=>set("totalCost",v)} />
        <div style={{...S.field,gridColumn:"1 / -1"}}>
          <label style={S.label}>Notes / Description</label>
          <textarea style={S.textarea} value={form.notes} onChange={e=>set("notes",e.target.value)} rows={3} placeholder="Optional notes…"/>
        </div>
      </div>
      <div style={S.formActions}>
        <button style={S.btnSecondary} onClick={onClose}>Cancel</button>
        <button style={{...S.btnPrimary,opacity:saving?0.6:1}} onClick={handleSave} disabled={saving}>{saving?"Saving…":editId?"Save Changes":"Add Entry"}</button>
      </div>
    </Modal>
  );
}

// ── ENTRY DETAIL MODAL ─────────────────────────────────────────────────────────
function EntryDetailModal({ entry, offices, users, canEdit, onEdit, onDelete, onClose }) {
  const office  = offices.find(o=>o.id===entry.officeId);
  const creator = users.find(u=>u.id===entry.createdBy);
  const rows=[
    ["Component #",    entry.componentNo],
    ["Component Name", entry.componentName],
    ["Office",         office?.name],
    ["Country",        entry.country],
    ["State",          entry.state],
    ["City",           entry.city],
    ["ZIP",            entry.zip],
    ["Unit",           entry.unit],
    ["Labor Cost",     fmt(entry.laborCost)],
    ["Material Cost",  fmt(entry.materialCost)],
    ["Total Installed",fmt(entry.totalCost),true],
    ["Notes",          entry.notes||"—",false,true],
    ["Added By",       creator?.name??entry.createdBy],
    ["Last Updated",   entry.updatedAt],
  ];
  return (
    <Modal title={`${entry.componentNo} — ${entry.componentName}`} onClose={onClose} wide>
      {!canEdit&&<div style={S.viewOnlyBanner}>👁 View Only — this entry belongs to another office</div>}
      <div style={S.detailGrid}>
        {rows.map(([label,value,big,full])=>(
          <div key={label} style={{...S.detailRow,...(full?{gridColumn:"1/-1"}:{})}}>
            <div style={S.detailLabel}>{label}</div>
            <div style={{...S.detailValue,...(big?{fontSize:20,fontWeight:700,color:"#1a7a3c"}:{})}}>{value}</div>
          </div>
        ))}
      </div>
      {canEdit&&<div style={S.formActions}>
        <button style={S.btnDanger}  onClick={onDelete}>Delete</button>
        <button style={S.btnPrimary} onClick={onEdit}>Edit Entry</button>
      </div>}
    </Modal>
  );
}

// ── OFFICE MODAL ───────────────────────────────────────────────────────────────
function OfficeModal({ form:init, editId, onSave, onClose }) {
  const [form,setForm]=useState(init);
  const [saving,setSaving]=useState(false);
  const handleSave=async()=>{ setSaving(true); await onSave(form,editId); setSaving(false); };
  return (
    <Modal title={editId?"Edit Office":"New Office"} onClose={onClose}>
      <p style={S.modalDesc}>Offices represent LLC locations. Users and cost entries are assigned to an office.</p>
      <FF label="Office Name*" value={form.name} onChange={v=>setForm(p=>({...p,name:v}))} />
      <div style={S.formActions}>
        <button style={S.btnSecondary} onClick={onClose}>Cancel</button>
        <button style={{...S.btnPrimary,opacity:saving?0.6:1}} onClick={handleSave} disabled={saving}>{saving?"Saving…":editId?"Save Changes":"Create Office"}</button>
      </div>
    </Modal>
  );
}

// ── USER MODAL ─────────────────────────────────────────────────────────────────
function UserModal({ form:init, editId, offices, me, isAdmin, onSave, onClose }) {
  const [form,setForm]=useState(init);
  const [showPw,setShowPw]=useState(false);
  const [saving,setSaving]=useState(false);
  const availOffices=isAdmin?offices:offices.filter(o=>o.id===me.officeId);
  const availRoles=isAdmin?ROLES:ROLES.filter(r=>r!=="admin");
  const handleSave=async()=>{ setSaving(true); await onSave(form,editId); setSaving(false); };
  return (
    <Modal title={editId?"Edit User":"New User"} onClose={onClose}>
      <div style={S.formGrid}>
        <FF label="Full Name*" value={form.name}  onChange={v=>setForm(p=>({...p,name:v}))}  span={3}/>
        <FF label="Email*"     value={form.email} onChange={v=>setForm(p=>({...p,email:v}))} span={3}/>
        <FF label="Job Title"  value={form.title} onChange={v=>setForm(p=>({...p,title:v}))} span={3}/>
        <div style={{...S.field,gridColumn:"span 3"}}>
          <label style={S.label}>Password*</label>
          <div style={{position:"relative"}}>
            <input style={{...S.input,paddingRight:52}} type={showPw?"text":"password"}
              value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} placeholder="Set a password…"/>
            <button onClick={()=>setShowPw(p=>!p)}
              style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#666",fontSize:13}}>
              {showPw?"Hide":"Show"}
            </button>
          </div>
        </div>
        <div style={{...S.field,gridColumn:"span 2"}}>
          <label style={S.label}>Office</label>
          <select style={S.select} value={form.officeId} onChange={e=>setForm(p=>({...p,officeId:e.target.value}))} disabled={!isAdmin}>
            {availOffices.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          {!isAdmin&&<span style={S.hint}>Locked to your office</span>}
        </div>
        <div style={S.field}>
          <label style={S.label}>Role</label>
          <select style={S.select} value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))}>
            {availRoles.map(r=><option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
          </select>
        </div>
      </div>
      <div style={S.formActions}>
        <button style={S.btnSecondary} onClick={onClose}>Cancel</button>
        <button style={{...S.btnPrimary,opacity:saving?0.6:1}} onClick={handleSave} disabled={saving}>{saving?"Saving…":editId?"Save Changes":"Create User"}</button>
      </div>
    </Modal>
  );
}

// ── MICRO COMPONENTS ──────────────────────────────────────────────────────────
function FF({ label, value, onChange, type="text", span }) {
  return (
    <div style={{...S.field,...(span?{gridColumn:`span ${span}`}:{})}}>
      <label style={S.label}>{label}</label>
      <input style={S.input} type={type} value={value??""} onChange={e=>onChange(e.target.value)}
        step={type==="number"?"0.01":undefined} min={type==="number"?"0":undefined}/>
    </div>
  );
}

function RoleBadge({ role, small }) {
  const colors={admin:["#fef2f2","#991b1b"],manager:["#fefce8","#854d0e"],editor:["#f0fdf4","#166534"]};
  const [bg,tc]=colors[role]??["#f3f4f6","#374151"];
  return <span style={{background:bg,color:tc,borderRadius:20,padding:small?"1px 7px":"3px 10px",fontSize:small?10:11,fontWeight:700,whiteSpace:"nowrap"}}>{role}</span>;
}

function StatCard({ label, value }) {
  return (
    <div style={S.statCard}>
      <div style={S.statValue}>{value}</div>
      <div style={S.statLabel}>{label}</div>
    </div>
  );
}

function Toast({ msg, type }) {
  return <div style={{...S.toast,background:type==="error"?"#dc2626":"#16a34a"}}>{msg}</div>;
}

// ── STYLES ─────────────────────────────────────────────────────────────────────
const S = {
  app:       { minHeight:"100vh", background:"#f4f5f7", fontFamily:"Georgia,'Times New Roman',serif" },
  container: { maxWidth:1200, margin:"0 auto", padding:"24px 20px" },

  loginWrap:    { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#0f2952 0%,#1a4b8c 60%,#0f5132 100%)", fontFamily:"Georgia,serif" },
  loginCard:    { background:"#fff", borderRadius:12, padding:"44px 40px", width:400, boxShadow:"0 20px 60px rgba(0,0,0,0.3)", textAlign:"center" },
  loginLogoImg: { width:80, height:80, objectFit:"contain", marginBottom:12 },
  loginTitle:   { fontSize:22, fontWeight:700, margin:"0 0 6px", color:"#0f2952", lineHeight:1.25 },
  loginSub:     { color:"#666", marginBottom:24, fontSize:13 },
  loginFields:  { textAlign:"left", display:"flex", flexDirection:"column", gap:14 },
  loginError:   { color:"#dc2626", fontSize:13, margin:"2px 0 0" },

  header:       { background:"#0f2952", borderBottom:"3px solid #e8a000", position:"sticky", top:0, zIndex:100 },
  headerInner:  { maxWidth:1200, margin:"0 auto", padding:"0 20px", display:"flex", alignItems:"center", justifyContent:"space-between", height:60 },
  brand:        { display:"flex", alignItems:"center", gap:14 },
  headerLogoImg:{ height:36, width:36, objectFit:"contain", display:"block" },
  brandIcon:    { display:"flex", alignItems:"center" },
  brandName:    { fontSize:17, fontWeight:700, color:"#fff", letterSpacing:"-0.3px", marginRight:6 },
  nav:          { display:"flex", gap:4 },
  navBtn:       { background:"transparent", border:"none", color:"rgba(255,255,255,0.65)", cursor:"pointer", padding:"6px 14px", borderRadius:6, fontSize:14, fontFamily:"Georgia,serif" },
  navActive:    { background:"rgba(255,255,255,0.15)", color:"#fff", fontWeight:600 },
  headerRight:  { display:"flex", alignItems:"center", gap:16 },
  userInfo:     { textAlign:"right" },
  userName:     { color:"#fff", fontWeight:600, fontSize:14 },
  userMeta:     { color:"#94b8e8", fontSize:12 },
  btnLogout:    { background:"transparent", border:"1px solid rgba(255,255,255,0.3)", color:"#fff", borderRadius:6, padding:"6px 14px", cursor:"pointer", fontSize:13 },

  statsBar:  { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 },
  statCard:  { background:"#fff", borderRadius:8, padding:"16px 20px", boxShadow:"0 1px 4px rgba(0,0,0,0.07)", borderLeft:"4px solid #1a4b8c" },
  statValue: { fontSize:28, fontWeight:700, color:"#0f2952" },
  statLabel: { fontSize:12, color:"#888", marginTop:2, textTransform:"uppercase", letterSpacing:0.5 },

  toolbar:    { display:"flex", gap:10, marginBottom:14, flexWrap:"wrap", alignItems:"center" },
  searchInput:{ flex:2, minWidth:220, padding:"9px 14px", border:"1px solid #ddd", borderRadius:7, fontSize:14, fontFamily:"Georgia,serif", outline:"none" },
  filterSel:  { flex:1, minWidth:130, padding:"9px 10px", border:"1px solid #ddd", borderRadius:7, fontSize:13, fontFamily:"Georgia,serif", background:"#fff", outline:"none" },

  tableWrap:  { background:"#fff", borderRadius:10, boxShadow:"0 2px 8px rgba(0,0,0,0.07)", overflow:"auto" },
  table:      { width:"100%", borderCollapse:"collapse" },
  thead:      { background:"#0f2952" },
  th:         { color:"#fff", padding:"11px 14px", textAlign:"left", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:0.6, whiteSpace:"nowrap" },
  tr:         { borderBottom:"1px solid #f0f0f0", transition:"background 0.1s", background:"#fff" },
  td:         { padding:"11px 14px", fontSize:14, color:"#333", verticalAlign:"middle" },
  tdCenter:   { padding:"11px 14px", fontSize:14, color:"#333", textAlign:"center", verticalAlign:"middle" },
  tdRight:    { padding:"11px 14px", fontSize:14, color:"#333", textAlign:"right", verticalAlign:"middle" },
  tdActions:  { padding:"11px 14px", textAlign:"right", verticalAlign:"middle", whiteSpace:"nowrap" },
  empty:      { textAlign:"center", padding:40, color:"#999", fontSize:15, background:"#fff", borderRadius:10 },
  foot:       { color:"#888", fontSize:13, marginTop:10, textAlign:"right" },

  unitBadge:  { background:"#f0f4ff", color:"#1a4b8c", borderRadius:4, padding:"2px 8px", fontSize:12, fontWeight:600, fontFamily:"monospace" },
  officePill: { borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:600, whiteSpace:"nowrap" },
  viewOnly:   { fontSize:11, color:"#aaa", fontStyle:"italic" },
  youBadge:   { background:"#dbeafe", color:"#1e40af", borderRadius:10, padding:"1px 7px", fontSize:10, fontWeight:700, marginLeft:6 },
  pwMask:     { letterSpacing:2, color:"#aaa", fontSize:13 },

  btnPrimary:   { background:"#1a4b8c", color:"#fff", border:"none", borderRadius:7, padding:"9px 20px", cursor:"pointer", fontSize:14, fontWeight:600, fontFamily:"Georgia,serif", whiteSpace:"nowrap" },
  btnSecondary: { background:"#f0f0f0", color:"#444", border:"none", borderRadius:7, padding:"9px 20px", cursor:"pointer", fontSize:14, fontFamily:"Georgia,serif" },
  btnOutline:   { background:"#fff", color:"#1a4b8c", border:"1px solid #1a4b8c", borderRadius:7, padding:"9px 16px", cursor:"pointer", fontSize:13, fontFamily:"Georgia,serif", whiteSpace:"nowrap" },
  btnDanger:    { background:"#dc2626", color:"#fff", border:"none", borderRadius:7, padding:"9px 18px", cursor:"pointer", fontSize:14, fontFamily:"Georgia,serif" },
  btnEdit:      { background:"#e8f0fd", color:"#1a4b8c", border:"none", borderRadius:5, padding:"5px 12px", cursor:"pointer", fontSize:12, fontWeight:600 },
  btnDel:       { background:"#fef2f2", color:"#dc2626", border:"none", borderRadius:5, padding:"5px 12px", cursor:"pointer", fontSize:12, fontWeight:600 },
  linkBtn:      { background:"none", border:"none", color:"#1a4b8c", cursor:"pointer", fontSize:14, padding:0, textDecoration:"underline", fontFamily:"Georgia,serif", textAlign:"left" },

  pageHead:  { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 },
  pageTitle: { fontSize:22, fontWeight:700, color:"#0f2952", margin:"0 0 4px" },
  pageSub:   { fontSize:13, color:"#888", margin:0 },

  cardGrid:         { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 },
  officeCard:       { background:"#fff", borderRadius:10, padding:20, boxShadow:"0 2px 8px rgba(0,0,0,0.07)", borderTop:"4px solid #1a4b8c" },
  officeCardTop:    { display:"flex", gap:14, alignItems:"flex-start", marginBottom:14 },
  officeIcon:       { fontSize:32 },
  officeName:       { fontSize:16, fontWeight:700, color:"#0f2952", marginBottom:4 },
  officeMeta:       { fontSize:13, color:"#666" },
  officeMgr:        { fontSize:12, color:"#888", marginTop:3 },
  officeCardActions:{ display:"flex", gap:8, justifyContent:"flex-end" },

  formGrid:    { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"14px 18px", marginBottom:4 },
  field:       { display:"flex", flexDirection:"column", gap:6 },
  label:       { fontSize:12, fontWeight:600, color:"#555", textTransform:"uppercase", letterSpacing:0.5 },
  input:       { padding:"9px 12px", border:"1px solid #ddd", borderRadius:6, fontSize:14, fontFamily:"Georgia,serif", outline:"none" },
  select:      { padding:"9px 10px", border:"1px solid #ddd", borderRadius:6, fontSize:14, fontFamily:"Georgia,serif", background:"#fff", outline:"none" },
  textarea:    { padding:"9px 12px", border:"1px solid #ddd", borderRadius:6, fontSize:14, fontFamily:"Georgia,serif", resize:"vertical", outline:"none" },
  hint:        { fontSize:11, color:"#999", marginTop:2 },
  formActions: { display:"flex", justifyContent:"flex-end", gap:12, marginTop:20, paddingTop:16, borderTop:"1px solid #f0f0f0" },

  overlay:    { position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 },
  modal:      { background:"#fff", borderRadius:12, width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" },
  modalHead:  { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 24px 0" },
  modalTitle: { fontSize:18, fontWeight:700, color:"#0f2952", margin:0 },
  modalClose: { background:"none", border:"none", fontSize:18, cursor:"pointer", color:"#888" },
  modalBody:  { padding:"16px 24px 24px" },
  modalDesc:  { fontSize:13, color:"#666", marginBottom:16, marginTop:0 },

  detailGrid:     { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0 20px" },
  detailRow:      { padding:"11px 0", borderBottom:"1px solid #f3f3f3" },
  detailLabel:    { fontSize:11, fontWeight:600, color:"#999", textTransform:"uppercase", letterSpacing:0.5, marginBottom:3 },
  detailValue:    { fontSize:15, color:"#1a1a1a", fontWeight:500 },
  viewOnlyBanner: { background:"#fefce8", border:"1px solid #fde047", borderRadius:7, padding:"10px 14px", fontSize:13, color:"#854d0e", marginBottom:14 },

  toast: { position:"fixed", bottom:28, right:28, color:"#fff", borderRadius:8, padding:"12px 22px", fontSize:14, fontWeight:600, boxShadow:"0 4px 20px rgba(0,0,0,0.2)", zIndex:9999 },
};
