import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const SUBJECTS = ['MATH', 'PHYSICS', 'CYBERSECURITY', 'ARCHITECTURE OF GLOBAL POWER'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getDateKey = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
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
  if (mins >= 5 * 60 + 30 && mins < 8 * 60)   return { name: 'NY AM',   color: '#00ff41' };
  if (mins >= 10 * 60 + 30 && mins < 13 * 60) return { name: 'NY PM',   color: '#00ff41' };
  if (mins >= 16 * 60 && mins < 19 * 60)      return { name: 'ASIA',    color: '#00ccff' };
  if (mins >= 23 * 60 || mins < 2 * 60)       return { name: 'LONDON', color: '#ff9500' };
  return { name: 'CLOSED', color: '#444' };
};

const calcSleep = (sleep, wake) => {
  const [sh, sm] = sleep.split(':').map(Number);
  const [wh, wm] = wake.split(':').map(Number);
  let diff = (wh * 60 + wm) - (sh * 60 + sm);
  if (diff <= 0) diff += 1440;
  return (diff / 60).toFixed(1);
};

// ─── Components ───────────────────────────────────────────────────────────────

const TimePicker = ({ val, onChange, disabled }) => (
  <select value={val} onChange={e => onChange(e.target.value)} disabled={disabled}
    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)', color: disabled ? '#222' : '#00ff41', borderRadius: '10px', padding: '8px', fontSize: '12px', outline: 'none', cursor: disabled ? 'not-allowed' : 'pointer' }}>
    {Array.from({ length: 96 }).map((_, i) => {
      const t = `${Math.floor(i/4).toString().padStart(2,'0')}:${((i%4)*15).toString().padStart(2,'0')}`;
      return <option key={t} value={t} style={{background: '#111'}}>{t}</option>;
    })}
  </select>
);

const BlockRow = ({ color, label, time }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', background: `${color}0a`, border: `1px dashed ${color}33`, borderRadius: '12px', marginBottom: '8px' }}>
    <span style={{ fontSize: '11px', fontWeight: '800', color, letterSpacing: '1px' }}>{label}</span>
    <span style={{ fontSize: '11px', color, opacity: 0.7 }}>{time}</span>
  </div>
);

