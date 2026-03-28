import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const SUBJECTS = ['MATH', 'PHYSICS', 'CYBERSECURITY', 'ARCHITECTURE OF GLOBAL POWER'];
const SESSIONS = [
  { name: 'NY AM',  range: [5.5, 8],    color: '#00ff41' },
  { name: 'NY PM',  range: [10.5, 13],  color: '#00ff41' },
  { name: 'ASIA',   range: [16, 19],    color: '#00ccff' },
  { name: 'LONDON', range: [23, 26],    color: '#ff9500' } // 26 represents 2am next day
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getDateKey = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
};

const getCurrentSession = () => {
  const now = new Date();
  const hrs = now.getHours() + now.getMinutes() / 60;
  const match = SESSIONS.find(s => {
    if (s.name === 'LONDON') return hrs >= 23 || hrs < 2;
    return hrs >= s.range[0] && hrs < s.range[1];
  });
  return match || { name: 'CLOSED', color: '#444' };
};

const calcSleep = (sleep, wake) => {
  const [sh, sm] = sleep.split(':').map(Number);
  const [wh, wm] = wake.split(':').map(Number);
  let diff = (wh * 60 + wm) - (sh * 60 + sm);
  if (diff <= 0) diff += 1440;
  return (diff / 60).toFixed(1);
};

// ─── Components ───────────────────────────────────────────────────────────────

