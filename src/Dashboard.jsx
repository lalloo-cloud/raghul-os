import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const Dashboard = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour12: false }));
  const [activeTab, setActiveTab] = useState('TODAY');
  
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('raghul_os_v19');
    return saved ? JSON.parse(saved) : {
      dayType: 'HOLIDAY',
      today: { mission: 'PHYSICS', duration: '90', completed: false, progress: 40 },
      tomorrow: { blocks: [] },
      trading: { strategy: 'NY AM KILLZONE', window: '08:30 - 11:00' },
      recovery: { sleep: '23:00', wake: '07:00' }
    };
  });

  useEffect(() => {
    localStorage.setItem('raghul_os_v19', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour12: false })), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleComplete = () => {
    if (!data.today.completed) {
      confetti({ particleCount: 150, spread: 60, origin: { y: 0.7 }, colors: ['#00ff41', '#ffffff', '#00ccff'] });
    }
    setData({...data, today: {...data.today, completed: !data.today.completed}});
  };

  const styles = {
    container: { backgroundColor: '#000', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: '-apple-system, sans-serif' },
    header: { marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    tab: (active) => ({
      padding: '10px 20px', borderRadius: '14px', fontSize: '11px', fontWeight: '700', border: 'none',
      background: active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)', color: active ? '#00ff41' : '#444',
      backdropFilter: 'blur(20px)', transition: '0.3s', marginRight: '8px'
    }),
    glassCard: {
      background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(40px)', borderRadius: '24px',
      padding: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '15px', position: 'relative', overflow: 'hidden'
    },
    progressBar: { position: 'absolute', bottom: '0', left: '0', width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)' },
    progressFill: (p) => ({ width: `${p}%`, height: '100%', background: '#00ff41', boxShadow: '0 0 15px #00ff41' }),
    select: { background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', borderRadius: '8px', padding: '6px', fontSize: '13px', outline: 'none' }
  };

  const TimePicker = ({ val, onChange }) => (
    <select style={styles.select} value={val} onChange={(e) => onChange(e.target.value)}>
      {Array.from({ length: 24 * 4 }).map((_, i) => {
        const h = Math.floor(i / 4).toString().padStart(2, '0');
        const m = ((i % 4) * 15).toString().padStart(2, '0');
        const t = `${h}:${m}`;
        return <option key={t} value={t} style={{background: '#000'}}>{t}</option>;
      })}
    </select>
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ fontSize: '38px', fontWeight: '800', letterSpacing: '-1.5px' }}>{time}</div>
        <button onClick={() => setData({...data, dayType: data.dayType === 'SCHOOL' ? 'HOLIDAY' : 'SCHOOL'})}
          style={{ background: 'transparent', border: `1px solid ${data.dayType === 'SCHOOL' ? '#ff4b4b' : '#00ff41'}`, color: data.dayType === 'SCHOOL' ? '#ff4b4b' : '#00ff41', padding: '6px 12px', borderRadius: '10px', fontSize: '9px', fontWeight: 'bold' }}>
          {data.dayType} MODE
        </button>
      </header>

      <div style={{ display: 'flex', marginBottom: '30px', overflowX: 'auto', paddingBottom: '10px' }}>
        {['TODAY', 'TOMORROW', 'TRADING'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={styles.tab(activeTab === t)}>{t}</button>
        ))}
      </div>

      {activeTab === 'TODAY' && (
        <>
          <div style={styles.glassCard}>
            <span style={{ fontSize: '10px', color: '#555', letterSpacing: '2px' }}>CURRENT MISSION</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <span style={{ fontSize: '26px', fontWeight: '700', opacity: data.today.completed ? 0.3 : 1 }}>{data.today.mission}</span>
              <input type="checkbox" checked={data.today.completed} onChange={handleComplete} style={{ width: '24px', height: '24px', accentColor: '#00ff41' }} />
            </div>
            <div style={styles.progressBar}><div style={styles.progressFill(data.today.progress)} /></div>
          </div>

          <div style={styles.glassCard}>
            <span style={{ fontSize: '10px', color: '#555', letterSpacing: '2px' }}>RECOVERY LOG</span>
            <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
              <div>
                <div style={{ fontSize: '8px', color: '#333', marginBottom: '5px' }}>SLEEP_TIME</div>
                <TimePicker val={data.recovery.sleep} onChange={(t) => setData({...data, recovery: {...data.recovery, sleep: t}})} />
              </div>
              <div>
                <div style={{ fontSize: '8px', color: '#333', marginBottom: '5px' }}>WAKE_TIME</div>
                <TimePicker val={data.recovery.wake} onChange={(t) => setData({...data, recovery: {...data.recovery, wake: t}})} />
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'TOMORROW' && (
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button onClick={() => setData({...data, tomorrow: {blocks: [...data.tomorrow.blocks, {id: Date.now(), subject: 'FLOW_BLOCK', duration: 60}]}})} style={{ flex: 1, background: '#111', color: 'white', border: '1px solid #222', padding: '12px', borderRadius: '15px', fontSize: '11px', fontWeight: 'bold' }}>+ 60M BLOCK</button>
            <button onClick={() => setData({...data, tomorrow: {blocks: [...data.tomorrow.blocks, {id: Date.now(), subject: 'FLOW_BLOCK', duration: 90}]}})} style={{ flex: 1, background: '#111', color: 'white', border: '1px solid #222', padding: '12px', borderRadius: '15px', fontSize: '11px', fontWeight: 'bold' }}>+ 90M BLOCK</button>
          </div>

          {data.dayType === 'SCHOOL' && (
            <div style={{ ...styles.glassCard, background: 'rgba(255,75,75,0.05)', borderStyle: 'dashed', borderColor: 'rgba(255,75,75,0.2)' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff4b4b' }}>SCHOOL MANDATORY // 08:00 - 15:30</div>
            </div>
          )}

          {data.tomorrow.blocks.map((block) => (
            <div key={block.id} style={styles.glassCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '18px', fontWeight: '700', outline: 'none', width: '80%' }} value={block.subject} onChange={(e) => {
                  const newB = data.tomorrow.blocks.map(b => b.id === block.id ? {...b, subject: e.target.value.toUpperCase()} : b);
                  setData({...data, tomorrow: {blocks: newB}});
                }} />
                <button onClick={() => setData({...data, tomorrow: {blocks: data.tomorrow.blocks.filter(b => b.id !== block.id)}})} style={{ background: 'transparent', border: 'none', color: '#ff4b4b', fontSize: '18px' }}>✕</button>
              </div>
              <span style={{ fontSize: '10px', color: '#00ff41', fontWeight: 'bold' }}>{block.duration} MIN SESSION</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;