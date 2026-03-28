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

// ─── Shared Components ────────────────────────────────────────────────────────

const TimePicker = ({ val, onChange }) => (
  <select value={val} onChange={e => onChange(e.target.value)}
    style={{ background: '#111', border: '1px solid #222', color: '#00ff41', borderRadius: '8px', padding: '8px', fontSize: '12px', outline: 'none' }}>
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
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('raghul_os_v22');
    return saved ? JSON.parse(saved) : { 
      recovery: { sleep: '23:00', wake: '07:30' }, 
      trading: { target: 'NY AM' },
      schedule: {} 
    };
  });

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { localStorage.setItem('raghul_os_v22', JSON.stringify(data)); }, [data]);

  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString([], { hour12: false }));
      setSession(getCurrentSession());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const todayData = data.schedule[getDateKey(0)] || { dayType: 'HOLIDAY', blocks: [], workStart: '15:00', hasWork: false };
  const tomorrowData = data.schedule[getDateKey(1)] || { dayType: 'HOLIDAY', blocks: [], workStart: '15:00', hasWork: false };

  const updateDay = (key, updates) => {
    setData(prev => ({ ...prev, schedule: { ...prev.schedule, [key]: { ...(prev.schedule[key] || { dayType: 'HOLIDAY', blocks: [] }), ...updates } } }));
  };

  const styles = {
    container: { backgroundColor: '#000', color: 'white', minHeight: '100vh', padding: isDesktop ? '40px' : '20px', fontFamily: '-apple-system, sans-serif' },
    layout: { display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: '30px', maxWidth: '1400px', margin: '0 auto' },
    glass: { background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(40px)', borderRadius: '24px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '15px' },
    label: { fontSize: '10px', color: '#444', letterSpacing: '2.5px', fontWeight: '800', display: 'block', marginBottom: '15px' },
    nav: { display: isDesktop ? 'none' : 'flex', gap: '5px', marginBottom: '25px', background: '#111', padding: '5px', borderRadius: '14px' },
    activeTab: { flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.08)', color: '#00ff41', fontWeight: '900', fontSize: '11px' }
  };

  const TodayPanel = (
    <div style={styles.glass}>
      <span style={styles.label}>TODAY / {getDateKey(0)}</span>
      {todayData.dayType === 'SCHOOL' && <BlockRow color="#ff4b4b" label="SCHOOL" time="08:00 - 15:30" />}
      {todayData.hasWork && <BlockRow color="#ff9500" label="WORK" time={`${todayData.workStart} - 5H`} />}
      {todayData.blocks.map(b => (
        <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(0,255,65,0.04)', borderRadius: '14px', marginBottom: '10px', border: '1px solid rgba(0,255,65,0.1)' }}>
          <div>
            <div style={{ fontWeight: '800' }}>{b.subject}</div>
            <div style={{ fontSize: '10px', color: '#00ff41', marginTop: '4px' }}>{b.duration} MIN FLOW</div>
          </div>
          <input type="checkbox" onChange={() => confetti()} style={{ width: '20px', height: '20px', accentColor: '#00ff41' }} />
        </div>
      ))}
    </div>
  );

  const TomorrowPanel = (
    <div style={styles.glass}>
      <span style={styles.label}>TOMORROW ARCHITECT</span>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => updateDay(getDateKey(1), { dayType: 'SCHOOL' })} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: tomorrowData.dayType === 'SCHOOL' ? '#ff4b4b22' : '#111', color: tomorrowData.dayType === 'SCHOOL' ? '#ff4b4b' : '#333', border: 'none' }}>SCHOOL</button>
        <button onClick={() => updateDay(getDateKey(1), { dayType: 'HOLIDAY' })} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: tomorrowData.dayType === 'HOLIDAY' ? '#00ff4122' : '#111', color: tomorrowData.dayType === 'HOLIDAY' ? '#00ff41' : '#333', border: 'none' }}>HOLIDAY</button>
      </div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => updateDay(getDateKey(1), { blocks: [...tomorrowData.blocks, { id: Date.now(), subject: 'MATH', duration: 60 }] })} style={{ flex: 1, padding: '15px', background: '#111', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: '900' }}>+60M</button>
        <button onClick={() => updateDay(getDateKey(1), { blocks: [...tomorrowData.blocks, { id: Date.now(), subject: 'MATH', duration: 90 }] })} style={{ flex: 1, padding: '15px', background: '#111', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: '900' }}>+90M</button>
      </div>
      {tomorrowData.blocks.map((b, i) => (
        <div key={b.id} style={{ marginBottom: '10px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '9px', color: '#00ff41' }}>BLOCK {i+1}</span>
            <button onClick={() => updateDay(getDateKey(1), { blocks: tomorrowData.blocks.filter(x => x.id !== b.id) })} style={{ background: 'transparent', border: 'none', color: '#ff4b4b' }}>✕</button>
          </div>
          <select value={b.subject} onChange={e => {
            const newB = [...tomorrowData.blocks]; newB[i].subject = e.target.value; updateDay(getDateKey(1), { blocks: newB });
          }} style={{ width: '100%', padding: '10px', background: '#111', color: '#fff', border: '1px solid #222', borderRadius: '8px', fontSize: '13px' }}>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      ))}
    </div>
  );

  return (
    <div style={styles.container}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', maxWidth: '1400px', margin: '0 auto 40px' }}>
        <div style={{ fontSize: isDesktop ? '64px' : '42px', fontWeight: '900', letterSpacing: '-3px' }}>{time}</div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: session.color, fontWeight: '900' }}>{session.name} LIVE</div>
          <div style={{ fontSize: '10px', color: '#333' }}>PACIFIC STANDARD TIME</div>
        </div>
      </header>

      {/* Mobile Nav Only */}
      <div style={styles.nav}>
        {['TODAY', 'TOMORROW', 'TRADING'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={activeTab === t ? styles.activeTab : { flex: 1, background: 'transparent', border: 'none', color: '#333', fontSize: '11px' }}>{t}</button>
        ))}
      </div>

      <div style={styles.layout}>
        {/* Left Column (Desktop) or Selected Tab (Mobile) */}
        {(isDesktop || activeTab === 'TODAY') && (
          <div>
            {TodayPanel}
            <div style={styles.glass}>
              <span style={styles.label}>RECOVERY LOG</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#00ff41' }}>{calcSleep(data.recovery.sleep, data.recovery.wake)}H</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <TimePicker val={data.recovery.sleep} onChange={t => setData({...data, recovery: {...data.recovery, sleep: t}})} />
                  <TimePicker val={data.recovery.wake} onChange={t => setData({...data, recovery: {...data.recovery, wake: t}})} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Column (Desktop) or Selected Tab (Mobile) */}
        {(isDesktop || activeTab === 'TOMORROW') && TomorrowPanel}
        
        {/* Trading (Full Width on Desktop Bottom or Tab on Mobile) */}
        {(isDesktop || activeTab === 'TRADING') && (
          <div style={{ gridColumn: isDesktop ? '1 / -1' : 'auto' }}>
            <div style={styles.glass}>
              <span style={styles.label}>TRADING TERMINAL</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: session.color }}>{session.name} SESSION</div>
                  <div style={{ fontSize: '10px', color: '#333' }}>MARKET IS OPEN</div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['NY AM', 'NY PM', 'LONDON', 'ASIA'].map(s => (
                    <button key={s} onClick={() => setData({...data, trading: {target: s}})} 
                      style={{ padding: '10px 15px', borderRadius: '10px', background: data.trading.target === s ? '#00ff4111' : '#111', color: data.trading.target === s ? '#00ff41' : '#333', border: '1px solid #222', fontSize: '10px', fontWeight: '800' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}