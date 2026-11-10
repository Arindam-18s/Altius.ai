import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';
import { authFetch } from '../../api';


// ── Counselor data loaded dynamically from localStorage after login

const STUDENTS = [
  {
    id: 1, altiusId: 'ALTIUS-2025-012', avatar: '🌸',
    phq9: 14, gad7: 12, phq9Label: 'Moderate', gad7Label: 'Moderate',
    lastSeen: '2 hours ago', sessions: 3, flagged: true,
    mood: '😐', notes: '',
    messages: [
      { role: 'student', text: "I can't stop shaking before exams. It's really bad.", time: '10:22 AM' },
      { role: 'counselor', text: "I hear you. Let's try a breathing exercise together. Inhale for 4 counts...", time: '10:25 AM' },
      { role: 'student', text: "I tried it. It helped a little. Thank you.", time: '10:31 AM' },
    ],
  },
  {
    id: 2, altiusId: 'ALTIUS-2025-034', avatar: '⭐',
    phq9: 6, gad7: 5, phq9Label: 'Mild', gad7Label: 'Mild',
    lastSeen: '1 day ago', sessions: 1, flagged: false,
    mood: '🙂', notes: '',
    messages: [
      { role: 'student', text: "I feel a bit better this week. The Pomodoro technique is working.", time: '9:10 AM' },
      { role: 'counselor', text: "That's wonderful progress! Keep up the great work.", time: '9:15 AM' },
    ],
  },
  {
    id: 3, altiusId: 'ALTIUS-2025-078', avatar: '🌻',
    phq9: 18, gad7: 16, phq9Label: 'Severe', gad7Label: 'Severe',
    lastSeen: '30 min ago', sessions: 5, flagged: true,
    mood: '😔', notes: '',
    messages: [
      { role: 'student', text: "My parents keep fighting. I can't focus on anything.", time: '11:00 AM' },
      { role: 'student', text: "I feel like I want to disappear sometimes.", time: '11:02 AM' },
      { role: 'counselor', text: "Thank you for trusting me with this. You are not alone. Can we schedule an urgent session today?", time: '11:05 AM' },
    ],
  },
  {
    id: 4, altiusId: 'ALTIUS-2025-091', avatar: '🦋',
    phq9: 4, gad7: 3, phq9Label: 'Minimal', gad7Label: 'Minimal',
    lastSeen: '3 days ago', sessions: 2, flagged: false,
    mood: '😊', notes: '',
    messages: [
      { role: 'student', text: "I just wanted to say I feel much better after our last session!", time: '2:00 PM' },
      { role: 'counselor', text: "That makes me so happy to hear. You've worked really hard.", time: '2:05 PM' },
    ],
  },
  {
    id: 5, altiusId: 'ALTIUS-2025-055', avatar: '🎯',
    phq9: 9, gad7: 8, phq9Label: 'Mild', gad7Label: 'Mild',
    lastSeen: '5 hours ago', sessions: 4, flagged: false,
    mood: '🙂', notes: '',
    messages: [
      { role: 'student', text: "Exams are next week. Feeling a bit nervous but managing.", time: '3:30 PM' },
      { role: 'counselor', text: "You've prepared well. Trust yourself. Let's talk through your plan.", time: '3:35 PM' },
    ],
  },
];

const UPCOMING = [
  { id: 1, altiusId: 'ALTIUS-2025-012', avatar: '🌸', date: 'Today',    time: '3:00 PM', type: 'Video', urgent: true  },
  { id: 2, altiusId: 'ALTIUS-2025-055', avatar: '🎯', date: 'Today',    time: '5:00 PM', type: 'Chat',  urgent: false },
  { id: 3, altiusId: 'ALTIUS-2025-034', avatar: '⭐', date: 'Tomorrow', time: '10:00 AM',type: 'Video', urgent: false },
  { id: 4, altiusId: 'ALTIUS-2025-078', avatar: '🌻', date: 'Tomorrow', time: '11:30 AM',type: 'Video', urgent: true  },
];

const SEVERITY_COLORS = {
  Minimal:  { bg: '#e8f7f1', color: '#4aba8e' },
  Mild:     { bg: '#fef9c3', color: '#eab308' },
  Moderate: { bg: '#fff0e8', color: '#fb923c' },
  Severe:   { bg: '#fff0f4', color: '#f43f5e' },
};

