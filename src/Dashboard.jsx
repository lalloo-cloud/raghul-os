import React, { useState, useEffect } from 'react';

const SUBJECTS = ['MATH', 'PHYSICS', 'CYBERSECURITY', 'ARCHITECTURE OF GLOBAL POWER'];
const SESSIONS = ['NY AM', 'NY PM', 'LONDON', 'ASIA'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getDateKey = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Vancouver' }).format(d);
};

const getCurrentSession = () => {
  const now = new Date();
  const ptStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Vancouver',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(now);
  const [h, m] = ptStr.split(':').map(Number);
  const mins = h * 60 + m;
  if (mins >= 5 * 60 + 30 && mins < 8 * 60)  return { name: 'NY AM',  color: '#00ff41' };
  if (mins >= 10 * 60 + 30 && mins < 13 * 60) return { name: 'NY PM',  color: '#00ff41' };
  if (mins >= 16 * 60 && mins < 19 * 60)      return { name: 'ASIA',   color: '#00ccff' };
  if (mins >= 23 * 60 || mins < 2 * 60)       return { name: 'LONDON', color: '#ff9500' };
  return { name: 'CLOSED', color: '#444' };
};

const calcSleepHours = (sleep, wake) => {
  const [sh, sm] = sleep.split(':').map(Number);
  const [wh, wm] = wake.split(':').map(Number);
  let sMins = sh * 60 + sm;
  let wMins = wh * 60 + wm;
  if (wMins <= sMins) wMins += 1440;
  const diff = wMins - sMins;
  const hrs = Math.floor(diff / 60);
  const mins = diff % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
};

const addFiveHours = (start) => {
  const [h, m] = start.split(':').map(Number);
  const total = h * 60 + m + 300;
  return `${Math.floor(total / 60) % 24}`.padStart(2, '0') + ':' + `${total % 60}`.padStart(2, '0');
};

// ─── TimePicker ───────────────────────────────────────────────────────────────

function TimePicker({ val, onChange }) {
  return (
    <select value={val} onChange={e => onChange(e.target.value)}
      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', borderRadius: '10px', padding: '8px 12px', fontSize: '14px', fontWeight: '600', outline: 'none', cursor: 'pointer' }}>
      {Array.from({ length: 96 }).map((_, i) => {
        const h = Math.floor(i / 4).toString().padStart(2, '0');
        const m = ((i % 4) * 15).toString().padStart(2, '0');
        const t = `${h}:${m}`;
        return <option key={t} value={t} style={{ background: '#111' }}>{t}</option>;
      })}
    </select>
  );
}

// ─── BlockRow (read-only display) ─────────────────────────────────────────────

