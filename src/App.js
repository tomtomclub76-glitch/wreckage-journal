import { useState, useEffect } from "react";

const SUPABASE_URL = "https://ezmvrevrhazvprumoryw.supabase.co";
const SUPABASE_KEY = "sb_publishable_RbjIHZX5Iz4XT_m09KZ9kQ_IlE4waad";

// ── AUTH ───────────────────────────────────────────────────────────────────
async function authSignUp(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: { "apikey": SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const d = await res.json();
  if (d.error) throw new Error(d.error.message || d.msg || "Signup failed");
  return d;
}

async function authSignIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "apikey": SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const d = await res.json();
  if (d.error || d.error_code) throw new Error(d.error_description || d.msg || "Sign in failed");
  return d;
}

async function authSignOut(token) {
  await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: "POST",
    headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${token}` }
  });
}

async function dbLoad(userId, mode, token) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/journal_entries?user_id=eq.${userId}&mode=eq.${mode}&order=updated_at.desc&limit=1`, {
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${token||SUPABASE_KEY}` }
    });
    const rows = await res.json();
    return rows?.[0]?.data || null;
  } catch(e) { return null; }
}

async function dbSave(userId, mode, data, token) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/journal_entries`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${token||SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
      },
      body: JSON.stringify({ user_id: userId, mode, page: "all", data, updated_at: new Date().toISOString() })
    });
    return res.ok;
  } catch(e) { return false; }
}

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&family=JetBrains+Mono:wght@300;400&display=swap');`;

