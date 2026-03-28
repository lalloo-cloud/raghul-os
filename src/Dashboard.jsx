import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti'; // Standard for react confetti

const Dashboard = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour12: false }));
  const [activeTab, setActiveTab] = useState('TODAY');
  
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('raghul_os_v18');
    return saved ? JSON.parse(saved) : {
      dayType: 'HOLIDAY', // SCHOOL or HOLIDAY
      today: { mission: 'PHYSICS', duration: '90', completed: false, progress: 65 },
      tomorrow: { blocks: [{ id: 1, subject: 'MATH', duration: '90' }] },
      trading: { strategy: 'NY AM KILLZONE', window: '08:30 - 11:00' },
      recovery: { sleep: '23:00', wake: '07:00' }
    };
  });

  useEffect(() => {
    localStorage.setItem('raghul_os_v18', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour12: false })), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleComplete = () => {
    if (!data.today.completed) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#00ff41', '#ffffff'] });
    }
    setData({...data, today: {...data.today, completed: !data.today.completed}});
  };

  const removeBlock = (id) => {
    setData({...data, tomorrow: { blocks: data.tomorrow.blocks.filter(b => b.id !== id) }});
  };

  const styles = {
    container: { backgroundColor: '#000', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: '-apple-system, system-ui' },
    header: { marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    tab: (active) => ({
      padding: '10px 18px', borderRadius: '14px', fontSize: '11px', fontWeight: '700', border: 'none',
      background: active ? 'rgba(255,255,255,0.12)' : 'transparent', color: active ? '#00ff41' : '#444',
      backdropFilter: 'blur(15px)', transition: '0.3s'
    }),
    glassCard: {
      background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(30px)', borderRadius: '24px',
      padding: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '15px', position: 'relative'
    },
    progressBar: { position: 'absolute', bottom: '0', left: '24px', right: '24px', height: '3px', background: 'rgba(0,255,65,0.1)', borderRadius: '2px', overflow: 'hidden' },
    progressFill: (p) => ({ width: `${p}%`, height: '100%', background: '#00ff41', boxShadow: '0 0 10px #00ff41' }),
    timeInput: { background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '5px', borderRadius: '5px', fontSize: '14px', marginRight: '5px' }
  };

  // Helper for 15-min window options
  const TimeOptions = ({ val, onChange }) => (
    <select style={styles.timeInput} value={val} onChange={(e) => onChange(e.target.value)}>
      {Array.from({ length: 24 * 4 }).map((_, i) => {
        const h = Math.floor(i / 4).toString().padStart(2, '0');
        const m = ((i % 4) * 15).toString().padStart(2, '0');
        const t = `${h}:${m}`;
        return <option key={t} value={t}>{t}</option>;
      })}
    </select>
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ fontSize: '36px', fontWeight: '800' }}>{time}</div>
        <div onClick={() => setData({...data, dayType: data.dayType === 'SCHOOL' ? 'HOLIDAY' : 'SCHOOL'})} 
             style={{ fontSize: '10px', color: data.dayType === 'SCHOOL' ? '#ff4b4b' : '#00ff41', border: '1px solid', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}>
          {data.dayType} MODE
        </div>
      </header>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', overflowX: 'auto' }}>
        {['TODAY', 'TOMORROW', 'TRADING'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={styles.tab(activeTab === t)}>{t}</button>
        ))}
      </div>

      {activeTab === 'TODAY' && (
        <div style={styles.glassCard}>
          <span style={{ fontSize: '10px', color: '#444', letterSpacing: '2px' }}>CURRENT MISSION</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <span style={{ fontSize: '24px', fontWeight: '700', color: data.today.completed ? '#222' : 'white' }}>{data.today.mission}</span>
            <input type="checkbox" checked={data.today.completed} onChange={handleComplete} style={{ width: '24px', height: '24px' }} />
          </div>
          <div style={styles.progressBar}><div style={styles.progressFill(data.today.progress)} /></div>
          
          <div style={{ marginTop: '40px', display: 'flex', gap: '20px' }}>
            <div>
              <span style={{ fontSize: '9px', color: '#444' }}>SLEEP</span>
              <TimeOptions val={data.recovery.sleep} onChange={(t) => setData({...data, recovery: {...data.recovery, sleep: t}})} />
            </div>
            <div>
              <span style={{ fontSize: '9px', color: '#444' }}>WAKE</span>
              <TimeOptions val={data.recovery.wake} onChange={(t) => setData({...data, recovery: {...data.recovery, wake: t}})} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'TOMORROW' && (
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button onClick={() => setData({...data, tomorrow: {blocks: [...data.tomorrow.blocks, {id: Date.now(), subject: 'FLOW_BLOCK', duration: '60'}]}})} style={{ background: '#111', color: 'white', border: '1px solid #222', padding: '10px', borderRadius: '12px', fontSize: '11px' }}>+ 60M</button>
            <button onClick={() => setData({...data, tomorrow: {blocks: [...data.tomorrow.blocks, {id: Date.now(), subject: 'FLOW_BLOCK', duration: '90'}]}})} style={{ background: '#111', color: 'white', border: '1px solid #222', padding: '10px', borderRadius: '12px', fontSize: '11px' }}>+ 90M</button>
          </div>
          
          {data.dayType === 'SCHOOL' && (
            <div style={{ ...styles.glassCard, opacity: 0.5, borderStyle: 'dashed' }}>
              <span style={{ fontSize: '10px' }}>08:00 - 15:30 // SCHOOL_MANDATORY</span>
            </div>
          )}

          {data.tomorrow.blocks.map((block) => (
            <div key={block.id} style={styles.glassCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <input style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '18px', fontWeight: '700', outline: 'none' }} value={block.subject} onChange={(e) => {
                  const newB = data.tomorrow.blocks.map(b => b.id === block.id ? {...b, subject: e.target.value.toUpperCase()} : b);
                  setData({...data, tomorrow: {blocks: newB}});
                }} />
                <button onClick={() => removeBlock(block.id)} style={{ background: 'transparent', border: 'none', color: '#ff4b4b' }}>✕</button>
              </div>
              <span style={{ fontSize: '10px', color: '#00ff41' }}>{block.duration} MIN BLOCK</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;