import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Resource Data
const RESOURCES = [
  // Games
  {
    id: 1, type: 'game', category: 'focus',
    title: 'Breathing Exercise',
    desc: 'A guided 4-7-8 breathing animation to calm your mind instantly.',
    icon: '🌬️', color: '#e8f7f1', accent: '#4aba8e',
    tags: ['anxiety', 'stress', 'calm'], duration: '5 min',
  },
  {
    id: 2, type: 'game', category: 'focus',
    title: 'Memory Match',
    desc: 'Flip cards to find matching pairs. Boosts focus and memory.',
    icon: '🧠', color: '#ede9fe', accent: '#a78bfa',
    tags: ['focus', 'fun', 'brain'], duration: '10 min',
  },
  {
    id: 3, type: 'game', category: 'stress',
    title: 'Bubble Pop',
    desc: 'Pop colorful bubbles to release stress. Simple and satisfying!',
    icon: '🫧', color: '#fce7f3', accent: '#ec4899',
    tags: ['stress', 'fun', 'relax'], duration: '5 min',
  },
  // Audio
  {
    id: 4, type: 'audio', category: 'calm',
    title: 'Deep Meditation',
    desc: 'A peaceful guided meditation to clear your mind and reduce anxiety.',
    icon: '🎵', color: '#fff0e8', accent: '#fb923c',
    tags: ['anxiety', 'calm', 'meditation'], duration: '10 min',
    audioFile: '/audios/Meditation.mpeg',
  },
  {
    id: 5, type: 'audio', category: 'calm',
    title: 'Nature Sounds',
    desc: 'Soothing rain and forest sounds to help you focus and relax.',
    icon: '🌿', color: '#e0f5ff', accent: '#38bdf8',
    tags: ['focus', 'relax', 'sleep'], duration: '30 min',
    audioFile: '/audios/Nature.mpeg',
  },
  {
    id: 6, type: 'audio', category: 'calm',
    title: 'Breathing Guide',
    desc: 'Audio guide for box breathing technique — perfect before exams.',
    icon: '🫁', color: '#fef9c3', accent: '#eab308',
    tags: ['anxiety', 'exam', 'calm'], duration: '7 min',
    audioFile: '/audios/Breathing.mpeg',
  },
  // Videos (YouTube)
  {
    id: 7, type: 'video', category: 'motivation',
    title: 'You Are Enough',
    desc: 'A powerful talk about self-worth that every student must watch.',
    icon: '▶️', color: '#e8f7f1', accent: '#4aba8e',
    tags: ['motivation', 'self-worth', 'depression'],
    duration: '8 min',
    videoUrl: 'https://youtu.be/1uY3MDx2n64?si=FZNS8-6awnAWGe-V',
    thumbnail: 'https://img.youtube.com/vi/eTBBHEFDLGk/hqdefault.jpg',
  },
  {
    id: 8, type: 'video', category: 'motivation',
    title: 'Managing Exam Stress',
    desc: 'Practical tips from a psychologist on handling exam pressure.',
    icon: '▶️', color: '#ede9fe', accent: '#a78bfa',
    tags: ['stress', 'exam', 'tips'],
    duration: '12 min',
    videoUrl: 'https://youtu.be/-RZ86OB9hw4?si=tsHmpYAU5uWRwtvK',
    thumbnail: 'https://img.youtube.com/vi/NRGSfZDJG38/hqdefault.jpg',
  },
  {
    id: 9, type: 'video', category: 'motivation',
    title: '5-Minute Meditation',
    desc: 'Quick guided meditation you can do anywhere, anytime.',
    icon: '▶️', color: '#fff0e8', accent: '#fb923c',
    tags: ['meditation', 'calm', 'quick'],
    duration: '5 min',
    videoUrl: 'https://youtu.be/ACYZXD3Ap1M?si=gBMeIe_VYmH9p2_p',
    thumbnail: 'https://img.youtube.com/vi/inpok4MKVLM/hqdefault.jpg',
  },
  {
    id: 10, type: 'video', category: 'motivation',
    title: 'How to Stop Worrying',
    desc: 'Science-backed strategies to reduce anxiety and overthinking.',
    icon: '▶️', color: '#e0f5ff', accent: '#38bdf8',
    tags: ['anxiety', 'worry', 'tips'],
    duration: '15 min',
    videoUrl: 'https://youtu.be/kPx2gaCUij0?si=DJwLULAu8z7qcUri',
    thumbnail: 'https://img.youtube.com/vi/QovzELRBPsE/hqdefault.jpg',
  },
];