const css = `
${FONTS}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0a0a08; --bg2: #111110; --bg3: #1a1a17;
  --border: #2a2a25; --border2: #3a3a33;
  --text: #e8e4d8; --text2: #9a9488; --text3: #7a7468;
  --gold: #d4a843; --gold2: #a07830;
  --red: #c0442a; --red2: #7a2a15;
  --green: #4a8a6a; --green2: #2a5a42;
}
body { background: var(--bg); color: var(--text); font-family: 'Crimson Pro', serif; }
textarea, input { font-family: 'Crimson Pro', serif; font-size: 1rem; color: var(--text); background: var(--bg2); border: 1px solid var(--border); padding: 0.6rem 0.8rem; width: 100%; outline: none; resize: vertical; transition: border-color 0.2s; line-height: 1.6; }
textarea:focus, input:focus { border-color: var(--border2); }
.mono { font-family: 'JetBrains Mono', monospace; }
.bebas { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.05em; }

/* SELECTOR */
.selector { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; gap: 2.5rem; background: var(--bg); }
.sel-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; letter-spacing: 0.25em; color: var(--text3); text-transform: uppercase; text-align: center; margin-bottom: 0.5rem; }
.sel-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(3rem, 10vw, 5.5rem); line-height: 0.9; text-align: center; letter-spacing: 0.04em; }
.sel-tag { font-style: italic; color: var(--text2); text-align: center; font-size: 1.05rem; }
.sel-cards { display: flex; gap: 1.25rem; flex-wrap: wrap; justify-content: center; }
.sel-card { width: 260px; padding: 1.75rem; background: var(--bg2); border: 1px solid var(--border); cursor: pointer; transition: transform 0.25s, border-color 0.25s; position: relative; overflow: hidden; }
.sel-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; opacity: 0; transition: opacity 0.25s; }
.sel-card:hover { transform: translateY(-4px); border-color: var(--border2); }
.sel-card:hover::after { opacity: 1; }
.sel-card.w::after { background: var(--gold); }
.sel-card.r::after { background: var(--red); }
.sel-card.b::after { background: linear-gradient(90deg, var(--gold), var(--red)); }
.card-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 0.5rem; }
.sel-card.w .card-eyebrow { color: var(--gold2); }
.sel-card.r .card-eyebrow { color: var(--red2); }
.sel-card.b .card-eyebrow { color: var(--text3); }
.card-name { font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem; line-height: 1; margin-bottom: 0.3rem; }
.sel-card.w .card-name { color: var(--gold); }
.sel-card.r .card-name { color: var(--red); }
.sel-card.b .card-name { background: linear-gradient(90deg, var(--gold), var(--red)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.card-sub { font-style: italic; color: var(--text3); font-size: 0.8rem; margin-bottom: 1rem; }
.card-body { color: var(--text2); font-size: 0.85rem; line-height: 1.55; }
.card-price { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; letter-spacing: 0.1em; color: var(--text3); margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border); }
.best-value { font-family: 'JetBrains Mono', monospace; font-size: 0.5rem; letter-spacing: 0.15em; text-transform: uppercase; padding: 0.15rem 0.5rem; background: var(--border); color: var(--text2); display: inline-block; margin-bottom: 0.5rem; }

/* LAYOUT */
.app-wrap { display: flex; flex-direction: column; min-height: 100vh; background: var(--bg); }

/* TOPBAR */
.topbar { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1.25rem; background: var(--bg2); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 20; }
.topbar-brand { font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; letter-spacing: 0.05em; flex: 1; }
.w-mode .topbar-brand { color: var(--gold); }
.r-mode .topbar-brand { color: var(--red); }
.topbar-sub { font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; letter-spacing: 0.15em; color: var(--text3); text-transform: uppercase; }
.back-btn { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; letter-spacing: 0.1em; background: none; border: 1px solid var(--border); color: var(--text3); padding: 0.35rem 0.7rem; cursor: pointer; text-transform: uppercase; transition: all 0.2s; }
.back-btn:hover { color: var(--text2); border-color: var(--border2); }
.toggle-wrap { display: flex; border: 1px solid var(--border); overflow: hidden; }
.toggle-btn { font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.35rem 0.7rem; cursor: pointer; background: none; border: none; color: var(--text3); transition: all 0.15s; white-space: nowrap; }
.toggle-btn.tw.active { background: var(--gold2); color: var(--gold); }
.toggle-btn.tr.active { background: var(--red2); color: var(--red); }

/* TAB NAV */
.tabnav { display: flex; overflow-x: auto; background: var(--bg2); border-bottom: 1px solid var(--border); padding: 0 0.5rem; gap: 0.1rem; scrollbar-width: none; }
.tabnav::-webkit-scrollbar { display: none; }
.tab { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase; padding: 0.7rem 0.9rem; cursor: pointer; color: var(--text3); border-bottom: 2px solid transparent; white-space: nowrap; transition: all 0.15s; background: none; border-top: none; border-left: none; border-right: none; }
.tab:hover { color: var(--text2); }
.w-mode .tab.active { color: var(--gold); border-bottom-color: var(--gold); }
.r-mode .tab.active { color: var(--red); border-bottom-color: var(--red); }

/* CONTENT */
.page { padding: 1.75rem 1.5rem 4rem; max-width: 780px; width: 100%; margin: 0 auto; }

/* PAGE HEADER */
.ph-eye { font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--text3); margin-bottom: 0.4rem; }
.ph-title { font-family: 'Bebas Neue', sans-serif; font-size: 2rem; letter-spacing: 0.04em; line-height: 1; margin-bottom: 0.3rem; }
.w-mode .ph-title { color: var(--gold); }
.r-mode .ph-title { color: var(--red); }
.ph-date { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: var(--text3); }
.page-header { padding-bottom: 1.25rem; border-bottom: 1px solid var(--border); margin-bottom: 1.75rem; }

/* SECTION */
.sec { margin-bottom: 1.75rem; }
.sec-label { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text3); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
.sec-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }
.field { margin-bottom: 0.9rem; }
.field-label { font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text3); display: block; margin-bottom: 0.35rem; }
.dump { min-height: 200px; background: var(--bg); border-style: dashed; }
.img-upload-area { border: 1px dashed var(--border); padding: 0.75rem; margin-top: 0.5rem; background: var(--bg); }
.img-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; }
.img-thumb { position: relative; width: 80px; height: 80px; }
.img-thumb img { width: 80px; height: 80px; object-fit: cover; border: 1px solid var(--border); display: block; }
.img-thumb-del { position: absolute; top: 2px; right: 2px; background: var(--bg); border: 1px solid var(--border); color: var(--text3); cursor: pointer; font-size: 0.7rem; line-height: 1; padding: 1px 4px; }
.img-upload-btn { font-family: "JetBrains Mono", monospace; font-size: 0.55rem; letter-spacing: 0.12em; text-transform: uppercase; background: none; border: 1px dashed var(--border); color: var(--text3); padding: 0.4rem 0.75rem; cursor: pointer; transition: all 0.2s; }
.img-upload-btn:hover { border-color: var(--border2); color: var(--text2); }

/* RATING */
.rating-wrap { display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap; }
.r-btn { width: 34px; height: 34px; background: var(--bg2); border: 1px solid var(--border); color: var(--text2); font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center; }
.r-btn:hover { border-color: var(--border2); }
.w-mode .r-btn.on { background: var(--gold2); border-color: var(--gold); color: var(--bg); }
.r-mode .r-btn.on { background: var(--red2); border-color: var(--red); color: var(--bg); }
.r-label { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: var(--text3); margin-left: 0.35rem; }

/* HABITS */
.habit-row { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.6rem; }
.habit-name-input { width: 120px; flex-shrink: 0; font-size: 0.85rem; padding: 0.35rem 0.5rem; }
.dots { display: flex; flex-wrap: wrap; gap: 3px; flex: 1; }
.dot { width: 16px; height: 16px; border-radius: 50%; border: 1px solid var(--border); background: var(--bg2); cursor: pointer; transition: all 0.1s; }
.w-mode .dot.on { background: var(--gold); border-color: var(--gold); }
.r-mode .dot.on { background: var(--red); border-color: var(--red); }

/* FINANCE */
.fin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
.fin-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.7rem; background: var(--bg2); border: 1px solid var(--border); }
.fin-label { font-size: 0.85rem; color: var(--text2); flex: 1; }
.fin-row input { width: 80px; flex-shrink: 0; text-align: right; padding: 0.25rem 0.4rem; font-size: 0.85rem; }
.net-box { padding: 0.6rem 0.8rem; background: var(--bg2); border: 1px solid var(--border); font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; margin-top: 0.5rem; }

/* PIPELINE */
.pipe-scroll { overflow-x: auto; }
.pipe-table { width: 100%; border-collapse: collapse; min-width: 500px; }
.pipe-table th { font-family: 'JetBrains Mono', monospace; font-size: 0.5rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text3); text-align: left; padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--border); }
.pipe-table td { padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--border); font-size: 0.85rem; }
.pipe-table td input { padding: 0.25rem 0.35rem; font-size: 0.8rem; }
.add-btn { font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; letter-spacing: 0.15em; text-transform: uppercase; background: none; border: 1px dashed var(--border); color: var(--text3); padding: 0.45rem 1rem; cursor: pointer; margin-top: 0.4rem; width: 100%; transition: all 0.2s; }
.add-btn:hover { border-color: var(--border2); color: var(--text2); }
.status { font-family: 'JetBrains Mono', monospace; font-size: 0.5rem; letter-spacing: 0.08em; padding: 0.15rem 0.4rem; cursor: pointer; border: 1px solid; white-space: nowrap; }
.s-active { color: var(--green); border-color: var(--green2); background: var(--green2); }
.s-pending { color: var(--gold); border-color: var(--gold2); background: var(--gold2); }
.s-stale { color: var(--red); border-color: var(--red2); background: var(--red2); }

/* AI PANEL */
.ai-wrap { background: var(--bg2); border: 1px solid var(--green2); padding: 1.25rem; margin-top: 1.5rem; position: relative; }
.ai-wrap::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--green2), var(--green), var(--green2)); }
.ai-head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.75rem; }
.ai-badge { font-family: 'JetBrains Mono', monospace; font-size: 0.5rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--green); background: var(--green2); padding: 0.15rem 0.45rem; }
.ai-title { font-family: 'Bebas Neue', sans-serif; font-size: 0.95rem; color: var(--green); letter-spacing: 0.05em; }
.ai-hint { font-style: italic; color: var(--text2); font-size: 0.85rem; margin-bottom: 0.75rem; line-height: 1.5; }
.ai-row { display: flex; gap: 0.6rem; }
.ai-row textarea { flex: 1; min-height: 65px; font-size: 0.9rem; }
.ai-go { font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; letter-spacing: 0.12em; text-transform: uppercase; background: var(--green2); border: 1px solid var(--green); color: var(--green); padding: 0 1rem; cursor: pointer; white-space: nowrap; transition: all 0.2s; flex-shrink: 0; }
.ai-go:hover { background: var(--green); color: var(--bg); }
.ai-go:disabled { opacity: 0.35; cursor: not-allowed; }
.ai-thinking { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: var(--green); margin-top: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
.dots-anim { display: flex; gap: 3px; }
.dots-anim span { width: 4px; height: 4px; background: var(--green); border-radius: 50%; animation: dp 1.2s ease infinite; }
.dots-anim span:nth-child(2) { animation-delay: 0.2s; }
.dots-anim span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dp { 0%,80%,100%{transform:scale(0.5);opacity:0.3} 40%{transform:scale(1);opacity:1} }
.ai-resp { margin-top: 1rem; padding: 1rem; background: var(--bg); border: 1px solid var(--border); font-size: 0.92rem; line-height: 1.75; white-space: pre-wrap; }

/* SAVE */
.save-bar { display: flex; justify-content: flex-end; align-items: center; gap: 1rem; margin-top: 2rem; padding-top: 1.25rem; border-top: 1px solid var(--border); }
.saved-msg { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: var(--green); }
.save-btn { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; padding: 0.65rem 1.75rem; cursor: pointer; border: 1px solid; background: transparent; transition: all 0.2s; }
.w-mode .save-btn { color: var(--gold); border-color: var(--gold); }
.w-mode .save-btn:hover { background: var(--gold); color: var(--bg); }
.r-mode .save-btn { color: var(--red); border-color: var(--red); }
.r-mode .save-btn:hover { background: var(--red); color: var(--bg); }

/* 2-col grid */
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; }
@media(max-width:600px){ .grid2,.grid3,.fin-grid { grid-template-columns: 1fr; } }

@keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
.page { animation: fadeUp 0.3s ease; }

/* AUTH SCREEN */
.auth-wrap { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; background: var(--bg); gap: 2rem; }
.auth-box { width: 100%; max-width: 380px; background: var(--bg2); border: 1px solid var(--border); padding: 2rem; position: relative; }
.auth-box::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--gold2), var(--gold), var(--gold2)); }
.auth-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; letter-spacing: 0.05em; color: var(--gold); margin-bottom: 0.25rem; }
.auth-sub { font-style: italic; color: var(--text3); font-size: 0.85rem; margin-bottom: 1.5rem; }
.auth-field { margin-bottom: 0.9rem; }
.auth-field label { font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text3); display: block; margin-bottom: 0.35rem; }
.auth-btn { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; letter-spacing: 0.18em; text-transform: uppercase; padding: 0.75rem; cursor: pointer; border: 1px solid var(--gold); background: transparent; color: var(--gold); width: 100%; margin-top: 0.5rem; transition: all 0.2s; }
.auth-btn:hover { background: var(--gold); color: var(--bg); }
.auth-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.auth-switch { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; letter-spacing: 0.1em; color: var(--text3); text-align: center; margin-top: 1.25rem; cursor: pointer; }
.auth-switch span { color: var(--gold); text-decoration: underline; cursor: pointer; }
.auth-err { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: var(--red); margin-top: 0.75rem; text-align: center; line-height: 1.5; }
.auth-brand { text-align: center; }
.auth-brand-title { font-family: 'Bebas Neue', sans-serif; font-size: 3rem; letter-spacing: 0.05em; line-height: 0.9; }
.auth-brand-tag { font-style: italic; color: var(--text3); font-size: 0.9rem; margin-top: 0.4rem; }
`;

