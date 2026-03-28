import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour12: false }));
  const [activeTab, setActiveTab] = useState('TODAY');
  
  // Editable State
  const [plan, setPlan] = useState(() => {
    const saved = localStorage.getItem('raghul_os_v13');
    return saved ? JSON.parse(saved) : {
      mission: 'PHYSICS',
      duration: '90',
      strategy: 'NY AM KILLZONE',
      sleep: '11:00 PM',
      wake: '7:00 AM'
    };
  });

  const [notes, setNotes] = useState(() => localStorage.getItem('raghul_notes') || "");

  useEffect(() => {
    localStorage.setItem('raghul_os_v13', JSON.stringify(plan));
    localStorage.setItem('raghul_notes', notes);
  }, [plan, notes]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour12: false })), 1000);
    return () => clearInterval(timer);
  }, []);

  const styles = {
    container: { backgroundColor: '#000', color: 'white', minHeight: '100vh', padding: '15px', fontFamily: 'monospace' },
    header: { marginBottom: '20px', borderBottom: '1px solid #111', paddingBottom: '10px' },
    tabContainer: { display: 'flex', gap: '15px', marginBottom: '20px' },
    tab: (active) => ({
      color: active ? '#00ff41' : '#333',
      fontSize: '14px', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer',
      borderBottom: active ? '2px solid #00ff41' : 'none'
    }),
    // The "Fluid" Stack: Column on phone, Row on Mac
    mainGrid: {
      display: 'flex',
      flexDirection: window.innerWidth < 768 ? 'column' : 'row',
      gap: '15px'
    },
    card: { 
      backgroundColor: '#080808', border: '1px solid #1a1a1a', padding: '15px', flex: 1,
      display: 'flex', flexDirection: 'column', gap: '8px'
    },
    input: {
      background: 'transparent', border: 'none', color: '#00ff41', fontSize: '18px', 
      fontWeight: '900', outline: 'none', width: '100%', fontFamily: 'monospace'
    },
    label: { fontSize: '9px', color: '#444', letterSpacing: '2px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: '#333' }}>RAGHUL_SYSTEM_V13</span>
          <span style={{ fontSize: '20px', fontWeight: '900' }}>{time}</span>
        </div>
      </div>

      <div style={styles.tabContainer}>
        {['TODAY', 'TOMORROW', 'INSIGHTS'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={styles.tab(activeTab === t)}>{t}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'TODAY' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.mainGrid}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1.5 }}>
              <div style={{ ...styles.card, borderLeft: '4px solid #00ff41' }}>
                <span style={styles.label}>ACTIVE MISSION</span>
                <input 
                  style={styles.input} 
                  value={plan.mission} 
                  onChange={(e) => setPlan({...plan, mission: e.target.value.toUpperCase()})}
                />
                <div style={{ fontSize: '10px', color: '#444' }}>{plan.duration} MIN SESSION</div>
              </div>

              <div style={{ ...styles.card, borderLeft: '4px solid #00ccff' }}>
                <span style={styles.label}>STRATEGY</span>
                <input 
                  style={{ ...styles.input, color: 'white' }} 
                  value={plan.strategy} 
                  onChange={(e) => setPlan({...plan, strategy: e.target.value.toUpperCase()})}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
              <div style={styles.card}>
                <span style={styles.label}>RECOVERY LOG</span>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '8px', color: '#333' }}>SLEEP</div>
                    <input style={{ ...styles.input, fontSize: '12px' }} value={plan.sleep} onChange={(e) => setPlan({...plan, sleep: e.target.value})}/>
                  </div>
                  <div>
                    <div style={{ fontSize: '8px', color: '#333' }}>WAKE</div>
                    <input style={{ ...styles.input, fontSize: '12px' }} value={plan.wake} onChange={(e) => setPlan({...plan, wake: e.target.value})}/>
                  </div>
                </div>
              </div>

              <div style={{ ...styles.card, minHeight: '150px' }}>
                <span style={styles.label}>TERMINAL_NOTES</span>
                <textarea 
                  style={{ background: 'transparent', border: 'none', color: '#888', resize: 'none', outline: 'none', height: '100%', fontSize: '12px' }}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter secure data..."
                />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'TOMORROW' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '40px', textAlign: 'center', color: '#222' }}>
            <div style={{ fontSize: '10px' }}>[ NEXT_OBJECTIVE_LOCKED ]</div>
            <div style={{ fontSize: '12px', marginTop: '10px' }}>FINISH TODAY TO UNLOCK</div>
          </motion.div>
        )}

        {activeTab === 'INSIGHTS' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '40px', textAlign: 'center', color: '#222' }}>
            <div style={{ fontSize: '10px' }}>[ ANALYTICS_OFFLINE ]</div>
            <div style={{ fontSize: '12px', marginTop: '10px' }}>DATA COLLECTION IN PROGRESS</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;