const TimePicker = ({ val, onChange }) => (
  <select value={val} onChange={e => onChange(e.target.value)}
    style={{ background: '#111', border: '1px solid #222', color: '#00ff41', borderRadius: '8px', padding: '6px', fontSize: '12px', outline: 'none' }}>
    {Array.from({ length: 96 }).map((_, i) => {
      const t = `${Math.floor(i/4).toString().padStart(2,'0')}:${((i%4)*15).toString().padStart(2,'0')}`;
      return <option key={t} value={t}>{t}</option>;
    })}
  </select>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [time, setTime] = useState('');
  const [activeTab, setActiveTab] = useState('TODAY');
  const [session, setSession] = useState(getCurrentSession());

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('raghul_os_v20');
    return saved ? JSON.parse(saved) : { 
      recovery: { sleep: '23:00', wake: '07:30' }, 
      trading: { target: 'NY AM' },
      schedule: {} 
    };
  });

  useEffect(() => { localStorage.setItem('raghul_os_v20', JSON.stringify(data)); }, [data]);

  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString([], { hour12: false }));
      setSession(getCurrentSession());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const todayData = data.schedule[getDateKey(0)] || { dayType: 'HOLIDAY', blocks: [] };
  const tomorrowData = data.schedule[getDateKey(1)] || { dayType: 'HOLIDAY', blocks: [], workStart: '15:00', hasWork: false, hasTrip: false };

  const updateDay = (key, updates) => {
    setData(prev => ({ ...prev, schedule: { ...prev.schedule, [key]: { ...(prev.schedule[key] || { dayType: 'HOLIDAY', blocks: [] }), ...updates } } }));
  };

  const glass = { background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(40px)', borderRadius: '20px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '12px' };
  const label = { fontSize: '9px', color: '#444', letterSpacing: '2px', fontWeight: 'bold', display: 'block', marginBottom: '10px' };

  return (
    <div style={{ backgroundColor: '#000', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: '-apple-system, sans-serif' }}>
      
      {/* Clock & Session */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1px' }}>{time}</div>
        <div style={{ color: session.color, fontSize: '10px', fontWeight: 'bold', border: `1px solid ${session.color}`, padding: '4px 8px', borderRadius: '6px' }}>
          {session.name}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '25px', background: '#111', padding: '4px', borderRadius: '12px' }}>
        {['TODAY', 'TOMORROW', 'TRADING'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '10px', background: activeTab === t ? '#222' : 'transparent', color: activeTab === t ? '#00ff41' : '#444', border: 'none', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>{t}</button>
        ))}
      </div>

      {activeTab === 'TODAY' && (
        <>
          <div style={glass}>
            <span style={label}>ACTIVE SCHEDULE</span>
            {todayData.dayType === 'SCHOOL' && <div style={{ color: '#ff4b4b', fontSize: '12px', marginBottom: '10px' }}>● 08:00 - 15:30 SCHOOL MANDATORY</div>}
            {todayData.blocks.map(b => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #111' }}>
                <span style={{ fontWeight: 'bold' }}>{b.subject}</span>
                <span style={{ color: '#00ff41' }}>{b.duration}m</span>
              </div>
            ))}
          </div>

          <div style={glass}>
            <span style={label}>RECOVERY LOG</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#00ff41' }}>{calcSleep(data.recovery.sleep, data.recovery.wake)}H</div>
                <div style={{ fontSize: '9px', color: '#444' }}>TOTAL SLEEP</div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <TimePicker val={data.recovery.sleep} onChange={t => setData({...data, recovery: {...data.recovery, sleep: t}})} />
                <TimePicker val={data.recovery.wake} onChange={t => setData({...data, recovery: {...data.recovery, wake: t}})} />
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'TOMORROW' && (
        <>
          <div style={glass}>
            <span style={label}>DAY SETTINGS</span>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
              <button onClick={() => updateDay(getDateKey(1), { dayType: 'SCHOOL' })} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: tomorrowData.dayType === 'SCHOOL' ? '#ff4b4b22' : '#111', color: tomorrowData.dayType === 'SCHOOL' ? '#ff4b4b' : '#333', border: '1px solid #222' }}>SCHOOL</button>
              <button onClick={() => updateDay(getDateKey(1), { dayType: 'HOLIDAY' })} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: tomorrowData.dayType === 'HOLIDAY' ? '#00ff4122' : '#111', color: tomorrowData.dayType === 'HOLIDAY' ? '#00ff41' : '#333', border: '1px solid #222' }}>HOLIDAY</button>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => updateDay(getDateKey(1), { hasWork: !tomorrowData.hasWork })} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: tomorrowData.hasWork ? '#00ccff22' : '#111', color: tomorrowData.hasWork ? '#00ccff' : '#333', border: '1px solid #222' }}>WORK</button>
              <button onClick={() => updateDay(getDateKey(1), { hasTrip: !tomorrowData.hasTrip })} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: tomorrowData.hasTrip ? '#ff950022' : '#111', color: tomorrowData.hasTrip ? '#ff9500' : '#333', border: '1px solid #222' }}>TRIP</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button onClick={() => updateDay(getDateKey(1), { blocks: [...tomorrowData.blocks, { id: Date.now(), subject: 'PHYSICS', duration: 60 }] })} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#111', color: 'white', border: 'none' }}>+ 60M</button>
            <button onClick={() => updateDay(getDateKey(1), { blocks: [...tomorrowData.blocks, { id: Date.now(), subject: 'PHYSICS', duration: 90 }] })} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#111', color: 'white', border: 'none' }}>+ 90M</button>
          </div>

          {tomorrowData.blocks.map((b, i) => (
            <div key={b.id} style={glass}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '10px', color: '#00ff41' }}>BLOCK {i+1}</span>
                <button onClick={() => updateDay(getDateKey(1), { blocks: tomorrowData.blocks.filter(x => x.id !== b.id) })} style={{ background: 'transparent', border: 'none', color: '#ff4b4b' }}>✕</button>
              </div>
              <select value={b.subject} onChange={e => {
                const newB = [...tomorrowData.blocks]; newB[i].subject = e.target.value; updateDay(getDateKey(1), { blocks: newB });
              }} style={{ width: '100%', padding: '10px', background: '#111', color: 'white', border: '1px solid #222', borderRadius: '8px' }}>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </>
      )}

      {activeTab === 'TRADING' && (
        <div style={glass}>
          <span style={label}>SESSION OVERVIEW</span>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: session.color, marginBottom: '20px' }}>{session.name} MARKET</div>
          <span style={label}>MY TARGET SESSION</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {SESSIONS.map(s => (
              <button key={s.name} onClick={() => setData({...data, trading: {target: s.name}})} 
                style={{ padding: '8px 12px', borderRadius: '8px', background: data.trading.target === s.name ? `${s.color}22` : '#111', color: data.trading.target === s.name ? s.color : '#333', border: '1px solid #222' }}>
                {s.name}
              </button>
            ))}
          </div>
          {data.trading.target === session.name && <div style={{ marginTop: '20px', color: '#00ff41', fontSize: '12px' }}>● TARGET SESSION IS CURRENTLY ACTIVE</div>}
        </div>
      )}
    </div>
  );
}