const FILTERS = [
  { id: 'all',        label: 'All',        icon: '✨' },
  { id: 'game',       label: 'Games',      icon: '🎮' },
  { id: 'audio',      label: 'Audio',      icon: '🎵' },
  { id: 'video',      label: 'Videos',     icon: '▶️' },
];

const TAG_FILTERS = ['all','anxiety','stress','focus','motivation','calm','sleep','exam'];

export default function Resources() {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState('all');
  const [tagFilter,  setTagFilter]  = useState('all');
  const [activeAudio, setActiveAudio] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [modal, setModal] = useState(null);  // selected resource for detail view
  const audioRef = React.useRef(null);

  // Filter logic
  const filtered = RESOURCES.filter(r => {
    const typeMatch = typeFilter === 'all' || r.type === typeFilter;
    const tagMatch  = tagFilter  === 'all' || r.tags.includes(tagFilter);
    return typeMatch && tagMatch;
  });

  // Play / pause audio
  function toggleAudio(resource) {
    if (activeAudio?.id === resource.id) {
      if (audioPlaying) {
        audioRef.current?.pause();
        setAudioPlaying(false);
      } else {
        audioRef.current?.play();
        setAudioPlaying(true);
      }
    } else {
      setActiveAudio(resource);
      setAudioPlaying(true);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = resource.audioFile;
          audioRef.current.play().catch(() => {
            // Audio file not found — show friendly message
            setAudioPlaying(false);
          });
        }
      }, 100);
    }
  }

  // Open resource
  function openResource(resource) {
    if (resource.type === 'game') {
      if (resource.title === 'Breathing Exercise') navigate('/student/games/breathing');
      else if (resource.title === 'Memory Match')  navigate('/student/games/memory');
      else if (resource.title === 'Bubble Pop')    navigate('/student/games/bubble');
    } else if (resource.type === 'video') {
      window.open(resource.videoUrl, '_blank');
    } else if (resource.type === 'audio') {
      toggleAudio(resource);
    }
  }

  return (
    <div style={s.page}>
      <div style={s.blob1} /><div style={s.blob2} /><div style={s.dots} />

      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.sidebarLogo}>🌿 Altius</div>

        <div style={s.altiusBox}>
          <div style={s.altiusBoxLabel}>Browsing as</div>
          <div style={s.altiusBoxId}>ALTIUS-2025-047</div>
          <div style={s.altiusBoxSub}>Identity protected 🔒</div>
        </div>

        {/* Type Filter */}
        <div style={s.filterSection}>
          <div style={s.filterTitle}>Resource Type</div>
          {FILTERS.map(f => (
            <button
              key={f.id}
              style={{
                ...s.filterBtn,
                background:  typeFilter === f.id ? '#e8f7f1' : 'transparent',
                color:       typeFilter === f.id ? '#4aba8e' : '#6b8f7e',
                fontWeight:  typeFilter === f.id ? 700 : 400,
                borderColor: typeFilter === f.id ? '#b8e8d4' : 'transparent',
              }}
              onClick={() => setTypeFilter(f.id)}
            >
              <span>{f.icon}</span> {f.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={s.statsBox}>
          {[
            { num: RESOURCES.filter(r=>r.type==='game').length,  label: 'Games',  color: '#4aba8e' },
            { num: RESOURCES.filter(r=>r.type==='audio').length, label: 'Audios', color: '#fb923c' },
            { num: RESOURCES.filter(r=>r.type==='video').length, label: 'Videos', color: '#a78bfa' },
          ].map(stat => (
            <div key={stat.label} style={s.statItem}>
              <div style={{...s.statNum, color: stat.color}}>{stat.num}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={s.sidebarBottom}>
          <button style={s.backBtn} onClick={() => navigate('/student/dashboard')}>
            ← Dashboard
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={s.main}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>📚 Resource Library</h1>
            <p style={s.subtitle}>Curated wellness content just for you</p>
          </div>
          <div style={s.resourceCount}>
            {filtered.length} resource{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Tag Filter Pills */}
        <div style={s.tagRow}>
          {TAG_FILTERS.map(tag => (
            <button
              key={tag}
              style={{
                ...s.tagPill,
                background:  tagFilter === tag ? '#4aba8e' : 'white',
                color:       tagFilter === tag ? 'white'   : '#6b8f7e',
                borderColor: tagFilter === tag ? '#4aba8e' : 'rgba(74,186,142,0.25)',
                fontWeight:  tagFilter === tag ? 700 : 400,
              }}
              onClick={() => setTagFilter(tag)}
            >
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </button>
          ))}
        </div>

        {/* Resource Grid */}
        {filtered.length === 0 ? (
          <div style={s.emptyBox}>
            <div style={{fontSize:'3rem', marginBottom:12}}>🔍</div>
            <div style={{fontFamily:'Georgia,serif', fontSize:'1.1rem', fontWeight:700, color:'#1e3a2f', marginBottom:8}}>
              No resources found
            </div>
            <div style={{fontSize:'0.88rem', color:'#6b8f7e'}}>
              Try a different filter
            </div>
          </div>
        ) : (
          <div style={s.grid}>
            {filtered.map(resource => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                isActive={activeAudio?.id === resource.id}
                isPlaying={activeAudio?.id === resource.id && audioPlaying}
                onOpen={() => openResource(resource)}
              />
            ))}
          </div>
        )}

        {/* Now Playing Bar */}
        {activeAudio && (
          <div style={s.nowPlaying}>
            <div style={s.nowPlayingLeft}>
              <div style={s.nowPlayingIcon}>{activeAudio.icon}</div>
              <div>
                <div style={s.nowPlayingTitle}>{activeAudio.title}</div>
                <div style={s.nowPlayingLabel}>{audioPlaying ? '▶ Playing' : '⏸ Paused'}</div>
              </div>
            </div>
            <div style={s.nowPlayingControls}>
              <button
                style={s.playPauseBtn}
                onClick={() => toggleAudio(activeAudio)}
              >
                {audioPlaying ? '⏸' : '▶'}
              </button>
              <button
                style={s.stopBtn}
                onClick={() => {
                  audioRef.current?.pause();
                  setActiveAudio(null);
                  setAudioPlaying(false);
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          onEnded={() => setAudioPlaying(false)}
          onError={() => setAudioPlaying(false)}
        />
      </main>
    </div>
  );
}

// ── Resource Card Component
function ResourceCard({ resource, isActive, isPlaying, onOpen }) {
  const [hovered, setHovered] = useState(false);

  const typeLabel = resource.type === 'game'  ? '🎮 Game'
                  : resource.type === 'audio' ? '🎵 Audio'
                  : '▶️ Video';

  return (
    <div
      style={{
        ...cs.card,
        boxShadow: hovered
          ? `0 16px 48px ${resource.accent}33`
          : '0 4px 20px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
        border: isActive
          ? `2px solid ${resource.accent}`
          : '2px solid transparent',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top color band */}
      <div style={{ ...cs.topBand, background: resource.color }}>
        <div style={cs.bigIcon}>{resource.icon}</div>
        {resource.type === 'video' && resource.thumbnail && (
          <img
            src={resource.thumbnail}
            alt={resource.title}
            style={cs.thumbnail}
            onError={e => e.target.style.display = 'none'}
          />
        )}
        <div style={{...cs.typeBadge, background: 'white', color: resource.accent}}>
          {typeLabel}
        </div>
      </div>

      {/* Content */}
      <div style={cs.content}>
        <div style={cs.cardTitle}>{resource.title}</div>
        <div style={cs.cardDesc}>{resource.desc}</div>

        {/* Tags */}
        <div style={cs.tags}>
          {resource.tags.slice(0,2).map(tag => (
            <span key={tag} style={{...cs.tag, background: resource.color, color: resource.accent}}>
              {tag}
            </span>
          ))}
          <span style={cs.duration}>⏱ {resource.duration}</span>
        </div>

        {/* Action Button */}
        <button
          style={{
            ...cs.actionBtn,
            background: isPlaying
              ? '#fff0e8'
              : `linear-gradient(135deg, ${resource.accent}, ${resource.accent}dd)`,
            color: isPlaying ? resource.accent : 'white',
          }}
          onClick={onOpen}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          {resource.type === 'game'  ? '🎮 Play Now'
          : resource.type === 'video' ? '▶️ Watch Now'
          : isPlaying ? '⏸ Pause'
          : isActive  ? '▶ Resume'
          : '🎵 Play Audio'}
        </button>
      </div>
    </div>
  );
}

// ── Styles
const s = {
  page: {
    display: 'flex', minHeight: '100vh',
    background: '#f0f7f4',
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
    position: 'fixed', top: 0, left: 0, bottom: 0, width: 240,
    zIndex: 10,
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(74,186,142,0.15)',
    display: 'flex', flexDirection: 'column',
    padding: '24px 16px', overflowY: 'auto',
  },
  sidebarLogo: {
    fontFamily: 'Georgia, serif', fontSize: '1.4rem',
    fontWeight: 900, color: '#4aba8e',
    marginBottom: 20, paddingLeft: 8,
  },
  altiusBox: {
    background: 'linear-gradient(135deg, #e8f7f1, #d1fae5)',
    border: '1px solid rgba(74,186,142,0.25)',
    borderRadius: 14, padding: '12px 14px', marginBottom: 20,
  },
  altiusBoxLabel: { fontSize: '0.62rem', color: '#6b8f7e', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' },
  altiusBoxId: { fontSize: '0.95rem', fontWeight: 800, color: '#1e3a2f', marginTop: 3 },
  altiusBoxSub: { fontSize: '0.62rem', color: '#6b8f7e', marginTop: 2 },
  filterSection: { marginBottom: 20 },
  filterTitle: {
    fontSize: '0.68rem', fontWeight: 700, color: '#6b8f7e',
    letterSpacing: 1, textTransform: 'uppercase',
    marginBottom: 8, paddingLeft: 8,
  },
  filterBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    width: '100%', textAlign: 'left',
    padding: '9px 12px', borderRadius: 10,
    border: '1.5px solid transparent',
    cursor: 'pointer', fontSize: '0.85rem',
    fontFamily: 'inherit', marginBottom: 4, transition: 'all 0.2s',
  },
  statsBox: {
    display: 'flex', gap: 8, marginBottom: 20,
    background: '#f8fffe', border: '1px solid rgba(74,186,142,0.15)',
    borderRadius: 14, padding: '14px 10px',
  },
  statItem: { flex: 1, textAlign: 'center' },
  statNum: { fontFamily: 'Georgia, serif', fontSize: '1.3rem', fontWeight: 900 },
  statLabel: { fontSize: '0.65rem', color: '#6b8f7e', marginTop: 2 },
  sidebarBottom: { marginTop: 'auto' },
  backBtn: {
    width: '100%', background: 'none',
    border: '1px solid rgba(74,186,142,0.25)',
    borderRadius: 10, padding: 10, cursor: 'pointer',
    color: '#6b8f7e', fontSize: '0.82rem', fontFamily: 'inherit',
  },
  main: {
    marginLeft: 240, flex: 1,
    padding: '32px 36px',
    position: 'relative', zIndex: 1,
    paddingBottom: 100,
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 24,
  },
  title: {
    fontFamily: 'Georgia, serif', fontSize: '1.8rem',
    fontWeight: 700, color: '#1e3a2f', margin: 0, marginBottom: 6,
  },
  subtitle: { fontSize: '0.88rem', color: '#6b8f7e', margin: 0 },
  resourceCount: {
    background: 'white', border: '1px solid rgba(74,186,142,0.2)',
    borderRadius: 12, padding: '8px 16px',
    fontSize: '0.82rem', color: '#4aba8e', fontWeight: 700,
  },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 },
  tagPill: {
    border: '1.5px solid', borderRadius: 20,
    padding: '6px 16px', cursor: 'pointer',
    fontSize: '0.78rem', fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 20,
  },
  emptyBox: {
    textAlign: 'center', padding: '60px 40px',
    background: 'white', borderRadius: 24,
    border: '2px dashed rgba(74,186,142,0.3)',
  },
  nowPlaying: {
    position: 'fixed', bottom: 24, left: '50%',
    transform: 'translateX(-50%)',
    background: 'white',
    border: '1.5px solid rgba(74,186,142,0.25)',
    borderRadius: 20, padding: '14px 20px',
    display: 'flex', alignItems: 'center', gap: 16,
    boxShadow: '0 8px 32px rgba(74,186,142,0.15)',
    zIndex: 50, minWidth: 320,
  },
  nowPlayingLeft: { display: 'flex', alignItems: 'center', gap: 12, flex: 1 },
  nowPlayingIcon: { fontSize: '1.5rem' },
  nowPlayingTitle: { fontSize: '0.88rem', fontWeight: 700, color: '#1e3a2f' },
  nowPlayingLabel: { fontSize: '0.72rem', color: '#4aba8e', marginTop: 2 },
  nowPlayingControls: { display: 'flex', gap: 8 },
  playPauseBtn: {
    width: 36, height: 36, borderRadius: '50%',
    background: '#e8f7f1', border: '1.5px solid #b8e8d4',
    cursor: 'pointer', fontSize: '0.9rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  stopBtn: {
    width: 36, height: 36, borderRadius: '50%',
    background: '#fff0f4', border: '1.5px solid #fca5a5',
    cursor: 'pointer', fontSize: '0.85rem', color: '#f43f5e',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
};

const cs = {
  card: {
    background: 'white', borderRadius: 22,
    overflow: 'hidden', transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  topBand: {
    height: 120, position: 'relative',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  bigIcon: { fontSize: '3rem', zIndex: 1 },
  thumbnail: {
    position: 'absolute', inset: 0, width: '100%', height: '100%',
    objectFit: 'cover', opacity: 0.35,
  },
  typeBadge: {
    position: 'absolute', top: 10, right: 10,
    fontSize: '0.68rem', fontWeight: 700,
    padding: '4px 10px', borderRadius: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  content: { padding: '18px 20px 20px' },
  cardTitle: {
    fontFamily: 'Georgia, serif', fontSize: '1rem',
    fontWeight: 700, color: '#1e3a2f', marginBottom: 6,
  },
  cardDesc: {
    fontSize: '0.8rem', color: '#6b8f7e',
    lineHeight: 1.6, marginBottom: 12,
  },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14, alignItems: 'center' },
  tag: {
    fontSize: '0.65rem', fontWeight: 700,
    padding: '3px 8px', borderRadius: 20,
  },
  duration: { fontSize: '0.68rem', color: '#94a3b8', marginLeft: 'auto' },
  actionBtn: {
    width: '100%', padding: '11px',
    border: 'none', borderRadius: 12,
    fontSize: '0.82rem', fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'opacity 0.2s',
  },
};