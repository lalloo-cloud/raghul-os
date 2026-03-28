import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour12: false }));
  const [activeTab, setActiveTab] = useState('TODAY');
  
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('raghul_os_v15');
    return saved ? JSON.parse(saved) : {
      today: { mission: 'PHYSICS', duration: '90', strategy: 'NY AM KILLZONE' },
      tomorrow: { mission: 'CALCULUS', duration: '120', strategy: 'LONDON OPEN' },
      recovery: { sleep: '11:00 PM', wake: '07:00 AM' }
    };
  });

  const [notes, setNotes] = useState(() => localStorage.getItem('raghul_notes_v15') || "> SYSTEM_REBOOT_COMPLETE\n> STATUS: ELITE_OPS\n> MONITORING_ACTIVE");

  useEffect(() => {
    localStorage.setItem('raghul_os_v15', JSON.stringify(data));
    localStorage.setItem('raghul_notes_v15', notes);
  }, [data, notes]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour12: false })), 1000);
    return () => clearInterval(timer);
  }, []);

  const styles = {
    container: { 
      backgroundColor: '#000', color: 'white', minHeight: '100vh', padding: '25px', 
      fontFamily: '"JetBrains Mono", monospace', backgroundImage: 'radial-gradient(circle at 2px 2px, #111 1px, transparent 0)', backgroundSize: '40px 40px' 
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' },
    tabBtn: (active) => ({
      background: active ? 'rgba(0, 255, 65, 0.1)' : 'transparent', 
      border: 'none', color: active ? '#00ff41' : '#444', fontSize: '12px', fontWeight: 'bold',
      cursor: 'pointer', padding: '8px 20px', letterSpacing: '2px', borderBottom: active ? '2px solid #00ff41' : '2px solid transparent'
    }),
    grid: { display: 'flex', flexDirection: window.innerWidth < 1000 ? 'column' : 'row', gap: '20px' },
    card: { 
      backgroundColor: 'rgba(10, 10, 10, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid #1a1a1a', 
      padding: '30px', position: 'relative', flex: 1, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' 
    },
    label: { fontSize: '9px', color: '#666', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '15px', display: 'block' },
    input: { background: 'transparent', border: 'none', color: '#fff', fontSize: '28px', fontWeight: '900', outline: 'none', width: '100%', textShadow: '0 0 10px rgba(255,255,255,0.2)' },
    accent: (color) => ({ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: color, boxShadow: `0 0 15px ${color}` }),
    badge: { fontSize: '8px', padding: '3px 8px', border: '1px solid #00ff41', color: '#00ff41', position: 'absolute', top: '20px', right: '20px' }
  };

  const Page = ({ day }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.grid}>
      <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={styles.card}>
          <div style={styles.accent('#00ff41')} />
          <div style={styles.badge}>NON-NEGOTIABLE</div>
          <span style={styles.label}>Active Mission Block</span>
          <input style={styles.input} value={data[day].mission} onChange={(e) => setData({...data, [day]: {...data[day], mission: e.target.value.toUpperCase()}})} />
          <div style={{ color: '#00ff41', fontSize: '10px', marginTop: '10px' }}>⚡ SESSION_LENGTH: {data[day].duration} MIN</div>
        </div>

        <div style={styles.card}>
          <div style={styles.accent('#00ccff')} />
          <span style={styles.label}>Execution Strategy</span>
          <input style={{ ...styles.input, fontSize: '20px' }} value={data[day].strategy} onChange={(e) => setData({...data, [day]: {...data[day], strategy: e.target.value.toUpperCase()}})} />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={styles.card}>
          <div style={styles.accent('#333')} />
          <span style={styles.label}>Recovery Metrics</span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '8px', color: '#444', marginBottom: '5px' }}>TARGET_SLEEP</div>
              <input style={{ ...styles.input, fontSize: '16px' }} value={data.recovery.sleep} onChange={(e) => setData({...data, recovery: {...data.recovery, sleep: e.target.value}})} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '8px', color: '#444', marginBottom: '5px' }}>ACTUAL_WAKE</div>
              <input style={{ ...styles.input, fontSize: '16px' }} value={data.recovery.wake} onChange={(e) => setData({...data, recovery: {...data.recovery, wake: e.target.value}})} />
            </div>
          </div>
        </div>

        <div style={{ ...styles.card, background: '#050505' }}>
          <div style={styles.accent('#ff4b4b')} />
          <span style={styles.label}>System Terminal</span>
          <textarea 
            style={{ background: 'transparent', border: 'none', color: '#00ff41', width: '100%', height: '140px', outline: 'none', fontFamily: 'monospace', fontSize: '12px', resize: 'none' }}
            value={notes} onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <div style={{ fontSize: '10px', color: '#555', letterSpacing: '6px', marginBottom: '15px' }}>SYSTEM_CORE_V15</div>
          <div style={{ display: 'flex', gap: '5px' }}>
            {['TODAY', 'TOMORROW', 'INSIGHTS'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={styles.tabBtn(activeTab === t)}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '38px', fontWeight: '900', letterSpacing: '-2px', color: '#fff' }}>{time}</div>
          <div style={{ fontSize: '9px', color: '#00ff41', letterSpacing: '2px' }}>SHIELD_ACTIVE // ENCRYPTED</div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'TODAY' && <Page key="today" day="today" />}
        {activeTab === 'TOMORROW' && <Page key="tomorrow" day="tomorrow" />}
        {activeTab === 'INSIGHTS' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ ...styles.card, textAlign: 'center', padding: '100px' }}>
            <span style={styles.label}>Data Stream Offline</span>
            <div style={{ color: '#222' }}>AGGREGATING_SYSTEM_METRICS...</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;