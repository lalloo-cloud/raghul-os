import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour12: false }));
  const [activeTab, setActiveTab] = useState('TODAY');
  
  // Clean state for Today, Tomorrow, and Insights
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('raghul_os_v16');
    return saved ? JSON.parse(saved) : {
      today: { mission: 'PHYSICS', duration: '90', strategy: 'NY AM KILLZONE', time: '08:30 - 11:00' },
      tomorrow: { mission: 'SET_MISSION', duration: '0', strategy: 'SET_STRATEGY', time: '00:00 - 00:00' },
      recovery: { sleep: '11:00 PM', wake: '07:00 AM' },
      stats: { missionsCompleted: 12, totalHours: 48 }
    };
  });

  const [notes, setNotes] = useState(() => localStorage.getItem('raghul_notes_v16') || "> SYSTEM_STABLE\n> READY_FOR_INPUT");

  useEffect(() => {
    localStorage.setItem('raghul_os_v16', JSON.stringify(data));
    localStorage.setItem('raghul_notes_v16', notes);
  }, [data, notes]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour12: false })), 1000);
    return () => clearInterval(timer);
  }, []);

  const styles = {
    container: { backgroundColor: '#000', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'monospace', overflowX: 'hidden' },
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '1px solid #111', paddingBottom: '15px' },
    tabBtn: (active) => ({
      background: 'none', border: 'none', color: active ? '#00ff41' : '#333', fontSize: '13px', fontWeight: 'bold',
      cursor: 'pointer', marginRight: '15px', borderBottom: active ? '2px solid #00ff41' : 'none', paddingBottom: '5px'
    }),
    // Fixed: Flex-wrap allows phone stacking without "glitching" or sliding
    mainGrid: { display: 'flex', flexWrap: 'wrap', gap: '20px' },
    card: { 
      backgroundColor: '#080808', borderLeft: '4px solid #1a1a1a', padding: '20px', 
      flex: '1 1 300px', // This makes it wide on Mac but stacks on Phone
      minWidth: '280px' 
    },
    label: { fontSize: '9px', color: '#444', letterSpacing: '2px', marginBottom: '10px', display: 'block' },
    input: { background: 'transparent', border: 'none', color: '#fff', fontSize: '20px', fontWeight: 'bold', outline: 'none', width: '100%', fontFamily: 'monospace' },
    subInput: { background: 'transparent', border: 'none', color: '#00ff41', fontSize: '11px', outline: 'none', width: '100%', marginTop: '5px' }
  };

  const renderPage = (dayKey) => (
    <div style={styles.mainGrid}>
      <div style={{...styles.card, borderLeftColor: '#00ff41'}}>
        <span style={styles.label}>ACTIVE_MISSION_BLOCK</span>
        <input style={styles.input} value={data[dayKey].mission} onChange={(e) => setData({...data, [dayKey]: {...data[dayKey], mission: e.target.value.toUpperCase()}})} />
        <div style={{display: 'flex', gap: '10px'}}>
           <input style={styles.subInput} value={`${data[dayKey].duration} MIN`} onChange={(e) => setData({...data, [dayKey]: {...data[dayKey], duration: e.target.value.replace(/\D/g,'')}})} />
           <input style={styles.subInput} value={data[dayKey].time} onChange={(e) => setData({...data, [dayKey]: {...data[dayKey], time: e.target.value}})} />
        </div>
      </div>

      <div style={{...styles.card, borderLeftColor: '#00ccff'}}>
        <span style={styles.label}>NON_NEGOTIABLE_STRATEGY</span>
        <input style={styles.input} value={data[dayKey].strategy} onChange={(e) => setData({...data, [dayKey]: {...data[dayKey], strategy: e.target.value.toUpperCase()}})} />
      </div>

      <div style={styles.card}>
        <span style={styles.label}>RECOVERY_LOG</span>
        <div style={{display: 'flex', gap: '10px'}}>
          <input style={{...styles.input, fontSize: '14px'}} value={data.recovery.sleep} onChange={(e) => setData({...data, recovery: {...data.recovery, sleep: e.target.value}})} />
          <input style={{...styles.input, fontSize: '14px'}} value={data.recovery.wake} onChange={(e) => setData({...data, recovery: {...data.recovery, wake: e.target.value}})} />
        </div>
      </div>

      <div style={{...styles.card, borderLeftColor: '#ff4b4b', flex: '1 1 100%'}}>
        <span style={styles.label}>TERMINAL_INPUT</span>
        <textarea 
          style={{background: 'transparent', border: 'none', color: '#00ff41', width: '100%', height: '80px', outline: 'none', resize: 'none', fontFamily: 'monospace'}}
          value={notes} onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <div style={{fontSize: '9px', color: '#222', marginBottom: '10px'}}>RAGHUL_OS_v16</div>
          <div style={{display: 'flex'}}>
            {['TODAY', 'TOMORROW', 'INSIGHTS'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={styles.tabBtn(activeTab === t)}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{textAlign: 'right'}}>
          <div style={{fontSize: '28px', fontWeight: 'bold'}}>{time}</div>
          <div style={{fontSize: '8px', color: '#00ff41'}}>SYSTEM_OPERATIONAL</div>
        </div>
      </div>

      {activeTab === 'TODAY' && renderPage('today')}
      {activeTab === 'TOMORROW' && renderPage('tomorrow')}
      {activeTab === 'INSIGHTS' && (
        <div style={styles.mainGrid}>
          <div style={styles.card}>
            <span style={styles.label}>MISSIONS_COMPLETED</span>
            <div style={{fontSize: '24px', fontWeight: 'bold'}}>{data.stats.missionsCompleted}</div>
          </div>
          <div style={styles.card}>
            <span style={styles.label}>TOTAL_FLOW_HOURS</span>
            <div style={{fontSize: '24px', fontWeight: 'bold'}}>{data.stats.totalHours}H</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;