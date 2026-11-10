import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { API_URL } from '../config';
const API = `${API_URL}/api`;

export default function Login() {
  const navigate = useNavigate();
  const [screen,     setScreen]     = useState('roles');
  const [mode,       setMode]       = useState('login');
  const [altiusId,     setAltiusId]     = useState('');
  const [password,   setPassword]   = useState('');
  const [email,      setEmail]      = useState('');
  const [cPassword,  setCPassword]  = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [registered, setRegistered] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  function reset() {
    setError(''); setAltiusId(''); setPassword('');
    setEmail(''); setCPassword(''); setRegistered(null); setMode('login');
  }

  async function handleStudentRegister() {
    if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API}/auth/student/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setRegistered(data);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  async function handleStudentLogin() {
    if (!altiusId || !password) { setError('Please enter your Unique ALTIUS ID and password'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API}/auth/student/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ altius_id: altiusId.trim().toUpperCase(), password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('altius_token', data.token);
      localStorage.setItem('altius_id',    data.altius_id);
      localStorage.setItem('altius_role',  'student');
      navigate('/student/dashboard');
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  async function handleAdminLogin() {
    if (!email || !cPassword) { setError('Please enter email and password'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API}/auth/admin/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password: cPassword }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('altius_token', data.token);
      localStorage.setItem('altius_role',  'admin');
      navigate('/admin/dashboard');
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  return (
    <div style={s.page}>
      {/* Background layers */}
      <div style={s.bgGradient} />
      <div style={s.blob1} /><div style={s.blob2} /><div style={s.blob3} /><div style={s.blob4} />
      <div style={s.dots} />

      {/* Decorative circles */}
      <div style={s.circle1} />
      <div style={s.circle2} />
      <div style={s.circle3} />

      <div style={s.container}>

        {/* ── LOGO */}
        <div style={s.logoWrap}>
          <div style={s.logoIconWrap}>
            <span style={{ fontSize: '1.8rem' }}>🦚</span>
          </div>
          <div>
            <div style={s.logoText}>Altius</div>
            <div style={s.logoSub}>A Platform for the new</div>
            <div style={s.logoSub}> Age of Wellness</div>
          </div>
        </div>

        {/* ══ ROLES SCREEN ══ */}
        {screen === 'roles' && (
          <div style={s.rolesWrap}>
            <div style={s.heroSection}>
              <div style={s.heroBadge}></div>
              <h1 style={s.heroTitle}>Welcome to Altius.ai</h1>
              <p style={s.heroDesc}>
                Your safe, anonymous space for mental wellness support.
                Choose your role to get started.
              </p>
            </div>

            <div style={s.rolesGrid}>
              {[
                {
                  id: 'student',
                  icon: '🎓',
                  label: 'Professionals and Students',
                  desc: 'Anonymous wellness support',
                  detail: 'Chat with AI · Take assessments · Book counselor sessions',
                  gradient: 'linear-gradient(135deg, #4aba8e, #2d9e6e)',
                  lightBg: 'linear-gradient(135deg, #e8f7f1, #d1fae5)',
                  accent: '#4aba8e',
                  onClick: () => { reset(); setScreen('student'); },
                },
                {
                  id: 'counselor',
                  icon: '🧑‍⚕️',
                  label: 'Counselor',
                  desc: 'Manage your Professionals and Students',
                  detail: 'View Users progress · Chat · Schedule sessions',
                  gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
                  lightBg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
                  accent: '#a78bfa',
                  onClick: () => navigate('/counselor/login'),
                },
                {
                  id: 'admin',
                  icon: '📊',
                  label: 'Admin',
                  desc: 'Institution analytics',
                  detail: 'Campus insights · Alerts · Reports · Counselor management',
                  gradient: 'linear-gradient(135deg, #fb923c, #ea580c)',
                  lightBg: 'linear-gradient(135deg, #fff0e8, #fed7aa)',
                  accent: '#fb923c',
                  onClick: () => { reset(); setScreen('admin'); },
                },
              ].map(role => (
                <div
                  key={role.id}
                  style={{
                    ...s.roleCard,
                    transform: hoveredCard === role.id ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
                    boxShadow: hoveredCard === role.id
                      ? `0 20px 60px ${role.accent}30`
                      : '0 4px 24px rgba(0,0,0,0.06)',
                    borderColor: hoveredCard === role.id ? `${role.accent}40` : 'rgba(255,255,255,0.8)',
                  }}
                  onClick={role.onClick}
                  onMouseEnter={() => setHoveredCard(role.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Left accent bar */}
                  <div style={{ ...s.roleAccentBar, background: role.gradient }} />

                  {/* Icon */}
                  <div style={{ ...s.roleIconCircle, background: role.lightBg }}>
                    <span style={{ fontSize: '1.8rem' }}>{role.icon}</span>
                  </div>

                  {/* Text */}
                  <div style={s.roleText}>
                    <div style={s.roleName}>{role.label}</div>
                    <div style={s.roleDesc}>{role.desc}</div>
                    <div style={s.roleDetail}>{role.detail}</div>
                  </div>

                  {/* Arrow */}
                  <div style={{
                    ...s.roleArrowWrap,
                    background: hoveredCard === role.id ? role.gradient : role.lightBg,
                    transform: hoveredCard === role.id ? 'scale(1.1)' : 'scale(1)',
                  }}>
                    <span style={{ color: hoveredCard === role.id ? 'white' : role.accent, fontWeight: 800, fontSize: '1rem' }}>→</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats bar */}
            <div style={s.statsBar}>
              {[
                { icon: '🌆', label: 'Corporate Wellness', value: '1,200+' },
                { icon: '🧑‍⚕️', label: 'Counselors', value: '3' },
                { icon: '🤖', label: 'AI Support', value: '24/7' },
                { icon: '🔒', label: 'Anonymous', value: '100%' },
              ].map(stat => (
                <div key={stat.label} style={s.statItem}>
                  <span style={{ fontSize: '1.1rem' }}>{stat.icon}</span>
                  <span style={s.statValue}>{stat.value}</span>
                  <span style={s.statLabel}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ STUDENT SCREEN ══ */}
        {screen === 'student' && (
          <div style={s.formCard}>
            <button style={s.backBtn} onClick={() => { setScreen('roles'); reset(); }}>← Back</button>
            <div style={s.formHeader}>
              <div style={{ ...s.formHeaderIcon, background: 'linear-gradient(135deg,#4aba8e,#2d9e6e)' }}>🎓</div>
              <div style={s.formTitle}>Students and Corporate Portal</div>
              <div style={s.formSub}>Your identity is always protected 🔒</div>
            </div>

            {!registered && (
              <div style={s.toggle}>
                <button style={{ ...s.toggleBtn, background: mode==='login'?'linear-gradient(135deg,#4aba8e,#2d9e6e)':'transparent', color: mode==='login'?'white':'#6b8f7e', boxShadow: mode==='login'?'0 4px 12px rgba(74,186,142,0.3)':'none' }}
                  onClick={() => { setMode('login'); setError(''); }}>Login</button>
                <button style={{ ...s.toggleBtn, background: mode==='register'?'linear-gradient(135deg,#4aba8e,#2d9e6e)':'transparent', color: mode==='register'?'white':'#6b8f7e', boxShadow: mode==='register'?'0 4px 12px rgba(74,186,142,0.3)':'none' }}
                  onClick={() => { setMode('register'); setError(''); }}>New User</button>
              </div>
            )}

            {registered && (
              <div style={s.successWrap}>
                <div style={s.successGlow} />
                <div style={{ fontSize:'3rem', marginBottom:12 }}>🎉</div>
                <div style={s.successTitle}>Welcome to Altius.ai!</div>
                <div style={s.successSub}>Your anonymous ALTIUS ID has been created</div>
                <div style={s.altiusIdCard}>
                  <div style={s.altiusIdLabel}>YOUR ALTIUS ID</div>
                  <div style={s.altiusIdValue}>{registered.altius_id}</div>
                  <div style={s.altiusIdNote}>⚠️ Save this ID — you'll need it to login</div>
                </div>
                <button style={s.submitBtn} onClick={() => {
                  localStorage.setItem('altius_token', registered.token);
                  localStorage.setItem('altius_id',    registered.altius_id);
                  localStorage.setItem('altius_role',  'student');
                  navigate('/student/dashboard');
                }}>Enter Altius id →</button>
              </div>
            )}

            {!registered && mode === 'login' && (
              <div style={s.formFields}>
                <div style={s.fieldWrap}>
                  <div style={s.fieldLabel}>ALTIUS ID</div>
                  <div style={s.inputWrap}>
                    <span style={s.inputIcon}>🪪</span>
                    <input style={s.input} placeholder="e.g. ALTIUS-2026-1234"
                      value={altiusId} onChange={e => setAltiusId(e.target.value)}
                      onKeyDown={e => e.key==='Enter' && handleStudentLogin()} />
                  </div>
                </div>
                <div style={s.fieldWrap}>
                  <div style={s.fieldLabel}>PASSWORD</div>
                  <div style={s.inputWrap}>
                    <span style={s.inputIcon}>🔑</span>
                    <input style={s.input} type="password" placeholder="Enter your password"
                      value={password} onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key==='Enter' && handleStudentLogin()} />
                  </div>
                </div>
                {error && <div style={s.errorBox}>⚠️ {error}</div>}
                <button style={{ ...s.submitBtn, opacity: loading?0.7:1 }} onClick={handleStudentLogin} disabled={loading}>
                  {loading ? '⏳ Logging in...' : 'Login →'}
                </button>
              </div>
            )}

            {!registered && mode === 'register' && (
              <div style={s.formFields}>
                <div style={s.registerNote}>
                  <span style={{ fontSize:'1.2rem' }}>🦚</span>
                  <div>No name or email needed. We'll generate a unique anonymous Altius ID just for you.</div>
                </div>
                <div style={s.fieldWrap}>
                  <div style={s.fieldLabel}>CREATE PASSWORD</div>
                  <div style={s.inputWrap}>
                    <span style={s.inputIcon}>🔑</span>
                    <input style={s.input} type="password" placeholder="Min 6 characters"
                      value={password} onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key==='Enter' && handleStudentRegister()} />
                  </div>
                </div>
                {error && <div style={s.errorBox}>⚠️ {error}</div>}
                <button style={{ ...s.submitBtn, opacity: loading?0.7:1 }} onClick={handleStudentRegister} disabled={loading}>
                  {loading ? '⏳ Creating account...' : '✨ Get My ALTIUS ID →'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ ADMIN SCREEN ══ */}
        {screen === 'admin' && (
          <div style={s.formCard}>
            <button style={s.backBtn} onClick={() => { setScreen('roles'); reset(); }}>← Back</button>
            <div style={s.formHeader}>
              <div style={{ ...s.formHeaderIcon, background: 'linear-gradient(135deg,#fb923c,#ea580c)' }}>📊</div>
              <div style={s.formTitle}>Admin Portal</div>
              <div style={s.formSub}>Authorized personnel only</div>
            </div>
            <div style={s.formFields}>
              <div style={s.fieldWrap}>
                <div style={s.fieldLabel}>ADMIN EMAIL</div>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>📧</span>
                  <input style={s.input} type="email" placeholder="admin@altius.edu"
                    value={email} onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && handleAdminLogin()} />
                </div>
              </div>
              <div style={s.fieldWrap}>
                <div style={s.fieldLabel}>PASSWORD</div>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>🔑</span>
                  <input style={s.input} type="password" placeholder="Enter admin password"
                    value={cPassword} onChange={e => setCPassword(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && handleAdminLogin()} />
                </div>
              </div>
              <div style={s.demoHint}>
                <div style={s.demoHintTitle}>🔑 Demo Credentials</div>
                <div style={s.demoHintRow}>📧 admin@altius.edu &nbsp;·&nbsp; 🔑 admin123</div>
              </div>
              {error && <div style={s.errorBox}>⚠️ {error}</div>}
              <button style={{ ...s.submitBtn, background:'linear-gradient(135deg,#fb923c,#ea580c)', boxShadow:'0 8px 24px rgba(251,146,60,0.35)', opacity: loading?0.7:1 }}
                onClick={handleAdminLogin} disabled={loading}>
                {loading ? '⏳ Logging in...' : 'Login →'}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={s.footer}>
          <span>🔒 All App data is anonymous</span>
          <span style={s.footerDot}>·</span>
          <span>🦚 Altius — Techno India University MCA ESD Project 26-27</span>
        </div>

      </div>

      <style>{`
        @keyframes float1 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(5deg)} }
        @keyframes float2 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-14px) rotate(-4deg)} }
        @keyframes float3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

const s = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Plus Jakarta Sans',sans-serif", position:'relative', overflowX:'hidden', padding:'24px', background:'#f0f7f4' },
  bgGradient: { position:'fixed', inset:0, background:'radial-gradient(ellipse at 20% 20%, #506ab0 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, #530046 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, #f0f6f7 0%, transparent 100%)', zIndex:0 },
  blob1: { position:'fixed', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, #b8f0dc, transparent)', opacity:0.5, top:-200, left:-150, zIndex:0, pointerEvents:'none', animation:'float1 8s ease-in-out infinite' },
  blob2: { position:'fixed', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, #ddd6fe, transparent)', opacity:0.4, bottom:-150, right:-100, zIndex:0, pointerEvents:'none', animation:'float2 10s ease-in-out infinite' },
  blob3: { position:'fixed', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle, #fed7aa, transparent)', opacity:0.3, top:'40%', right:'10%', zIndex:0, pointerEvents:'none', animation:'float3 7s ease-in-out infinite' },
  blob4: { position:'fixed', width:250, height:250, borderRadius:'50%', background:'radial-gradient(circle, #a7f3d0, transparent)', opacity:0.4, bottom:'20%', left:'5%', zIndex:0, pointerEvents:'none', animation:'float1 9s ease-in-out infinite reverse' },
  dots:  { position:'fixed', inset:0, zIndex:0, pointerEvents:'none', backgroundImage:'radial-gradient(circle, rgba(74,186,142,0.12) 1.5px, transparent 1.5px)', backgroundSize:'32px 32px' },
  circle1: { position:'fixed', width:120, height:120, borderRadius:'50%', border:'1.5px solid rgba(74,186,142,0.15)', top:'15%', right:'8%', zIndex:0, pointerEvents:'none' },
  circle2: { position:'fixed', width:80, height:80, borderRadius:'50%', border:'1.5px solid rgba(167,139,250,0.15)', bottom:'25%', left:'6%', zIndex:0, pointerEvents:'none' },
  circle3: { position:'fixed', width:200, height:200, borderRadius:'50%', border:'1px solid rgba(74,186,142,0.08)', top:'55%', right:'15%', zIndex:0, pointerEvents:'none' },
  container: { position:'relative', zIndex:1, width:'100%', maxWidth:540, display:'flex', flexDirection:'column', alignItems:'center', animation:'fadeIn 0.6s ease' },

  // Logo
  logoWrap:    { display:'flex', alignItems:'center', gap:14, marginBottom:32 },
  logoIconWrap:{ width:56, height:56, borderRadius:18, background:'linear-gradient(135deg, #1948ae, #7dd3fc)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 24px rgba(188, 22, 22, 0.35)' },
  logoText:    { fontFamily:'Georgia,serif', fontSize:'2rem', fontWeight:900, color:'#1e3a2f', lineHeight:1.1 },
  logoSub:     { fontSize:'0.72rem', color:'#737878', fontWeight:600, letterSpacing:0.5 },

  // Hero
  rolesWrap:   { width:'100%' },
  heroSection: { textAlign:'center', marginBottom:28 },
  heroBadge:   { display:'inline-block', background:'linear-gradient(135deg,#e8f7f1,#d1fae5)', border:'1px solid rgba(74,186,142,0.3)', borderRadius:20, padding:'5px 16px', fontSize:'0.72rem', fontWeight:700, color:'#2d9e6e', marginBottom:12, letterSpacing:0.5 },
  heroTitle:   { fontFamily:'Georgia,serif', fontSize:'2rem', fontWeight:900, color:'#1e3a2f', margin:'0 0 10px', lineHeight:1.2 },
  heroDesc:    { fontSize:'0.88rem', color:'#3f5349', lineHeight:1.7, maxWidth:380, margin:'0 auto' },

  // Role cards
  rolesGrid:   { display:'flex', flexDirection:'column', gap:14, marginBottom:24 },
  roleCard:    { background:'rgba(247, 113, 247, 0.14)', backdropFilter:'blur(20px)', borderRadius:22, padding:'20px 22px', display:'flex', alignItems:'center', gap:16, cursor:'pointer', border:'1.5px solid rgba(255, 255, 255, 0.8)', transition:'all 0.3s cubic-bezier(0.34,1.56,0.64,1)', position:'relative', overflow:'hidden' },
  roleAccentBar: { position:'absolute', left:0, top:0, bottom:0, width:4, borderRadius:'22px 0 0 22px' },
  roleIconCircle:{ width:58, height:58, borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  roleText:    { flex:1 },
  roleName:    { fontFamily:'Georgia,serif', fontSize:'1.05rem', fontWeight:800, color:'#1e3a2f', marginBottom:3 },
  roleDesc:    { fontSize:'0.78rem', color:'#4b7860', fontWeight:600, marginBottom:4 },
  roleDetail:  { fontSize:'0.68rem', color:'#94a3b8' },
  roleArrowWrap:{ width:38, height:38, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.3s' },

  // Stats bar
  statsBar:    { display:'flex', justifyContent:'space-around', background:'rgba(255,255,255,0.7)', backdropFilter:'blur(20px)', borderRadius:18, padding:'16px 20px', border:'1px solid rgba(74,186,142,0.15)', marginBottom:4 },
  statItem:    { display:'flex', flexDirection:'column', alignItems:'center', gap:3 },
  statValue:   { fontFamily:'Georgia,serif', fontSize:'1rem', fontWeight:900, color:'#1e3a2f' },
  statLabel:   { fontSize:'0.65rem', color:'#6b8f7e', fontWeight:600 },

  // Form card
  formCard:    { width:'100%', background:'rgba(255,255,255,0.9)', backdropFilter:'blur(24px)', borderRadius:28, padding:'40px 36px', boxShadow:'0 20px 60px rgba(0,0,0,0.08)', border:'1.5px solid rgba(255,255,255,0.8)', position:'relative' },
  backBtn:     { position:'absolute', top:20, left:20, background:'#f0f7f4', border:'none', color:'#6b8f7e', fontSize:'0.82rem', cursor:'pointer', fontFamily:'inherit', padding:'6px 12px', borderRadius:10 },
  formHeader:  { textAlign:'center', marginBottom:24 },
  formHeaderIcon:{ width:64, height:64, borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', margin:'0 auto 12px', boxShadow:'0 8px 24px rgba(0,0,0,0.15)' },
  formTitle:   { fontFamily:'Georgia,serif', fontSize:'1.5rem', fontWeight:800, color:'#1e3a2f', marginBottom:4 },
  formSub:     { fontSize:'0.82rem', color:'#6b8f7e' },

  // Toggle
  toggle:      { display:'flex', background:'#f0f7f4', borderRadius:14, padding:4, marginBottom:24 },
  toggleBtn:   { flex:1, padding:'10px', borderRadius:11, border:'none', cursor:'pointer', fontSize:'0.85rem', fontWeight:700, fontFamily:'inherit', transition:'all 0.3s' },

  // Fields
  formFields:  { display:'flex', flexDirection:'column', gap:16 },
  fieldWrap:   { display:'flex', flexDirection:'column', gap:6 },
  fieldLabel:  { fontSize:'0.68rem', fontWeight:700, color:'#6b8f7e', letterSpacing:1 },
  inputWrap:   { display:'flex', alignItems:'center', background:'#f0f7f4', borderRadius:14, border:'1.5px solid rgba(74,186,142,0.2)', overflow:'hidden', transition:'border-color 0.2s' },
  inputIcon:   { padding:'0 12px', fontSize:'1rem', flexShrink:0 },
  input:       { flex:1, padding:'13px 14px 13px 0', background:'transparent', border:'none', fontFamily:'inherit', fontSize:'0.92rem', color:'#1e3a2f', outline:'none' },

  // Register note
  registerNote:{ display:'flex', alignItems:'flex-start', gap:12, background:'linear-gradient(135deg,#e8f7f1,#d1fae5)', borderRadius:14, padding:'14px 16px', fontSize:'0.82rem', color:'#2d7a5f', lineHeight:1.6, border:'1px solid rgba(74,186,142,0.2)' },

  // Error
  errorBox:    { background:'#fff0f4', border:'1px solid #fca5a5', borderRadius:12, padding:'11px 14px', fontSize:'0.82rem', color:'#f43f5e' },

  // Submit
  submitBtn:   { width:'100%', padding:'15px', background:'linear-gradient(135deg,#4aba8e,#2d9e6e)', color:'white', border:'none', borderRadius:14, fontSize:'0.95rem', fontWeight:800, cursor:'pointer', fontFamily:'inherit', marginTop:4, boxShadow:'0 8px 24px rgba(74,186,142,0.35)', letterSpacing:0.3 },

  // Success
  successWrap: { textAlign:'center', position:'relative' },
  successGlow: { position:'absolute', width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle,rgba(74,186,142,0.15),transparent)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' },
  successTitle:{ fontFamily:'Georgia,serif', fontSize:'1.5rem', fontWeight:800, color:'#1e3a2f', marginBottom:6 },
  successSub:  { fontSize:'0.85rem', color:'#6b8f7e', marginBottom:24 },
  altiusIdCard:  { background:'linear-gradient(135deg,#e8f7f1,#d1fae5)', border:'2px solid rgba(74,186,142,0.3)', borderRadius:20, padding:'24px', marginBottom:24, position:'relative', overflow:'hidden' },
  altiusIdLabel: { fontSize:'0.65rem', fontWeight:700, color:'#6b8f7e', letterSpacing:1.5, textTransform:'uppercase', marginBottom:8 },
  altiusIdValue: { fontFamily:'Georgia,serif', fontSize:'1.4rem', wordBreak:'break-all', fontWeight:900, color:'#1e3a2f', marginBottom:10, letterSpacing:1 },
  altiusIdNote:  { fontSize:'0.75rem', color:'#fb923c', fontWeight:700 },

  // Demo hint
  demoHint:    { background:'linear-gradient(135deg,#fffbeb,#fef3c7)', border:'1px solid rgba(234,179,8,0.25)', borderRadius:14, padding:'14px 16px' },
  demoHintTitle:{ fontSize:'0.72rem', fontWeight:700, color:'#92400e', letterSpacing:1, textTransform:'uppercase', marginBottom:8 },
  demoHintRow: { fontSize:'0.82rem', color:'#78350f' },

  // Footer
  footer:      { display:'flex', alignItems:'center', gap:10, fontSize:'0.72rem', color:'#012960', marginTop:20 },
  footerDot:   { color:'#cbd5e1' },
};