function BlockRow({ color, label, time }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 15px', background: `${color}0a`, border: `1px dashed ${color}33`, borderRadius: '13px', marginBottom: '8px' }}>
      <span style={{ fontSize: '12px', fontWeight: '800', color, letterSpacing: '1px' }}>{label}</span>
      <span style={{ fontSize: '12px', color, opacity: 0.65 }}>{time}</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [time, setTime] = useState('');
  const [activeTab, setActiveTab] = useState('TODAY');
  const [session, setSession] = useState(getCurrentSession());

  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('raghul_os_v20');
      return saved ? JSON.parse(saved) : { recovery: { sleep: '23:00', wake: '07:30' }, trading: { preferredSession: 'NY AM' }, schedule: {} };
    } catch {
      return { recovery: { sleep: '23:00', wake: '07:30' }, trading: { preferredSession: 'NY AM' }, schedule: {} };
    }
  });

  useEffect(() => { localStorage.setItem('raghul_os_v20', JSON.stringify(data)); }, [data]);

  useEffect(() => {
    const tick = () => { setTime(new Date().toLocaleTimeString([], { hour12: false })); setSession(getCurrentSession()); };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const todayKey    = getDateKey(0);
  const tomorrowKey = getDateKey(1);
  const emptyDay    = { dayType: 'HOLIDAY', blocks: [], workBlock: null, tripBlock: null };
  const todayData    = data.schedule[todayKey]    || emptyDay;
  const tomorrowData = data.schedule[tomorrowKey] || emptyDay;

  const updateSchedule = (key, updates) =>
    setData(prev => ({ ...prev, schedule: { ...prev.schedule, [key]: { ...(prev.schedule[key] || emptyDay), ...updates } } }));

  const updateTomorrow = (u) => updateSchedule(tomorrowKey, u);
  const addBlock = (dur) => updateTomorrow({ blocks: [...tomorrowData.blocks, { id: Date.now(), subject: 'PHYSICS', duration: dur }] });
  const updateBlock = (id, field, val) => updateTomorrow({ blocks: tomorrowData.blocks.map(b => b.id === id ? { ...b, [field]: val } : b) });
  const removeBlock = (id) => updateTomorrow({ blocks: tomorrowData.blocks.filter(b => b.id !== id) });

  const sleepHours = calcSleepHours(data.recovery.sleep, data.recovery.wake);

  // ── Shared style tokens ──
  const glass = { background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', borderRadius: '20px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '12px', position: 'relative', overflow: 'hidden' };
  const lbl   = { fontSize: '9px', color: '#444', letterSpacing: '2.5px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '14px', display: 'block' };
  const chip  = (active, color = '#00ff41') => ({ padding: '9px 16px', borderRadius: '10px', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', border: `1px solid ${active ? color + '55' : '#1a1a1a'}`, background: active ? color + '18' : 'transparent', color: active ? color : '#333', cursor: 'pointer', transition: '0.2s' });
  const actBtn= (color = '#00ff41') => ({ flex: 1, background: 'transparent', color, border: `1px solid ${color}22`, padding: '13px', borderRadius: '14px', fontSize: '10px', fontWeight: '800', letterSpacing: '1.5px', cursor: 'pointer' });

  return (
    <div style={{ backgroundColor: '#000', color: 'white', minHeight: '100vh', padding: '24px 18px 48px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', maxWidth: '480px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div style={{ fontSize: '38px', fontWeight: '800', letterSpacing: '-1.5px', fontVariantNumeric: 'tabular-nums' }}>{time}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: session.color, boxShadow: `0 0 10px ${session.color}` }} />
          <span style={{ fontSize: '10px', color: session.color, fontWeight: '800', letterSpacing: '1.5px' }}>{session.name}</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '4px' }}>
        {['TODAY', 'TOMORROW', 'TRADING'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '10px 4px', borderRadius: '11px', fontSize: '10px', fontWeight: '800', letterSpacing: '1.5px', border: 'none', cursor: 'pointer', transition: '0.2s', background: activeTab === t ? 'rgba(255,255,255,0.09)' : 'transparent', color: activeTab === t ? '#00ff41' : '#333' }}>
            {t}
          </button>
        ))}
      </div>

      {/* ── TODAY ─────────────────────────────────────────────────────────── */}
      {activeTab === 'TODAY' && <>

        <div style={glass}>
          <span style={lbl}>TODAY'S SCHEDULE</span>

          {todayData.dayType === 'SCHOOL' && <BlockRow color="#ff4b4b" label="SCHOOL" time="08:00 — 15:30" />}
          {todayData.workBlock && <BlockRow color="#ff9500" label="WORK" time={`${todayData.workBlock.start} — ${addFiveHours(todayData.workBlock.start)}`} />}
          {todayData.tripBlock && <BlockRow color="#00ccff" label="TRIP" time={`${todayData.tripBlock.start} — ${addFiveHours(todayData.tripBlock.start)}`} />}

          {todayData.blocks.map(block => (
            <div key={block.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 15px', background: 'rgba(0,255,65,0.04)', border: '1px solid rgba(0,255,65,0.1)', borderRadius: '13px', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700' }}>{block.subject}</div>
                <div style={{ fontSize: '10px', color: '#00ff41', marginTop: '3px', letterSpacing: '1px' }}>{block.duration} MIN</div>
              </div>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00ff41', opacity: 0.5 }} />
            </div>
          ))}

          {todayData.blocks.length === 0 && !todayData.workBlock && !todayData.tripBlock && todayData.dayType !== 'SCHOOL' && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#222', fontSize: '11px', letterSpacing: '2px' }}>
              NOTHING PLANNED — ADD BLOCKS IN TOMORROW
            </div>
          )}
        </div>

        {/* Recovery Log */}
        <div style={glass}>
          <span style={lbl}>RECOVERY LOG</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#00ff41', letterSpacing: '-1px', lineHeight: 1 }}>{sleepHours}</div>
              <div style={{ fontSize: '9px', color: '#333', letterSpacing: '2px', marginTop: '5px' }}>SLEEP</div>
            </div>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ ...lbl, marginBottom: '8px' }}>SLEEP TIME</div>
                <TimePicker val={data.recovery.sleep} onChange={t => setData(p => ({ ...p, recovery: { ...p.recovery, sleep: t } }))} />
              </div>
              <div>
                <div style={{ ...lbl, marginBottom: '8px' }}>WAKE TIME</div>
                <TimePicker val={data.recovery.wake} onChange={t => setData(p => ({ ...p, recovery: { ...p.recovery, wake: t } }))} />
              </div>
            </div>
          </div>
        </div>
      </>}

      {/* ── TOMORROW ──────────────────────────────────────────────────────── */}
      {activeTab === 'TOMORROW' && <>

        {/* Day Type */}
        <div style={glass}>
          <span style={lbl}>DAY TYPE</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => updateTomorrow({ dayType: 'SCHOOL' })}  style={chip(tomorrowData.dayType === 'SCHOOL', '#ff4b4b')}>SCHOOL DAY</button>
            <button onClick={() => updateTomorrow({ dayType: 'HOLIDAY' })} style={chip(tomorrowData.dayType === 'HOLIDAY', '#00ff41')}>HOLIDAY</button>
          </div>
          {tomorrowData.dayType === 'SCHOOL' && (
            <div style={{ marginTop: '14px', padding: '12px 15px', background: 'rgba(255,75,75,0.05)', border: '1px dashed rgba(255,75,75,0.2)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#ff4b4b', letterSpacing: '1px' }}>SCHOOL LOCKED</span>
              <span style={{ fontSize: '11px', color: '#ff4b4b', opacity: 0.6 }}>08:00 — 15:30</span>
            </div>
          )}
        </div>

        {/* Time Blockers */}
        <div style={glass}>
          <span style={lbl}>TIME BLOCKERS</span>
          <div style={{ display: 'flex', gap: '8px', marginBottom: tomorrowData.workBlock || tomorrowData.tripBlock ? '14px' : '0' }}>
            <button onClick={() => updateTomorrow({ workBlock: tomorrowData.workBlock ? null : { start: '15:00' } })} style={chip(!!tomorrowData.workBlock, '#ff9500')}>
              {tomorrowData.workBlock ? '✕ WORK' : '+ WORK'}
            </button>
            <button onClick={() => updateTomorrow({ tripBlock: tomorrowData.tripBlock ? null : { start: '10:00' } })} style={chip(!!tomorrowData.tripBlock, '#00ccff')}>
              {tomorrowData.tripBlock ? '✕ TRIP' : '+ TRIP'}
            </button>
          </div>

          {tomorrowData.workBlock && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: 'rgba(255,149,0,0.05)', border: '1px dashed rgba(255,149,0,0.2)', borderRadius: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#ff9500', letterSpacing: '1px', minWidth: '36px' }}>WORK</span>
              <TimePicker val={tomorrowData.workBlock.start} onChange={t => updateTomorrow({ workBlock: { start: t } })} />
              <span style={{ fontSize: '12px', color: '#ff9500', opacity: 0.7 }}>→ {addFiveHours(tomorrowData.workBlock.start)}</span>
              <span style={{ fontSize: '9px', color: '#555', letterSpacing: '1px' }}>5 HRS BLOCKED</span>
            </div>
          )}

          {tomorrowData.tripBlock && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: 'rgba(0,204,255,0.05)', border: '1px dashed rgba(0,204,255,0.2)', borderRadius: '12px', marginTop: tomorrowData.workBlock ? '8px' : '0', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#00ccff', letterSpacing: '1px', minWidth: '36px' }}>TRIP</span>
              <TimePicker val={tomorrowData.tripBlock.start} onChange={t => updateTomorrow({ tripBlock: { start: t } })} />
              <span style={{ fontSize: '12px', color: '#00ccff', opacity: 0.7 }}>→ {addFiveHours(tomorrowData.tripBlock.start)}</span>
              <span style={{ fontSize: '9px', color: '#555', letterSpacing: '1px' }}>5 HRS BLOCKED</span>
            </div>
          )}
        </div>

        {/* Add blocks */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button onClick={() => addBlock(60)} style={actBtn()}>+ 60 MIN BLOCK</button>
          <button onClick={() => addBlock(90)} style={actBtn()}>+ 90 MIN BLOCK</button>
        </div>

        {tomorrowData.blocks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '28px', color: '#1a1a1a', fontSize: '11px', letterSpacing: '2px' }}>NO BLOCKS PLANNED YET</div>
        )}

        {tomorrowData.blocks.map((block, idx) => (
          <div key={block.id} style={glass}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '10px', color: '#00ff41', fontWeight: '800', letterSpacing: '1.5px' }}>BLOCK {idx + 1} — {block.duration} MIN</span>
              <button onClick={() => removeBlock(block.id)} style={{ background: 'transparent', border: 'none', color: '#ff4b4b', fontSize: '18px', cursor: 'pointer', padding: 0, lineHeight: 1 }}>✕</button>
            </div>
            <select value={block.subject} onChange={e => updateBlock(block.id, 'subject', e.target.value)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', borderRadius: '12px', padding: '12px 14px', fontSize: '14px', fontWeight: '700', outline: 'none', width: '100%', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}>
              {SUBJECTS.map(s => <option key={s} value={s} style={{ background: '#111', fontSize: '13px' }}>{s}</option>)}
            </select>
          </div>
        ))}
      </>}

      {/* ── TRADING ───────────────────────────────────────────────────────── */}
      {activeTab === 'TRADING' && <>

        <div style={glass}>
          <span style={lbl}>ACTIVE SESSION</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: session.color, boxShadow: `0 0 20px ${session.color}`, flexShrink: 0 }} />
            <span style={{ fontSize: '32px', fontWeight: '800', color: session.color, letterSpacing: '-1px' }}>{session.name}</span>
          </div>

          <div style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', fontSize: '8px', color: '#333', letterSpacing: '2.5px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              KILL ZONES — PACIFIC TIME
            </div>
            {[
              { name: 'NY AM',  time: '5:30 AM — 8:00 AM',  color: '#00ff41' },
              { name: 'NY PM',  time: '10:30 AM — 1:00 PM', color: '#00ff41' },
              { name: 'LONDON', time: '11:00 PM — 2:00 AM', color: '#ff9500' },
              { name: 'ASIA',   time: '4:00 PM — 7:00 PM',  color: '#00ccff' },
            ].map((s, i, arr) => {
              const isActive = session.name === s.name;
              return (
                <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 14px', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', background: isActive ? `${s.color}0a` : 'transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? s.color : '#1a1a1a', boxShadow: isActive ? `0 0 8px ${s.color}` : 'none' }} />
                    <span style={{ fontSize: '12px', fontWeight: '700', color: isActive ? s.color : '#333' }}>{s.name}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: isActive ? s.color : '#2a2a2a' }}>{s.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={glass}>
          <span style={lbl}>SESSION I WANT TO TRADE</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {SESSIONS.map(s => (
              <button key={s} onClick={() => setData(p => ({ ...p, trading: { ...p.trading, preferredSession: s } }))} style={chip(data.trading.preferredSession === s)}>
                {s}
              </button>
            ))}
          </div>
          {data.trading.preferredSession && (
            <div style={{ marginTop: '14px', padding: '14px', background: 'rgba(0,255,65,0.04)', borderRadius: '12px', border: '1px solid rgba(0,255,65,0.1)' }}>
              <div style={{ fontSize: '9px', color: '#444', letterSpacing: '2px', marginBottom: '6px' }}>TARGET WINDOW</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#00ff41' }}>
                {data.trading.preferredSession === 'NY AM'  && '5:30 AM — 8:00 AM PT'}
                {data.trading.preferredSession === 'NY PM'  && '10:30 AM — 1:00 PM PT'}
                {data.trading.preferredSession === 'LONDON' && '11:00 PM — 2:00 AM PT'}
                {data.trading.preferredSession === 'ASIA'   && '4:00 PM — 7:00 PM PT'}
              </div>
              <div style={{ fontSize: '11px', color: '#333', marginTop: '6px' }}>
                {session.name === data.trading.preferredSession
                  ? '● LIVE NOW — your session is active'
                  : `Currently in: ${session.name}`}
              </div>
            </div>
          )}
        </div>
      </>}

    </div>
  );
}