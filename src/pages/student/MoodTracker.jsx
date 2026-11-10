import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';
import { authFetch } from '../../api';

const MOODS = [
  { emoji: '😔', label: 'Sad',     value: 1, color: '#a78bfa', bg: '#ede9fe' },
  { emoji: '😐', label: 'Okay',    value: 2, color: '#38bdf8', bg: '#e0f5ff' },
  { emoji: '🙂', label: 'Good',    value: 3, color: '#4aba8e', bg: '#e8f7f1' },
  { emoji: '😊', label: 'Happy',   value: 4, color: '#fb923c', bg: '#fff0e8' },
  { emoji: '🤩', label: 'Amazing', value: 5, color: '#eab308', bg: '#fef9c3' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MOOD_MESSAGES = {
  1: "I hear you 💜 It's okay to not be okay. Be gentle with yourself today.",
  2: "That's okay — neutral days are valid too 🌿 One step at a time.",
  3: "Good to hear! Keep that energy going 🌱 Small wins matter.",
  4: "That's wonderful! 😊 Your positivity is contagious. Keep it up!",
  5: "You're shining today! 🌟 That energy is everything — hold onto it!",
};

function getTodayKey() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

export default function MoodTracker() {
  const navigate  = useNavigate();
  const altiusId    = localStorage.getItem('altius_id') || 'ALTIUS-2025-047';  // || 'ALTIUS-2025-047'
  const storageKey = `mood_${altiusId}`;

  const [moodLog,       setMoodLog]       = useState({});   // { 'YYYY-MM-DD': { value, label, emoji, note } }
  const [selectedMood,  setSelectedMood]  = useState(null);
  const [note,          setNote]          = useState('');
  const [saved,         setSaved]         = useState(false);
  const [hoveredDay,    setHoveredDay]    = useState(null);
  const [activeNav,     setActiveNav]     = useState('mood');

  const todayKey     = getTodayKey();
  const todaysMood   = moodLog[todayKey];
  const last7        = getLast7Days();

  // ── Load from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');
      setMoodLog(stored);
      if (stored[todayKey]) {
        setSelectedMood(stored[todayKey].value);
        setSaved(true);
      }
    } catch {}
  }, []);

  // ── Save mood
  function saveMood() {
    if (!selectedMood) return;
    const mood   = MOODS.find(m => m.value === selectedMood);
    const entry  = { value: mood.value, label: mood.label, emoji: mood.emoji, color: mood.color, note: note.trim(), time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) };
    const updated = { ...moodLog, [todayKey]: entry };
    setMoodLog(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setSaved(true);

    // Save to backend
  authFetch(`${API_URL}/api/mood/save`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ altius_id: altiusId, date: todayKey, ...entry }),
    }).catch(() => {});
  }

  function editMood() {
    setSaved(false);
    setNote(moodLog[todayKey]?.note || '');
  }

  // ── Demo mode — fill last 7 days with realistic data
  const [demoFilled, setDemoFilled] = useState(false);
  function fillDemoData() {
    const demoMoods = [
      { value:2, label:'Okay',    emoji:'😐', note:'Felt a bit tired today' },
      { value:1, label:'Sad',     emoji:'😔', note:'Exam stress is getting to me' },
      { value:3, label:'Good',    emoji:'🙂', note:'Breathing game really helped!' },
      { value:2, label:'Okay',    emoji:'😐', note:'' },
      { value:4, label:'Happy',   emoji:'😊', note:'Had a good session with counselor' },
      { value:3, label:'Good',    emoji:'🙂', note:'Feeling better gradually' },
      { value:5, label:'Amazing', emoji:'🤩', note:'Best day this week!' },
    ];
    const updated = { ...moodLog };
    const today = new Date();
    demoMoods.forEach((mood, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().split('T')[0];
      updated[key] = {
        ...mood,
        color: ['#38bdf8','#a78bfa','#4aba8e','#38bdf8','#fb923c','#4aba8e','#eab308'][i],
        time: '10:30 AM',
      };
    });
    setMoodLog(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setSelectedMood(updated[todayKey]?.value || null);
    setSaved(true);
    setDemoFilled(true);
  }

  function clearDemoData() {
    setMoodLog({});
    localStorage.removeItem(storageKey);
    setSelectedMood(null);
    setSaved(false);
    setDemoFilled(false);
  }

  // ── Streak calculator
  function getStreak() {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (moodLog[key]) streak++;
      else if (i > 0) break;
    }
    return streak;
  }

  // ── Average mood
  function getAverage() {
    const vals = last7.map(d => moodLog[d]?.value).filter(Boolean);
    if (!vals.length) return null;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return avg.toFixed(1);
  }

  const streak  = getStreak();
  const average = getAverage();
  const avgMood = average ? MOODS.find(m => m.value === Math.round(average)) : null;

  const navItems = [
    { id: 'home',      icon: '🏠', label: 'Home',       path: '/student/dashboard' },
    { id: 'assess',    icon: '📋', label: 'Assessment',  path: '/student/assessment' },
    { id: 'mood',      icon: '📈', label: 'Mood',        path: '/student/mood' },
    { id: 'resources', icon: '📚', label: 'Resources',   path: '/student/resources' },
    { id: 'chat',      icon: '🤖', label: 'Altius AI',     path: '/student/chat' },
    { id: 'community', icon: '👥', label: 'Community',   path: '/student/community' },
    { id: 'counselor', icon: '🧑‍⚕️', label: 'Counselor', path: '/student/counselor' },
  ];

  return (
    <div style={s.page}>
      <div style={s.blob1} /><div style={s.blob2} /><div style={s.dots} />

      {/* ── SIDEBAR */}
      <aside style={s.sidebar}>
        <div style={s.sidebarLogo}>🌿 Altius</div>
        <div style={s.altiusBox}>
          <div style={s.altiusLabel}>YOUR ANONYMOUS ID</div>
          <div style={s.altiusId}>{altiusId}</div>
          <div style={s.altiusSub}>Your identity is fully protected</div>
        </div>
        {navItems.map(item => (
          <button
            key={item.id}
            style={{
              ...s.navBtn,
              background:  activeNav === item.id ? '#e8f7f1' : 'transparent',
              color:       activeNav === item.id ? '#4aba8e' : '#6b8f7e',
              fontWeight:  activeNav === item.id ? 700 : 400,
              borderColor: activeNav === item.id ? '#b8e8d4' : 'transparent',
            }}
            onClick={() => { setActiveNav(item.id); navigate(item.path); }}
          >
            <span>{item.icon}</span> {item.label}
          </button>
        ))}
      </aside>

      {/* ── MAIN */}
      <main style={s.main}>
        <div style={s.header}>
          <div>
            <h1 style={s.pageTitle}>📈 Mood Tracker</h1>
            <p style={s.pageSub}>Track your daily emotions and see your wellness journey</p>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            {streak > 0 && (
              <div style={s.streakBadge}>
                🔥 {streak} day{streak > 1 ? 's' : ''} streak!
              </div>
            )}
            {!demoFilled ? (
              <button style={s.demoBtn} onClick={fillDemoData}>
                🎬 Fill Demo Data
              </button>
            ) : (
              <button style={s.clearBtn} onClick={clearDemoData}>
                🗑️ Clear Demo
              </button>
            )}
          </div>
        </div>

        <div style={s.grid}>

          {/* ── LEFT COLUMN */}
          <div style={s.leftCol}>

            {/* Today's check-in */}
            <div style={s.card}>
              <div style={s.cardTitle}>
                {saved ? '✅ Today\'s Mood Logged' : '🌤️ How are you feeling today?'}
              </div>
              <div style={s.cardDate}>{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}</div>

              {/* Mood picker */}
              <div style={s.moodPicker}>
                {MOODS.map(mood => (
                  <button
                    key={mood.value}
                    style={{
                      ...s.moodBtn,
                      background:   selectedMood === mood.value ? mood.bg : 'white',
                      borderColor:  selectedMood === mood.value ? mood.color : 'rgba(0,0,0,0.08)',
                      transform:    selectedMood === mood.value ? 'scale(1.15)' : 'scale(1)',
                      boxShadow:    selectedMood === mood.value ? `0 8px 20px ${mood.color}40` : '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                    onClick={() => { if (!saved) setSelectedMood(mood.value); }}
                    disabled={saved}
                  >
                    <span style={s.moodEmoji}>{mood.emoji}</span>
                    <span style={{ ...s.moodLabel, color: selectedMood === mood.value ? mood.color : '#6b8f7e' }}>
                      {mood.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Message after selection */}
              {selectedMood && (
                <div style={{
                  ...s.moodMessage,
                  background: MOODS.find(m => m.value === selectedMood)?.bg,
                  borderColor: `${MOODS.find(m => m.value === selectedMood)?.color}40`,
                }}>
                  {MOOD_MESSAGES[selectedMood]}
                </div>
              )}

              {/* Note input */}
              {!saved && selectedMood && (
                <div style={s.noteWrap}>
                  <div style={s.noteLabel}>Add a note (optional)</div>
                  <textarea
                    style={s.noteInput}
                    placeholder="What's on your mind today? (optional)"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={2}
                  />
                </div>
              )}

              {/* Saved note */}
              {saved && moodLog[todayKey]?.note && (
                <div style={s.savedNote}>
                  💭 "{moodLog[todayKey].note}"
                </div>
              )}

              {/* Buttons */}
              {!saved && (
                <button
                  style={{ ...s.saveBtn, opacity: selectedMood ? 1 : 0.5, cursor: selectedMood ? 'pointer' : 'not-allowed' }}
                  onClick={saveMood}
                  disabled={!selectedMood}
                >
                  ✅ Log My Mood
                </button>
              )}
              {saved && (
                <button style={s.editBtn} onClick={editMood}>
                  ✏️ Edit Today's Mood
                </button>
              )}
            </div>

            {/* Stats */}
            <div style={s.statsRow}>
              <div style={s.statCard}>
                <div style={s.statIcon}>🔥</div>
                <div style={s.statValue}>{streak}</div>
                <div style={s.statLabel}>Day Streak</div>
              </div>
              <div style={s.statCard}>
                <div style={s.statIcon}>{avgMood?.emoji || '—'}</div>
                <div style={{ ...s.statValue, color: avgMood?.color || '#94a3b8' }}>{average || '—'}</div>
                <div style={s.statLabel}>Avg This Week</div>
              </div>
              <div style={s.statCard}>
                <div style={s.statIcon}>📅</div>
                <div style={s.statValue}>{last7.filter(d => moodLog[d]).length}</div>
                <div style={s.statLabel}>Days Logged</div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN */}
          <div style={s.rightCol}>

            {/* 7-Day Graph */}
            <div style={s.card}>
              <div style={s.cardTitle}>📊 7-Day Mood Trend</div>
              <div style={s.cardDate}>Your emotional journey this week</div>

              {/* Graph */}
              <div style={s.graph}>
                {/* Y-axis labels */}
                <div style={s.yAxis}>
                  {[...MOODS].reverse().map(m => (
                    <div key={m.value} style={s.yLabel}>{m.emoji}</div>
                  ))}
                </div>

                {/* Grid + bars */}
                <div style={s.graphArea}>
                  {/* Horizontal grid lines */}
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ ...s.gridLine, bottom: `${((i-1)/4)*100}%` }} />
                  ))}

                  {/* Bars for each day */}
                  <div style={s.bars}>
                    {last7.map((dateKey, i) => {
                      const entry   = moodLog[dateKey];
                      const mood    = entry ? MOODS.find(m => m.value === entry.value) : null;
                      const dayObj  = new Date(dateKey);
                      const dayName = DAYS[dayObj.getDay()];
                      const isToday = dateKey === todayKey;

                      return (
                        <div
                          key={dateKey}
                          style={s.barCol}
                          onMouseEnter={() => setHoveredDay(dateKey)}
                          onMouseLeave={() => setHoveredDay(null)}
                        >
                          {/* Tooltip */}
                          {hoveredDay === dateKey && mood && (
                            <div style={s.tooltip}>
                              <div style={{ fontSize:'1.2rem' }}>{mood.emoji}</div>
                              <div style={{ fontSize:'0.72rem', fontWeight:700, color: mood.color }}>{mood.label}</div>
                              {entry.note && <div style={{ fontSize:'0.65rem', color:'#6b8f7e', marginTop:3, maxWidth:80, textAlign:'center' }}>"{entry.note}"</div>}
                              <div style={{ fontSize:'0.6rem', color:'#94a3b8', marginTop:2 }}>{entry.time}</div>
                            </div>
                          )}

                          {/* Bar */}
                          <div style={s.barTrack}>
                            {mood ? (
                              <div style={{
                                ...s.barFill,
                                height: `${(mood.value / 5) * 100}%`,
                                background: `linear-gradient(to top, ${mood.color}, ${mood.color}99)`,
                                boxShadow: `0 4px 12px ${mood.color}40`,
                              }} />
                            ) : (
                              <div style={s.barEmpty} />
                            )}
                          </div>

                          {/* Day label */}
                          <div style={{
                            ...s.dayLabel,
                            color:      isToday ? '#4aba8e' : '#6b8f7e',
                            fontWeight: isToday ? 800 : 400,
                          }}>
                            {isToday ? 'Today' : dayName}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div style={s.legend}>
                {MOODS.map(m => (
                  <div key={m.value} style={s.legendItem}>
                    <div style={{ ...s.legendDot, background: m.color }} />
                    <span>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent history */}
            <div style={s.card}>
              <div style={s.cardTitle}>🗓️ Recent Mood Log</div>
              <div style={s.historyList}>
                {last7.slice().reverse().map(dateKey => {
                  const entry  = moodLog[dateKey];
                  const mood   = entry ? MOODS.find(m => m.value === entry.value) : null;
                  const isToday = dateKey === todayKey;
                  const dateObj = new Date(dateKey);
                  const label   = isToday ? 'Today' : dateObj.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' });

                  return (
                    <div key={dateKey} style={s.historyRow}>
                      <div style={s.historyDate}>{label}</div>
                      {mood ? (
                        <>
                          <div style={{ ...s.historyMoodBadge, background: mood.bg, color: mood.color }}>
                            {mood.emoji} {mood.label}
                          </div>
                          {entry.note && (
                            <div style={s.historyNote}>"{entry.note}"</div>
                          )}
                        </>
                      ) : (
                        <div style={s.historyEmpty}>Not logged</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

const s = {
  page:    { display:'flex', minHeight:'100vh', background:'#f0f7f4', fontFamily:"'Plus Jakarta Sans',sans-serif", position:'relative', overflowX:'hidden' },
  blob1:   { position:'fixed', width:500, height:500, borderRadius:'50%', background:'#b8f0dc', filter:'blur(80px)', opacity:0.25, top:-150, left:-100, zIndex:0, pointerEvents:'none' },
  blob2:   { position:'fixed', width:400, height:400, borderRadius:'50%', background:'#ddd6fe', filter:'blur(80px)', opacity:0.2, bottom:-100, right:-80, zIndex:0, pointerEvents:'none' },
  dots:    { position:'fixed', inset:0, zIndex:0, pointerEvents:'none', backgroundImage:'radial-gradient(circle, rgba(74,186,142,0.08) 1.5px, transparent 1.5px)', backgroundSize:'36px 36px' },

  // Sidebar
  sidebar:     { position:'fixed', top:0, left:0, bottom:0, width:240, zIndex:10, background:'rgba(255,255,255,0.92)', backdropFilter:'blur(20px)', borderRight:'1px solid rgba(74,186,142,0.15)', display:'flex', flexDirection:'column', padding:'24px 16px', overflowY:'auto' },
  sidebarLogo: { fontFamily:'Georgia,serif', fontSize:'1.4rem', fontWeight:900, color:'#4aba8e', marginBottom:20, paddingLeft:8 },
  altiusBox:     { background:'linear-gradient(135deg,#e8f7f1,#d1fae5)', border:'1px solid rgba(74,186,142,0.25)', borderRadius:14, padding:'12px 14px', marginBottom:20 },
  altiusLabel:   { fontSize:'0.58rem', fontWeight:700, color:'#6b8f7e', letterSpacing:1, textTransform:'uppercase' },
  altiusId:      { fontSize:'0.92rem', fontWeight:800, color:'#1e3a2f', marginTop:3 },
  altiusSub:     { fontSize:'0.62rem', color:'#6b8f7e', marginTop:2 },
  navBtn:      { display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 12px', borderRadius:12, border:'1.5px solid transparent', cursor:'pointer', fontSize:'0.85rem', fontFamily:'inherit', marginBottom:4, transition:'all 0.2s', textAlign:'left' },

  // Main
  main:      { marginLeft:240, flex:1, padding:'32px 36px', position:'relative', zIndex:1 },
  header:    { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 },
  pageTitle: { fontFamily:'Georgia,serif', fontSize:'1.8rem', fontWeight:700, color:'#1e3a2f', margin:0, marginBottom:4 },
  pageSub:   { fontSize:'0.88rem', color:'#6b8f7e', margin:0 },
  streakBadge: { background:'linear-gradient(135deg,#fff0e8,#fed7aa)', border:'1px solid rgba(251,146,60,0.3)', borderRadius:20, padding:'8px 18px', fontSize:'0.88rem', fontWeight:700, color:'#ea580c' },
  demoBtn: { background:'linear-gradient(135deg,#a78bfa,#7c3aed)', color:'white', border:'none', borderRadius:20, padding:'8px 18px', fontSize:'0.82rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 12px rgba(167,139,250,0.35)' },
  clearBtn:{ background:'#f0f7f4', color:'#6b8f7e', border:'1px solid rgba(74,186,142,0.2)', borderRadius:20, padding:'8px 18px', fontSize:'0.82rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' },

  // Layout
  grid:     { display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:20 },
  leftCol:  { display:'flex', flexDirection:'column', gap:16 },
  rightCol: { display:'flex', flexDirection:'column', gap:16 },

  // Cards
  card:      { background:'white', borderRadius:24, padding:'24px', boxShadow:'0 4px 20px rgba(0,0,0,0.05)' },
  cardTitle: { fontSize:'1rem', fontWeight:700, color:'#1e3a2f', marginBottom:4 },
  cardDate:  { fontSize:'0.78rem', color:'#94a3b8', marginBottom:20 },

  // Mood picker
  moodPicker: { display:'flex', gap:8, justifyContent:'space-between', marginBottom:16 },
  moodBtn:    { flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'14px 4px', borderRadius:16, border:'2px solid', cursor:'pointer', transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)', fontFamily:'inherit' },
  moodEmoji:  { fontSize:'1.8rem' },
  moodLabel:  { fontSize:'0.65rem', fontWeight:700 },
  moodMessage:{ borderRadius:14, padding:'12px 16px', fontSize:'0.83rem', color:'#1e3a2f', lineHeight:1.6, border:'1px solid', marginBottom:14 },

  // Note
  noteWrap:  { marginBottom:16 },
  noteLabel: { fontSize:'0.72rem', fontWeight:700, color:'#6b8f7e', marginBottom:6 },
  noteInput: { width:'100%', padding:'10px 14px', borderRadius:12, border:'1.5px solid rgba(74,186,142,0.2)', background:'#f8fffe', fontFamily:'inherit', fontSize:'0.85rem', color:'#1e3a2f', outline:'none', resize:'none', boxSizing:'border-box' },
  savedNote: { background:'#f8fffe', borderRadius:12, padding:'10px 14px', fontSize:'0.82rem', color:'#6b8f7e', fontStyle:'italic', marginBottom:14, border:'1px solid rgba(74,186,142,0.15)' },

  // Buttons
  saveBtn: { width:'100%', padding:'13px', background:'linear-gradient(135deg,#4aba8e,#2d9e6e)', color:'white', border:'none', borderRadius:14, fontSize:'0.92rem', fontWeight:700, fontFamily:'inherit', boxShadow:'0 6px 20px rgba(74,186,142,0.3)' },
  editBtn: { width:'100%', padding:'11px', background:'#f0f7f4', color:'#4aba8e', border:'1px solid rgba(74,186,142,0.25)', borderRadius:14, fontSize:'0.85rem', fontWeight:600, fontFamily:'inherit', cursor:'pointer' },

  // Stats
  statsRow:  { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 },
  statCard:  { background:'white', borderRadius:18, padding:'18px 12px', textAlign:'center', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' },
  statIcon:  { fontSize:'1.4rem', marginBottom:6 },
  statValue: { fontFamily:'Georgia,serif', fontSize:'1.5rem', fontWeight:900, color:'#1e3a2f' },
  statLabel: { fontSize:'0.68rem', color:'#6b8f7e', marginTop:4 },

  // Graph
  graph:     { display:'flex', gap:12, height:180, marginBottom:16 },
  yAxis:     { display:'flex', flexDirection:'column', justifyContent:'space-between', paddingBottom:24 },
  yLabel:    { fontSize:'1rem', lineHeight:1 },
  graphArea: { flex:1, position:'relative' },
  gridLine:  { position:'absolute', left:0, right:0, height:1, background:'rgba(0,0,0,0.04)', zIndex:0 },
  bars:      { position:'absolute', inset:0, display:'flex', alignItems:'flex-end', gap:6, paddingBottom:24 },
  barCol:    { flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, position:'relative', height:'100%', justifyContent:'flex-end' },
  tooltip:   { position:'absolute', top:-90, left:'50%', transform:'translateX(-50%)', background:'white', borderRadius:12, padding:'8px 10px', boxShadow:'0 8px 24px rgba(0,0,0,0.12)', zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', minWidth:70, border:'1px solid rgba(74,186,142,0.15)', pointerEvents:'none' },
  barTrack:  { width:'100%', flex:1, display:'flex', alignItems:'flex-end', maxHeight:132 },
  barFill:   { width:'100%', borderRadius:'8px 8px 4px 4px', transition:'height 0.6s cubic-bezier(0.34,1.56,0.64,1)', minHeight:4 },
  barEmpty:  { width:'100%', height:4, background:'#f0f7f4', borderRadius:4 },
  dayLabel:  { fontSize:'0.62rem', textAlign:'center', whiteSpace:'nowrap' },
  legend:    { display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center' },
  legendItem:{ display:'flex', alignItems:'center', gap:5, fontSize:'0.72rem', color:'#6b8f7e' },
  legendDot: { width:8, height:8, borderRadius:'50%' },

  // History
  historyList: { display:'flex', flexDirection:'column', gap:10 },
  historyRow:  { display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid #f0f7f4' },
  historyDate: { fontSize:'0.78rem', color:'#6b8f7e', width:90, flexShrink:0 },
  historyMoodBadge: { fontSize:'0.78rem', fontWeight:700, padding:'4px 12px', borderRadius:20, flexShrink:0 },
  historyNote: { fontSize:'0.72rem', color:'#94a3b8', fontStyle:'italic', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  historyEmpty:{ fontSize:'0.75rem', color:'#cbd5e1', fontStyle:'italic' },
};