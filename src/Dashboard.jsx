import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

const SUBJECTS = ['MATH', 'PHYSICS', 'CYBERSECURITY', 'ARCHITECTURE OF GLOBAL POWER'];
const EMPTY_DAY = { dayType: 'HOLIDAY', blocks: [], workStart: '15:00', hasWork: false };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getDateKey = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Vancouver' }).format(d);
};

const getVancouverDayInfo = () => {
  const now = new Date();
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Vancouver',
    weekday: 'short',
  }).format(now); // 'Mon', 'Tue', ... 'Sat', 'Sun'

  const timeStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Vancouver',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(now);
  const [h, m] = timeStr.split(':').map(Number);
  return { weekday, mins: h * 60 + m };
};

const getCurrentSession = () => {
  const { weekday, mins } = getVancouverDayInfo();

  // Saturday: fully closed — no sessions
  if (weekday === 'Sat') {
    return { name: 'CLOSED', color: '#444', marketClosed: true, closedReason: 'SATURDAY — NO SESSIONS' };
  }

  // Sunday: closed until 15:00 PT, Asia opens at 15:00
  if (weekday === 'Sun') {
    if (mins < 15 * 60) return { name: 'CLOSED', color: '#444', marketClosed: true, closedReason: 'ASIA OPENS AT 15:00 PT' };
    if (mins < 19 * 60)  return { name: 'ASIA',   color: '#00ccff', marketClosed: false };
    if (mins >= 23 * 60) return { name: 'LONDON', color: '#ff9500', marketClosed: false };
    return { name: 'CLOSED', color: '#444', marketClosed: true, closedReason: 'BETWEEN SESSIONS' };
  }

  // Mon–Fri: standard sessions
  if (mins >= 5 * 60 + 30 && mins < 8 * 60)   return { name: 'NY AM',  color: '#00ff41', marketClosed: false };
  if (mins >= 10 * 60 + 30 && mins < 13 * 60) return { name: 'NY PM',  color: '#00ff41', marketClosed: false };
  if (mins >= 16 * 60 && mins < 19 * 60)      return { name: 'ASIA',   color: '#00ccff', marketClosed: false };
  if (mins >= 23 * 60 || mins < 2 * 60)       return { name: 'LONDON', color: '#ff9500', marketClosed: false };
  return { name: 'CLOSED', color: '#444', marketClosed: true, closedReason: 'BETWEEN SESSIONS' };
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
      const t = `${Math.floor(i / 4).toString().padStart(2, '0')}:${((i % 4) * 15).toString().padStart(2, '0')}`;
      return <option key={t} value={t} style={{ background: '#111' }}>{t}</option>;
    })}
  </select>
);

const BlockRow = ({ color, label, time }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', background: `${color}0a`, border: `1px dashed ${color}33`, borderRadius: '12px', marginBottom: '8px' }}>
    <span style={{ fontSize: '11px', fontWeight: '800', color, letterSpacing: '1px' }}>{label}</span>
    <span style={{ fontSize: '11px', color, opacity: 0.7 }}>{time}</span>
  </div>
);

// ─── Style Factory ────────────────────────────────────────────────────────────

const makeGlass = (glow = false) => ({
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '24px',
  padding: '24px',
  border: glow ? '1px solid rgba(0, 255, 65, 0.2)' : '1px solid rgba(255,255,255,0.05)',
  marginBottom: '15px',
  boxShadow: glow
    ? '0 0 20px rgba(0, 255, 65, 0.25), 0 0 50px rgba(0, 255, 65, 0.08)'
    : 'none',
  transition: 'box-shadow 0.6s ease, border 0.6s ease',
});

const LABEL = { fontSize: '10px', color: '#444', letterSpacing: '2.5px', fontWeight: '800', display: 'block', marginBottom: '15px' };

