// --- RAGHUL_OS v12: MOBILE RESPONSIVE PATCH ---
// Replace your current Dashboard component with this logic

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour12: false }));
  const [activeTab, setActiveTab] = useState('TODAY');
  
  // Terminal and Plan state remains the same
  const [terminalNotes, setTerminalNotes] = useState(() => localStorage.getItem('raghul_terminal') || "");
  const [plan, setPlan] = useState(() => {
    const saved = localStorage.getItem('raghul_os_v11');
    return saved ? JSON.parse(saved) : {
      blocks: [{ id: 1, subject: 'PHYSICS', size: 90 }],
      tradingSession: { name: 'NY AM', start: '08:30', end: '11:00' },
      sleepLog: { slept: '23:00', woke: '07:00' },
      lastUpdate: new Date().toDateString()
    };
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour12: false })), 1000);
    return () => clearInterval(timer);
  }, []);

  const styles = {
    container: { 
      backgroundColor: '#020202', 
      color: 'white', 
      minHeight: '100vh', 
      padding: '20px', // Reduced padding for mobile
      fontFamily: 'Inter, sans-serif',
      overflowX: 'hidden' // Prevents the "glitchy" side-sliding
    },
    header: {
      display: 'flex',
      flexDirection: window.innerWidth < 600 ? 'column-reverse' : 'row', // Stack clock on top for mobile
      justifyContent: 'space-between',
      alignItems: window.innerWidth < 600 ? 'flex-start' : 'flex-end',
      marginBottom: '30px',
      gap: '20px'
    },
    // NEW RESPONSIVE GRID
    grid: {
      display: 'flex',
      flexDirection: window.innerWidth < 800 ? 'column' : 'row', // The magic switch
      gap: '20px',
      width: '100%'
    },
    card: { 
      backgroundColor: '#080808', 
      borderLeft: '3px solid #1a1a1a', 
      padding: '20px', 
      flex: 1,
      width: '100%' 
    },
    accentCard: { 
      borderLeft: '3px solid #00ff41', 
      backgroundColor: '#080808', 
      padding: '20px', 
      flex: 1.5,
      width: '100%' 
    },
    label: { fontSize: '9px', color: '#555', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 'bold' },
    tabBtn: (active) => ({
      background: 'none', border: 'none', color: active ? '#00ff41' : '#333', fontSize: '16px', fontWeight: '900',
      cursor: 'pointer', marginRight: '15px', borderBottom: active ? '3px solid #00ff41' : '3px solid transparent', paddingBottom: '5px'
    }),
    terminal: {
      position: window.innerWidth < 600 ? 'relative' : 'fixed', // Don't float on small screens
      bottom: '20px', left: '20px', 
      width: window.innerWidth < 600 ? '100%' : '350px', 
      backgroundColor: '#050505',
      border: '1px solid #1a1a1a', borderTop: '2px solid #00ff41', padding: '15px', marginTop: '30px'
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <div style={styles.label}>RAGHUL_SYSTEM_v12_MOBILE_READY</div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {['TODAY', 'TOMORROW', 'INSIGHTS'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={styles.tabBtn(activeTab === t)}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{ textAlign: window.innerWidth < 600 ? 'left' : 'right' }}>
          <div style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-1px' }}>{time}</div>
          <div style={{ fontSize: '8px', color: '#00ff41' }}>SYSTEM_ENCRYPTED // SHIELD_ACTIVE</div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'TODAY' && (
          <motion.div key="today" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={styles.grid}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1.5 }}>
                <div style={styles.accentCard}>
                  <div style={styles.label}>Active Mission Blocks</div>
                  <div style={{ color: '#00ff41', fontSize: '20px', fontWeight: '900' }}>PHYSICS</div>
                  <div style={{ fontSize: '10px', color: '#666' }}>SESSION_LENGTH: 90 MIN</div>
                </div>
                
                <div style={{ ...styles.card, borderLeft: '3px solid #06b6d4' }}>
                  <div style={styles.label}>Strategy</div>
                  <div style={{ fontSize: '20px', fontWeight: '900' }}>NY AM KILLZONE</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                <div style={styles.card}>
                  <div style={styles.label}>Recovery Log</div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '8px', color: '#444' }}>SLEEP: 11:00 PM</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '8px', color: '#444' }}>WAKE: 07:00 AM</div>
                    </div>
                  </div>
                </div>
                
                <div style={styles.card}>
                  <button style={{ width: '100%', padding: '10px', background: '#111', color: '#ff4b4b', border: '1px solid #311', fontSize: '10px', fontWeight: 'bold' }}>WIPE CACHE</button>
                </div>
              </div>
            </div>

            <div style={styles.terminal}>
              <div style={{ ...styles.label, color: '#00ff41', display: 'flex', justifyContent: 'space-between' }}>
                <span>{`> TERMINAL_v12`}</span>
                <span>MEM: OK</span>
              </div>
              <textarea 
                value={terminalNotes}
                onChange={(e) => setTerminalNotes(e.target.value)}
                style={{ width: '100%', height: '100px', background: 'transparent', border: 'none', color: '#aaa', fontFamily: 'monospace', outline: 'none', resize: 'none' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;