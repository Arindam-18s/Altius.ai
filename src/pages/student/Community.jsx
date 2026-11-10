import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';
// ── Sample community posts (will come from Supabase later)
const INITIAL_POSTS = [
  {
    id: 1,
    altiusId: 'ALTIUS-2025-012',
    avatar: '🌸',
    time: '2 hours ago',
    category: 'anxiety',
    text: "Exams are in 3 days and I can't stop my hands from shaking. Has anyone else felt this way? How did you deal with it?",
    likes: 14,
    liked: false,
    comments: [
      { id: 1, altiusId: 'ALTIUS-2025-031', avatar: '🌿', text: 'Yes! Deep breathing helped me a lot. Try 4-7-8 breathing before you sleep tonight 💚', time: '1 hr ago' },
      { id: 2, altiusId: 'ALTIUS-2025-089', avatar: '🦋', text: "You're not alone. I felt the same before my boards. It gets better, I promise.", time: '45 min ago' },
    ],
    showComments: false,
  },
  {
    id: 2,
    altiusId: 'ALTIUS-2025-055',
    avatar: '⭐',
    time: '5 hours ago',
    category: 'motivation',
    text: "Just wanted to share a small win — I completed my full study schedule today without getting distracted! First time in weeks. If I can do it, you can too 💪",
    likes: 38,
    liked: false,
    comments: [
      { id: 1, altiusId: 'ALTIUS-2025-022', avatar: '🌻', text: "That's amazing!! Celebrate this win 🎉", time: '4 hr ago' },
    ],
    showComments: false,
  },
  {
    id: 3,
    altiusId: 'ALTIUS-2025-078',
    avatar: '🌻',
    time: '1 day ago',
    category: 'stress',
    text: "My parents keep comparing me to my cousin who got into IIT. I love my family but it's really hurting me. Does anyone else go through this kind of pressure at home?",
    likes: 52,
    liked: false,
    comments: [],
    showComments: false,
  },
  {
    id: 4,
    altiusId: 'ALTIUS-2025-034',
    avatar: '🎯',
    time: '1 day ago',
    category: 'tips',
    text: "Study tip that changed my life: the Pomodoro technique. 25 min study, 5 min break. My focus improved so much in just one week. Give it a try!",
    likes: 61,
    liked: false,
    comments: [
      { id: 1, altiusId: 'ALTIUS-2025-019', avatar: '🌸', text: 'Been using this for a month now, total game changer!', time: '20 hr ago' },
      { id: 2, altiusId: 'ALTIUS-2025-067', avatar: '⭐', text: "Combined it with the Altius breathing game before each session. Highly recommend.", time: '18 hr ago' },
    ],
    showComments: false,
  },
  {
    id: 5,
    altiusId: 'ALTIUS-2025-091',
    avatar: '🦋',
    time: '2 days ago',
    category: 'support',
    text: "I talked to the counselor here for the first time yesterday. I was really nervous but she was so kind and didn't judge me at all. If you've been thinking about it, please go. It really helped 💙",
    likes: 87,
    liked: false,
    comments: [
      { id: 1, altiusId: 'ALTIUS-2025-044', avatar: '🌿', text: 'Thank you for sharing this. I was scared to go but this gives me courage 🙏', time: '1 day ago' },
    ],
    showComments: false,
  },
];

const CATEGORIES = [
  { id: 'all',        label: 'All Posts',   icon: '✨', color: '#4aba8e' },
  { id: 'anxiety',    label: 'Anxiety',     icon: '💭', color: '#a78bfa' },
  { id: 'stress',     label: 'Stress',      icon: '😮‍💨', color: '#fb923c' },
  { id: 'motivation', label: 'Motivation',  icon: '💪', color: '#38bdf8' },
  { id: 'tips',       label: 'Study Tips',  icon: '📚', color: '#eab308' },
  { id: 'support',    label: 'Support',     icon: '💙', color: '#ec4899' },
];