const today = new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
const monthYear = new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"});
const season = ["Winter","Spring","Summer","Fall"][Math.floor((new Date().getMonth()/12)*4)];

async function callAI(system, user) {
  const res = await fetch("/api/claude", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system, messages:[{role:"user",content:user}] })
  });
  const d = await res.json();
  return d.content?.[0]?.text || "No response.";
}

function Rating({label, val, onChange}) {
  const labels = ["","rough","slow","steady","strong","on fire"];
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="rating-wrap">
        {[1,2,3,4,5].map(n=>(
          <button key={n} className={`r-btn ${val===n?"on":""}`} onClick={()=>onChange(n)}>{n}</button>
        ))}
        {val ? <span className="r-label">{labels[val]}</span> : null}
      </div>
    </div>
  );
}

function Habits({habits, setHabits}) {
  const toggle=(hi,di)=>setHabits(h=>h.map((x,i)=>i!==hi?x:{...x,days:x.days.map((d,j)=>j===di?!d:d)}));
  const rename=(i,n)=>setHabits(h=>h.map((x,j)=>j!==i?x:{...x,name:n}));
  return (
    <div>
      {habits.map((h,hi)=>(
        <div key={hi} className="habit-row">
          <input className="habit-name-input" type="text" value={h.name} onChange={e=>rename(hi,e.target.value)} placeholder={`Habit ${hi+1}`} />
          <div className="dots">
            {h.days.map((on,di)=>(
              <div key={di} className={`dot ${on?"on":""}`} onClick={()=>toggle(hi,di)} title={`Day ${di+1}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AIPanel({mode, context, hint, sys}) {
  const [q,setQ]=useState("");
  const [resp,setResp]=useState("");
  const [loading,setLoading]=useState(false);
  const run=async()=>{
    setLoading(true); setResp("");
    try {
      const msg = q.trim() ? `Journal context:\n${context}\n\nQuestion: ${q}` : `Journal context:\n${context}\n\nGive me a clarity report.`;
      setResp(await callAI(sys, msg));
    } catch(e) { setResp("Error reaching AI. Check connection."); }
    setLoading(false);
  };
  return (
    <div className="ai-wrap">
      <div className="ai-head">
        <span className="ai-badge">AI</span>
        <span className="ai-title">Clarity Engine</span>
      </div>
      <p className="ai-hint">{hint}</p>
      <div className="ai-row">
        <textarea value={q} onChange={e=>setQ(e.target.value)} placeholder="Ask anything, or leave blank for a clarity report..." rows={3} />
        <button className="ai-go" onClick={run} disabled={loading}>{loading?"...":"→ run"}</button>
      </div>
      {loading && <div className="ai-thinking"><div className="dots-anim"><span/><span/><span/></div>reading entries...</div>}
      {resp && <div className="ai-resp">{resp}</div>}
    </div>
  );
}

// ── PAGES ──────────────────────────────────────────────────────────────────
function ImageUpload({images, setImages}) {
  const [confirmImg, setConfirmImg] = useState(null);

  const handleFiles = (files) => {
    Array.from(files).forEach(file => {
      if(!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...(prev||[]), { src: e.target.result, name: file.name, id: Date.now()+Math.random() }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const delImg = (id) => setConfirmImg(id);
  const confirmDel = () => { setImages(prev => prev.filter(img => img.id !== confirmImg)); setConfirmImg(null); };

  return (
    <div className="img-upload-area"
      onDrop={handleDrop}
      onDragOver={e=>e.preventDefault()}
    >
      <div style={{display:"flex",alignItems:"center",gap:"0.75rem",flexWrap:"wrap"}}>
        <label style={{cursor:"pointer"}}>
          <span className="img-upload-btn">+ add image</span>
          <input type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>handleFiles(e.target.files)} />
        </label>
        <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:"0.5rem",color:"var(--text3)"}}>or drag & drop</span>
      </div>
      {images && images.length > 0 && (
        <div className="img-grid">
          {images.map(img=>(
            <div key={img.id} className="img-thumb">
              <img src={img.src} alt={img.name} title={img.name} />
              {confirmImg===img.id ? (
                <span style={{position:"absolute",top:2,right:2,display:"flex",gap:"2px"}}>
                  <button onClick={confirmDel} style={{background:"var(--red2)",border:"1px solid var(--red)",color:"var(--red)",fontFamily:"JetBrains Mono,monospace",fontSize:"0.45rem",padding:"1px 3px",cursor:"pointer"}}>yes</button>
                  <button onClick={()=>setConfirmImg(null)} style={{background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text3)",fontFamily:"JetBrains Mono,monospace",fontSize:"0.45rem",padding:"1px 3px",cursor:"pointer"}}>no</button>
                </span>
              ) : (
                <button className="img-thumb-del" onClick={()=>delImg(img.id)}>×</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DailyPage({mode,data,setData}) {
  const s=(k,v)=>setData(d=>({...d,daily:{...d.daily,[k]:v}}));
  const {intention,nonneg,dump,dayRating,prodRating,endNote}=data.daily;
  const sys = mode==="w"
    ? `You are the Clarity Engine inside The Wreckage Journal. Read the user's daily entry and surface patterns, connections, and honest reflection. Direct, not cheerleading. Under 250 words. Short paragraphs, no bullets unless asked.`
    : `You are the Clarity Engine inside the RECLAIM War Ledger. Read the daily execution log and surface what's moving, what's stalled, what needs attention. Tactical, direct, no fluff. Under 250 words.`;
  const ctx = `Intention: ${intention}\nNon-negotiables/MIT: ${nonneg}\nBrain dump: ${dump}\nDay rating: ${dayRating}/5\nProductivity: ${prodRating}/5\nEnd note: ${endNote}`;
  return (
    <div className="page">
      <div className="page-header">
        <div className="ph-eye">{mode==="w"?"The Wreckage Journal":"RECLAIM War Ledger"} — Daily</div>
        <div className="ph-title">{mode==="w"?"Today's Entry":"Execution Log"}</div>
        <div className="ph-date">{today}</div>
      </div>
      <div className="sec">
        <div className="sec-label">Morning</div>
        <div className="field"><label className="field-label">Today's intention — one line</label><input type="text" value={intention} onChange={e=>s("intention",e.target.value)} placeholder="What matters most today..." /></div>
        <div className="field"><label className="field-label">{mode==="w"?"Non-negotiables (1–3 things)":"Most Important Task (MIT)"}</label><textarea rows={3} value={nonneg} onChange={e=>s("nonneg",e.target.value)} placeholder={mode==="w"?"The things that must happen today...":"The one task that moves the needle..."} /></div>
      </div>
      <div className="sec">
        <div className="sec-label">{mode==="w"?"Brain Dump — The Grail Core":"Idea Capture + Execution Log"}</div>
        <div className="field">
          <label className="field-label">{mode==="w"?"Everything goes here. No rules.":"Ideas, observations, what happened, what moved."}</label>
          <textarea className="dump" value={dump} onChange={e=>s("dump",e.target.value)} placeholder={mode==="w"?"Dump everything. Ideas, lyrics, comedy bits, rants, observations, quotes, half-thoughts...":"Site updates, client notes, ideas, market observations, what shipped, what didn't..."} />
          <ImageUpload images={data.daily.images||[]} setImages={imgs=>setData(d=>({...d,daily:{...d.daily,images:typeof imgs==="function"?imgs(d.daily.images||[]):imgs}}))} />
        </div>
      </div>
      <div className="sec">
        <div className="sec-label">Evening</div>
        <Rating label="Rate the day" val={dayRating} onChange={v=>s("dayRating",v)} />
        <Rating label="Productivity" val={prodRating} onChange={v=>s("prodRating",v)} />
        <div className="field"><label className="field-label">One honest line — what actually happened</label><input type="text" value={endNote} onChange={e=>s("endNote",e.target.value)} placeholder="The real story of today..." /></div>
      </div>
      <AIPanel mode={mode} context={ctx} sys={sys} hint="Ask about today, or get a clarity report on your entries." />
    </div>
  );
}

function WeeklyPage({mode,data,setData}) {
  const s=(k,v)=>setData(d=>({...d,weekly:{...d.weekly,[k]:v}}));
  const {opener,focus,highPri,lowPri,rating,win,carry}=data.weekly;
  const sys = mode==="w"
    ? `You are the Clarity Engine for The Wreckage Journal weekly review. Surface patterns in energy, productivity, and creative momentum. Direct, honest, no hype. Under 200 words.`
    : `You are the Clarity Engine for the RECLAIM War Ledger weekly standup. Surface what's moving, what's slipping, and the priority for next week. Tactical and direct. Under 200 words.`;
  const ctx = `Week opener: ${opener}\nFocus/north star: ${focus}\nHigh priority: ${highPri}\nLow priority: ${lowPri}\nWeek rating: ${rating}/5\nWin: ${win}\nCarry forward: ${carry}`;
  return (
    <div className="page">
      <div className="page-header">
        <div className="ph-eye">{mode==="w"?"The Wreckage Journal":"RECLAIM War Ledger"} — Weekly</div>
        <div className="ph-title">{mode==="w"?"Weekly Review":"Weekly Standup"}</div>
        <div className="ph-date">{today}</div>
      </div>
      <div className="sec">
        <div className="sec-label">Week Opener</div>
        <div className="field"><label className="field-label">Brain state entering this week</label><textarea rows={4} value={opener} onChange={e=>s("opener",e.target.value)} placeholder="Where are you mentally heading into this week..." /></div>
        <div className="field"><label className="field-label">{mode==="w"?"Weekly focus — one north star":"Top 3 tasks that move money or rankings"}</label><textarea rows={3} value={focus} onChange={e=>s("focus",e.target.value)} placeholder={mode==="w"?"The one thing that matters most...":"The three things that actually move the needle..."} /></div>
      </div>
      <div className="sec">
        <div className="sec-label">Task Capture — kept separate from creative space</div>
        <div className="grid2">
          <div className="field"><label className="field-label">High priority — must do</label><textarea rows={5} value={highPri} onChange={e=>s("highPri",e.target.value)} placeholder="Must-dos..." /></div>
          <div className="field"><label className="field-label">Low priority — nice to do</label><textarea rows={5} value={lowPri} onChange={e=>s("lowPri",e.target.value)} placeholder="Nice-to-haves..." /></div>
        </div>
      </div>
      <div className="sec">
        <div className="sec-label">Week Closer</div>
        <Rating label="Rate the week" val={rating} onChange={v=>s("rating",v)} />
        <div className="field"><label className="field-label">One win this week</label><input type="text" value={win} onChange={e=>s("win",e.target.value)} placeholder="Something that moved..." /></div>
        <div className="field"><label className="field-label">Carry forward into next week</label><input type="text" value={carry} onChange={e=>s("carry",e.target.value)} placeholder="What follows you into next week..." /></div>
      </div>
      <AIPanel mode={mode} context={ctx} sys={sys} hint="What's the pattern this week? What am I avoiding? What should I carry forward?" />
    </div>
  );
}

function MonthlyPage({mode,data,setData}) {
  const s=(k,v)=>setData(d=>({...d,monthly:{...d.monthly,[k]:v}}));
  const m=data.monthly;
  return (
    <div className="page">
      <div className="page-header">
        <div className="ph-eye">{mode==="w"?"The Wreckage Journal":"RECLAIM War Ledger"} — Monthly</div>
        <div className="ph-title">Monthly Layer</div>
        <div className="ph-date">{monthYear}</div>
      </div>
      <div className="sec">
        <div className="sec-label">Month Opener</div>
        <div className="grid3">
          <div className="field"><label className="field-label">Mood — one word</label><input type="text" value={m.mood} onChange={e=>s("mood",e.target.value)} placeholder="Focused..." /></div>
          <div className="field"><label className="field-label">One intention</label><input type="text" value={m.intention} onChange={e=>s("intention",e.target.value)} placeholder="This month I will..." /></div>
          <div className="field"><label className="field-label">{mode==="w"?"Financial pulse":"Revenue target"}</label><input type="text" value={m.financePulse} onChange={e=>s("financePulse",e.target.value)} placeholder={mode==="w"?"Ahead/Behind/On track":"$..."} /></div>
        </div>
        <div className="field"><label className="field-label">3 non-negotiables this month</label><textarea rows={3} value={m.nonneg} onChange={e=>s("nonneg",e.target.value)} placeholder="The three things that must happen..." /></div>
      </div>
      <div className="sec">
        <div className="sec-label">Habit Tracker — {monthYear}</div>
        <Habits habits={m.habits} setHabits={h=>s("habits", typeof h==="function"?h(m.habits):h)} />
      </div>
      <div className="sec">
        <div className="sec-label">Month Closer</div>
        <div className="field"><label className="field-label">What worked?</label><textarea rows={3} value={m.worked} onChange={e=>s("worked",e.target.value)} placeholder="What moved this month..." /></div>
        <div className="field"><label className="field-label">What didn't?</label><textarea rows={3} value={m.didnt} onChange={e=>s("didnt",e.target.value)} placeholder="What stalled or fell away..." /></div>
      </div>
    </div>
  );
}

function SeasonalPage({mode,data,setData}) {
  const s=(k,v)=>setData(d=>({...d,seasonal:{...d.seasonal,[k]:v}}));
  const q=data.seasonal;
  const sys = mode==="w"
    ? `You are the Clarity Engine for The Wreckage Journal quarterly review. Compare what the user intended vs. what they wrote. Surface patterns, flag gaps, surface one thing to carry hard into next quarter. Direct, honest, under 300 words.`
    : `You are the Clarity Engine for the RECLAIM War Ledger quarterly war council. Compare strategic intentions vs. execution. Identify which bets paid off, what stalled, and the single most important move next quarter. Tactical, direct, under 300 words.`;
  const ctx = `Season opener:\nWhere I am: ${q.whereAm}\nWhere I want to be: ${q.whereBe}\nWhat needs to die: ${q.whatDie}\n${mode==="w"?`Goals — Personal: ${q.personal} | Creative: ${q.creative} | Financial: ${q.financial}`:`Revenue target: ${q.revenueTarget}\nTop 3 bets: ${q.topBets}\nKill: ${q.kill}`}\nReview:\nRose: ${q.rose} | Fell: ${q.fell} | Surprised: ${q.surprised} | Forward: ${q.forward} | Leaving: ${q.behind} | Proud: ${q.proud}`;
  return (
    <div className="page">
      <div className="page-header">
        <div className="ph-eye">{mode==="w"?"The Wreckage Journal":"RECLAIM War Ledger"} — Quarterly</div>
        <div className="ph-title">{season} Quarter</div>
        <div className="ph-date">{new Date().getFullYear()}</div>
      </div>
      <div className="sec">
        <div className="sec-label">Season Opener — 90 Day Vision</div>
        <div className="field"><label className="field-label">Where am I right now?</label><textarea rows={3} value={q.whereAm} onChange={e=>s("whereAm",e.target.value)} placeholder="Honest assessment..." /></div>
        <div className="field"><label className="field-label">Where do I want to be in 90 days?</label><textarea rows={3} value={q.whereBe} onChange={e=>s("whereBe",e.target.value)} placeholder="The target. Make it real." /></div>
        <div className="field"><label className="field-label">What needs to die?</label><textarea rows={2} value={q.whatDie} onChange={e=>s("whatDie",e.target.value)} placeholder="What gets buried this quarter..." /></div>
      </div>
      <div className="sec">
        <div className="sec-label">{mode==="w"?"Goal Buckets":"Strategic Bets"}</div>
        {mode==="w" ? (
          <div className="grid3">
            {[["personal","Personal"],["creative","Creative"],["financial","Financial"]].map(([k,l])=>(
              <div key={k} className="field"><label className="field-label">{l}</label><textarea rows={4} value={q[k]||""} onChange={e=>s(k,e.target.value)} placeholder={`${l} goals...`} /></div>
            ))}
          </div>
        ) : (
          <>
            <div className="field"><label className="field-label">Revenue target</label><input type="text" value={q.revenueTarget||""} onChange={e=>s("revenueTarget",e.target.value)} placeholder="$..." /></div>
            <div className="field"><label className="field-label">Top 3 bets this quarter</label><textarea rows={4} value={q.topBets||""} onChange={e=>s("topBets",e.target.value)} placeholder="Sites, clients, products..." /></div>
            <div className="field"><label className="field-label">One thing to kill</label><input type="text" value={q.kill||""} onChange={e=>s("kill",e.target.value)} placeholder="What gets cut..." /></div>
          </>
        )}
      </div>
      <div className="sec">
        <div className="sec-label">Season Closer — Quarterly Review</div>
        {[["rose","What rose to the top?"],["fell","What fell away?"],["surprised","What surprised me?"],["forward","Carrying forward..."],["behind","Leaving behind..."],["proud","One thing I'm proud of"]].map(([k,l])=>(
          <div key={k} className="field"><label className="field-label">{l}</label><textarea rows={2} value={q[k]} onChange={e=>s(k,e.target.value)} placeholder="..." /></div>
        ))}
      </div>
      <AIPanel mode={mode} context={ctx} sys={sys} hint="Compare my season opener to my closer. What's the real story of this quarter?" />
    </div>
  );
}

const INCOME_PRESETS = [
  "Local Digital Properties","AI Consulting","Digital Products","Freelance Work",
  "Coaching / Training","Content / Sponsorship","E-commerce","Real Estate",
  "Investments","Side Hustle","Day Job / Salary","Other"
];

function FinancePage({mode,data,setData}) {
  const s=(k,v)=>setData(d=>({...d,finance:{...d.finance,[k]:v}}));
  const f=data.finance;
  const sources = f.sources || [];
  const setSources = (v) => s("sources", typeof v==="function" ? v(sources) : v);
  const [showDropdown,setShowDropdown]=useState(false);
  const [customLabel,setCustomLabel]=useState("");

  const addSource=(label)=>{
    if(!label.trim()) return;
    setSources(prev=>[...prev,{label:label.trim(),amount:""}]);
    setShowDropdown(false);
    setCustomLabel("");
  };
  const updateAmt=(i,v)=>setSources(prev=>prev.map((src,j)=>j!==i?src:{...src,amount:v}));
  const [confirmSrc,setConfirmSrc]=useState(null);
  const removeSource=(i)=>setConfirmSrc(i);
  const confirmRemove=()=>{ setSources(prev=>prev.filter((_,j)=>j!==confirmSrc)); setConfirmSrc(null); };
  const total=sources.reduce((sum,src)=>sum+parseFloat(src.amount||0),0);
  const target=parseFloat(f.target||0);

  const wSys=`You are the financial clarity layer inside The Wreckage Journal. Simple money pulse check. Reflect it back honestly. Are they ahead or behind? What does their win and concern tell you? Under 150 words. Direct, no jargon.`;
  const rSys=`You are the financial clarity layer inside the RECLAIM War Ledger. Read the income sources and pulse check. Surface which source is strongest, whether the target is realistic, what the most important financial move is this week. Under 150 words. Tactical.`;
  const wCtx=`Money pulse:\nAhead or behind: ${f.pulse}\nWin: ${f.win}\nConcern: ${f.concern}`;
  const rCtx=`Income this month:\n${sources.map(src=>`${src.label}: $${src.amount}`).join("\n")}\nTotal: $${total}\nTarget: $${target}\nWin: ${f.win}\nConcern: ${f.concern}`;

  return (
    <div className="page">
      <div className="page-header">
        <div className="ph-eye">{mode==="w"?"The Wreckage Journal":"RECLAIM War Ledger"} — Money</div>
        <div className="ph-title">{mode==="w"?"Money Pulse":"Income Tracker"}</div>
        <div className="ph-date">{today}</div>
      </div>

      {mode==="w" ? (
        <>
          <div style={{fontStyle:"italic",color:"var(--text3)",fontSize:"0.9rem",marginBottom:"1.5rem",lineHeight:"1.6"}}>
            Three fields. No spreadsheet. Just honest awareness of where you stand with money this week.
          </div>
          <div className="sec">
            <div className="sec-label">Weekly Pulse</div>
            <div className="field">
              <label className="field-label">Am I ahead or behind this month?</label>
              <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
                {["Ahead","On Track","Behind"].map(opt=>(
                  <button key={opt} onClick={()=>s("pulse",opt)} style={{
                    fontFamily:"JetBrains Mono,monospace",fontSize:"0.65rem",letterSpacing:"0.12em",
                    textTransform:"uppercase",padding:"0.5rem 1rem",cursor:"pointer",border:"1px solid",
                    background:f.pulse===opt?"var(--gold2)":"var(--bg2)",
                    borderColor:f.pulse===opt?"var(--gold)":"var(--border)",
                    color:f.pulse===opt?"var(--gold)":"var(--text3)",transition:"all 0.15s"
                  }}>{opt}</button>
                ))}
              </div>
            </div>
            <div className="field"><label className="field-label">One money win this week</label><input type="text" value={f.win||""} onChange={e=>s("win",e.target.value)} placeholder="Something that moved in the right direction..." /></div>
            <div className="field"><label className="field-label">One money concern this week</label><input type="text" value={f.concern||""} onChange={e=>s("concern",e.target.value)} placeholder="Something worth watching..." /></div>
          </div>
          <div style={{fontFamily:"JetBrains Mono,monospace",fontSize:"0.55rem",color:"var(--text3)",lineHeight:"1.6",padding:"0.75rem",border:"1px solid var(--border)",marginBottom:"1.5rem"}}>
            NOTE — This is a pulse check, not an accounting system. For actual numbers use Wave or QuickBooks.
          </div>
        </>
      ) : (
        <>
          <div style={{fontStyle:"italic",color:"var(--text3)",fontSize:"0.9rem",marginBottom:"1.5rem",lineHeight:"1.6"}}>
            Add your income sources for this month. Pick from the list or type your own. Skip what does not apply. Keep your real books in Wave or QuickBooks.
          </div>
          <div className="sec">
            <div className="sec-label">Where My Money Came From This Month</div>

            {sources.length > 0 && (
              <div style={{marginBottom:"0.75rem"}}>
                {sources.map((src,i)=>(
                  <div key={i} className="fin-row" style={{marginBottom:"0.4rem",gap:"0.5rem"}}>
                    <span className="fin-label" style={{fontWeight:500}}>{src.label}</span>
                    <input type="number" value={src.amount} onChange={e=>updateAmt(i,e.target.value)} placeholder="0" style={{width:"90px",flexShrink:0}} />
                    {confirmSrc===i ? (
                      <span style={{display:"flex",gap:"0.3rem",alignItems:"center",flexShrink:0}}>
                        <button onClick={confirmRemove} style={{background:"var(--red2)",border:"1px solid var(--red)",color:"var(--red)",fontFamily:"JetBrains Mono,monospace",fontSize:"0.5rem",padding:"0.2rem 0.4rem",cursor:"pointer",letterSpacing:"0.1em"}}>yes</button>
                        <button onClick={()=>setConfirmSrc(null)} style={{background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text3)",fontFamily:"JetBrains Mono,monospace",fontSize:"0.5rem",padding:"0.2rem 0.4rem",cursor:"pointer",letterSpacing:"0.1em"}}>no</button>
                      </span>
                    ) : (
                      <button onClick={()=>removeSource(i)} style={{background:"none",border:"none",color:"var(--text3)",cursor:"pointer",fontSize:"1.1rem",padding:"0 0.3rem",lineHeight:1,flexShrink:0}}>×</button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {sources.length > 0 && (
              <div className="fin-row" style={{marginBottom:"0.75rem"}}>
                <span className="fin-label">Monthly Target ($)</span>
                <input type="number" value={f.target||""} onChange={e=>s("target",e.target.value)} placeholder="0" style={{width:"90px"}} />
              </div>
            )}

            {target > 0 && sources.length > 0 && (
              <div className="net-box" style={{marginBottom:"0.75rem"}}>
                <span style={{color:"var(--text3)"}}>Total vs Target: </span>
                <span style={{color:total>=target?"var(--green)":"var(--red)"}}>
                  ${total.toLocaleString()} / ${target.toLocaleString()}
                </span>
              </div>
            )}

            <div style={{position:"relative"}}>
              <button className="add-btn" onClick={()=>setShowDropdown(!showDropdown)}>+ add income source</button>
              {showDropdown && (
                <div style={{position:"absolute",top:"100%",left:0,right:0,background:"var(--bg2)",border:"1px solid var(--border2)",zIndex:50,maxHeight:"260px",overflowY:"auto",boxShadow:"0 8px 24px rgba(0,0,0,0.4)"}}>
                  {INCOME_PRESETS.filter(p=>!sources.find(src=>src.label===p)).map(preset=>(
                    <div key={preset} onClick={()=>addSource(preset)}
                      style={{padding:"0.6rem 0.9rem",cursor:"pointer",fontSize:"0.85rem",color:"var(--text2)",borderBottom:"1px solid var(--border)",transition:"background 0.1s"}}
                      onMouseEnter={e=>e.currentTarget.style.background="var(--bg3)"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      {preset}
                    </div>
                  ))}
                  <div style={{padding:"0.5rem 0.9rem",borderTop:"1px solid var(--border2)",background:"var(--bg3)"}}>
                    <input
                      type="text"
                      value={customLabel}
                      onChange={e=>setCustomLabel(e.target.value)}
                      onKeyDown={e=>{ if(e.key==="Enter") addSource(customLabel); }}
                      placeholder="Custom — press Enter to add"
                      style={{fontSize:"0.85rem",padding:"0.35rem 0.5rem"}}
                      autoFocus
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="sec">
            <div className="sec-label">Pulse Check</div>
            <div className="field"><label className="field-label">One money win this week</label><input type="text" value={f.win||""} onChange={e=>s("win",e.target.value)} placeholder="Something that moved..." /></div>
            <div className="field"><label className="field-label">One money concern this week</label><input type="text" value={f.concern||""} onChange={e=>s("concern",e.target.value)} placeholder="Something worth watching..." /></div>
          </div>
          <div style={{fontFamily:"JetBrains Mono,monospace",fontSize:"0.55rem",color:"var(--text3)",lineHeight:"1.6",padding:"0.75rem",border:"1px solid var(--border)",marginBottom:"1.5rem"}}>
            NOTE — Manually entered. Always verify against your actual accounting records. Awareness tool, not a ledger.
          </div>
        </>
      )}
      <AIPanel mode={mode} context={mode==="w"?wCtx:rCtx} sys={mode==="w"?wSys:rSys} hint={mode==="w"?"How does my money pulse look?":"Which source is strongest? What is the most important financial move this week?"} />
    </div>
  );
}

function PipelinePage({data,setData}) {
  const s=(k,v)=>setData(d=>({...d,pipeline:{...d.pipeline,[k]:v}}));
  const p=data.pipeline;
  const statuses=["active","pending","stale"];
  const upd=(i,f,v)=>s("renters",p.renters.map((r,j)=>j!==i?r:{...r,[f]:v}));
  const cyc=(i)=>{const cur=p.renters[i].status;s("renters",p.renters.map((r,j)=>j!==i?r:{...r,status:statuses[(statuses.indexOf(cur)+1)%3]}));};
  const add=()=>s("renters",[...p.renters,{site:"",prospect:"",status:"pending",lastContact:"",rate:""}]);
  const [confirmDel,setConfirmDel]=useState(null);
  const del=(i)=>setConfirmDel(i);
  const confirmDelete=()=>{ s("renters",p.renters.filter((_,j)=>j!==confirmDel)); setConfirmDel(null); };
  const ctx=`Business partnership pipeline: ${JSON.stringify(p.renters)}`;
  const sys=`You are the Clarity Engine for the RECLAIM War Ledger pipeline. Read the deal data and surface: stale deals needing attention, which opportunities are converting, where the next revenue comes from, what to do this week. Under 200 words.`;
  return (
    <div className="page">
      <div className="page-header">
        <div className="ph-eye">RECLAIM War Ledger — Pipeline</div>
        <div className="ph-title">Pitch & Deal Tracker</div>
        <div className="ph-date">{today}</div>
      </div>
      <div className="sec">
        <div className="sec-label">Local Business Partnerships</div>
        <div className="pipe-scroll">
          <table className="pipe-table">
            <thead><tr><th>Site / Niche</th><th>Prospect</th><th>Status</th><th>Last Contact</th><th>$/mo</th><th></th></tr></thead>
            <tbody>
              {p.renters.map((r,i)=>(
                <tr key={i}>
                  <td><input type="text" value={r.site} onChange={e=>upd(i,"site",e.target.value)} placeholder="site.com" /></td>
                  <td><input type="text" value={r.prospect} onChange={e=>upd(i,"prospect",e.target.value)} placeholder="Business name" /></td>
                  <td><span className={`status s-${r.status}`} onClick={()=>cyc(i)}>{r.status}</span></td>
                  <td><input type="text" value={r.lastContact} onChange={e=>upd(i,"lastContact",e.target.value)} placeholder="MM/DD/YY" /></td>
                  <td><input type="number" value={r.rate} onChange={e=>upd(i,"rate",e.target.value)} placeholder="300" /></td>
                  <td>
                    {confirmDel===i ? (
                      <span style={{display:"flex",gap:"0.3rem",alignItems:"center"}}>
                        <button onClick={confirmDelete} style={{background:"var(--red2)",border:"1px solid var(--red)",color:"var(--red)",fontFamily:"JetBrains Mono,monospace",fontSize:"0.5rem",padding:"0.2rem 0.4rem",cursor:"pointer",letterSpacing:"0.1em"}}>yes</button>
                        <button onClick={()=>setConfirmDel(null)} style={{background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text3)",fontFamily:"JetBrains Mono,monospace",fontSize:"0.5rem",padding:"0.2rem 0.4rem",cursor:"pointer",letterSpacing:"0.1em"}}>no</button>
                      </span>
                    ) : (
                      <button onClick={()=>del(i)} style={{background:"none",border:"none",color:"var(--text3)",cursor:"pointer",fontSize:"1rem",padding:"0.25rem 0.5rem",lineHeight:1}} title="Remove row">×</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="add-btn" onClick={add}>+ add prospect</button>
      </div>
      <AIPanel mode="r" context={ctx} sys={sys} hint="What's stale? Where's the next close? What do I do this week?" />
    </div>
  );
}

function VaultPage({mode,data,setData}) {
  const s=(k,v)=>setData(d=>({...d,vault:{...d.vault,[k]:v}}));
  const sys = mode==="w"
    ? `You are the Clarity Engine reading the user's unfiltered brain vault. Surface: the 3 ideas with the most energy, unexpected connections between ideas, one idea worth developing. Be specific. Under 250 words.`
    : `You are the Clarity Engine reading the RECLAIM idea vault. Surface: business ideas worth pursuing, niche opportunities that keep appearing, one connection the user might have missed. Under 250 words.`;
  return (
    <div className="page">
      <div className="page-header">
        <div className="ph-eye">{mode==="w"?"The Wreckage Journal":"RECLAIM War Ledger"} — Vault</div>
        <div className="ph-title">{mode==="w"?"Brain Vault":"Idea Vault"}</div>
        <div className="ph-date">No rules. No prompts.</div>
      </div>
      <p style={{fontStyle:"italic",color:"var(--text3)",fontSize:"0.9rem",marginBottom:"1.25rem",lineHeight:"1.6"}}>
        {mode==="w"
          ? "Your most unfiltered space. Manifesto writing, 5-year vision, song lyrics, comedy set notes, random pages. The AI only reads this when you ask."
          : "Business ideas, niche expansions, product concepts, partnership angles. The Grail layer of the War Ledger."}
      </p>
      <div className="field">
        <textarea className="dump" style={{minHeight:"300px"}} value={data.vault.dump} onChange={e=>s("dump",e.target.value)} placeholder={mode==="w"?"Write anything. Everything goes here...":"Every idea, observation, expansion thought..."} />
        <ImageUpload images={data.vault.images||[]} setImages={imgs=>setData(d=>({...d,vault:{...d.vault,images:typeof imgs==="function"?imgs(d.vault.images||[]):imgs}}))} />
      </div>
      <AIPanel mode={mode} context={`Vault:\n${data.vault.dump}`} sys={sys} hint="What ideas have the most energy? Surface something I'm missing." />
    </div>
  );
}

// ── INIT STATE ─────────────────────────────────────────────────────────────
const initData = () => ({
  daily:{intention:"",nonneg:"",dump:"",dayRating:0,prodRating:0,endNote:""},
  weekly:{opener:"",focus:"",highPri:"",lowPri:"",rating:0,win:"",carry:""},
  monthly:{mood:"",intention:"",financePulse:"",nonneg:"",worked:"",didnt:"",
    habits:[{name:"",days:Array(31).fill(false)},{name:"",days:Array(31).fill(false)},{name:"",days:Array(31).fill(false)}]},
  seasonal:{whereAm:"",whereBe:"",whatDie:"",personal:"",creative:"",financial:"",revenueTarget:"",topBets:"",kill:"",rose:"",fell:"",surprised:"",forward:"",behind:"",proud:""},
  finance:{pulse:"",win:"",concern:"",target:"",sources:[]},
  pipeline:{
    renters:[{site:"georgetowntxjiujitsu.com",prospect:"10th Planet Georgetown",status:"pending",lastContact:"",rate:"300"}]
  },
  vault:{dump:""}
});

const wTabs=[{id:"daily",label:"Today's Entry"},{id:"weekly",label:"Weekly Review"},{id:"monthly",label:"Monthly"},{id:"seasonal",label:"Quarterly"},{id:"finance",label:"Money Pulse"},{id:"vault",label:"Brain Vault"}];
const rTabs=[{id:"daily",label:"Execution Log"},{id:"weekly",label:"Weekly Standup"},{id:"monthly",label:"Monthly"},{id:"seasonal",label:"War Council"},{id:"pipeline",label:"Pipeline"},{id:"finance",label:"War Chest"},{id:"vault",label:"Idea Vault"}];

// ── AUTH SCREEN ────────────────────────────────────────────────────────────
function AuthScreen({onAuth}) {
  const [isLogin,setIsLogin]=useState(true);
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const handle=async()=>{
    setError(""); setLoading(true);
    try {
      let result;
      if(isLogin) {
        result = await authSignIn(email, password);
      } else {
        result = await authSignUp(email, password);
        if(result.user && !result.access_token) {
          setError("Account created! Please sign in."); setIsLogin(true); setLoading(false); return;
        }
      }
      if(result.access_token) {
        localStorage.setItem("jrnl_token", result.access_token);
        localStorage.setItem("jrnl_uid", result.user.id);
        onAuth(result.user.id, result.access_token);
      }
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <>
      <style>{css}</style>
      <div className="auth-wrap">
        <div className="auth-brand">
          <div className="auth-brand-title" style={{background:"linear-gradient(90deg, var(--gold), var(--red))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",fontSize:"clamp(2.5rem,8vw,4.5rem)"}}>THE WRECKAGE JOURNAL</div>
          <div className="auth-brand-tag" style={{fontSize:"1.2rem",marginTop:"0.5rem"}}>Chaos in, clarity out.</div>
        </div>
        <div className="auth-box">
          <div className="auth-title">{isLogin ? "Sign In" : "Create Account"}</div>
          <div className="auth-sub">{isLogin ? "Welcome back." : "Start your journal."}</div>
          <div className="auth-field">
            <label>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="you@email.com" autoFocus />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="••••••••" />
          </div>
          {error && <div className="auth-err">{error}</div>}
          <button className="auth-btn" onClick={handle} disabled={loading||!email||!password}>
            {loading ? "..." : isLogin ? "Sign In" : "Create Account"}
          </button>
          <div className="auth-switch">
            {isLogin ? <>No account? <span onClick={()=>{setIsLogin(false);setError("");}}>Sign up free</span></> : <>Have an account? <span onClick={()=>{setIsLogin(true);setError("");}}>Sign in</span></>}
          </div>
        </div>
      </div>
    </>
  );
}

// ── APP ────────────────────────────────────────────────────────────────────
export default function App() {
  const [user,setUser]=useState(null);
  const [authChecked,setAuthChecked]=useState(false);

  useEffect(()=>{
    const uid=localStorage.getItem("jrnl_uid");
    const token=localStorage.getItem("jrnl_token");
    if(uid&&token){ setUser({id:uid,token}); }
    setAuthChecked(true);
  },[]);
  const [mode,setMode]=useState(null);
  const [activeMode,setActiveMode]=useState("w");
  const [page,setPage]=useState("daily");
  const [dataW,setDataW]=useState(initData());
  const [dataR,setDataR]=useState(initData());
  const [saved,setSaved]=useState(false);
  const [saving,setSaving]=useState(false);
  const [dbLoading,setDbLoading]=useState(false);

  const handleAuth=(uid,token)=>setUser({id:uid,token});
  const handleSignOut=async()=>{
    if(user?.token) await authSignOut(user.token);
    localStorage.removeItem("jrnl_token");
    localStorage.removeItem("jrnl_uid");
    setUser(null); setMode(null);
  };

  const isBundle = mode==="b";
  const curMode = isBundle ? activeMode : mode;
  const data = curMode==="w" ? dataW : dataR;
  const setData = curMode==="w" ? setDataW : setDataR;

  useEffect(()=>{
    if(!mode||!user) return;
    setDbLoading(true);
    Promise.all([dbLoad(user.id,"w",user.token), dbLoad(user.id,"r",user.token)]).then(([dw,dr])=>{
      if(dw) setDataW(dw); else setDataW(initData());
      if(dr) setDataR(dr); else setDataR(initData());
      setDbLoading(false);
    });
  },[mode,user]);

  const save=async()=>{
    setSaving(true);
    await Promise.all([dbSave(user.id,"w",dataW,user.token), dbSave(user.id,"r",dataR,user.token)]);
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),2500);
  };

  if(!authChecked) return null;
  if(!user) return <AuthScreen onAuth={handleAuth}/>;

  const renderPage=()=>{
    if(page==="daily") return <DailyPage mode={curMode} data={data} setData={setData}/>;
    if(page==="weekly") return <WeeklyPage mode={curMode} data={data} setData={setData}/>;
    if(page==="monthly") return <MonthlyPage mode={curMode} data={data} setData={setData}/>;
    if(page==="seasonal") return <SeasonalPage mode={curMode} data={data} setData={setData}/>;
    if(page==="finance") return <FinancePage mode={curMode} data={data} setData={setData}/>;
    if(page==="pipeline") return <PipelinePage data={data} setData={setData}/>;
    if(page==="vault") return <VaultPage mode={curMode} data={data} setData={setData}/>;
    return null;
  };

  // Auto-launch into Wreckage Journal
  useEffect(()=>{ if(user && !mode){ setMode("w"); setActiveMode("w"); setPage("daily"); } },[user]);

  const tabs = wTabs;

  return (
    <>
      <style>{css}</style>
      <div className={`app-wrap ${curMode==="w"?"w-mode":"r-mode"}`}>
        <div className="topbar">
          <div style={{flex:1}}>
            <div className="topbar-sub">A Thinking Partner</div>
            <div className="topbar-brand">The Wreckage Journal</div>
          </div>

          <div style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
            <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:"0.5rem",color:"var(--text3)"}}>{user?.id?.slice(0,8)}</span>
            <button className="back-btn" onClick={()=>setMode(null)}>← back</button>
            <button className="back-btn" onClick={handleSignOut} style={{borderColor:"var(--red2)",color:"var(--red2)"}}>sign out</button>
          </div>
        </div>
        <div className="tabnav">
          {tabs.map(t=>(
            <button key={t.id} className={`tab ${page===t.id?"active":""}`} onClick={()=>setPage(t.id)}>{t.label}</button>
          ))}
        </div>
        <div style={{flex:1, overflowY:"auto"}}>
          {renderPage()}
          <div className="save-bar" style={{padding:"0 1.5rem 2rem"}}>
            {saved && <span className="saved-msg">✓ saved to cloud</span>}
            {dbLoading && <span className="saved-msg" style={{color:"var(--text3)"}}>loading entries...</span>}
            <button className="save-btn" onClick={save} disabled={saving}>{saving?"saving...":"Save Entry"}</button>
          </div>
        </div>
      </div>
    </>
  );
}
