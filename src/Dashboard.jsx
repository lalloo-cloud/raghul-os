import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour12: false }));
  const [activeTab, setActiveTab] = useState('TODAY');
  const [insightTab, setInsightTab] = useState('WEEKLY');
  const [terminalNotes, setTerminalNotes] = useState(() => localStorage.getItem('raghul_terminal') || "");
  
  // CORE STATE ENGINE
  const [plan, setPlan] = useState(() => {
    const saved = localStorage.getItem('raghul_os_v11');
    return saved ? JSON.parse(saved) : {
      dayType: 'HOLIDAY',
      blocks: [{ id: 1, subject: 'PHYSICS', size: 90 }],
      commitments: [],
      tradingSession: { name: 'NY AM', start: '08:30', end: '11:00' },
      sleepLog: { slept: '23:00', woke: '07:00' },
      history: [85, 92, 78, 95, 100, 88, 90],
      sleepHistory: [7.5, 8, 6.5, 7.2, 8, 8.5, 7],
      lastUpdate: new Date().toDateString()
    };
  });

  // PERSISTENCE & AUTO-ARCHIVE LOGIC
  useEffect(() => {
    localStorage.setItem('raghul_os_v11', JSON.stringify(plan));
    localStorage.setItem('raghul_terminal', terminalNotes);
    
    // Auto-clear terminal if a new day has started to keep app light
    if (plan.lastUpdate !== new Date().toDateString()) {
      setPlan(prev => ({ ...prev, lastUpdate: new Date().toDateString() }));
      // Optional: Backup notes to history before clearing
    }
  }, [plan, terminalNotes]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour12: false })), 1000);
    return () => clearInterval(timer);
  }, []);

  // SYSTEM UTILITIES
  const clearAllData = useCallback(() => {
    if (window.confirm("CRITICAL: WIPE ALL TELEMETRY DATA?")) {
      localStorage.clear();
      window.location.reload();
    }
  }, []);

  const styles = {
    container: { backgroundColor: '#020202', color: 'white', minHeight: '100vh', padding: '30px', fontFamily: 'Inter, sans-serif' },
    card: { backgroundColor: '#080808', borderLeft: '3px solid #1a1a1a', padding: '20px', marginBottom: '15px', position: 'relative' },
    accentCard: { borderLeft: '3px solid #00ff41', backgroundColor: '#080808', padding: '20px', marginBottom: '15px' },
    label: { fontSize: '9px', color: '#555', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 'bold' },
    btn: (active, color = '#00ff41') => ({
      background: active ? color : '#111',
      color: active ? 'black' : '#444',
      border: 'none', padding: '10px 15px', fontWeight: '900', cursor: 'pointer', fontSize: '11px', transition: '0.2s'
    }),
    tabBtn: (active) => ({
      background: 'none', border: 'none', color: active ? '#00ff41' : '#222', fontSize: '20px', fontWeight: '900',
      cursor: 'pointer', marginRight: '20px', borderBottom: active ? '3px solid #00ff41' : '3px solid transparent', paddingBottom: '5px'
    }),
    terminal: {
      position: 'fixed', bottom: '30px', left: '30px', width: '350px', backgroundColor: '#050505',
      border: '1px solid #1a1a1a', borderTop: '2px solid #00ff41', padding: '15px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)', zIndex: 100
    }
  };

  return (
    <div style={styles.container}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <div style={styles.label}>RAGHUL_SYSTEM_v11_STABLE</div>
          <div style={{ display: 'flex' }}>
            {['TODAY', 'TOMORROW', 'INSIGHTS'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={styles.tabBtn(activeTab === t)}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'right', fontFamily: 'monospace' }}>
          <div style={{ fontSize: '40px', fontWeight: '900', letterSpacing: '-2px' }}>{time}</div>
          <div style={{ fontSize: '9px', color: '#00ff41', letterSpacing: '1px' }}>SYSTEM_ENCRYPTED // SHIELD_ACTIVE</div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'TODAY' && (
          <motion.div key="today" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>
              <div>
                <div style={styles.accentCard}>
                  <div style={styles.label}>Active Mission Blocks</div>
                  {plan.blocks.map((b, i) => (
                    <div key={i} style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #111' }}>
                      <div style={{ color: '#00ff41', fontSize: '18px', fontWeight: '900', fontStyle: 'italic' }}>{b.subject}</div>
                      <div style={{ fontSize: '10px', color: '#666' }}>SESSION_LENGTH: {b.size} MIN</div>
                    </div>
                  ))}
                </div>
                
                <div style={{ ...styles.card, borderLeft: '3px solid #06b6d4' }}>
                  <div style={styles.label}>Non-Negotiable Strategy</div>
                  <div style={{ fontSize: '22px', fontWeight: '900' }}>{plan.tradingSession.name} KILLZONE</div>
                  <div style={{ fontSize: '11px', color: '#06b6d4', fontWeight: 'bold' }}>WINDOW: {plan.tradingSession.start} — {plan.tradingSession.end}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={styles.card}>
                  <div style={styles.label}>Daily Recovery Log</div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '8px', color: '#444', marginBottom: '5px' }}>SLEEP</div>
                      <input type="time" value={plan.sleepLog.slept} onChange={(e) => setPlan({...plan, sleepLog: {...plan.sleepLog, slept: e.target.value}})} style={{ background: '#0c0c0c', border: '1px solid #1a1a1a', color: 'white', padding: '8px', width: '100%', fontSize: '12px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '8px', color: '#444', marginBottom: '5px' }}>WAKE</div>
                      <input type="time" value={plan.sleepLog.woke} onChange={(e) => setPlan({...plan, sleepLog: {...plan.sleepLog, woke: e.target.value}})} style={{ background: '#0c0c0c', border: '1px solid #1a1a1a', color: 'white', padding: '8px', width: '100%', fontSize: '12px' }} />
                    </div>
                  </div>
                </div>
                
                <div style={styles.card}>
                  <div style={styles.label}>Security & Maintenance</div>
                  <button onClick={clearAllData} style={{ width: '100%', padding: '12px', background: '#111', color: '#ff4b4b', border: '1px solid #331111', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}>WIPE LOCAL CACHE</button>
                </div>
              </div>
            </div>

            <div style={styles.terminal}>
              <div style={{ ...styles.label, color: '#00ff41', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #111', paddingBottom: '8px', marginBottom: '10px' }}>
                <span>{`> TERMINAL_SYNC_v11`}</span>
                <span style={{ fontSize: '8px', opacity: 0.5 }}>MEM: OK</span>
              </div>
              <textarea 
                placeholder="Secure note entry..."
                value={terminalNotes}
                onChange={(e) => setTerminalNotes(e.target.value)}
                style={{ width: '100%', height: '140px', background: 'transparent', border: 'none', color: '#aaa', fontFamily: 'monospace', fontSize: '11px', outline: 'none', resize: 'none' }}
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'TOMORROW' && (
          <motion.div key="tomorrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={styles.card}>
                <div style={styles.label}>Session Architecture</div>
                {plan.blocks.map((block, index) => (
                  <div key={index} style={{ background: '#0c0c0c', padding: '15px', marginBottom: '10px', border: '1px solid #1a1a1a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                       <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#444' }}>BLOCK_0{index + 1}</span>
                       <button onClick={() => setPlan({...plan, blocks: plan.blocks.filter((_, i) => i !== index)})} style={{ background: 'none', border: 'none', color: '#ff4b4b', fontSize: '9px', cursor: 'pointer' }}>[X]</button>
                    </div>
                    <select value={block.subject} onChange={(e) => {
                      const newBlocks = [...plan.blocks];
                      newBlocks[index].subject = e.target.value;
                      setPlan({...plan, blocks: newBlocks});
                    }} style={{ width: '100%', background: '#111', color: 'white', border: 'none', padding: '10px', marginBottom: '10px', fontWeight: 'bold' }}>
                      {['PHYSICS', 'TRADING', 'CYBERSECURITY', 'GLOBAL POWER'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {[60, 90].map(sz => (
                        <button key={sz} onClick={() => {
                          const newBlocks = [...plan.blocks];
                          newBlocks[index].size = sz;
                          setPlan({...plan, blocks: newBlocks});
                        }} style={styles.btn(block.size === sz)}>{sz}M</button>
                      ))}
                    </div>
                  </div>
                ))}
                {plan.blocks.length < 3 && (
                  <button onClick={() => setPlan({...plan, blocks: [...plan.blocks, { id: Date.now(), subject: 'PHYSICS', size: 90 }]})} style={{ width: '100%', padding: '12px', background: 'transparent', color: '#00ff41', border: '1px dashed #00ff41', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>+ ADD OPERATION</button>
                )}
              </div>

              <div style={styles.card}>
                <div style={styles.label}>Mandatory Trading Parameters</div>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                  {['ASIA', 'LONDON', 'NY AM', 'NY PM'].map(n => (
                    <button key={n} onClick={() => setPlan({...plan, tradingSession: {...plan.tradingSession, name: n}})} style={styles.btn(plan.tradingSession.name === n, '#06b6d4')}>{n}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <input type="time" value={plan.tradingSession.start} onChange={(e) => setPlan({...plan, tradingSession: {...plan.tradingSession, start: e.target.value}})} style={{ flex: 1, background: '#111', border: 'none', color: 'white', padding: '10px', fontSize: '12px' }} />
                  <input type="time" value={plan.tradingSession.end} onChange={(e) => setPlan({...plan, tradingSession: {...plan.tradingSession, end: e.target.value}})} style={{ flex: 1, background: '#111', border: 'none', color: 'white', padding: '10px', fontSize: '12px' }} />
                </div>
                
                <div style={styles.label}>Day Topology</div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                  {['SCHOOL', 'HOLIDAY'].map(t => (
                    <button key={t} onClick={() => setPlan({...plan, dayType: t})} style={styles.btn(plan.dayType === t, 'white')}>{t}</button>
                  ))}
                </div>
                <button onClick={() => setActiveTab('TODAY')} style={{ width: '100%', padding: '25px', background: '#00ff41', color: 'black', fontWeight: '900', border: 'none', fontStyle: 'italic', fontSize: '18px', cursor: 'pointer', boxShadow: '0 0 20px rgba(0,255,65,0.2)' }}>INITIATE MISSION</button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'INSIGHTS' && (
          <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {['WEEKLY', 'MONTHLY', 'SLEEP_TRACKER'].map(t => (
                <button key={t} onClick={() => setInsightTab(t)} style={styles.btn(insightTab === t, '#00ff41')}>{t}</button>
              ))}
            </div>
            <div style={styles.card}>
              <div style={styles.label}>{insightTab} PERFORMANCE TELEMETRY</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '220px', marginTop: '30px', paddingBottom: '20px' }}>
                {(insightTab === 'SLEEP_TRACKER' ? plan.sleepHistory : plan.history).map((val, i) => (
                  <div key={i} style={{ flex: 1, background: '#111', position: 'relative', height: '100%' }}>
                    <motion.div 
                      initial={{ height: 0 }} 
                      animate={{ height: `${(val / (insightTab === 'SLEEP_TRACKER' ? 12 : 100)) * 100}%` }} 
                      style={{ position: 'absolute', bottom: 0, width: '100%', background: insightTab === 'SLEEP_TRACKER' ? '#a855f7' : '#00ff41', opacity: 0.5 }} 
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;