const CATEGORY_COLORS = {
  anxiety:    { bg: '#ede9fe', color: '#a78bfa' },
  stress:     { bg: '#fff0e8', color: '#fb923c' },
  motivation: { bg: '#e0f5ff', color: '#38bdf8' },
  tips:       { bg: '#fef9c3', color: '#eab308' },
  support:    { bg: '#fce7f3', color: '#ec4899' },
};

export default function Community() {
  const navigate = useNavigate();
  const [posts,       setPosts]       = useState(INITIAL_POSTS);
  const [filter,      setFilter]      = useState('all');
  const [newPost,     setNewPost]     = useState('');
  const [newCategory, setNewCategory] = useState('anxiety');
  const [showForm,    setShowForm]    = useState(false);
  const [commentText, setCommentText] = useState({});

  const myAltiusId = 'ALTIUS-2025-047';
  const myAvatar = '🌿';

  // Filter posts
  const filtered = filter === 'all'
    ? posts
    : posts.filter(p => p.category === filter);

  // Toggle like
  function toggleLike(id) {
    setPosts(prev => prev.map(p =>
      p.id === id
        ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
        : p
    ));
  }

  // Toggle comments
  function toggleComments(id) {
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, showComments: !p.showComments } : p
    ));
  }

  // Add comment
  function addComment(postId) {
    const text = (commentText[postId] || '').trim();
    if (!text) return;
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? {
            ...p,
            comments: [...p.comments, {
              id: Date.now(),
              altiusId: myAltiusId,
              avatar: myAvatar,
              text,
              time: 'Just now',
            }],
            showComments: true,
          }
        : p
    ));
    setCommentText(prev => ({ ...prev, [postId]: '' }));
  }

  // Add new post
  function submitPost() {
    if (!newPost.trim()) return;
    const post = {
      id: Date.now(),
      altiusId: myAltiusId,
      avatar: myAvatar,
      time: 'Just now',
      category: newCategory,
      text: newPost.trim(),
      likes: 0,
      liked: false,
      comments: [],
      showComments: false,
    };
    setPosts(prev => [post, ...prev]);
    setNewPost('');
    setShowForm(false);
  }

  return (
    <div style={s.page}>
      <div style={s.blob1} /><div style={s.blob2} /><div style={s.dots} />

      {/* ── SIDEBAR */}
      <aside style={s.sidebar}>
        <div style={s.sidebarLogo}>🌿 Altius</div>

        <div style={s.altiusBox}>
          <div style={s.altiusBoxLabel}>Posting as</div>
          <div style={s.altiusBoxId}>{myAltiusId}</div>
          <div style={s.altiusBoxSub}>Your name is never shown 🔒</div>
        </div>

        {/* Category filter */}
        <div style={s.filterSection}>
          <div style={s.filterTitle}>Browse by Topic</div>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              style={{
                ...s.filterBtn,
                background:  filter === cat.id ? '#e8f7f1' : 'transparent',
                color:       filter === cat.id ? '#4aba8e' : '#6b8f7e',
                fontWeight:  filter === cat.id ? 700 : 400,
                borderColor: filter === cat.id ? '#b8e8d4' : 'transparent',
              }}
              onClick={() => setFilter(cat.id)}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* Community rules */}
        <div style={s.rulesBox}>
          <div style={s.rulesTitle}>Community Guidelines</div>
          {[
            '💚 Be kind and supportive',
            '🔒 Everyone is anonymous',
            '🚫 No bullying or hate',
            '🤝 Share, don\'t judge',
            '🆘 Crisis? Use chat or counselor',
          ].map((r, i) => (
            <div key={i} style={s.ruleItem}>{r}</div>
          ))}
        </div>

        <div style={s.sidebarBottom}>
          <button style={s.backBtn} onClick={() => navigate('/student/dashboard')}>
            ← Dashboard
          </button>
        </div>
      </aside>

      {/* ── MAIN */}
      <main style={s.main}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>👥 Peer Community</h1>
            <p style={s.subtitle}>
              A safe, anonymous space to share, support, and connect with fellow students
            </p>
          </div>
          <button
            style={s.newPostBtn}
            onClick={() => setShowForm(prev => !prev)}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {showForm ? '✕ Cancel' : '✏️ Share Something'}
          </button>
        </div>

        {/* New Post Form */}
        {showForm && (
          <div style={s.postForm}>
            <div style={s.postFormHeader}>
              <span style={s.postFormAvatar}>{myAvatar}</span>
              <div>
                <div style={s.postFormId}>{myAltiusId}</div>
                <div style={s.postFormSub}>Your post will be anonymous</div>
              </div>
            </div>

            <textarea
              style={s.textarea}
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              placeholder="Share what's on your mind. You're safe here 💚"
              rows={4}
              maxLength={500}
            />

            <div style={s.postFormFooter}>
              <div style={s.categoryPicker}>
                <span style={s.categoryPickerLabel}>Topic:</span>
                {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                  <button
                    key={cat.id}
                    style={{
                      ...s.catPickerBtn,
                      background:  newCategory === cat.id
                        ? (CATEGORY_COLORS[cat.id]?.bg || '#e8f7f1')
                        : 'white',
                      color: newCategory === cat.id
                        ? (CATEGORY_COLORS[cat.id]?.color || '#4aba8e')
                        : '#6b8f7e',
                      borderColor: newCategory === cat.id
                        ? (CATEGORY_COLORS[cat.id]?.color || '#4aba8e')
                        : 'rgba(74,186,142,0.2)',
                    }}
                    onClick={() => setNewCategory(cat.id)}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
              <div style={s.postFormActions}>
                <span style={s.charCount}>{newPost.length}/500</span>
                <button
                  style={{
                    ...s.submitBtn,
                    opacity: newPost.trim() ? 1 : 0.5,
                    cursor: newPost.trim() ? 'pointer' : 'not-allowed',
                  }}
                  onClick={submitPost}
                  disabled={!newPost.trim()}
                >
                  Post Anonymously →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts */}
        <div style={s.postsWrap}>
          {filtered.length === 0 ? (
            <div style={s.emptyBox}>
              <div style={{fontSize:'2.5rem', marginBottom:12}}>🌱</div>
              <div style={{fontFamily:'Georgia,serif', fontSize:'1.1rem', fontWeight:700, color:'#1e3a2f', marginBottom:8}}>
                No posts here yet
              </div>
              <div style={{fontSize:'0.88rem', color:'#6b8f7e'}}>
                Be the first to share something in this topic!
              </div>
            </div>
          ) : (
            filtered.map(post => {
              const catStyle = CATEGORY_COLORS[post.category] || { bg: '#e8f7f1', color: '#4aba8e' };
              return (
                <div key={post.id} style={s.postCard}>

                  {/* Post Header */}
                  <div style={s.postHeader}>
                    <div style={s.postAvatar}>{post.avatar}</div>
                    <div>
                      <div style={s.postAltiusId}>{post.altiusId}</div>
                      <div style={s.postTime}>{post.time}</div>
                    </div>
                    <div style={{
                      ...s.catBadge,
                      background: catStyle.bg,
                      color: catStyle.color,
                      marginLeft: 'auto',
                    }}>
                      {CATEGORIES.find(c => c.id === post.category)?.icon} {post.category}
                    </div>
                  </div>

                  {/* Post Text */}
                  <div style={s.postText}>{post.text}</div>

                  {/* Post Actions */}
                  <div style={s.postActions}>
                    <button
                      style={{
                        ...s.actionBtn,
                        color: post.liked ? '#f43f5e' : '#6b8f7e',
                        background: post.liked ? '#fff0f4' : 'transparent',
                      }}
                      onClick={() => toggleLike(post.id)}
                    >
                      {post.liked ? '❤️' : '🤍'} {post.likes}
                    </button>
                    <button
                      style={{
                        ...s.actionBtn,
                        color: post.showComments ? '#4aba8e' : '#6b8f7e',
                        background: post.showComments ? '#e8f7f1' : 'transparent',
                      }}
                      onClick={() => toggleComments(post.id)}
                    >
                      💬 {post.comments.length} {post.comments.length === 1 ? 'reply' : 'replies'}
                    </button>
                    <button style={{...s.actionBtn, color: '#6b8f7e'}}>
                      🤝 Support
                    </button>
                  </div>

                  {/* Comments */}
                  {post.showComments && (
                    <div style={s.commentsSection}>

                      {post.comments.map(c => (
                        <div key={c.id} style={s.comment}>
                          <div style={s.commentAvatar}>{c.avatar}</div>
                          <div style={s.commentBody}>
                            <div style={s.commentId}>{c.altiusId} · {c.time}</div>
                            <div style={s.commentText}>{c.text}</div>
                          </div>
                        </div>
                      ))}

                      {/* Add comment */}
                      <div style={s.addComment}>
                        <div style={s.commentAvatar}>{myAvatar}</div>
                        <div style={s.commentInputWrap}>
                          <input
                            style={s.commentInput}
                            value={commentText[post.id] || ''}
                            onChange={e => setCommentText(prev => ({
                              ...prev, [post.id]: e.target.value
                            }))}
                            onKeyDown={e => e.key === 'Enter' && addComment(post.id)}
                            placeholder="Write a supportive reply..."
                            maxLength={200}
                          />
                          <button
                            style={{
                              ...s.commentSendBtn,
                              opacity: (commentText[post.id] || '').trim() ? 1 : 0.4,
                            }}
                            onClick={() => addComment(post.id)}
                            disabled={!(commentText[post.id] || '').trim()}
                          >
                            ➤
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
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
  filterSection: { marginBottom: 16 },
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
    cursor: 'pointer', fontSize: '0.82rem',
    fontFamily: 'inherit', marginBottom: 3, transition: 'all 0.2s',
  },
  rulesBox: {
    background: '#f8fffe', border: '1px solid rgba(74,186,142,0.15)',
    borderRadius: 14, padding: '14px', marginBottom: 16,
  },
  rulesTitle: {
    fontSize: '0.68rem', fontWeight: 700, color: '#6b8f7e',
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10,
  },
  ruleItem: { fontSize: '0.75rem', color: '#6b8f7e', marginBottom: 6, lineHeight: 1.4 },
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
    maxWidth: 860,
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 24,
  },
  title: {
    fontFamily: 'Georgia, serif', fontSize: '1.8rem',
    fontWeight: 700, color: '#1e3a2f', margin: 0, marginBottom: 6,
  },
  subtitle: { fontSize: '0.88rem', color: '#6b8f7e', margin: 0, maxWidth: 420 },
  newPostBtn: {
    background: 'linear-gradient(135deg, #4aba8e, #2d9e6e)',
    color: 'white', border: 'none', borderRadius: 14,
    padding: '12px 22px', cursor: 'pointer',
    fontSize: '0.88rem', fontWeight: 700,
    fontFamily: 'inherit', whiteSpace: 'nowrap',
    transition: 'opacity 0.2s',
  },

  // Post form
  postForm: {
    background: 'white', borderRadius: 20,
    padding: '24px', marginBottom: 24,
    boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
    border: '1.5px solid rgba(74,186,142,0.2)',
  },
  postFormHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  postFormAvatar: {
    width: 40, height: 40, borderRadius: '50%',
    background: '#e8f7f1', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '1.2rem', border: '1.5px solid rgba(74,186,142,0.25)',
    flexShrink: 0,
  },
  postFormId: { fontSize: '0.88rem', fontWeight: 700, color: '#1e3a2f' },
  postFormSub: { fontSize: '0.72rem', color: '#6b8f7e', marginTop: 2 },
  textarea: {
    width: '100%', padding: '14px 16px',
    background: '#f8fffe',
    border: '1.5px solid rgba(74,186,142,0.2)',
    borderRadius: 14, fontFamily: 'inherit',
    fontSize: '0.92rem', color: '#1e3a2f',
    resize: 'none', outline: 'none',
    lineHeight: 1.65, boxSizing: 'border-box',
    marginBottom: 16,
  },
  postFormFooter: { display: 'flex', flexDirection: 'column', gap: 12 },
  categoryPicker: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  categoryPickerLabel: { fontSize: '0.78rem', color: '#6b8f7e', fontWeight: 600 },
  catPickerBtn: {
    border: '1.5px solid', borderRadius: 20,
    padding: '5px 12px', cursor: 'pointer',
    fontSize: '0.74rem', fontWeight: 600,
    fontFamily: 'inherit', transition: 'all 0.2s',
  },
  postFormActions: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 },
  charCount: { fontSize: '0.72rem', color: '#94a3b8' },
  submitBtn: {
    background: 'linear-gradient(135deg, #4aba8e, #2d9e6e)',
    color: 'white', border: 'none', borderRadius: 12,
    padding: '10px 22px', cursor: 'pointer',
    fontSize: '0.85rem', fontWeight: 700, fontFamily: 'inherit',
    transition: 'opacity 0.2s',
  },

  // Posts
  postsWrap: { display: 'flex', flexDirection: 'column', gap: 16 },
  postCard: {
    background: 'white', borderRadius: 20,
    padding: '24px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
    border: '1px solid rgba(74,186,142,0.08)',
  },
  postHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 },
  postAvatar: {
    width: 38, height: 38, borderRadius: '50%',
    background: '#f0f7f4',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.1rem', border: '1.5px solid rgba(74,186,142,0.2)',
    flexShrink: 0,
  },
  postAltiusId: { fontSize: '0.82rem', fontWeight: 700, color: '#1e3a2f' },
  postTime: { fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 },
  catBadge: {
    fontSize: '0.7rem', fontWeight: 700,
    padding: '4px 12px', borderRadius: 20,
    textTransform: 'capitalize',
  },
  postText: {
    fontSize: '0.95rem', color: '#1e3a2f',
    lineHeight: 1.75, marginBottom: 16,
  },
  postActions: { display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid #f0f7f4' },
  actionBtn: {
    border: 'none', borderRadius: 10,
    padding: '7px 14px', cursor: 'pointer',
    fontSize: '0.8rem', fontWeight: 600,
    fontFamily: 'inherit', transition: 'all 0.2s',
  },

  // Comments
  commentsSection: {
    marginTop: 16, paddingTop: 16,
    borderTop: '1px solid #f0f7f4',
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  comment: { display: 'flex', gap: 10, alignItems: 'flex-start' },
  commentAvatar: {
    width: 30, height: 30, borderRadius: '50%',
    background: '#f0f7f4',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.85rem', border: '1px solid rgba(74,186,142,0.2)',
    flexShrink: 0,
  },
  commentBody: {
    background: '#f8fffe', border: '1px solid rgba(74,186,142,0.12)',
    borderRadius: 12, padding: '10px 14px', flex: 1,
  },
  commentId: { fontSize: '0.68rem', color: '#94a3b8', marginBottom: 4 },
  commentText: { fontSize: '0.85rem', color: '#1e3a2f', lineHeight: 1.55 },
  addComment: { display: 'flex', gap: 10, alignItems: 'center' },
  commentInputWrap: {
    flex: 1, display: 'flex', gap: 8, alignItems: 'center',
    background: '#f8fffe',
    border: '1.5px solid rgba(74,186,142,0.2)',
    borderRadius: 12, padding: '6px 8px 6px 14px',
  },
  commentInput: {
    flex: 1, border: 'none', background: 'transparent',
    fontFamily: 'inherit', fontSize: '0.85rem',
    color: '#1e3a2f', outline: 'none',
  },
  commentSendBtn: {
    background: 'linear-gradient(135deg, #4aba8e, #2d9e6e)',
    color: 'white', border: 'none', borderRadius: 8,
    width: 30, height: 30, cursor: 'pointer',
    fontSize: '0.8rem', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    transition: 'opacity 0.2s', flexShrink: 0,
  },
  emptyBox: {
    textAlign: 'center', padding: '60px 40px',
    background: 'white', borderRadius: 24,
    border: '2px dashed rgba(74,186,142,0.3)',
  },
};