export default function CounselorDashboard() {
  const navigate = useNavigate();
  const [activeTab,      setActiveTab]      = useState('overview');
  const [selectedStudent,setSelectedStudent]= useState(null);
  const [msgInput,       setMsgInput]       = useState('');
  const [students,       setStudents]       = useState(STUDENTS);
  // ── Load logged-in counselor from localStorage
  const loggedInCounselor = {
    name:   localStorage.getItem('counselor_name')  || 'Counselor',
    avatar: localStorage.getItem('counselor_avatar') || '🧑‍⚕️',
    title:  localStorage.getItem('counselor_title')  || 'Counselor',
    id:     localStorage.getItem('counselor_id')     || '',
  };
  const [available, setAvailable] = useState(true);
  const [noteInput,      setNoteInput]      = useState('');

  const flagged  = students.filter(s => s.flagged);
  const totalSessions = students.reduce((a, s) => a + s.sessions, 0);

  function sendMessage() {
    const msg = msgInput.trim();
    if (!msg || !selectedStudent) return;
    setStudents(prev => prev.map(s =>
      s.id === selectedStudent.id
        ? { ...s, messages: [...s.messages, { role: 'counselor', text: msg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] }
        : s
    ));
    setSelectedStudent(prev => ({
      ...prev,
      messages: [...prev.messages, { role: 'counselor', text: msg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }],
    }));
    setMsgInput('');
  }

  function saveNote() {
    if (!noteInput.trim() || !selectedStudent) return;
    setStudents(prev => prev.map(s =>
      s.id === selectedStudent.id ? { ...s, notes: noteInput } : s
    ));
    setSelectedStudent(prev => ({ ...prev, notes: noteInput }));
    setNoteInput('');
    showToast('📝 Note saved');
  }

  // ── NEW: toast
  const [toast, setToast] = useState('');
  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  }

  // ── NEW: schedule modal
  const [scheduleModal, setScheduleModal] = useState(null); // { student, urgent }
  const [schedDate,     setSchedDate]     = useState('');
  const [schedTime,     setSchedTime]     = useState('');
  const [schedType,     setSchedType]     = useState('Video');
  const [schedDone,     setSchedDone]     = useState(false);
  const [upcomingSessions, setUpcomingSessions] = useState(UPCOMING);

  // ── Fetch real sessions from backend on load
  useEffect(() => {
    const counselorId = localStorage.getItem('counselor_id');
    if (!counselorId) return;
    authFetch(`http://localhost:5000/api/sessions/counselor/${counselorId}`)
      .then(r => r.json())
      .then(data => {
        if (data.sessions && data.sessions.length > 0) {
          const mapped = data.sessions.map(s => ({
            id:     s.id,
            altiusId: s.altius_id,
            avatar: '🌸',
            date:   s.date,
            time:   s.time,
            type:   s.type,
            urgent: s.urgent || false,
          }));
          setUpcomingSessions(mapped);
        }
      })
      .catch(err => console.error('Sessions fetch error:', err));
  }, []);

  function openSchedule(student, urgent = false) {
    setScheduleModal({ student, urgent });
    setSchedDate('');
    setSchedTime('');
    setSchedType('Video');
    setSchedDone(false);
  }

  async function confirmSchedule() {
    if (!schedDate || !schedTime) {
      showToast('⚠️ Please pick a date and time');
      return;
    }
    const newSession = {
      id:        Date.now(),
      altiusId:    scheduleModal.student.altiusId,
      avatar:    scheduleModal.student.avatar,
      date:      schedDate,
      time:      schedTime,
      type:      schedType,
      urgent:    scheduleModal.urgent,
    };

    // Save to backend
    try {
      await authFetch('http://localhost:5000/api/sessions/book', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          altius_id:      scheduleModal.student.altiusId,
          counselor_id: loggedInCounselor.id,
          date:         schedDate,
          time:         schedTime,
          type:         schedType,
          urgent:       scheduleModal.urgent,
        }),
      });
    } catch (err) {
      console.error('Session save error:', err.message);
    }

    setUpcomingSessions(prev => [...prev, newSession]);
    setSchedDone(true);
    setTimeout(() => {
      setScheduleModal(null);
      setSchedDone(false);
      showToast(`✅ Session booked for ${schedDate} at ${schedTime}`);
    }, 1400);
  }

  // ── join session: Video → Jitsi, Chat → open student chat tab
  function joinSession(session) {
    if (session.type === 'Video') {
      const room = `altius-counselor-${session.altiusId.replace(/-/g, '')}${session.id}`;
      window.open(`https://meet.jit.si/${room}`, '_blank');
      showToast(`🎥 Opening video call for ${session.altiusId}...`);
    } else {
      const student = students.find(s => s.altiusId === session.altiusId);
      if (student) {
        setSelectedStudent(student);
        setActiveTab('students');
        showToast(`💬 Opening chat with ${session.altiusId}`);
      } else {
        showToast(`💬 Chat session opened for ${session.altiusId}`);
      }
    }
  }

  return (
    <div style={s.page}>
      <div style={s.blob1} /><div style={s.blob2} /><div style={s.dots} />

      {/* TOAST */}
      {toast && (
        <div style={{ position:'fixed', bottom:32, left:'50%', transform:'translateX(-50%)', zIndex:999, background:'#1e3a2f', color:'white', padding:'12px 24px', borderRadius:20, fontSize:'0.88rem', fontFamily:"'Plus Jakarta Sans',sans-serif", boxShadow:'0 8px 32px rgba(0,0,0,0.2)', whiteSpace:'nowrap' }}>
          {toast}
        </div>
      )}

      {/* SCHEDULE MODAL */}
      {scheduleModal && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(30,58,47,0.25)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
          onClick={e => e.target === e.currentTarget && setScheduleModal(null)}>
          <div style={{ background:'white', borderRadius:28, padding:'40px 36px', width:'100%', maxWidth:440, position:'relative', boxShadow:'0 32px 80px rgba(0,0,0,0.12)' }}>
            <button onClick={() => setScheduleModal(null)} style={{ position:'absolute', top:16, right:16, width:32, height:32, borderRadius:'50%', background:'#f0f7f4', border:'none', cursor:'pointer', color:'#6b8f7e', fontSize:'0.9rem' }}>✕</button>

            {schedDone ? (
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <div style={{ fontSize:'3rem', marginBottom:12 }}>✅</div>
                <div style={{ fontFamily:'Georgia,serif', fontSize:'1.3rem', fontWeight:700, color:'#1e3a2f' }}>Session Booked!</div>
                <div style={{ fontSize:'0.88rem', color:'#6b8f7e', marginTop:8 }}>{schedDate} at {schedTime} · {schedType}</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize:'1.8rem', marginBottom:8 }}>📅</div>
                <div style={{ fontFamily:'Georgia,serif', fontSize:'1.4rem', fontWeight:700, color:'#1e3a2f', marginBottom:4 }}>
                  {scheduleModal.urgent ? 'Schedule Urgent Session' : 'Book a Session'}
                </div>
                <div style={{ fontSize:'0.85rem', color:'#6b8f7e', marginBottom:24 }}>
                  For student <strong>{scheduleModal.student.altiusId}</strong>
                </div>

                {scheduleModal.urgent && (
                  <div style={{ background:'#fff0f4', border:'1px solid #fca5a5', borderRadius:10, padding:'10px 14px', fontSize:'0.82rem', color:'#f43f5e', marginBottom:18 }}>
                    🚨 This student is flagged — urgent session recommended
                  </div>
                )}

                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:'0.78rem', fontWeight:700, color:'#6b8f7e', marginBottom:6 }}>SELECT DATE</div>
                  <input
                    type="date"
                    value={schedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setSchedDate(e.target.value)}
                    style={{ width:'100%', padding:'11px 14px', border:'1.5px solid rgba(74,186,142,0.25)', borderRadius:12, fontFamily:'inherit', fontSize:'0.9rem', color:'#1e3a2f', outline:'none', background:'#f8fffe' }}
                  />
                </div>

                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:'0.78rem', fontWeight:700, color:'#6b8f7e', marginBottom:6 }}>SELECT TIME</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {['9:00 AM','10:00 AM','11:00 AM','12:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'].map(t => (
                      <button key={t}
                        style={{ padding:'7px 14px', borderRadius:20, border:`1.5px solid ${schedTime===t?'#4aba8e':'rgba(74,186,142,0.2)'}`, background:schedTime===t?'#e8f7f1':'white', color:schedTime===t?'#4aba8e':'#6b8f7e', fontSize:'0.78rem', cursor:'pointer', fontFamily:'inherit', fontWeight:schedTime===t?700:400 }}
                        onClick={() => setSchedTime(t)}
                      >{t}</button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom:24 }}>
                  <div style={{ fontSize:'0.78rem', fontWeight:700, color:'#6b8f7e', marginBottom:6 }}>SESSION TYPE</div>
                  <div style={{ display:'flex', gap:10 }}>
                    {['Video','Chat'].map(type => (
                      <button key={type}
                        style={{ flex:1, padding:'10px', borderRadius:12, border:`1.5px solid ${schedType===type?'#4aba8e':'rgba(74,186,142,0.2)'}`, background:schedType===type?'#e8f7f1':'white', color:schedType===type?'#4aba8e':'#6b8f7e', fontSize:'0.85rem', cursor:'pointer', fontFamily:'inherit', fontWeight:schedType===type?700:400 }}
                        onClick={() => setSchedType(type)}
                      >{type === 'Video' ? '🎥 Video Call' : '💬 Chat Session'}</button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={confirmSchedule}
                  style={{ width:'100%', background:'linear-gradient(135deg,#4aba8e,#2d9e6e)', color:'white', border:'none', borderRadius:14, padding:'14px', fontSize:'0.95rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}
                >
                  ✅ Confirm Booking
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── SIDEBAR */}
      <aside style={s.sidebar}>
        <div style={s.sidebarLogo}>🌿 Altius</div>

        <div style={s.counselorBox}>
          <div style={s.counselorAvatar}>{loggedInCounselor.avatar}</div>
          <div style={s.counselorName}>{loggedInCounselor.name}</div>
          <div style={s.counselorTitle}>{loggedInCounselor.title}</div>
          {/* Availability toggle */}
          <div
            style={{
              ...s.availToggle,
              background: available ? '#e8f7f1' : '#fff0f4',
              color:      available ? '#4aba8e' : '#f43f5e',
              borderColor:available ? '#b8e8d4' : '#fca5a5',
            }}
            onClick={() => setAvailable(prev => !prev)}
          >
            {available ? '● Available for sessions' : '○ Set as Unavailable'}
          </div>
        </div>

        {/* Nav */}
        {[
          { id: 'overview',  icon: '📊', label: 'Overview'       },
          { id: 'students',  icon: '👥', label: 'My Students'    },
          { id: 'schedule',  icon: '📅', label: 'Schedule'       },
          { id: 'flagged',   icon: '🚨', label: `Flagged (${flagged.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            style={{
              ...s.navBtn,
              background: activeTab === tab.id ? '#e8f7f1' : 'transparent',
              color:      activeTab === tab.id ? '#4aba8e' : '#6b8f7e',
              fontWeight: activeTab === tab.id ? 700 : 400,
              borderColor:activeTab === tab.id ? '#b8e8d4' : 'transparent',
            }}
            onClick={() => { setActiveTab(tab.id); setSelectedStudent(null); }}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}

        <div style={s.sidebarBottom}>
          <button style={s.logoutBtn} onClick={() => navigate('/')}>← Logout</button>
        </div>
      </aside>

      {/* ── MAIN */}
      <main style={s.main}>

        {/* ══ OVERVIEW TAB ══ */}
        {activeTab === 'overview' && (
          <div>
            <h1 style={s.pageTitle}>Good {getTimeOfDay()}, {loggedInCounselor.name} 👋</h1>
            <p style={s.pageSub}>Here's your wellness dashboard for today</p>

            {/* Stat cards */}
            <div style={s.statsRow}>
              {[
                { icon: '👥', label: 'Total Students', value: students.length, color: '#4aba8e', bg: '#e8f7f1' },
                { icon: '🚨', label: 'Flagged',        value: flagged.length,  color: '#f43f5e', bg: '#fff0f4' },
                { icon: '📅', label: 'Sessions Today', value: upcomingSessions.filter(u=>u.date==='Today').length, color: '#a78bfa', bg: '#ede9fe' },
                { icon: '💬', label: 'Total Sessions', value: totalSessions,   color: '#fb923c', bg: '#fff0e8' },
              ].map(stat => (
                <div key={stat.label} style={{ ...s.statCard, borderTop: `3px solid ${stat.color}` }}>
                  <div style={{ ...s.statIcon, background: stat.bg }}>{stat.icon}</div>
                  <div style={{ ...s.statValue, color: stat.color }}>{stat.value}</div>
                  <div style={s.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Flagged students alert */}
            {flagged.length > 0 && (
              <div style={s.alertBox}>
                <div style={s.alertTitle}>🚨 Students Needing Immediate Attention</div>
                {flagged.map(student => (
                  <div key={student.id} style={s.alertRow}>
                    <span style={s.alertAvatar}>{student.avatar}</span>
                    <div style={{ flex: 1 }}>
                      <div style={s.alertId}>{student.altiusId}</div>
                      <div style={s.alertScores}>
                        PHQ-9: {student.phq9} ({student.phq9Label}) · GAD-7: {student.gad7} ({student.gad7Label})
                      </div>
                    </div>
                    <button
                      style={s.alertViewBtn}
                      onClick={() => { setSelectedStudent(student); setActiveTab('students'); }}
                    >
                      View →
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Today's schedule */}
            <div style={s.scheduleCard}>
              <div style={s.cardTitle}>📅 Today's Sessions</div>
              {upcomingSessions.filter(u => u.date === 'Today').map(session => (
                <div key={session.id} style={s.sessionRow}>
                  <span style={s.sessionAvatar}>{session.avatar}</span>
                  <div style={{ flex: 1 }}>
                    <div style={s.sessionId}>{session.altiusId}</div>
                    <div style={s.sessionMeta}>{session.time} · {session.type}</div>
                  </div>
                  {session.urgent && <span style={s.urgentBadge}>Urgent</span>}
                  <button style={s.joinBtn} onClick={() => joinSession(session)}>
                    {session.type === 'Video' ? '🎥 Join' : '💬 Chat'}
                  </button>
                </div>
              ))}
            </div>

            {/* Student severity overview */}
            <div style={s.overviewCard}>
              <div style={s.cardTitle}>📊 Student Severity Overview</div>
              <div style={s.severityGrid}>
                {['Minimal','Mild','Moderate','Severe'].map(level => {
                  const count = students.filter(s => s.phq9Label === level || s.gad7Label === level).length;
                  const col = SEVERITY_COLORS[level];
                  return (
                    <div key={level} style={{ ...s.severityCard, background: col.bg }}>
                      <div style={{ ...s.severityNum, color: col.color }}>{count}</div>
                      <div style={{ ...s.severityLabel, color: col.color }}>{level}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══ STUDENTS TAB ══ */}
        {activeTab === 'students' && !selectedStudent && (
          <div>
            <h1 style={s.pageTitle}>👥 My Students</h1>
            <p style={s.pageSub}>Click on a student to view their profile and chat</p>
            <div style={s.studentGrid}>
              {students.map(student => {
                const phqCol = SEVERITY_COLORS[student.phq9Label];
                const gadCol = SEVERITY_COLORS[student.gad7Label];
                return (
                  <div
                    key={student.id}
                    style={{
                      ...s.studentCard,
                      border: student.flagged ? '2px solid #f43f5e' : '1px solid rgba(74,186,142,0.15)',
                    }}
                    onClick={() => { setSelectedStudent(student); setNoteInput(student.notes || ''); }}
                  >
                    {student.flagged && <div style={s.flagBadge}>🚨 Flagged</div>}
                    <div style={s.studentTop}>
                      <div style={s.studentAvatar}>{student.avatar}</div>
                      <div>
                        <div style={s.studentId}>{student.altiusId}</div>
                        <div style={s.studentMeta}>Last seen {student.lastSeen}</div>
                      </div>
                      <div style={s.studentMood}>{student.mood}</div>
                    </div>
                    <div style={s.scoreRow}>
                      <div style={{ ...s.scorePill, background: phqCol.bg, color: phqCol.color }}>
                        PHQ-9: {student.phq9} · {student.phq9Label}
                      </div>
                      <div style={{ ...s.scorePill, background: gadCol.bg, color: gadCol.color }}>
                        GAD-7: {student.gad7} · {student.gad7Label}
                      </div>
                    </div>
                    <div style={s.sessionCount}>
                      {student.sessions} sessions completed
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ STUDENT DETAIL VIEW ══ */}
        {activeTab === 'students' && selectedStudent && (() => {
          const st = students.find(s => s.id === selectedStudent.id) || selectedStudent;
          const phqCol = SEVERITY_COLORS[st.phq9Label];
          const gadCol = SEVERITY_COLORS[st.gad7Label];
          return (
            <div>
              <button style={s.backBtn} onClick={() => setSelectedStudent(null)}>
                ← Back to Students
              </button>

              <div style={s.detailGrid}>
                {/* LEFT — Profile + Scores + Notes */}
                <div style={s.detailLeft}>
                  {/* Profile card */}
                  <div style={s.detailProfileCard}>
                    <div style={s.detailAvatar}>{st.avatar}</div>
                    <div style={s.detailId}>{st.altiusId}</div>
                    <div style={s.detailMeta}>Last seen {st.lastSeen} · {st.sessions} sessions</div>
                    <div style={s.detailMood}>Today's mood: {st.mood}</div>

                    {st.flagged && (
                      <div style={s.flagAlert}>
                        🚨 This student is flagged for urgent attention
                      </div>
                    )}

                    <div style={s.detailScores}>
                      <div style={{ ...s.detailScore, background: phqCol.bg }}>
                        <div style={{ ...s.detailScoreNum, color: phqCol.color }}>{st.phq9}</div>
                        <div style={{ color: phqCol.color, fontSize: '0.7rem', fontWeight: 700 }}>PHQ-9</div>
                        <div style={{ ...s.detailScoreBadge, background: 'white', color: phqCol.color }}>
                          {st.phq9Label}
                        </div>
                      </div>
                      <div style={{ ...s.detailScore, background: gadCol.bg }}>
                        <div style={{ ...s.detailScoreNum, color: gadCol.color }}>{st.gad7}</div>
                        <div style={{ color: gadCol.color, fontSize: '0.7rem', fontWeight: 700 }}>GAD-7</div>
                        <div style={{ ...s.detailScoreBadge, background: 'white', color: gadCol.color }}>
                          {st.gad7Label}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div style={s.notesCard}>
                    <div style={s.notesTitle}>📝 My Notes</div>
                    {st.notes && (
                      <div style={s.savedNote}>{st.notes}</div>
                    )}
                    <textarea
                      style={s.notesInput}
                      value={noteInput}
                      onChange={e => setNoteInput(e.target.value)}
                      placeholder="Add private notes about this student..."
                      rows={4}
                    />
                    <button style={s.saveNoteBtn} onClick={saveNote}>Save Note</button>
                  </div>

                  {/* Quick actions */}
                  <div style={s.quickActions}>
                    <button style={{ ...s.qaBtn, background: 'linear-gradient(135deg, #4aba8e, #2d9e6e)', color: 'white' }}
                      onClick={() => openSchedule(st)}
                    >
                      📅 Schedule Session
                    </button>
                    <button style={{ ...s.qaBtn, background: st.flagged ? '#f0f7f4' : '#fff0f4', color: st.flagged ? '#6b8f7e' : '#f43f5e' }}
                      onClick={() => {
                        setStudents(prev => prev.map(s => s.id === st.id ? { ...s, flagged: !s.flagged } : s));
                        setSelectedStudent(prev => ({ ...prev, flagged: !prev.flagged }));
                      }}
                    >
                      {st.flagged ? '✅ Remove Flag' : '🚨 Flag Student'}
                    </button>
                  </div>
                </div>

                {/* RIGHT — Chat */}
                <div style={s.detailRight}>
                  <div style={s.chatHeader}>
                    <div style={s.chatHeaderTitle}>💬 Chat with {st.altiusId}</div>
                    <div style={s.chatHeaderSub}>All messages are confidential</div>
                  </div>

                  <div style={s.chatMessages}>
                    {st.messages.map((msg, i) => (
                      <div key={i} style={{
                        ...s.msgRow,
                        justifyContent: msg.role === 'counselor' ? 'flex-end' : 'flex-start',
                      }}>
                        {msg.role === 'student' && (
                          <div style={s.msgStudentAvatar}>{st.avatar}</div>
                        )}
                        <div style={{ maxWidth: '70%' }}>
                          <div style={{
                            ...s.msgBubble,
                            background: msg.role === 'counselor'
                              ? 'linear-gradient(135deg, #4aba8e, #2d9e6e)'
                              : 'white',
                            color: msg.role === 'counselor' ? 'white' : '#1e3a2f',
                            borderRadius: msg.role === 'counselor' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                            border: msg.role === 'student' ? '1px solid rgba(74,186,142,0.15)' : 'none',
                          }}>
                            {msg.text}
                          </div>
                          <div style={{
                            ...s.msgTime,
                            textAlign: msg.role === 'counselor' ? 'right' : 'left',
                          }}>
                            {msg.role === 'counselor' ? 'You' : st.altiusId} · {msg.time}
                          </div>
                        </div>
                        {msg.role === 'counselor' && (
                          <div style={s.msgCounselorAvatar}>{loggedInCounselor.avatar}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div style={s.chatInput}>
                    <input
                      style={s.chatInputField}
                      value={msgInput}
                      onChange={e => setMsgInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendMessage()}
                      placeholder={`Reply to ${st.altiusId}...`}
                    />
                    <button
                      style={{
                        ...s.chatSendBtn,
                        opacity: msgInput.trim() ? 1 : 0.5,
                      }}
                      onClick={sendMessage}
                    >
                      ➤
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ══ SCHEDULE TAB ══ */}
        {activeTab === 'schedule' && (
          <div>
            <h1 style={s.pageTitle}>📅 Upcoming Sessions</h1>
            <p style={s.pageSub}>Manage your session schedule</p>
            <div style={s.scheduleList}>
              {upcomingSessions.map(session => (
                <div key={session.id} style={{
                  ...s.scheduleItem,
                  borderLeft: `4px solid ${session.urgent ? '#f43f5e' : '#4aba8e'}`,
                }}>
                  <div style={s.scheduleLeft}>
                    <div style={s.scheduleAvatar}>{session.avatar}</div>
                    <div>
                      <div style={s.scheduleId}>{session.altiusId}</div>
                      <div style={s.scheduleMeta}>{session.date} · {session.time} · {session.type} Session</div>
                    </div>
                  </div>
                  <div style={s.scheduleRight}>
                    {session.urgent && <span style={s.urgentBadge}>Urgent</span>}
                    <span style={{
                      ...s.typeBadge,
                      background: session.type === 'Video' ? '#e8f7f1' : '#ede9fe',
                      color:      session.type === 'Video' ? '#4aba8e' : '#a78bfa',
                    }}>
                      {session.type === 'Video' ? '🎥' : '💬'} {session.type}
                    </span>
                    <button style={s.joinBtn} onClick={() => joinSession(session)}>
                      {session.type === 'Video' ? '🎥 Join Call' : '💬 Open Chat'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ FLAGGED TAB ══ */}
        {activeTab === 'flagged' && (
          <div>
            <h1 style={s.pageTitle}>🚨 Flagged Students</h1>
            <p style={s.pageSub}>These students need your immediate attention</p>
            {flagged.length === 0 ? (
              <div style={s.emptyBox}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✅</div>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: '1.1rem', fontWeight: 700, color: '#1e3a2f' }}>
                  No flagged students right now
                </div>
                <div style={{ fontSize: '0.88rem', color: '#6b8f7e', marginTop: 8 }}>
                  All students are in a manageable state.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {flagged.map(student => {
                  const phqCol = SEVERITY_COLORS[student.phq9Label];
                  const gadCol = SEVERITY_COLORS[student.gad7Label];
                  return (
                    <div key={student.id} style={s.flaggedCard}>
                      <div style={s.flaggedTop}>
                        <div style={s.flaggedAvatar}>{student.avatar}</div>
                        <div style={{ flex: 1 }}>
                          <div style={s.flaggedId}>{student.altiusId}</div>
                          <div style={s.flaggedMeta}>Last seen {student.lastSeen} · {student.sessions} sessions</div>
                        </div>
                        <div style={s.flaggedMood}>{student.mood}</div>
                      </div>

                      <div style={s.flaggedScores}>
                        <div style={{ ...s.scorePill, background: phqCol.bg, color: phqCol.color }}>
                          PHQ-9: {student.phq9} · {student.phq9Label}
                        </div>
                        <div style={{ ...s.scorePill, background: gadCol.bg, color: gadCol.color }}>
                          GAD-7: {student.gad7} · {student.gad7Label}
                        </div>
                      </div>

                      {/* Last message preview */}
                      <div style={s.lastMsgPreview}>
                        <div style={s.lastMsgLabel}>Last message:</div>
                        <div style={s.lastMsgText}>
                          "{student.messages[student.messages.length - 1]?.text}"
                        </div>
                      </div>

                      <div style={s.flaggedActions}>
                        <button
                          style={{ ...s.flagActionBtn, background: 'linear-gradient(135deg, #4aba8e, #2d9e6e)', color: 'white' }}
                          onClick={() => { setSelectedStudent(student); setActiveTab('students'); }}
                        >
                          💬 Open Chat
                        </button>
                        <button style={{ ...s.flagActionBtn, background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', color: 'white' }}
                          onClick={() => openSchedule(student, true)}
                        >
                          📅 Schedule Urgent Session
                        </button>
                        <button
                          style={{ ...s.flagActionBtn, background: '#f0f7f4', color: '#6b8f7e' }}
                          onClick={() => setStudents(prev => prev.map(s => s.id === student.id ? { ...s, flagged: false } : s))}
                        >
                          ✅ Remove Flag
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

const s = {
  page: {
    display: 'flex', minHeight: '100vh', background: '#f0f7f4',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    position: 'relative', overflowX: 'hidden',
  },
  blob1: {
    position: 'fixed', width: 500, height: 500, borderRadius: '50%',
    background: '#b8f0dc', filter: 'blur(80px)', opacity: 0.28,
    top: -150, left: -100, zIndex: 0, pointerEvents: 'none',
  },
  blob2: {
    position: 'fixed', width: 400, height: 400, borderRadius: '50%',
    background: '#ddd6fe', filter: 'blur(80px)', opacity: 0.22,
    bottom: -100, right: -80, zIndex: 0, pointerEvents: 'none',
  },
  dots: {
    position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
    backgroundImage: 'radial-gradient(circle, rgba(74,186,142,0.1) 1.5px, transparent 1.5px)',
    backgroundSize: '36px 36px',
  },
  sidebar: {
    position: 'fixed', top: 0, left: 0, bottom: 0, width: 240, zIndex: 10,
    background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(74,186,142,0.15)',
    display: 'flex', flexDirection: 'column',
    padding: '24px 16px', overflowY: 'auto',
  },
  sidebarLogo: {
    fontFamily: 'Georgia, serif', fontSize: '1.4rem',
    fontWeight: 900, color: '#4aba8e', marginBottom: 20, paddingLeft: 8,
  },
  counselorBox: {
    background: 'linear-gradient(135deg, #e8f7f1, #d1fae5)',
    border: '1px solid rgba(74,186,142,0.25)',
    borderRadius: 16, padding: '16px', marginBottom: 20, textAlign: 'center',
  },
  counselorAvatar: { fontSize: '2rem', marginBottom: 6 },
  counselorName: { fontSize: '0.88rem', fontWeight: 700, color: '#1e3a2f' },
  counselorTitle: { fontSize: '0.7rem', color: '#6b8f7e', marginTop: 2, marginBottom: 10 },
  availToggle: {
    fontSize: '0.72rem', fontWeight: 700,
    padding: '6px 12px', borderRadius: 20,
    border: '1.5px solid', cursor: 'pointer',
    transition: 'all 0.2s',
  },
  navBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    width: '100%', padding: '10px 12px', borderRadius: 12,
    border: '1.5px solid transparent', cursor: 'pointer',
    fontSize: '0.85rem', fontFamily: 'inherit',
    marginBottom: 4, transition: 'all 0.2s', textAlign: 'left',
  },
  sidebarBottom: { marginTop: 'auto' },
  logoutBtn: {
    width: '100%', background: 'none',
    border: '1px solid rgba(74,186,142,0.25)',
    borderRadius: 10, padding: 10, cursor: 'pointer',
    color: '#6b8f7e', fontSize: '0.82rem', fontFamily: 'inherit',
  },
  main: {
    marginLeft: 240, flex: 1, padding: '32px 36px',
    position: 'relative', zIndex: 1,
  },
  pageTitle: {
    fontFamily: 'Georgia, serif', fontSize: '1.8rem',
    fontWeight: 700, color: '#1e3a2f', margin: 0, marginBottom: 6,
  },
  pageSub: { fontSize: '0.88rem', color: '#6b8f7e', margin: '0 0 24px' },

  // Stats
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard: {
    background: 'white', borderRadius: 20,
    padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
    textAlign: 'center',
  },
  statIcon: {
    width: 44, height: 44, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.3rem', margin: '0 auto 10px',
  },
  statValue: { fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 900 },
  statLabel: { fontSize: '0.78rem', color: '#6b8f7e', marginTop: 4 },

  // Alert
  alertBox: {
    background: 'linear-gradient(135deg, #fff0f4, #fce7f3)',
    border: '1px solid rgba(244,63,94,0.2)',
    borderRadius: 20, padding: '20px', marginBottom: 24,
  },
  alertTitle: { fontSize: '0.9rem', fontWeight: 700, color: '#f43f5e', marginBottom: 14 },
  alertRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: 'white', borderRadius: 14, padding: '12px 16px',
    marginBottom: 8,
  },
  alertAvatar: { fontSize: '1.3rem' },
  alertId: { fontSize: '0.85rem', fontWeight: 700, color: '#1e3a2f' },
  alertScores: { fontSize: '0.72rem', color: '#6b8f7e', marginTop: 2 },
  alertViewBtn: {
    background: '#f43f5e', color: 'white', border: 'none',
    borderRadius: 10, padding: '7px 14px', cursor: 'pointer',
    fontSize: '0.78rem', fontWeight: 700, fontFamily: 'inherit',
  },

  // Schedule card
  scheduleCard: {
    background: 'white', borderRadius: 20, padding: '24px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.05)', marginBottom: 24,
  },
  cardTitle: { fontSize: '1rem', fontWeight: 700, color: '#1e3a2f', marginBottom: 16 },
  sessionRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 0', borderBottom: '1px solid #f0f7f4',
  },
  sessionAvatar: { fontSize: '1.3rem' },
  sessionId: { fontSize: '0.85rem', fontWeight: 700, color: '#1e3a2f' },
  sessionMeta: { fontSize: '0.72rem', color: '#6b8f7e', marginTop: 2 },
  urgentBadge: {
    background: '#fff0f4', color: '#f43f5e',
    fontSize: '0.68rem', fontWeight: 700,
    padding: '3px 10px', borderRadius: 20,
  },
  joinBtn: {
    background: 'linear-gradient(135deg, #4aba8e, #2d9e6e)',
    color: 'white', border: 'none', borderRadius: 10,
    padding: '8px 14px', cursor: 'pointer',
    fontSize: '0.78rem', fontWeight: 700, fontFamily: 'inherit',
  },

  // Severity overview
  overviewCard: {
    background: 'white', borderRadius: 20, padding: '24px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
  },
  severityGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  severityCard: { borderRadius: 16, padding: '20px', textAlign: 'center' },
  severityNum: { fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 900 },
  severityLabel: { fontSize: '0.78rem', fontWeight: 700, marginTop: 4 },

  // Students grid
  studentGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  studentCard: {
    background: 'white', borderRadius: 20, padding: '20px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.05)', cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative',
  },
  flagBadge: {
    position: 'absolute', top: 12, right: 12,
    background: '#fff0f4', color: '#f43f5e',
    fontSize: '0.68rem', fontWeight: 700,
    padding: '3px 10px', borderRadius: 20,
  },
  studentTop: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 },
  studentAvatar: {
    width: 40, height: 40, borderRadius: '50%',
    background: '#f0f7f4', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
    border: '1.5px solid rgba(74,186,142,0.2)',
  },
  studentId: { fontSize: '0.88rem', fontWeight: 700, color: '#1e3a2f' },
  studentMeta: { fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 },
  studentMood: { fontSize: '1.3rem', marginLeft: 'auto' },
  scoreRow: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 },
  scorePill: {
    fontSize: '0.68rem', fontWeight: 700,
    padding: '4px 10px', borderRadius: 20,
  },
  sessionCount: { fontSize: '0.72rem', color: '#94a3b8' },

  // Student detail
  backBtn: {
    background: 'none', border: 'none', color: '#6b8f7e',
    fontSize: '0.88rem', cursor: 'pointer',
    fontFamily: 'inherit', marginBottom: 20, padding: 0,
  },
  detailGrid: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 },
  detailLeft: { display: 'flex', flexDirection: 'column', gap: 16 },
  detailProfileCard: {
    background: 'white', borderRadius: 20, padding: '24px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.05)', textAlign: 'center',
  },
  detailAvatar: { fontSize: '2.5rem', marginBottom: 8 },
  detailId: { fontSize: '1rem', fontWeight: 700, color: '#1e3a2f', marginBottom: 4 },
  detailMeta: { fontSize: '0.72rem', color: '#94a3b8', marginBottom: 6 },
  detailMood: { fontSize: '0.82rem', color: '#6b8f7e', marginBottom: 14 },
  flagAlert: {
    background: '#fff0f4', color: '#f43f5e',
    borderRadius: 10, padding: '8px 12px',
    fontSize: '0.75rem', fontWeight: 600, marginBottom: 14,
  },
  detailScores: { display: 'flex', gap: 8 },
  detailScore: { flex: 1, borderRadius: 14, padding: '14px 10px', textAlign: 'center' },
  detailScoreNum: { fontFamily: 'Georgia,serif', fontSize: '1.6rem', fontWeight: 900 },
  detailScoreBadge: {
    fontSize: '0.65rem', fontWeight: 700,
    padding: '3px 8px', borderRadius: 20, display: 'inline-block', marginTop: 4,
  },
  notesCard: {
    background: 'white', borderRadius: 20, padding: '20px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
  },
  notesTitle: { fontSize: '0.85rem', fontWeight: 700, color: '#1e3a2f', marginBottom: 12 },
  savedNote: {
    background: '#f8fffe', border: '1px solid rgba(74,186,142,0.15)',
    borderRadius: 10, padding: '10px 12px', fontSize: '0.82rem',
    color: '#1e3a2f', lineHeight: 1.6, marginBottom: 10,
  },
  notesInput: {
    width: '100%', padding: '10px 12px',
    background: '#f8fffe', border: '1.5px solid rgba(74,186,142,0.2)',
    borderRadius: 10, fontFamily: 'inherit', fontSize: '0.82rem',
    color: '#1e3a2f', resize: 'none', outline: 'none',
    lineHeight: 1.6, boxSizing: 'border-box', marginBottom: 8,
  },
  saveNoteBtn: {
    width: '100%', background: 'linear-gradient(135deg, #4aba8e, #2d9e6e)',
    color: 'white', border: 'none', borderRadius: 10,
    padding: '9px', cursor: 'pointer', fontSize: '0.82rem',
    fontWeight: 700, fontFamily: 'inherit',
  },
  quickActions: { display: 'flex', flexDirection: 'column', gap: 8 },
  qaBtn: {
    width: '100%', padding: '11px', border: 'none', borderRadius: 12,
    cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
    fontFamily: 'inherit', transition: 'opacity 0.2s',
  },

  // Chat in detail view
  detailRight: {
    background: 'white', borderRadius: 20,
    boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
    display: 'flex', flexDirection: 'column',
    height: 'calc(100vh - 160px)',
    overflow: 'hidden',
  },
  chatHeader: {
    padding: '18px 20px',
    borderBottom: '1px solid #f0f7f4',
    flexShrink: 0,
  },
  chatHeaderTitle: { fontSize: '0.95rem', fontWeight: 700, color: '#1e3a2f' },
  chatHeaderSub: { fontSize: '0.72rem', color: '#6b8f7e', marginTop: 3 },
  chatMessages: {
    flex: 1, overflowY: 'auto',
    padding: '20px', display: 'flex',
    flexDirection: 'column', gap: 12,
  },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: 8 },
  msgStudentAvatar: {
    width: 30, height: 30, borderRadius: '50%',
    background: '#f0f7f4', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '0.9rem', flexShrink: 0,
    border: '1.5px solid rgba(74,186,142,0.2)',
  },
  msgCounselorAvatar: {
    width: 30, height: 30, borderRadius: '50%',
    background: '#e8f7f1', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '0.9rem', flexShrink: 0,
    border: '1.5px solid rgba(74,186,142,0.2)',
  },
  msgBubble: {
    padding: '12px 16px', fontSize: '0.88rem',
    lineHeight: 1.65,
  },
  msgTime: { fontSize: '0.65rem', color: '#94a3b8', marginTop: 3, paddingLeft: 4 },
  chatInput: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '14px 18px',
    borderTop: '1px solid #f0f7f4', flexShrink: 0,
  },
  chatInputField: {
    flex: 1, padding: '11px 16px',
    background: '#f0f7f4', border: '1.5px solid rgba(74,186,142,0.2)',
    borderRadius: 12, fontFamily: 'inherit',
    fontSize: '0.88rem', color: '#1e3a2f', outline: 'none',
  },
  chatSendBtn: {
    width: 40, height: 40, borderRadius: '50%',
    background: 'linear-gradient(135deg, #4aba8e, #2d9e6e)',
    color: 'white', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1rem', transition: 'opacity 0.2s',
  },

  // Schedule tab
  scheduleList: { display: 'flex', flexDirection: 'column', gap: 12 },
  scheduleItem: {
    background: 'white', borderRadius: 16, padding: '18px 20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  scheduleLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  scheduleAvatar: {
    width: 40, height: 40, borderRadius: '50%',
    background: '#f0f7f4', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
    border: '1.5px solid rgba(74,186,142,0.2)',
  },
  scheduleId: { fontSize: '0.88rem', fontWeight: 700, color: '#1e3a2f' },
  scheduleMeta: { fontSize: '0.72rem', color: '#6b8f7e', marginTop: 3 },
  scheduleRight: { display: 'flex', alignItems: 'center', gap: 8 },
  typeBadge: {
    fontSize: '0.72rem', fontWeight: 700,
    padding: '4px 12px', borderRadius: 20,
  },

  // Flagged tab
  flaggedCard: {
    background: 'white', borderRadius: 20, padding: '20px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
    border: '1.5px solid rgba(244,63,94,0.15)',
  },
  flaggedTop: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 },
  flaggedAvatar: {
    width: 44, height: 44, borderRadius: '50%',
    background: '#f0f7f4', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
    border: '1.5px solid rgba(74,186,142,0.2)',
  },
  flaggedId: { fontSize: '0.95rem', fontWeight: 700, color: '#1e3a2f' },
  flaggedMeta: { fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 },
  flaggedMood: { fontSize: '1.5rem', marginLeft: 'auto' },
  flaggedScores: { display: 'flex', gap: 8, marginBottom: 14 },
  lastMsgPreview: {
    background: '#f8fffe', border: '1px solid rgba(74,186,142,0.12)',
    borderRadius: 12, padding: '12px 14px', marginBottom: 14,
  },
  lastMsgLabel: { fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, marginBottom: 4 },
  lastMsgText: { fontSize: '0.85rem', color: '#1e3a2f', lineHeight: 1.55, fontStyle: 'italic' },
  flaggedActions: { display: 'flex', gap: 10 },
  flagActionBtn: {
    flex: 1, padding: '10px', border: 'none', borderRadius: 12,
    cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
    fontFamily: 'inherit', transition: 'opacity 0.2s',
  },
  emptyBox: {
    textAlign: 'center', padding: '60px 40px',
    background: 'white', borderRadius: 24,
    border: '2px dashed rgba(74,186,142,0.3)',
  },
};