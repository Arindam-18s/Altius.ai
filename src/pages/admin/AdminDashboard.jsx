import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';
import { authFetch } from '../../api';

const STATS = {
  totalStudents: 1247,
  activeThisWeek: 389,
  assessmentsDone: 843,
  flaggedStudents: 28,
  avgPHQ9: 8.4,
  avgGAD7: 7.1,
  counselorSessions: 312,
  resourcesUsed: 2841,
};

const SEVERITY_DATA = [
  { label: 'Minimal',  phq9: 312, gad7: 289, color: '#4aba8e', bg: '#e8f7f1' },
  { label: 'Mild',     phq9: 287, gad7: 301, color: '#eab308', bg: '#fef9c3' },
  { label: 'Moderate', phq9: 164, gad7: 178, color: '#fb923c', bg: '#fff0e8' },
  { label: 'Severe',   phq9: 80,  gad7: 75,  color: '#f43f5e', bg: '#fff0f4' },
];

const WEEKLY_TREND = [
  { week: 'Week 1', logins: 180, assessments: 95,  sessions: 42 },
  { week: 'Week 2', logins: 224, assessments: 118, sessions: 58 },
  { week: 'Week 3', logins: 198, assessments: 104, sessions: 51 },
  { week: 'Week 4', logins: 389, assessments: 167, sessions: 78 },
];

const TOP_ISSUES = [
  { issue: 'Exam Anxiety',      count: 412, pct: 82, color: '#a78bfa' },
  { issue: 'Academic Pressure', count: 389, pct: 77, color: '#4aba8e' },
  { issue: 'Family Stress',     count: 267, pct: 53, color: '#fb923c' },
  { issue: 'Sleep Issues',      count: 234, pct: 46, color: '#38bdf8' },
  { issue: 'Loneliness',        count: 198, pct: 39, color: '#ec4899' },
  { issue: 'Low Motivation',    count: 176, pct: 35, color: '#eab308' },
];

const COUNSELORS_LIST = [
  { name: 'Dr. Priya Sharma', avatar: '👩‍⚕️', sessions: 134, rating: 4.9, available: true  },
  { name: 'Mr. Arjun Mehta',  avatar: '🧑‍⚕️', sessions: 112, rating: 4.8, available: true  },
  { name: 'Ms. Kavya Nair',   avatar: '👩‍💼', sessions: 66,  rating: 4.7, available: false },
];

const INITIAL_ALERTS = [
  { id: 1, altiusId: 'ALTIUS-2025-078', msg: 'PHQ-9 score 18 — Severe depression indicators', time: '30 min ago', level: 'high'   },
  { id: 2, altiusId: 'ALTIUS-2025-012', msg: 'GAD-7 score 15 — Severe anxiety indicators',    time: '2 hrs ago',  level: 'high'   },
  { id: 3, altiusId: 'ALTIUS-2025-134', msg: 'PHQ-9 score 12 — Moderate, flagged for review', time: '4 hrs ago',  level: 'medium' },
  { id: 4, altiusId: 'ALTIUS-2025-201', msg: 'Crisis keyword detected in AI chat session',     time: '6 hrs ago',  level: 'high'   },
  { id: 5, altiusId: 'ALTIUS-2025-089', msg: 'GAD-7 score 10 — Moderate anxiety',             time: '1 day ago',  level: 'medium' },
];

const UPCOMING = [
  { id: 1, altiusId: 'ALTIUS-2025-012', avatar: '🌸', date: 'Today',    time: '3:00 PM',  type: 'Video', urgent: true  },
  { id: 2, altiusId: 'ALTIUS-2025-055', avatar: '🎯', date: 'Today',    time: '5:00 PM',  type: 'Chat',  urgent: false },
  { id: 3, altiusId: 'ALTIUS-2025-034', avatar: '⭐', date: 'Tomorrow', time: '10:00 AM', type: 'Video', urgent: false },
  { id: 4, altiusId: 'ALTIUS-2025-078', avatar: '🌻', date: 'Tomorrow', time: '11:30 AM', type: 'Video', urgent: true  },
];

const RESOURCE_USAGE = [
  { name: 'Breathing Game', uses: 684, icon: '🌬️', color: '#4aba8e' },
  { name: 'AI Chatbot',     uses: 521, icon: '🤖', color: '#a78bfa' },
  { name: 'Memory Match',   uses: 398, icon: '🧠', color: '#38bdf8' },
  { name: 'Calm Music',     uses: 312, icon: '🎵', color: '#fb923c' },
  { name: 'Bubble Pop',     uses: 287, icon: '🫧', color: '#ec4899' },
  { name: 'Meditation',     uses: 245, icon: '🌿', color: '#eab308' },
];


const API = `${API_URL}/api`;