// ─── Main OS ──────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [time, setTime]       = useState('');
  const [activeTab, setActiveTab] = useState('TODAY');
  const [session, setSession] = useState(getCurrentSession());
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
  const lastDateRef = useRef(getDateKey(0));

  // ── Initialise with migration from v22 ────────────────────────────────────
  const [data, setData] = useState(() => {
    const savedV23 = localStorage.getItem('raghul_os_v23');
    if (savedV23) return JSON.parse(savedV23);

    const savedV22 = localStorage.getItem('raghul_os_v22');
    if (savedV22) {
      const v22 = JSON.parse(savedV22);
      return { ...v22, lastLoadedDate: getDateKey(0) };
    }

    return {
      recovery: { sleep: '23:00', wake: '07:30' },
      trading: { target: 'NY AM' },
      schedule: {},
      lastLoadedDate: getDateKey(0),
    };
  });

  // ── Persist to localStorage ───────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('raghul_os_v23', JSON.stringify(data));
  }, [data]);

  // ── Resize listener ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Clock + session ticker + midnight rollover ────────────────────────────
  useEffect(() => {
    const tick = () => {
      setTime(new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Vancouver',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
      }).format(new Date()));

      setSession(getCurrentSession());

      // Automatic date rollover — promote tomorrow's planned data to today
      const todayKey = getDateKey(0);
      if (lastDateRef.current !== todayKey) {
        lastDateRef.current = todayKey;
        setData(prev => ({
          ...prev,
          lastLoadedDate: todayKey,
          // Tomorrow's data is already stored under todayKey, no copy needed.
          // Ensure the entry exists by falling back to EMPTY_DAY.
          schedule: {
            ...prev.schedule,
            [todayKey]: prev.schedule[todayKey] || EMPTY_DAY,
          },
        }));
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Derived state ─────────────────────────────────────────────────────────
  const todayKey    = getDateKey(0);
  const tomorrowKey = getDateKey(1);
  const todayData    = data.schedule[todayKey]    || EMPTY_DAY;
  const tomorrowData = data.schedule[tomorrowKey] || EMPTY_DAY;

  const updateDay = (key, updates) =>
    setData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [key]: { ...(prev.schedule[key] || EMPTY_DAY), ...updates },
      },
    }));

  const isLive = !session.marketClosed;

  // ── EXECUTION (Left column / TODAY tab) ───────────────────────────────────
  const ExecutionPanel = (
    <div>
      {/* Clock + Active Session */}
      <div style={makeGlass(isLive)}>
        <span style={LABEL}>EXECUTION / {todayKey}</span>
        <div style={{ fontSize: isDesktop ? '64px' : '42px', fontWeight: '900', letterSpacing: '-3px', lineHeight: 1 }}>
          {time}
        </div>
        <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: session.color,
            boxShadow: isLive ? `0 0 10px ${session.color}` : 'none',
          }} />
          <span style={{ fontSize: '14px', fontWeight: '900', color: session.color, letterSpacing: '2px' }}>
            {session.name}
          </span>
          <span style={{ fontSize: '10px', color: '#333' }}>PACIFIC TIME</span>
        </div>
      </div>

      {/* Today's Checklist */}
      <div style={makeGlass()}>
        <span style={LABEL}>TODAY'S CHECKLIST</span>
        {todayData.dayType === 'SCHOOL' && <BlockRow color="#ff4b4b" label="SCHOOL" time="08:00 – 15:30" />}
        {todayData.hasWork && <BlockRow color="#ff9500" label="WORK" time={`${todayData.workStart} – 5H`} />}
        {todayData.blocks.length === 0 && !todayData.hasWork && todayData.dayType !== 'SCHOOL' && (
          <div style={{ color: '#333', fontSize: '11px', textAlign: 'center', padding: '20px 0' }}>
            NO BLOCKS PLANNED — BUILD TOMORROW'S PLAN →
          </div>
        )}
        {todayData.blocks.map(b => (
          <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(0,255,65,0.04)', borderRadius: '14px', marginBottom: '10px', border: '1px solid rgba(0,255,65,0.1)' }}>
            <div>
              <div style={{ fontWeight: '800' }}>{b.subject}</div>
              <div style={{ fontSize: '10px', color: '#00ff41', marginTop: '4px' }}>{b.duration} MIN FLOW</div>
            </div>
            <input type="checkbox" onChange={() => confetti()} style={{ width: '20px', height: '20px', accentColor: '#00ff41', cursor: 'pointer' }} />
          </div>
        ))}
      </div>
    </div>
  );

  // ── PLANNER (Right column / TOMORROW tab) ─────────────────────────────────
  const PlannerPanel = (
    <div>
      {/* Tomorrow Block Builder */}
      <div style={makeGlass()}>
        <span style={LABEL}>PLANNER / {tomorrowKey}</span>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {['SCHOOL', 'HOLIDAY'].map(type => (
            <button key={type}
              onClick={() => updateDay(tomorrowKey, { dayType: type })}
              style={{
                flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: tomorrowData.dayType === type
                  ? (type === 'SCHOOL' ? '#ff4b4b22' : '#00ff4122')
                  : '#111',
                color: tomorrowData.dayType === type
                  ? (type === 'SCHOOL' ? '#ff4b4b' : '#00ff41')
                  : '#333',
                fontWeight: '800', fontSize: '11px',
              }}>
              {type}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {[60, 90].map(dur => (
            <button key={dur}
              onClick={() => updateDay(tomorrowKey, { blocks: [...tomorrowData.blocks, { id: Date.now() + dur, subject: 'MATH', duration: dur }] })}
              style={{ flex: 1, padding: '15px', background: '#111', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: '900', cursor: 'pointer' }}>
              +{dur}M
            </button>
          ))}
        </div>
        {tomorrowData.blocks.map((b, i) => (
          <div key={b.id} style={{ marginBottom: '10px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '9px', color: '#00ff41' }}>BLOCK {i + 1} — {b.duration}M</span>
              <button onClick={() => updateDay(tomorrowKey, { blocks: tomorrowData.blocks.filter(x => x.id !== b.id) })}
                style={{ background: 'transparent', border: 'none', color: '#ff4b4b', cursor: 'pointer', fontSize: '14px' }}>✕</button>
            </div>
            <select value={b.subject}
              onChange={e => {
                const updated = tomorrowData.blocks.map((x, j) => j === i ? { ...x, subject: e.target.value } : x);
                updateDay(tomorrowKey, { blocks: updated });
              }}
              style={{ width: '100%', padding: '10px', background: '#111', color: '#fff', border: '1px solid #222', borderRadius: '8px', fontSize: '13px' }}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Recovery Log */}
      <div style={makeGlass()}>
        <span style={LABEL}>RECOVERY LOG</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#00ff41' }}>
            {calcSleep(data.recovery.sleep, data.recovery.wake)}H
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <TimePicker val={data.recovery.sleep} onChange={t => setData(d => ({ ...d, recovery: { ...d.recovery, sleep: t } }))} />
            <TimePicker val={data.recovery.wake}  onChange={t => setData(d => ({ ...d, recovery: { ...d.recovery, wake: t } }))} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
          <span style={{ fontSize: '10px', color: '#333' }}>SLEEP</span>
          <span style={{ fontSize: '10px', color: '#333' }}>WAKE</span>
        </div>
      </div>
    </div>
  );

  // ── TRADING (Full-width bottom on desktop / tab on mobile) ────────────────
  const TradingPanel = (
    <div style={{ gridColumn: isDesktop ? '1 / -1' : 'auto' }}>
      <div style={makeGlass(isLive)}>
        <span style={LABEL}>TRADING TERMINAL</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
          <div>
            {session.marketClosed ? (
              <>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#444', letterSpacing: '1px' }}>
                  MARKET CLOSED
                </div>
                <div style={{ fontSize: '10px', color: '#333', marginTop: '6px', letterSpacing: '1.5px' }}>
                  {session.closedReason}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '24px', fontWeight: '900', color: session.color, letterSpacing: '1px' }}>
                  {session.name} SESSION
                </div>
                <div style={{ fontSize: '10px', color: '#333', marginTop: '6px', letterSpacing: '1.5px' }}>
                  MARKET IS LIVE
                </div>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['NY AM', 'NY PM', 'LONDON', 'ASIA'].map(s => (
              <button key={s}
                onClick={() => setData(d => ({ ...d, trading: { target: s } }))}
                style={{
                  padding: '10px 15px', borderRadius: '10px', cursor: 'pointer',
                  background: data.trading.target === s ? '#00ff4111' : '#111',
                  color: data.trading.target === s ? '#00ff41' : '#333',
                  border: data.trading.target === s ? '1px solid rgba(0,255,65,0.3)' : '1px solid #222',
                  fontSize: '10px', fontWeight: '800',
                  boxShadow: data.trading.target === s ? '0 0 10px rgba(0,255,65,0.15)' : 'none',
                }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ backgroundColor: '#000', color: 'white', minHeight: '100vh', padding: isDesktop ? '40px' : '20px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* Mobile Tab Nav — hidden on desktop */}
      {!isDesktop && (
        <div style={{ display: 'flex', gap: '5px', marginBottom: '25px', background: '#0a0a0a', padding: '5px', borderRadius: '14px', border: '1px solid #111' }}>
          {['TODAY', 'TOMORROW', 'TRADING'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={activeTab === t
                ? { flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.08)', color: '#00ff41', fontWeight: '900', fontSize: '11px', cursor: 'pointer' }
                : { flex: 1, padding: '12px', background: 'transparent', border: 'none', color: '#333', fontSize: '11px', cursor: 'pointer' }
              }>
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Main 2-col grid (desktop) / single col (mobile) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
        gap: '30px',
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        {(isDesktop || activeTab === 'TODAY')     && ExecutionPanel}
        {(isDesktop || activeTab === 'TOMORROW')  && PlannerPanel}
        {(isDesktop || activeTab === 'TRADING')   && TradingPanel}
      </div>
    </div>
  );
}
