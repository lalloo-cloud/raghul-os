import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour12: false }));
  const [activeTab, setActiveTab] = useState('TODAY');
  
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('raghul_os_v17');
    return saved ? JSON.parse(saved) : {
      today: { mission: 'PHYSICS', duration: '90', completed: false },
      tomorrow: { blocks: [{ id: 1, type: 'FLOW', subject: 'MATH', duration: '90' }] },
      trading: { strategy: 'NY AM KILLZONE', pair: 'EURUSD', window: '08:30 - 11:00' },
      recovery: { sleep: '11:00 PM', wake: '07:00 AM' }
    };
  });

  useEffect(() => {
    localStorage.setItem('raghul_os_v17', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour12: false })), 1000);
    return () => clearInterval(timer);
  }, []);

  const addTomorrowBlock = (mins) => {
    const newBlock = { id: Date.now(), type: 'FLOW', subject: 'NEW_TASK', duration: mins };
    setData({...data, tomorrow: { blocks: [...data.tomorrow.blocks, newBlock] }});
  };

  const styles = {
    container: { backgroundColor: '#000', color: 'white', minHeight: '100vh', padding: '15px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica' },
    header: { marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #111' },
    clock: { fontSize: '32px', fontWeight: '800', letterSpacing: '-1px', display: 'block' },
    tabBar: { display: 'flex', gap: '10px', marginBottom: '25px', overflowX: 'auto', paddingBottom: '5px' },
    tab: (active) => ({
      padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', border: 'none',
      background: active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
      color: active ? '#00ff41' : '#666', backdropFilter: 'blur(10px)', transition: '0.2s'
    }),
    glassCard: {
      background: 'rgba(20, 20, 20, 0.6)', backdropFilter: 'blur(20px)', borderRadius: '20px',
      padding: '20px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '15px'
    },
    label: { fontSize: '10px', color: '#444', letterSpacing: '1px', fontWeight: 'bold', display: 'block', marginBottom: '8px' },
    btn: { background: '#00ff41', color: '#000', border: 'none', borderRadius: '8px', padding: '8px 12px', fontWeight: 'bold', fontSize: '11px' }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <span style={{ fontSize: '10px', color: '#00ff41', fontWeight: 'bold' }}>RAGHUL_OS // V17</span>
        <span style={styles.clock}>{time}</span>
      </header>

      <div style={styles.tabBar}>
        {['TODAY', 'TOMORROW', 'TRADING', 'INSIGHTS'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={styles.tab(activeTab === t)}>{t}</button>
        ))}
      </div>

      {activeTab === 'TODAY' && (
        <div>
          <div style={styles.glassCard}>
            <span style={styles.label}>ACTIVE MISSION</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{data.today.mission}</span>
              <input type="checkbox" checked={data.today.completed} onChange={() => setData({...data, today: {...data.today, completed: !data.today.completed}})} style={{ width: '20px', height: '20px' }} />
            </div>
            <span style={{ color: '#00ff41', fontSize: '10px' }}>{data.today.duration} MIN SESSION</span>
          </div>

          <div style={styles.glassCard}>
            <span style={styles.label}>RECOVERY LOG</span>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '8px', color: '#333' }}>SLEEP</div>
                <input style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '16px', outline: 'none', width: '80px' }} value={data.recovery.sleep} onChange={(e) => setData({...data, recovery: {...data.recovery, sleep: e.target.value}})} />
              </div>
              <div>
                <div style={{ fontSize: '8px', color: '#333' }}>WAKE</div>
                <input style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '16px', outline: 'none', width: '80px' }} value={data.recovery.wake} onChange={(e) => setData({...data, recovery: {...data.recovery, wake: e.target.value}})} />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'TOMORROW' && (
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button onClick={() => addTomorrowBlock(60)} style={styles.btn}>+ 60m BLOCK</button>
            <button onClick={() => addTomorrowBlock(90)} style={styles.btn}>+ 90m BLOCK</button>
          </div>
          {data.tomorrow.blocks.map((block, index) => (
            <div key={block.id} style={styles.glassCard}>
              <span style={styles.label}>BLOCK_{index + 1} ({block.duration}M)</span>
              <input 
                style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '18px', fontWeight: 'bold', width: '100%', outline: 'none' }}
                value={block.subject}
                onChange={(e) => {
                  const newBlocks = [...data.tomorrow.blocks];
                  newBlocks[index].subject = e.target.value.toUpperCase();
                  setData({...data, tomorrow: { blocks: newBlocks }});
                }}
              />
            </div>
          ))}
        </div>
      )}

      {activeTab === 'TRADING' && (
        <div style={styles.glassCard}>
          <span style={styles.label}>STRATEGY_EXECUTION</span>
          <input style={{ background: 'transparent', border: 'none', color: '#00ff41', fontSize: '20px', fontWeight: 'bold', width: '100%', outline: 'none', marginBottom: '10px' }} value={data.trading.strategy} onChange={(e) => setData({...data, trading: {...data.trading, strategy: e.target.value.toUpperCase()}})} />
          <span style={styles.label}>TIME_WINDOW</span>
          <input style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '16px', width: '100%', outline: 'none' }} value={data.trading.window} onChange={(e) => setData({...data, trading: {...data.trading, window: e.target.value}})} />
        </div>
      )}

      {activeTab === 'INSIGHTS' && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#222' }}>
          <div style={{ fontSize: '10px' }}>SYSTEM_ANALYTICS_OFFLINE</div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;