export default function AdminDashboard() {
  const navigate      = useNavigate();
  const [activeTab,   setActiveTab]   = useState('overview');
  const [alerts,      setAlerts]      = useState([]);
  const [assignModal, setAssignModal] = useState(null);
  const [assignedTo,  setAssignedTo]  = useState({});
  const [assignDone,  setAssignDone]  = useState(null);
  const [pdfLoading,  setPdfLoading]  = useState(false);

  // ── Live data from backend
  const [liveStats,      setLiveStats]      = useState(STATS);
  const [liveCounselors, setLiveCounselors] = useState(COUNSELORS_LIST);
  const [liveStudents,   setLiveStudents]   = useState([]);
  const [dataLoading,    setDataLoading]    = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    setDataLoading(true);
    try {
      const [statsRes, counselorsRes, alertsRes, studentsRes] = await Promise.all([
        authFetch(`${API}/admin/stats`).then(r => r.json()),
        authFetch(`${API}/admin/counselors`).then(r => r.json()),
        authFetch(`${API}/admin/alerts`).then(r => r.json()),
        authFetch(`${API}/admin/students`).then(r => r.json()),
      ]);

      if (statsRes && !statsRes.error)      setLiveStats({ ...STATS, ...statsRes });
      if (counselorsRes.counselors)         setLiveCounselors(counselorsRes.counselors);
      if (alertsRes.alerts)                 setAlerts(alertsRes.alerts);
      if (studentsRes.students)             setLiveStudents(studentsRes.students);
    } catch (err) {
      console.error('Admin data fetch error:', err.message);
    } finally {
      setDataLoading(false);
    }
  }
  const [toast,       setToast]       = useState('');

  const maxUses = Math.max(...RESOURCE_USAGE.map(r => r.uses));

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  function dismissAlert(id) {
    setAlerts(prev => prev.filter(a => a.id !== id));
    showToast('Alert dismissed');
  }

  function openAssign(alert) {
    setAssignModal(alert);
    setAssignDone(null);
  }

  // ── Schedule modal state for admin
  const [adminSchedModal, setAdminSchedModal] = useState(null);
  const [adminSchedDate,  setAdminSchedDate]  = useState('');
  const [adminSchedTime,  setAdminSchedTime]  = useState('');
  const [adminSchedType,  setAdminSchedType]  = useState('Video');
  const [adminSchedDone,  setAdminSchedDone]  = useState(false);

  async function doAssign(counselor) {
    const counselorName = counselor.name;
    setAssignedTo(prev => ({ ...prev, [assignModal.id]: counselorName }));
    setAssignDone(counselorName);

    // Book a session in backend
    try {
      await authFetch('http://localhost:5000/api/sessions/book', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          altius_id:      assignModal.altiusId,
          counselor_id: counselor.id,
          date:         new Date().toLocaleDateString('en-CA'),
          time:         'To be scheduled',
          type:         'Video',
          urgent:       assignModal.level === 'high',
        }),
      });
    } catch (err) {
      console.error('Assign session error:', err);
    }

    setTimeout(() => {
      const aId = assignModal.altiusId;
      setAssignModal(null);
      setAssignDone(null);
      showToast(`✅ ${aId} assigned to ${counselorName} — session created!`);
    }, 1200);
  }

  function joinSession(session) {
    if (session.type === 'Video') {
      const room = `altius-admin-${session.altiusId.replace(/-/g,'')}${Date.now()}`;
      window.open(`https://meet.jit.si/${room}`, '_blank');
      showToast(`🎥 Joining video call with ${session.altiusId}...`);
    } else {
      showToast(`💬 Chat session opened for ${session.altiusId}`);
    }
  }

  function downloadReport() {
    setPdfLoading(true);
    showToast('⏳ Generating report...');
    setTimeout(() => {
      const date = new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Altius Analytics Report</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#1e3a2f;padding:40px;background:white}
  .header{border-bottom:3px solid #4aba8e;padding-bottom:20px;margin-bottom:30px;display:flex;justify-content:space-between;align-items:flex-end}
  .logo{font-size:2rem;font-weight:900;color:#4aba8e}
  .subtitle{font-size:1rem;color:#6b8f7e;margin-top:4px}
  .date{font-size:0.82rem;color:#94a3b8;text-align:right}
  .privacy{background:#e8f7f1;border-radius:8px;padding:12px 16px;font-size:0.82rem;color:#4aba8e;margin-bottom:28px}
  .section{margin-bottom:32px}
  .section-title{font-size:1.05rem;font-weight:700;color:#1e3a2f;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid #e8f7f1}
  .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:8px}
  .stat{background:#f0f7f4;border-radius:10px;padding:16px;text-align:center;border-top:3px solid #4aba8e}
  .stat-n{font-size:1.8rem;font-weight:900;color:#4aba8e}
  .stat-l{font-size:0.72rem;color:#6b8f7e;margin-top:4px}
  .sev{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
  .sev-box{border-radius:10px;padding:16px;text-align:center}
  .sev-n{font-size:1.5rem;font-weight:900}
  .sev-l{font-size:0.78rem;font-weight:700;margin-top:4px}
  .row{display:flex;align-items:center;gap:12px;margin-bottom:10px}
  .bar-wrap{flex:1;background:#f0f7f4;height:8px;border-radius:10px;overflow:hidden}
  .bar{height:100%;border-radius:10px}
  .c-row{display:flex;align-items:center;gap:14px;padding:12px;background:#f8fffe;border-radius:10px;margin-bottom:8px}
  .footer{margin-top:40px;padding-top:16px;border-top:1px solid #e8f7f1;font-size:0.72rem;color:#94a3b8;text-align:center}
  @media print{body{padding:20px}}
</style></head><body>
<div class="header">
  <div><div class="logo">🌿 Altius</div><div class="subtitle">Campus Mental Health Analytics Report</div></div>
  <div class="date">Generated: ${date}<br>Confidential · Anonymized Data Only</div>
</div>
<div class="privacy">🔒 This report contains anonymized, aggregated data only. No individual student identities or personal details are included.</div>

<div class="section">
  <div class="section-title">📊 Key Statistics</div>
  <div class="stats">
    <div class="stat"><div class="stat-n">${STATS.totalStudents.toLocaleString()}</div><div class="stat-l">Total Students</div></div>
    <div class="stat" style="border-color:#38bdf8"><div class="stat-n" style="color:#38bdf8">${STATS.activeThisWeek}</div><div class="stat-l">Active This Week</div></div>
    <div class="stat" style="border-color:#a78bfa"><div class="stat-n" style="color:#a78bfa">${STATS.assessmentsDone}</div><div class="stat-l">Assessments Done</div></div>
    <div class="stat" style="border-color:#f43f5e"><div class="stat-n" style="color:#f43f5e">${STATS.flaggedStudents}</div><div class="stat-l">Flagged Students</div></div>
    <div class="stat" style="border-color:#fb923c"><div class="stat-n" style="color:#fb923c">${STATS.avgPHQ9}</div><div class="stat-l">Avg PHQ-9</div></div>
    <div class="stat" style="border-color:#eab308"><div class="stat-n" style="color:#eab308">${STATS.avgGAD7}</div><div class="stat-l">Avg GAD-7</div></div>
    <div class="stat"><div class="stat-n">${STATS.counselorSessions}</div><div class="stat-l">Counselor Sessions</div></div>
    <div class="stat" style="border-color:#ec4899"><div class="stat-n" style="color:#ec4899">${STATS.resourcesUsed.toLocaleString()}</div><div class="stat-l">Resources Used</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">📈 Severity Distribution</div>
  <div class="sev">
    ${SEVERITY_DATA.map(d=>`<div class="sev-box" style="background:${d.bg}"><div class="sev-n" style="color:${d.color}">${d.phq9}</div><div class="sev-l" style="color:${d.color}">${d.label}</div><div style="font-size:0.65rem;color:#94a3b8;margin-top:4px">PHQ-9 · GAD-7: ${d.gad7}</div></div>`).join('')}
  </div>
</div>

<div class="section">
  <div class="section-title">🔍 Top Mental Health Issues</div>
  ${TOP_ISSUES.map(i=>`<div class="row"><div style="width:160px;font-size:0.85rem">${i.issue}</div><div class="bar-wrap"><div class="bar" style="width:${i.pct}%;background:${i.color}"></div></div><div style="font-size:0.8rem;font-weight:700;color:${i.color};width:40px;text-align:right">${i.pct}%</div><div style="font-size:0.72rem;color:#94a3b8;width:80px;text-align:right">${i.count} students</div></div>`).join('')}
</div>

<div class="section">
  <div class="section-title">📚 Resource Usage</div>
  ${RESOURCE_USAGE.map(r=>`<div class="row"><div style="font-size:1.2rem;width:28px;text-align:center">${r.icon}</div><div style="width:140px;font-size:0.85rem;font-weight:600">${r.name}</div><div class="bar-wrap"><div class="bar" style="width:${(r.uses/684)*100}%;background:${r.color}"></div></div><div style="font-size:0.82rem;font-weight:700;color:${r.color};width:36px;text-align:right">${r.uses}</div></div>`).join('')}
</div>

<div class="section">
  <div class="section-title">🧑‍⚕️ Counselor Performance</div>
  ${liveCounselors.map(c=>`<div class="c-row"><div style="font-size:1.5rem">${c.avatar}</div><div style="flex:1"><div style="font-weight:700;font-size:0.9rem">${c.name}</div><div style="font-size:0.75rem;color:#6b8f7e;margin-top:2px">${c.sessions} sessions · ⭐ ${c.rating} · ${c.available?'Available':'Unavailable'}</div></div></div>`).join('')}
</div>

<div class="footer">🌿 Altius — Anonymous Student Mental Wellness Platform &nbsp;|&nbsp; ${date}<br>This report is confidential and for authorized administrative use only.</div>
</body></html>`;

      const blob = new Blob([html], { type: 'text/html' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `Altius_Report_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setPdfLoading(false);
      showToast('✅ Report downloaded! Open in browser → Ctrl+P → Save as PDF');
    }, 1500);
  }

  return (
    <div style={s.page}>
      <div style={s.blob1} /><div style={s.blob2} /><div style={s.dots} />

      {/* TOAST */}
      {toast && <div style={s.toast}>{toast}</div>}

      {/* ASSIGN MODAL */}
      {assignModal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setAssignModal(null)}>
          <div style={s.modal}>
            <button style={s.modalClose} onClick={() => setAssignModal(null)}>✕</button>
            <div style={{ fontSize: '2rem', marginBottom: 10 }}>🧑‍⚕️</div>
            <div style={s.modalTitle}>Assign Counselor</div>
            <div style={s.modalSub}>For student <strong>{assignModal.altiusId}</strong></div>
            <div style={s.modalAlertBox}>{assignModal.msg}</div>

            {assignDone ? (
              <div style={s.assignSuccess}>✅ Assigned to {assignDone}!</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {liveCounselors.map(c => (
                  <div
                    key={c.name}
                    style={{
                      ...s.cOption,
                      opacity:      c.available ? 1 : 0.5,
                      cursor:       c.available ? 'pointer' : 'not-allowed',
                      borderColor:  assignedTo[assignModal.id] === c.name ? '#4aba8e' : 'rgba(74,186,142,0.15)',
                      background:   assignedTo[assignModal.id] === c.name ? '#e8f7f1' : 'white',
                    }}
                    onClick={() => c.available && doAssign(c)}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{c.avatar}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e3a2f' }}>{c.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#6b8f7e', marginTop: 2 }}>
                        {c.sessions} sessions · ⭐ {c.rating} · {c.available ? '● Available' : '○ Unavailable'}
                      </div>
                    </div>
                    {c.available && (
                      <button style={s.assignPickBtn}>Assign →</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside style={s.sidebar}>
        <div style={s.sidebarLogo}>🌿 Altius</div>
        <div style={s.adminBox}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>📊</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e3a2f' }}>Admin Panel</div>
          <div style={{ fontSize: '0.7rem', color: '#6b8f7e', marginTop: 2 }}>Campus Mental Health</div>
        </div>
        {[
          { id: 'overview',   icon: '📊', label: 'Overview'         },
          { id: 'students',   icon: '👥', label: 'Student Insights'  },
          { id: 'counselors', icon: '🧑‍⚕️', label: 'Counselors'     },
          { id: 'alerts',     icon: '🚨', label: `Alerts (${alerts.length})` },
          { id: 'resources',  icon: '📚', label: 'Resource Usage'   },
        ].map(tab => (
          <button
            key={tab.id}
            style={{
              ...s.navBtn,
              background:  activeTab === tab.id ? '#fff0e8' : 'transparent',
              color:       activeTab === tab.id ? '#fb923c' : '#6b8f7e',
              fontWeight:  activeTab === tab.id ? 700 : 400,
              borderColor: activeTab === tab.id ? '#fed7aa' : 'transparent',
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
        <div style={{ marginTop: 'auto' }}>
          <button style={s.logoutBtn} onClick={() => navigate('/')}>← Logout</button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={s.main}>
        {/* Loading bar */}
        {dataLoading && (
          <div style={{ background:'linear-gradient(90deg,#4aba8e,#2d9e6e)', height:3, borderRadius:2, marginBottom:20, animation:'pulse 1s infinite' }} />
        )}
        {/* Refresh button */}
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
          <button
            style={{ background:'#e8f7f1', border:'1px solid rgba(74,186,142,0.2)', borderRadius:10, padding:'7px 14px', cursor:'pointer', fontSize:'0.78rem', color:'#4aba8e', fontFamily:'inherit', fontWeight:600 }}
            onClick={fetchAllData}
          >
            {dataLoading ? '⏳ Loading...' : '🔄 Refresh Data'}
          </button>
        </div>

        {/* ══ OVERVIEW ══ */}
        {activeTab === 'overview' && (
          <div>
            <h1 style={s.pageTitle}>📊 Campus Overview</h1>
            <p style={s.pageSub}>Real-time mental health analytics for your institution</p>
            <div style={s.statsGrid}>
              {[
                { icon:'🎓', label:'Total Students',    value:liveStats.totalStudents.toLocaleString(), color:'#4aba8e', bg:'#e8f7f1' },
                { icon:'✅', label:'Active This Week',  value:liveStats.activeThisWeek,                 color:'#38bdf8', bg:'#e0f5ff' },
                { icon:'📋', label:'Assessments Done',  value:liveStats.assessmentsDone,                color:'#a78bfa', bg:'#ede9fe' },
                { icon:'🚨', label:'Flagged Students',  value:liveStats.flaggedStudents,                color:'#f43f5e', bg:'#fff0f4' },
                { icon:'🧠', label:'Avg PHQ-9 Score',   value:liveStats.avgPHQ9,                        color:'#fb923c', bg:'#fff0e8' },
                { icon:'💭', label:'Avg GAD-7 Score',   value:liveStats.avgGAD7,                        color:'#eab308', bg:'#fef9c3' },
                { icon:'🗓', label:'Counselor Sessions',value:liveStats.counselorSessions,              color:'#4aba8e', bg:'#e8f7f1' },
                { icon:'📚', label:'Resources Used',    value:liveStats.resourcesUsed.toLocaleString(), color:'#ec4899', bg:'#fce7f3' },
              ].map(stat => (
                <div key={stat.label} style={{ ...s.statCard, borderTop:`3px solid ${stat.color}` }}>
                  <div style={{ ...s.statIcon, background: stat.bg }}>{stat.icon}</div>
                  <div style={{ ...s.statValue, color: stat.color }}>{stat.value}</div>
                  <div style={s.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={s.card}>
              <div style={s.cardTitle}>📈 Weekly Activity Trend</div>
              <div style={{ display:'flex', gap:20, justifyContent:'space-around', marginBottom:16 }}>
                {WEEKLY_TREND.map((week,i) => (
                  <div key={i} style={{ flex:1, textAlign:'center' }}>
                    <div style={{ display:'flex', gap:6, justifyContent:'center', alignItems:'flex-end', height:120, marginBottom:8 }}>
                      {[
                        { val:week.logins,      max:400, color:'#4aba8e' },
                        { val:week.assessments, max:200, color:'#a78bfa' },
                        { val:week.sessions,    max:100, color:'#fb923c' },
                      ].map((bar,j) => (
                        <div key={j} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                          <div style={{ width:20, height:100, background:'#f0f7f4', borderRadius:10, display:'flex', alignItems:'flex-end', overflow:'hidden' }}>
                            <div style={{ width:'100%', height:`${(bar.val/bar.max)*100}%`, background:bar.color, borderRadius:10 }} />
                          </div>
                          <div style={{ fontSize:'0.65rem', fontWeight:700, color:bar.color }}>{bar.val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize:'0.72rem', color:'#6b8f7e', fontWeight:600 }}>{week.week}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:20, justifyContent:'center' }}>
                {[{color:'#4aba8e',label:'Logins'},{color:'#a78bfa',label:'Assessments'},{color:'#fb923c',label:'Sessions'}].map(l=>(
                  <div key={l.label} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.75rem', color:'#6b8f7e' }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background:l.color }} />{l.label}
                  </div>
                ))}
              </div>
            </div>

            <div style={s.card}>
              <div style={s.cardTitle}>🔍 Top Mental Health Issues</div>
              {TOP_ISSUES.map(issue => (
                <div key={issue.issue} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                  <div style={{ fontSize:'0.82rem', color:'#1e3a2f', width:160, flexShrink:0 }}>{issue.issue}</div>
                  <div style={{ flex:1, height:8, background:'#f0f7f4', borderRadius:10, overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:10, width:`${issue.pct}%`, background:issue.color }} />
                  </div>
                  <div style={{ fontSize:'0.8rem', fontWeight:700, color:issue.color, width:36, textAlign:'right' }}>{issue.pct}%</div>
                  <div style={{ fontSize:'0.72rem', color:'#94a3b8', width:80, textAlign:'right' }}>{issue.count} students</div>
                </div>
              ))}
            </div>

            <div style={s.card}>
              <div style={s.cardTitle}>📅 Today's Sessions</div>
              {UPCOMING.filter(u => u.date === 'Today').map(session => (
                <div key={session.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid #f0f7f4' }}>
                  <span style={{ fontSize:'1.3rem' }}>{session.avatar}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'0.85rem', fontWeight:700, color:'#1e3a2f' }}>{session.altiusId}</div>
                    <div style={{ fontSize:'0.72rem', color:'#6b8f7e', marginTop:2 }}>{session.time} · {session.type}</div>
                  </div>
                  {session.urgent && <span style={{ background:'#fff0f4', color:'#f43f5e', fontSize:'0.68rem', fontWeight:700, padding:'3px 10px', borderRadius:20 }}>Urgent</span>}
                  <button
                    style={{ background:'linear-gradient(135deg,#4aba8e,#2d9e6e)', color:'white', border:'none', borderRadius:10, padding:'8px 14px', cursor:'pointer', fontSize:'0.78rem', fontWeight:700, fontFamily:'inherit' }}
                    onClick={() => joinSession(session)}
                  >
                    {session.type === 'Video' ? '🎥 Join Call' : '💬 Open Chat'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ STUDENTS ══ */}
        {activeTab === 'students' && (
          <div>
            <h1 style={s.pageTitle}>👥 Student Insights</h1>
            <p style={s.pageSub}>Anonymous aggregated data — no individual identities are revealed</p>
            <div style={s.card}>
              <div style={s.cardTitle}>📊 Severity Distribution</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                {SEVERITY_DATA.map(d => (
                  <div key={d.label} style={{ borderRadius:16, padding:20, textAlign:'center', background:d.bg }}>
                    <div style={{ fontFamily:'Georgia,serif', fontSize:'1.8rem', fontWeight:900, color:d.color }}>{d.phq9}</div>
                    <div style={{ fontSize:'0.82rem', fontWeight:700, color:d.color, marginTop:4, marginBottom:4 }}>{d.label}</div>
                    <div style={{ fontSize:'0.65rem', color:'#94a3b8' }}>PHQ-9</div>
                    <div style={{ height:1, background:`${d.color}33`, margin:'8px 0' }} />
                    <div style={{ fontFamily:'Georgia,serif', fontSize:'1.4rem', fontWeight:900, color:d.color }}>{d.gad7}</div>
                    <div style={{ fontSize:'0.65rem', color:'#94a3b8' }}>GAD-7</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>😊 Mood Check-in Summary (This Week)</div>
              <div style={{ display:'flex', gap:12, justifyContent:'space-around' }}>
                {[
                  { emoji:'😔', label:'Sad',     count:78,  color:'#a78bfa' },
                  { emoji:'😐', label:'Okay',    count:134, color:'#38bdf8' },
                  { emoji:'🙂', label:'Good',    count:98,  color:'#4aba8e' },
                  { emoji:'😊', label:'Happy',   count:56,  color:'#fb923c' },
                  { emoji:'🤩', label:'Amazing', count:23,  color:'#eab308' },
                ].map(m => (
                  <div key={m.label} style={{ textAlign:'center', flex:1 }}>
                    <div style={{ fontSize:'2rem', marginBottom:8 }}>{m.emoji}</div>
                    <div style={{ fontFamily:'Georgia,serif', fontSize:'1.4rem', fontWeight:900, color:m.color }}>{m.count}</div>
                    <div style={{ fontSize:'0.72rem', color:'#6b8f7e', marginTop:4 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...s.card, background:'linear-gradient(135deg,#ede9fe,#ddd6fe)', border:'1px solid rgba(167,139,250,0.3)' }}>
              <div style={{ ...s.cardTitle, color:'#5b21b6' }}>🤖 AI-Generated Insights</div>
              {[
                { icon:'📈', text:'Anxiety levels spike significantly during the 2 weeks before exam season. Consider scheduling extra counselor availability during this period.' },
                { icon:'🌙', text:'Sleep-related issues are reported by 46% of students. A sleep hygiene workshop could benefit a large portion of the campus.' },
                { icon:'👨‍👩‍👧', text:'Family pressure is the 3rd most cited concern. Consider adding family counseling or parent communication resources.' },
                { icon:'✅', text:'Students who use the breathing game report lower anxiety scores on subsequent assessments. Promote this resource more prominently.' },
              ].map((ins,i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, background:'rgba(255,255,255,0.6)', borderRadius:12, padding:14, marginBottom:10 }}>
                  <span style={{ fontSize:'1.2rem', flexShrink:0 }}>{ins.icon}</span>
                  <div style={{ fontSize:'0.85rem', color:'#1e3a2f', lineHeight:1.65 }}>{ins.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ COUNSELORS ══ */}
        {activeTab === 'counselors' && (
          <div>
            <h1 style={s.pageTitle}>🧑‍⚕️ Counselor Management</h1>
            <p style={s.pageSub}>Monitor counselor activity and performance</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 }}>
              {liveCounselors.map(c => (
                <div key={c.name} style={{ background:'white', borderRadius:20, padding:24, boxShadow:'0 4px 16px rgba(0,0,0,0.05)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                    <div style={{ fontSize:'2rem' }}>{c.avatar}</div>
                    <div style={{ fontSize:'0.68rem', fontWeight:700, padding:'4px 10px', borderRadius:20, background:c.available?'#e8f7f1':'#f0f7f4', color:c.available?'#4aba8e':'#94a3b8' }}>
                      {c.available ? '● Available' : '○ Away'}
                    </div>
                  </div>
                  <div style={{ fontFamily:'Georgia,serif', fontSize:'0.95rem', fontWeight:700, color:'#1e3a2f', marginBottom:14 }}>{c.name}</div>
                  <div style={{ display:'flex', gap:16, marginBottom:14 }}>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontFamily:'Georgia,serif', fontSize:'1.3rem', fontWeight:900, color:'#4aba8e' }}>{c.sessions}</div>
                      <div style={{ fontSize:'0.68rem', color:'#6b8f7e', marginTop:2 }}>Sessions</div>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontFamily:'Georgia,serif', fontSize:'1.3rem', fontWeight:900, color:'#fb923c' }}>{c.rating}</div>
                      <div style={{ fontSize:'0.68rem', color:'#6b8f7e', marginTop:2 }}>Rating</div>
                    </div>
                  </div>
                  <div style={{ fontSize:'0.72rem', color:'#6b8f7e', marginBottom:6, fontWeight:600 }}>Workload</div>
                  <div style={{ height:6, background:'#f0f7f4', borderRadius:10, overflow:'hidden', marginBottom:8 }}>
                    <div style={{ height:'100%', borderRadius:10, width:`${(c.sessions/150)*100}%`, background:c.sessions>120?'#f43f5e':'#4aba8e' }} />
                  </div>
                  <div style={{ fontSize:'0.72rem', color:'#6b8f7e', marginBottom:14 }}>
                    {c.sessions > 120 ? '⚠️ High workload' : '✅ Manageable workload'}
                  </div>
                  <button
                    style={{ width:'100%', background:c.available?'linear-gradient(135deg,#fb923c,#ea580c)':'#f0f7f4', color:c.available?'white':'#94a3b8', border:'none', borderRadius:12, padding:10, cursor:c.available?'pointer':'not-allowed', fontSize:'0.82rem', fontWeight:700, fontFamily:'inherit' }}
                    onClick={() => c.available && showToast(`📧 Message sent to ${c.name}`)}
                    disabled={!c.available}
                  >
                    {c.available ? '📧 Send Message' : 'Currently Unavailable'}
                  </button>
                </div>
              ))}
            </div>
            <div style={{ ...s.card, background:'linear-gradient(135deg,#fff0e8,#fed7aa)', border:'1px solid rgba(251,146,60,0.3)' }}>
              <div style={{ ...s.cardTitle, color:'#c2410c' }}>💡 Admin Recommendation</div>
              <div style={{ fontSize:'0.88rem', color:'#92400e', lineHeight:1.7 }}>
                Dr. Priya Sharma has handled 134 sessions this month — the highest on the team. Consider redistributing new bookings to Arjun Mehta to prevent burnout. Kavya Nair is currently unavailable; confirm her return date.
              </div>
            </div>
          </div>
        )}

        {/* ══ ALERTS ══ */}
        {activeTab === 'alerts' && (
          <div>
            <h1 style={s.pageTitle}>🚨 Student Alerts</h1>
            <p style={s.pageSub}>Students who may need urgent counselor attention</p>
            {alerts.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 40px', background:'white', borderRadius:24, border:'2px dashed rgba(74,186,142,0.3)' }}>
                <div style={{ fontSize:'2.5rem', marginBottom:12 }}>✅</div>
                <div style={{ fontFamily:'Georgia,serif', fontSize:'1.1rem', fontWeight:700, color:'#1e3a2f' }}>No active alerts</div>
                <div style={{ fontSize:'0.88rem', color:'#6b8f7e', marginTop:8 }}>All students are in a manageable state right now.</div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {alerts.map(alert => (
                  <div key={alert.id} style={{ background:'white', borderRadius:16, padding:'18px 20px', boxShadow:'0 2px 12px rgba(0,0,0,0.05)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, borderLeft:`4px solid ${alert.level==='high'?'#f43f5e':'#fb923c'}` }}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:14, flex:1 }}>
                      <div style={{ width:10, height:10, borderRadius:'50%', background:alert.level==='high'?'#f43f5e':'#fb923c', flexShrink:0, marginTop:4 }} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:'0.88rem', fontWeight:700, color:'#1e3a2f', marginBottom:3 }}>{alert.altiusId}</div>
                        <div style={{ fontSize:'0.82rem', color:'#6b8f7e', lineHeight:1.5 }}>{alert.msg}</div>
                        <div style={{ fontSize:'0.68rem', color:'#94a3b8', marginTop:4 }}>{alert.time}</div>
                        {assignedTo[alert.id] && (
                          <div style={{ fontSize:'0.72rem', color:'#4aba8e', fontWeight:700, marginTop:6 }}>✅ Assigned to {assignedTo[alert.id]}</div>
                        )}
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                      <span style={{ fontSize:'0.72rem', fontWeight:700, padding:'4px 12px', borderRadius:20, background:alert.level==='high'?'#fff0f4':'#fff0e8', color:alert.level==='high'?'#f43f5e':'#fb923c' }}>
                        {alert.level === 'high' ? '🚨 High' : '⚠️ Medium'}
                      </span>
                      <button
                        style={{ background:'linear-gradient(135deg,#4aba8e,#2d9e6e)', color:'white', border:'none', borderRadius:10, padding:'8px 14px', cursor:'pointer', fontSize:'0.75rem', fontWeight:700, fontFamily:'inherit' }}
                        onClick={() => openAssign(alert)}
                      >
                        {assignedTo[alert.id] ? '✅ Reassign' : 'Assign Counselor'}
                      </button>
                      <button
                        style={{ background:'#f0f7f4', color:'#6b8f7e', border:'1px solid rgba(74,186,142,0.2)', borderRadius:10, padding:'8px 14px', cursor:'pointer', fontSize:'0.75rem', fontFamily:'inherit' }}
                        onClick={() => dismissAlert(alert.id)}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ RESOURCES ══ */}
        {activeTab === 'resources' && (
          <div>
            <h1 style={s.pageTitle}>📚 Resource Usage</h1>
            <p style={s.pageSub}>See which wellness resources students are using most</p>
            <div style={s.card}>
              <div style={s.cardTitle}>Most Used Resources This Month</div>
              {RESOURCE_USAGE.map(r => (
                <div key={r.name} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                  <div style={{ fontSize:'1.3rem', width:30, textAlign:'center' }}>{r.icon}</div>
                  <div style={{ fontSize:'0.85rem', color:'#1e3a2f', fontWeight:600, width:130, flexShrink:0 }}>{r.name}</div>
                  <div style={{ flex:1, height:10, background:'#f0f7f4', borderRadius:10, overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:10, width:`${(r.uses/maxUses)*100}%`, background:r.color }} />
                  </div>
                  <div style={{ fontSize:'0.82rem', fontWeight:700, color:r.color, width:36, textAlign:'right' }}>{r.uses}</div>
                </div>
              ))}
            </div>

            <div style={s.card}>
              <div style={s.cardTitle}>📊 Usage Insights</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[
                  { icon:'🌬️', title:'Breathing Game', text:'Most popular resource. Students who use it show 23% lower anxiety scores on follow-up assessments.', color:'#4aba8e', bg:'#e8f7f1' },
                  { icon:'🤖', title:'AI Chatbot', text:'521 sessions this month. Crisis detection triggered 14 times — all students were referred to counselors.', color:'#a78bfa', bg:'#ede9fe' },
                  { icon:'🧠', title:'Memory Match', text:'Popular among students with focus and study-related concerns. Usage peaks during exam season.', color:'#38bdf8', bg:'#e0f5ff' },
                  { icon:'🎵', title:'Calm Music', text:'Most used during late-night hours (10 PM–2 AM), suggesting sleep-related usage patterns.', color:'#fb923c', bg:'#fff0e8' },
                ].map(ins => (
                  <div key={ins.title} style={{ borderRadius:16, padding:18, background:ins.bg }}>
                    <div style={{ fontSize:'1.5rem', marginBottom:8 }}>{ins.icon}</div>
                    <div style={{ fontSize:'0.88rem', fontWeight:700, color:ins.color, marginBottom:6 }}>{ins.title}</div>
                    <div style={{ fontSize:'0.78rem', color:'#6b8f7e', lineHeight:1.65 }}>{ins.text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign:'center', padding:24 }}>
              <button
                style={{ background:`linear-gradient(135deg,#fb923c,#ea580c)`, color:'white', border:'none', borderRadius:14, padding:'14px 32px', cursor:pdfLoading?'not-allowed':'pointer', fontSize:'0.95rem', fontWeight:700, fontFamily:'inherit', marginBottom:10, opacity:pdfLoading?0.7:1 }}
                onClick={downloadReport}
                disabled={pdfLoading}
              >
                {pdfLoading ? '⏳ Generating Report...' : '📥 Download Full Analytics Report'}
              </button>
              <div style={{ fontSize:'0.75rem', color:'#94a3b8' }}>
                Downloads as HTML · Open in browser → Ctrl+P → Save as PDF
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

const s = {
  page:       { display:'flex', minHeight:'100vh', background:'#f0f7f4', fontFamily:"'Plus Jakarta Sans',sans-serif", position:'relative', overflowX:'hidden' },
  blob1:      { position:'fixed', width:500, height:500, borderRadius:'50%', background:'#fed7aa', filter:'blur(80px)', opacity:0.25, top:-150, left:-100, zIndex:0, pointerEvents:'none' },
  blob2:      { position:'fixed', width:400, height:400, borderRadius:'50%', background:'#ddd6fe', filter:'blur(80px)', opacity:0.22, bottom:-100, right:-80, zIndex:0, pointerEvents:'none' },
  dots:       { position:'fixed', inset:0, zIndex:0, pointerEvents:'none', backgroundImage:'radial-gradient(circle, rgba(251,146,60,0.08) 1.5px, transparent 1.5px)', backgroundSize:'36px 36px' },
  toast:      { position:'fixed', bottom:32, left:'50%', transform:'translateX(-50%)', zIndex:999, background:'#1e3a2f', color:'white', padding:'12px 24px', borderRadius:20, fontSize:'0.88rem', fontFamily:"'Plus Jakarta Sans',sans-serif", boxShadow:'0 8px 32px rgba(0,0,0,0.2)', whiteSpace:'nowrap' },
  overlay:    { position:'fixed', inset:0, zIndex:200, background:'rgba(30,58,47,0.25)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 },
  modal:      { background:'white', borderRadius:28, padding:'40px 36px', width:'100%', maxWidth:460, position:'relative', boxShadow:'0 32px 80px rgba(0,0,0,0.12)' },
  modalClose: { position:'absolute', top:16, right:16, width:32, height:32, borderRadius:'50%', background:'#f0f7f4', border:'none', cursor:'pointer', color:'#6b8f7e', fontSize:'0.9rem' },
  modalTitle: { fontFamily:'Georgia,serif', fontSize:'1.5rem', fontWeight:700, color:'#1e3a2f', marginBottom:6 },
  modalSub:   { fontSize:'0.88rem', color:'#6b8f7e', marginBottom:14 },
  modalAlertBox: { background:'#fff0f4', border:'1px solid #fca5a5', borderRadius:10, padding:'10px 14px', fontSize:'0.82rem', color:'#f43f5e', marginBottom:20 },
  assignSuccess: { background:'#e8f7f1', border:'1px solid #b8e8d4', borderRadius:14, padding:20, textAlign:'center', fontSize:'1rem', fontWeight:700, color:'#4aba8e' },
  cOption:    { display:'flex', alignItems:'center', gap:12, padding:14, border:'1.5px solid', borderRadius:14, transition:'all 0.2s' },
  assignPickBtn: { background:'linear-gradient(135deg,#4aba8e,#2d9e6e)', color:'white', border:'none', borderRadius:10, padding:'7px 14px', cursor:'pointer', fontSize:'0.78rem', fontWeight:700, fontFamily:'inherit', flexShrink:0 },
  sidebar:    { position:'fixed', top:0, left:0, bottom:0, width:240, zIndex:10, background:'rgba(255,255,255,0.92)', backdropFilter:'blur(20px)', borderRight:'1px solid rgba(251,146,60,0.15)', display:'flex', flexDirection:'column', padding:'24px 16px', overflowY:'auto' },
  sidebarLogo:{ fontFamily:'Georgia,serif', fontSize:'1.4rem', fontWeight:900, color:'#fb923c', marginBottom:20, paddingLeft:8 },
  adminBox:   { background:'linear-gradient(135deg,#fff0e8,#fed7aa)', border:'1px solid rgba(251,146,60,0.25)', borderRadius:16, padding:16, marginBottom:20, textAlign:'center' },
  navBtn:     { display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 12px', borderRadius:12, border:'1.5px solid transparent', cursor:'pointer', fontSize:'0.85rem', fontFamily:'inherit', marginBottom:4, transition:'all 0.2s', textAlign:'left' },
  logoutBtn:  { width:'100%', background:'none', border:'1px solid rgba(251,146,60,0.25)', borderRadius:10, padding:10, cursor:'pointer', color:'#6b8f7e', fontSize:'0.82rem', fontFamily:'inherit' },
  main:       { marginLeft:240, flex:1, padding:'32px 36px', position:'relative', zIndex:1 },
  pageTitle:  { fontFamily:'Georgia,serif', fontSize:'1.8rem', fontWeight:700, color:'#1e3a2f', margin:0, marginBottom:6 },
  pageSub:    { fontSize:'0.88rem', color:'#6b8f7e', margin:'0 0 24px' },
  statsGrid:  { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 },
  statCard:   { background:'white', borderRadius:20, padding:20, boxShadow:'0 4px 16px rgba(0,0,0,0.05)', textAlign:'center' },
  statIcon:   { width:44, height:44, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', margin:'0 auto 10px' },
  statValue:  { fontFamily:'Georgia,serif', fontSize:'1.8rem', fontWeight:900 },
  statLabel:  { fontSize:'0.72rem', color:'#6b8f7e', marginTop:4 },
  card:       { background:'white', borderRadius:20, padding:24, boxShadow:'0 4px 16px rgba(0,0,0,0.05)', marginBottom:20 },
  cardTitle:  { fontSize:'1rem', fontWeight:700, color:'#1e3a2f', marginBottom:20 },
};