// ─── Main OS ──────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [time, setTime] = useState('');
  const [activeTab, setActiveTab] = useState('TODAY');
  const [session, setSession] = useState(getCurrentSession());

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('raghul_os_v21');
    return saved ? JSON.parse(saved) : { 
      recovery: { sleep: '23:00', wake: '07:30' }, 
      trading: { target: 'NY AM' },
      schedule: {} 
    };
  });

  useEffect(() => { localStorage.setItem('raghul_os_v21', JSON.stringify(data)); }, [data]);

  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString([], { hour12: false }));
      setSession(getCurrentSession());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const todayKey = getDateKey(0);
  const tomorrowKey = getDateKey(1);
  const todayData = data.schedule[todayKey] || { dayType: 'HOLIDAY', blocks: [], workStart: '15:00', hasWork: false, hasTrip: false };
  const tomorrowData = data.schedule[tomorrowKey] || { dayType: 'HOLIDAY', blocks: [], workStart: '15:00', hasWork: false, hasTrip: false };

  const updateDay = (key, updates) => {
    setData(prev => ({ ...prev, schedule: { ...prev.schedule, [key]: { ...(prev.schedule[key] || { dayType: 'HOLIDAY', blocks: [] }), ...updates } } }));
  };

  const handleMissionComplete = () => {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#00ff41', '#ffffff'] });
  };

  const styles = {
    glass: { background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(40px)', borderRadius: '22px', padding: '22px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '14px' },
    label: { fontSize: '9px', color: '#444', letterSpacing: '2.5px', fontWeight: '800', display: 'block', marginBottom: '12px', textTransform: 'uppercase' },
    chip: (active, color) => ({ padding: '10px 14px', borderRadius: '12px', fontSize: '10px', fontWeight: '800', border: `1px solid ${active ? color : '#1a1a1a'}`, background: active ? `${color}15` : 'transparent', color: active ? color : '#333', cursor: 'pointer', transition: '0.2s' })
  };

  return (
    <div style={{ backgroundColor: '#000', color: 'white', minHeight: '100vh', padding: '24px 20px', fontFamily: '-apple-system, sans-serif', maxWidth: '500px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ fontSize: '38px', fontWeight: '800', letterSpacing: '-1.5px' }}>{time}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: session.color, boxShadow: `0 0 12px ${session.color}` }} />
          <span style={{ fontSize: '11px', color: session.color, fontWeight: '900', letterSpacing: '1px' }}>{session.name}</span>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '25px', background: 'rgba(255,255,255,0.03)', padding: '5px', borderRadius: '16px' }}>
        {['TODAY', 'TOMORROW', 'TRADING'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === t ? 'rgba(255,255,255,0.08)' : 'transparent', color: activeTab === t ? '#00ff41' : '#333', fontSize: '11px', fontWeight: '900' }}>{t}</button>
        ))}
      </div>

      {activeTab === 'TODAY' && <>
        <div style={styles.glass}>
          <span style={styles.label}>LIVE TIMELINE</span>
          {todayData.dayType === 'SCHOOL' && <BlockRow color="#ff4b4b" label="SCHOOL BLOCK" time="08:00 — 15:30" />}
          {todayData.hasWork && <BlockRow color="#ff9500" label="WORK BLOCK" time={`${todayData.workStart} — 5H LOCK`} />}
          
          {todayData.blocks.map(b => (
            <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(0,255,65,0.04)', borderRadius: '14px', marginBottom: '10px', border: '1px solid rgba(0,255,65,0.08)' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '800' }}>{b.subject}</div>
                <div style={{ fontSize: '10px', color: '#00ff41', marginTop: '4px' }}>{b.duration} MIN SESSION</div>
              </div>
              <input type="checkbox" onChange={handleMissionComplete} style={{ width: '22px', height: '22px', accentColor: '#00ff41', cursor: 'pointer' }} />
            </div>
          ))}
          
          {todayData.blocks.length === 0 && !todayData.hasWork && todayData.dayType !== 'SCHOOL' && (
            <div style={{ textAlign: 'center', padding: '30px', color: '#222', fontSize: '11px', letterSpacing: '2px' }}>SYSTEM IDLE — NO BLOCKS FOUND</div>
          )}
        </div>

        <div style={styles.glass}>
          <span style={styles.label}>RECOVERY METRICS</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '34px', fontWeight: '900', color: '#00ff41', letterSpacing: '-1px' }}>{calcSleep(data.recovery.sleep, data.recovery.wake)}H</div>
              <div style={{ fontSize: '9px', color: '#333', fontWeight: '700' }}>SLEEP QUALITY</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <TimePicker val={data.recovery.sleep} onChange={t => setData({...data, recovery: {...data.recovery, sleep: t}})} />
              <TimePicker val={data.recovery.wake} onChange={t => setData({...data, recovery: {...data.recovery, wake: t}})} />
            </div>
          </div>
        </div>
      </>}

      {activeTab === 'TOMORROW' && <>
        <div style={styles.glass}>
          <span style={styles.label}>GLOBAL CONSTRAINTS</span>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            <button onClick={() => updateDay(tomorrowKey, { dayType: 'SCHOOL' })} style={styles.chip(tomorrowData.dayType === 'SCHOOL', '#ff4b4b')}>SCHOOL</button>
            <button onClick={() => updateDay(tomorrowKey, { dayType: 'HOLIDAY' })} style={styles.chip(tomorrowData.dayType === 'HOLIDAY', '#00ff41')}>HOLIDAY</button>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={() => updateDay(tomorrowKey, { hasWork: !tomorrowData.hasWork })} style={styles.chip(tomorrowData.hasWork, '#ff9500')}>WORK</button>
            <button onClick={() => updateDay(tomorrowKey, { hasTrip: !tomorrowData.hasTrip })} style={styles.chip(tomorrowData.hasTrip, '#00ccff')}>TRIP</button>
            {(tomorrowData.hasWork || tomorrowData.hasTrip) && <TimePicker val={tomorrowData.workStart} onChange={t => updateDay(tomorrowKey, { workStart: t })} />}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button onClick={() => updateDay(tomorrowKey, { blocks: [...tomorrowData.blocks, { id: Date.now(), subject: 'MATH', duration: 60 }] })} style={{ flex: 1, padding: '15px', background: '#111', color: '#fff', border: '1px solid #222', borderRadius: '14px', fontSize: '10px', fontWeight: '900' }}>+ 60M BLOCK</button>
          <button onClick={() => updateDay(tomorrowKey, { blocks: [...tomorrowData.blocks, { id: Date.now(), subject: 'MATH', duration: 90 }] })} style={{ flex: 1, padding: '15px', background: '#111', color: '#fff', border: '1px solid #222', borderRadius: '14px', fontSize: '10px', fontWeight: '900' }}>+ 90M BLOCK</button>
        </div>

        {tomorrowData.blocks.map((b, i) => (
          <div key={b.id} style={styles.glass}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ fontSize: '10px', color: '#00ff41', fontWeight: '900' }}>{b.duration}M FLOW BLOCK</span>
              <button onClick={() => updateDay(tomorrowKey, { blocks: tomorrowData.blocks.filter(x => x.id !== b.id) })} style={{ background: 'transparent', border: 'none', color: '#ff4b4b', cursor: 'pointer' }}>✕</button>
            </div>
            <select value={b.subject} onChange={e => {
              const newB = [...tomorrowData.blocks]; newB[i].subject = e.target.value; updateDay(tomorrowKey, { blocks: newB });
            }} style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '14px', fontWeight: '700', outline: 'none' }}>
              {SUBJECTS.map(s => <option key={s} value={s} style={{background: '#111'}}>{s}</option>)}
            </select>
          </div>
        ))}
      </>}

      {activeTab === 'TRADING' && (
        <div style={styles.glass}>
          <span style={styles.label}>MARKET STATUS</span>
          <div style={{ fontSize: '30px', fontWeight: '900', color: session.color, marginBottom: '25px' }}>{session.name} LIVE</div>
          <span style={styles.label}>TARGET KILLZONE</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['NY AM', 'NY PM', 'LONDON', 'ASIA'].map(s => (
              <button key={s} onClick={() => setData({...data, trading: {target: s}})} 
                style={styles.chip(data.trading.target === s, '#00ff41')}>
                {s}
              </button>
            ))}
          </div>
          {data.trading.target === session.name && (
            <div style={{ marginTop: '25px', padding: '15px', background: 'rgba(0,255,65,0.05)', border: '1px solid rgba(0,255,65,0.1)', borderRadius: '14px', color: '#00ff41', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
              ● EXECUTION WINDOW OPEN
            </div>
          )}
        </div>
      )}
    </div>
  );
}