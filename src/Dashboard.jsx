import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const Dashboard = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour12: false }));
  const [activeTab, setActiveTab] = useState('TODAY');
  
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('raghul_os_v20');
    return saved ? JSON.parse(saved) : {
      dayType: 'HOLIDAY', // SCHOOL or HOLIDAY
      activityType: 'NONE', // WORK or TRIP
      activityStart: '15:00',
      today: { mission: 'PHYSICS', duration: '90', completed: false, progress: 40 },
      tomorrow: { blocks: [] },
      trading: { targetSession: 'NEW YORK' },
      recovery: { sleep: '23:00', wake: '07:00' }
    };
  });

  useEffect(() => {
    localStorage.setItem('raghul_os_v20', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour12: false })), 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateSleep = () => {
    const [sH, sM] = data.recovery.sleep.split(':').map(Number);
    const [wH, wM] = data.recovery.wake.split(':').map(Number);
    let diff = (wH * 60 + wM) - (sH * 60 + sM);
    if (diff < 0) diff += 24 * 60; 
    return (diff / 60).toFixed(1);
  };

  const getCurrentSession = () => {
    const hour = new Date().getHours();
    if (hour >= 8 && hour < 12) return 'LONDON';
    if (hour >= 13 && hour < 17) return 'NEW YORK';
    return 'ASIA';
  };

  const styles = {
    container: { backgroundColor: '#000', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'monospace' },
    glassCard: { background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(40px)', borderRadius: '24px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '15px', position: 'relative' },
    tab: (active) => ({ padding: '10px 20px', borderRadius: '14px', fontSize: '11px', fontWeight: 'bold', border: 'none', background: active ? 'rgba(255,255,255,0.12)' : 'transparent', color: active ? '#00ff41' : '#444' }),
    select: { background: '#111', color: '#00ff41', border: '1px solid #222', borderRadius: '8px', padding: '8px', outline: 'none' }
  };

  const TimePicker = ({ val, onChange }) => (
    <select style={styles.select} value={val} onChange={(e) => onChange(e.target.value)}>
      {Array.from({ length: 24 * 4 }).map((_, i) => {
        const t = `${Math.floor(i/4).toString().padStart(2,'0')}:${((i%4)*15).toString().padStart(2,'0')}`;
        return <option key={t} value={t}>{t}</option>;
      })}
    </select>
  );

  return (
    <div style={styles.container}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div style={{ fontSize: '32px', fontWeight: '800' }}>{time}</div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '9px', color: '#00ff41' }}>{data.dayType} MODE</div>
          <div style={{ fontSize: '9px', color: '#ff4b4b' }}>{data.activityType !== 'NONE' ? `${data.activityType} ACTIVE` : ''}</div>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        {['TODAY', 'TOMORROW', 'TRADING'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={styles.tab(activeTab === t)}>{t}</button>
        ))}
      </div>

      {activeTab === 'TODAY' && (
        <>
          <div style={styles.glassCard}>
            <span style={{ fontSize: '10px', color: '#444' }}>CURRENT SCHEDULED MISSION</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.tomorrow.blocks[0]?.subject || 'NO MISSION'}</span>
              <input type="checkbox" onChange={() => confetti()} style={{ width: '20px' }} />
            </div>
          </div>

          <div style={styles.glassCard}>
            <span style={{ fontSize: '10px', color: '#444' }}>RECOVERY LOG</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
              <div style={{ color: '#00ff41' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{calculateSleep()}H</div>
                <div style={{ fontSize: '8px' }}>SLEEP DURATION</div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <TimePicker val={data.recovery.sleep} onChange={(t) => setData({...data, recovery: {...data.recovery, sleep: t}})} />
                <TimePicker val={data.recovery.wake} onChange={(t) => setData({...data, recovery: {...data.recovery, wake: t}})} />
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'TOMORROW' && (
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <select style={styles.select} onChange={(e) => setData({...data, dayType: e.target.value})}>
              <option value="HOLIDAY">HOLIDAY</option>
              <option value="SCHOOL">SCHOOL DAY</option>
            </select>
            <select style={styles.select} onChange={(e) => setData({...data, activityType: e.target.value})}>
              <option value="NONE">NORMAL</option>
              <option value="WORK">WORK (5H)</option>
              <option value="TRIP">TRIP (5H)</option>
            </select>
          </div>

          {data.dayType === 'SCHOOL' && <div style={{...styles.glassCard, color: '#ff4b4b'}}>08:00 - 15:30 // SCHOOL BLOCK</div>}
          {data.activityType !== 'NONE' && <div style={{...styles.glassCard, color: '#00ccff'}}>{data.activityStart} // {data.activityType} 5H BLACKOUT</div>}

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button onClick={() => setData({...data, tomorrow: {blocks: [...data.tomorrow.blocks, {id: Date.now(), subject: 'MATH', duration: 60}]}})} style={{ flex: 1, padding: '10px', background: '#111', color: 'white', border: 'none', borderRadius: '10px' }}>+ 60M</button>
            <button onClick={() => setData({...data, tomorrow: {blocks: [...data.tomorrow.blocks, {id: Date.now(), subject: 'MATH', duration: 90}]}})} style={{ flex: 1, padding: '10px', background: '#111', color: 'white', border: 'none', borderRadius: '10px' }}>+ 90M</button>
          </div>

          {data.tomorrow.blocks.map((block, i) => (
            <div key={block.id} style={styles.glassCard}>
              <select style={{...styles.select, width: '100%', marginBottom: '10px'}} value={block.subject} onChange={(e) => {
                const newB = [...data.tomorrow.blocks]; newB[i].subject = e.target.value; setData({...data, tomorrow: {blocks: newB}});
              }}>
                {['MATH', 'PHYSICS', 'CYBERSECURITY', 'GLOBAL POWER'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div style={{fontSize: '10px', color: '#00ff41'}}>{block.duration} MIN SESSION</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'TRADING' && (
        <div style={styles.glassCard}>
          <div style={{marginBottom: '20px'}}>
            <span style={{fontSize: '10px', color: '#444'}}>CURRENT MARKET</span>
            <div style={{fontSize: '24px', color: '#00ff41'}}>{getCurrentSession()} SESSION</div>
          </div>
          <span style={{fontSize: '10px', color: '#444'}}>TARGET SESSION</span>
          <select style={{...styles.select, width: '100%', marginTop: '5px'}} value={data.trading.targetSession} onChange={(e) => setData({...data, trading: {...data.trading, targetSession: e.target.value}})}>
            <option value="LONDON">LONDON</option>
            <option value="NEW YORK">NEW YORK</option>
            <option value="ASIA">ASIA</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default Dashboard;