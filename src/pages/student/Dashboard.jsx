import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('home');

  // ── Load student data from localStorage
  const altiusId = localStorage.getItem('altius_id') || 'ALTIUS-2025-047';
  const assessKey = `assessment_${altiusId}`;
  const savedAssessment = (() => {
    try { return JSON.parse(localStorage.getItem(assessKey) || 'null'); } catch { return null; }
  })();

  const student = {
    altiusId,
    assessmentDone: !!savedAssessment,
    depression: savedAssessment ? savedAssessment.phq9Label : null,
    anxiety:    savedAssessment ? savedAssessment.gad7Label : null,
    streak: 0,
    phq9:    savedAssessment ? savedAssessment.phq9Score : null,
    gad7:    savedAssessment ? savedAssessment.gad7Score : null,
    takenAt: savedAssessment ? savedAssessment.takenAt   : null,
  };

  const navItems = [
    { id: 'home',      icon: '🏠', label: 'Home'         },
    { id: 'assess',    icon: '📋', label: 'Assessment'   },
    { id: 'mood',      icon: '📈', label: 'Mood Tracker' },
    { id: 'resources', icon: '📚', label: 'Resources'    },
    { id: 'chat',      icon: '🦚', label: 'Altius AI'    },
    { id: 'community', icon: '👥', label: 'Community'    },
    { id: 'counselor', icon: '🧑‍⚕️', label: 'Counselor'    },
  ];

  // ✅ FIXED: Added path to each resource
  const resources = [
    { icon: '🎮', label: 'Breathing Game',   color: '#e8f7f1', accent: '#4aba8e', tag: 'Game',  path: '/student/games/breathing' },
    { icon: '🧠', label: 'Memory Match',     color: '#ede9fe', accent: '#a78bfa', tag: 'Game',  path: '/student/games/memory'    },
    { icon: '🎵', label: 'Calm Music',       color: '#fff0e8', accent: '#fb923c', tag: 'Audio', path: '/student/resources'       },
    { icon: '🌿', label: 'Meditation',       color: '#e0f5ff', accent: '#38bdf8', tag: 'Audio', path: '/student/resources'       },
    { icon: '▶️', label: 'Motivation Video', color: '#fef9c3', accent: '#eab308', tag: 'Video', path: '/student/resources'       },
    { icon: '🫧', label: 'Bubble Pop',       color: '#fce7f3', accent: '#ec4899', tag: 'Game',  path: '/student/games/bubble'    },
  ];

  const tips = [
    '💧 Drink a glass of water right now.',
    '🌬️ Take 3 deep breaths before your next task.',
    '📵 Put your phone down for 10 minutes.',
    '🚶 A short walk can reset your mind completely.',
    '✍️ Write down one thing you are grateful for today.',
  ];

  const todayTip = tips[new Date().getDay() % tips.length];

  return (
    <div style={s.page}>

      {/* Background blobs */}
      <div style={s.blob1} />
      <div style={s.blob2} />
      <div style={s.blob3} />
      <div style={s.dots} />

      {/* ── SIDEBAR ── */}
      <aside style={s.sidebar}>
        <div style={s.sidebarLogo}>🦚 Altius</div>

        <div style={s.altiusIdBox}>
          <div style={s.altiusIdLabel}>Your Anonymous ID</div>
          <div style={s.altiusId}>{student.altiusId}</div>
          <div style={s.altiusIdSub}>Your identity is fully protected</div>
        </div>

        <nav style={s.sideNav}>
          {navItems.map(item => (
            <div
              key={item.id}
              style={{
                ...s.navItem,
                background: activeNav === item.id ? '#e8f7f1' : 'transparent',
                color:      activeNav === item.id ? '#4aba8e' : '#6b8f7e',
                fontWeight: activeNav === item.id ? 700 : 400,
              }}
              onClick={() => {
                setActiveNav(item.id);
                if (item.id === 'assess')    navigate('/student/assessment');
                if (item.id === 'mood')      navigate('/student/mood');
                if (item.id === 'resources') navigate('/student/resources');
                if (item.id === 'chat')      navigate('/student/chat');
                if (item.id === 'community') navigate('/student/community');
                if (item.id === 'counselor') navigate('/student/counselor');
              }}
            >
              <span style={s.navIcon}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        <div style={s.sidebarBottom}>
          <div style={s.streakBox}>
            <span style={s.streakFire}>🔥</span>
            <div>
              <div style={s.streakNum}>{student.streak} day streak</div>
              <div style={s.streakSub}>Keep it going!</div>
            </div>
          </div>
          <button style={s.logoutBtn} onClick={() => navigate('/')}>
            ← Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={s.main}>

        {/* Top Bar */}
        <div style={s.topBar}>
          <div>
            <div style={s.greeting}>Good {getTimeOfDay()}, Champion 👋</div>
            <div style={s.greetingSub}>How are you feeling today?</div>
          </div>
          <div style={s.moodRow}>
            {['😔','😐','🙂','😊','🤩'].map((emoji, i) => (
              <button key={i} style={s.moodBtn}
                title={['Sad','Okay','Good','Happy','Amazing'][i]}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* ── ASSESSMENT NOT DONE → Show prompt ── */}
        {!student.assessmentDone && (
          <div style={s.noAssessBox}>
            <div style={s.noAssessIcon}>📋</div>
            <div style={s.noAssessTitle}>
              You haven't taken your assessment yet
            </div>
            <div style={s.noAssessSub}>
              Take the PHQ-9 + GAD-7 assessment to unlock your personalized
              wellness report, resource library, and AI recommendations.
            </div>
            <button
              style={s.noAssessBtn}
              onClick={() => navigate('/student/assessment')}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Take Assessment Now →
            </button>
          </div>
        )}

        {/* ── ASSESSMENT DONE → Show scores ── */}
        {student.assessmentDone && (
          <>
            {(student.anxiety === 'Moderate' || student.depression === 'Moderate' ||
              student.anxiety === 'Severe'   || student.depression === 'Severe') && (
              <div style={s.alertBanner}>
                <span>💜</span>
                <span>
                  Your recent assessment suggests you might benefit from talking
                  to a counselor. <strong>You're not alone.</strong>
                </span>
                <button style={s.alertBtn} onClick={() => navigate('/student/counselor')}>
                  Connect Now
                </button>
              </div>
            )}
            <div style={s.statsRow}>
              <div style={{...s.statCard, borderTop: '3px solid #4aba8e'}}>
                <div style={s.statIcon}>🧠</div>
                <div style={s.statValue}>{student.phq9}/27</div>
                <div style={s.statLabel}>Depression Score</div>
                <div style={{...s.statBadge, background: '#e8f7f1', color: '#4aba8e'}}>
                  {student.depression}
                </div>
              </div>
              <div style={{...s.statCard, borderTop: '3px solid #a78bfa'}}>
                <div style={s.statIcon}>💭</div>
                <div style={s.statValue}>{student.gad7}/21</div>
                <div style={s.statLabel}>Anxiety Score</div>
                <div style={{...s.statBadge, background: '#ede9fe', color: '#a78bfa'}}>
                  {student.anxiety}
                </div>
              </div>
              <div style={{...s.statCard, borderTop: '3px solid #fb923c'}}>
                <div style={s.statIcon}>🔥</div>
                <div style={s.statValue}>{student.streak}</div>
                <div style={s.statLabel}>Day Streak</div>
                <div style={{...s.statBadge, background: '#fff0e8', color: '#fb923c'}}>
                  Active
                </div>
              </div>
              <div style={{...s.statCard, borderTop: '3px solid #38bdf8'}}>
                <div style={s.statIcon}>🎯</div>
                <div style={s.statValue}>3/5</div>
                <div style={s.statLabel}>Tasks Done</div>
                <div style={{...s.statBadge, background: '#e0f5ff', color: '#38bdf8'}}>
                  Today
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── TWO COLUMN GRID ── */}
        <div style={s.grid2}>

          {/* Daily Tip */}
          <div style={s.tipCard}>
            <div style={s.tipHeader}>
              <span style={s.tipIcon}>✨</span>
              <span style={s.tipTitle}>Daily Wellness Tip</span>
            </div>
            <div style={s.tipText}>{todayTip}</div>
            <div style={s.tipFooter}>Refresh tomorrow for a new tip 🌱</div>
          </div>

          {/* Quick Actions */}
          <div style={s.quickCard}>
            <div style={s.sectionTitle}>Quick Actions</div>
            <div style={s.quickGrid}>
              {[
                { icon: '📋', label: 'Take Assessment', color: '#4aba8e', bg: '#e8f7f1', path: '/student/assessment' },
                { icon: '🤖', label: 'Chat with Altius',  color: '#a78bfa', bg: '#ede9fe', path: '/student/chat'       },
                { icon: '👥', label: 'Peer Community',  color: '#fb923c', bg: '#fff0e8', path: '/student/community'  },
                { icon: '🧑‍⚕️', label: 'See Counselor', color: '#38bdf8', bg: '#e0f5ff', path: '/student/counselor' },
              ].map(q => (
                <div
                  key={q.label}
                  style={{...s.quickBtn, background: q.bg}}
                  onClick={() => navigate(q.path)}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{fontSize: '1.6rem'}}>{q.icon}</div>
                  <div style={{fontSize: '0.78rem', color: q.color, fontWeight: 600, marginTop: 6}}>
                    {q.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RESOURCE LIBRARY ── */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <div style={s.sectionTitle}>📚 Your Resource Library</div>
            {/* ✅ FIXED: See All now navigates to resources page */}
            <button
              style={s.seeAllBtn}
              onClick={() => navigate('/student/resources')}
            >
              See All →
            </button>
          </div>
          <div style={s.resourceGrid}>
            {resources.map(r => (
              <div
                key={r.label}
                style={{...s.resourceCard, background: r.color}}
                // ✅ FIXED: Each card now navigates to its correct page
                onClick={() => navigate(r.path)}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = `0 12px 32px ${r.accent}44`;
                  e.currentTarget.style.cursor = 'pointer';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={s.resourceIcon}>{r.icon}</div>
                <div style={s.resourceLabel}>{r.label}</div>
                <div style={{...s.resourceTag, color: r.accent, background: 'white'}}>
                  {r.tag}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── WEEKLY PROGRESS ── */}
        <div style={s.progressCard}>
          <div style={s.sectionTitle}>🎯 Weekly Wellness Progress</div>
          <div style={s.progressSub}>Complete activities to improve your score</div>
          {[
            { label: 'Mood Check-ins', value: student.assessmentDone ? 71 : 0, color: '#4aba8e' },
            { label: 'Resources Used', value: student.assessmentDone ? 45 : 0, color: '#a78bfa' },
            { label: 'Chat Sessions',  value: student.assessmentDone ? 60 : 0, color: '#fb923c' },
          ].map(p => (
            <div key={p.label} style={s.progressRow}>
              <div style={s.progressLabel}>{p.label}</div>
              <div style={s.progressTrack}>
                <div style={{
                  ...s.progressFill,
                  width: p.value + '%',
                  background: p.color,
                }} />
              </div>
              <div style={{...s.progressPct, color: p.color}}>
                {p.value === 0 ? '—' : p.value + '%'}
              </div>
            </div>
          ))}
          {!student.assessmentDone && (
            <div style={s.progressNote}>
              Complete your assessment to start tracking progress 🌱
            </div>
          )}
        </div>

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
    display: 'flex', minHeight: '100vh',
    background: '#f0f7f4',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    position: 'relative', overflowX: 'hidden',
  },
  blob1: {
    position: 'fixed', width: 500, height: 500, borderRadius: '50%',
    background: '#b8f0dc', filter: 'blur(80px)', opacity: 0.3,
    top: -150, left: -100, zIndex: 0, pointerEvents: 'none',
  },
  blob2: {
    position: 'fixed', width: 400, height: 400, borderRadius: '50%',
    background: '#ddd6fe', filter: 'blur(80px)', opacity: 0.25,
    bottom: -100, right: -80, zIndex: 0, pointerEvents: 'none',
  },
  blob3: {
    position: 'fixed', width: 300, height: 300, borderRadius: '50%',
    background: '#fed7aa', filter: 'blur(80px)', opacity: 0.25,
    top: '50%', right: '30%', zIndex: 0, pointerEvents: 'none',
  },
  dots: {
    position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
    backgroundImage: 'radial-gradient(circle, rgba(74,186,142,0.12) 1.5px, transparent 1.5px)',
    backgroundSize: '36px 36px',
  },
  sidebar: {
    position: 'fixed', top: 0, left: 0, bottom: 0, width: 240,
    zIndex: 10,
    background: 'rgba(255,255,255,0.88)',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(74,186,142,0.15)',
    display: 'flex', flexDirection: 'column',
    padding: '28px 16px',
  },
  sidebarLogo: {
    fontFamily: 'Georgia, serif', fontSize: '1.5rem',
    fontWeight: 900, color: '#4aba8e',
    marginBottom: 24, paddingLeft: 12,
  },
  altiusIdBox: {
    background: 'linear-gradient(135deg, #e8f7f1, #d1fae5)',
    border: '1px solid rgba(74,186,142,0.25)',
    borderRadius: 16, padding: '14px 16px', marginBottom: 24,
  },
  altiusIdLabel: {
    fontSize: '0.62rem', color: '#6b8f7e', fontWeight: 700,
    letterSpacing: 1, textTransform: 'uppercase',
  },
  altiusId: { fontSize: '1.05rem', fontWeight: 800, color: '#1e3a2f', marginTop: 4 },
  altiusIdSub: { fontSize: '0.65rem', color: '#6b8f7e', marginTop: 3 },
  sideNav: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '11px 14px', borderRadius: 12,
    cursor: 'pointer', fontSize: '0.88rem', transition: 'all 0.2s',
  },
  navIcon: { fontSize: '1.1rem' },
  sidebarBottom: { marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 },
  streakBox: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: '#fff0e8', borderRadius: 14, padding: '12px 14px',
  },
  streakFire: { fontSize: '1.4rem' },
  streakNum: { fontSize: '0.85rem', fontWeight: 700, color: '#fb923c' },
  streakSub: { fontSize: '0.7rem', color: '#9a7060' },
  logoutBtn: {
    background: 'none', border: '1px solid rgba(74,186,142,0.25)',
    borderRadius: 10, padding: 10, cursor: 'pointer',
    color: '#6b8f7e', fontSize: '0.82rem', fontFamily: 'inherit',
  },
  main: {
    marginLeft: 240, flex: 1,
    padding: '32px 36px',
    position: 'relative', zIndex: 1,
  },
  topBar: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24,
  },
  greeting: {
    fontFamily: 'Georgia, serif', fontSize: '1.6rem',
    fontWeight: 700, color: '#1e3a2f',
  },
  greetingSub: { fontSize: '0.88rem', color: '#6b8f7e', marginTop: 4 },
  moodRow: { display: 'flex', gap: 8 },
  moodBtn: {
    fontSize: '1.5rem', background: 'white',
    border: '1.5px solid rgba(74,186,142,0.2)',
    borderRadius: 12, width: 44, height: 44,
    cursor: 'pointer', transition: 'transform 0.2s',
  },
  noAssessBox: {
    background: 'white', borderRadius: 24,
    padding: '48px 40px', textAlign: 'center',
    marginBottom: 24,
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    border: '2px dashed rgba(74,186,142,0.35)',
  },
  noAssessIcon: { fontSize: '3.5rem', marginBottom: 16 },
  noAssessTitle: {
    fontFamily: 'Georgia, serif', fontSize: '1.3rem',
    fontWeight: 700, color: '#1e3a2f', marginBottom: 12,
  },
  noAssessSub: {
    fontSize: '0.9rem', color: '#6b8f7e',
    maxWidth: 440, margin: '0 auto 28px', lineHeight: 1.75,
  },
  noAssessBtn: {
    background: 'linear-gradient(135deg, #4aba8e, #2d9e6e)',
    color: 'white', border: 'none', borderRadius: 14,
    padding: '14px 36px', fontSize: '0.95rem',
    fontWeight: 700, cursor: 'pointer',
    fontFamily: 'inherit', transition: 'opacity 0.2s',
  },
  alertBanner: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
    border: '1px solid rgba(167,139,250,0.3)',
    borderRadius: 16, padding: '14px 20px', marginBottom: 24,
    fontSize: '0.88rem', color: '#4c1d95',
  },
  alertBtn: {
    marginLeft: 'auto', background: '#a78bfa', color: 'white',
    border: 'none', borderRadius: 10, padding: '8px 16px',
    cursor: 'pointer', fontSize: '0.8rem',
    fontWeight: 600, fontFamily: 'inherit', whiteSpace: 'nowrap',
  },
  statsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16, marginBottom: 24,
  },
  statCard: {
    background: 'white', borderRadius: 20,
    padding: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
  },
  statIcon: { fontSize: '1.4rem', marginBottom: 8 },
  statValue: {
    fontFamily: 'Georgia, serif', fontSize: '1.6rem',
    fontWeight: 900, color: '#1e3a2f',
  },
  statLabel: { fontSize: '0.75rem', color: '#6b8f7e', marginTop: 2, marginBottom: 8 },
  statBadge: {
    display: 'inline-block', fontSize: '0.7rem',
    fontWeight: 700, padding: '3px 10px', borderRadius: 20,
  },
  grid2: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: 20, marginBottom: 24,
  },
  tipCard: {
    background: 'linear-gradient(135deg, #e8f7f1, #d1fae5)',
    border: '1px solid rgba(74,186,142,0.2)',
    borderRadius: 20, padding: 24,
  },
  tipHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 },
  tipIcon: { fontSize: '1.2rem' },
  tipTitle: { fontSize: '0.85rem', fontWeight: 700, color: '#1e3a2f' },
  tipText: { fontSize: '1rem', color: '#1e3a2f', lineHeight: 1.7, fontWeight: 500, marginBottom: 12 },
  tipFooter: { fontSize: '0.75rem', color: '#6b8f7e' },
  quickCard: {
    background: 'white', borderRadius: 20,
    padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
  },
  quickGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 },
  quickBtn: {
    borderRadius: 16, padding: '18px 12px',
    textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s',
  },
  section: { marginBottom: 24 },
  sectionHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  sectionTitle: { fontSize: '1rem', fontWeight: 700, color: '#1e3a2f' },
  seeAllBtn: {
    background: '#e8f7f1', border: 'none', color: '#4aba8e',
    borderRadius: 10, padding: '6px 14px', cursor: 'pointer',
    fontSize: '0.8rem', fontWeight: 600, fontFamily: 'inherit',
  },
  resourceGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 },
  resourceCard: {
    borderRadius: 18, padding: '20px 12px',
    textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s',
  },
  resourceIcon: { fontSize: '1.8rem', marginBottom: 8 },
  resourceLabel: { fontSize: '0.75rem', fontWeight: 600, color: '#1e3a2f', marginBottom: 8 },
  resourceTag: {
    fontSize: '0.65rem', fontWeight: 700,
    padding: '3px 8px', borderRadius: 20, display: 'inline-block',
  },
  progressCard: {
    background: 'white', borderRadius: 20, padding: 24,
    boxShadow: '0 4px 16px rgba(0,0,0,0.05)', marginBottom: 32,
  },
  progressSub: { fontSize: '0.8rem', color: '#6b8f7e', marginBottom: 20, marginTop: 4 },
  progressRow: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 },
  progressLabel: { fontSize: '0.82rem', color: '#1e3a2f', width: 140, flexShrink: 0 },
  progressTrack: { flex: 1, height: 8, background: '#f0f7f4', borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 10, transition: 'width 1s ease' },
  progressPct: { fontSize: '0.8rem', fontWeight: 700, width: 36, textAlign: 'right' },
  progressNote: {
    fontSize: '0.82rem', color: '#6b8f7e',
    textAlign: 'center', marginTop: 8, fontStyle: 'italic',
  },
};