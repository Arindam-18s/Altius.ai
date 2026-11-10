import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';
const API = `${API_URL}/api`;

const TITLES = [
  'Clinical Psychologist',
  'Counseling Psychologist',
  'Student Wellness Advisor',
  'Mental Health Counselor',
  'School Counselor',
];

const AVATARS = ['👩‍⚕️', '🧑‍⚕️', '👨‍⚕️', '👩‍💼', '🧑‍💼', '👨‍💼'];

export default function CounselorLogin() {
  const navigate = useNavigate();
  const [mode,      setMode]      = useState('login');   // 'login' | 'register'
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');

  // Login fields
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');

  // Register fields
  const [name,      setName]      = useState('');
  const [regEmail,  setRegEmail]  = useState('');
  const [regPass,   setRegPass]   = useState('');
  const [regPass2,  setRegPass2]  = useState('');
  const [title,     setTitle]     = useState(TITLES[0]);
  const [avatar,    setAvatar]    = useState(AVATARS[0]);

  function resetErrors() {
    setError('');
    setSuccess('');
  }

  // ── LOGIN
  async function handleLogin() {
    if (!email || !password) { setError('Please enter email and password'); return; }
    setLoading(true); resetErrors();
    try {
      const res  = await fetch(`${API}/auth/counselor/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('altius_token',      data.token);
      localStorage.setItem('altius_role',       'counselor');
      localStorage.setItem('counselor_name',  data.counselor.name);
      localStorage.setItem('counselor_id',    data.counselor.id);
      localStorage.setItem('counselor_avatar',data.counselor.avatar || '🧑‍⚕️');
      localStorage.setItem('counselor_title', data.counselor.title  || 'Counselor');
      navigate('/counselor/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── REGISTER
  async function handleRegister() {
    if (!name || !regEmail || !regPass || !regPass2) { setError('Please fill all fields'); return; }
    if (regPass.length < 6)      { setError('Password must be at least 6 characters'); return; }
    if (regPass !== regPass2)    { setError('Passwords do not match'); return; }

    setLoading(true); resetErrors();
    try {
      const res  = await fetch(`${API}/auth/counselor/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:     name.trim(),
          email:    regEmail.trim().toLowerCase(),
          password: regPass,
          title,
          avatar,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      localStorage.setItem('altius_token',      data.token);
      localStorage.setItem('altius_role',       'counselor');
      localStorage.setItem('counselor_name',  data.counselor.name);
      localStorage.setItem('counselor_id',    data.counselor.id);
      localStorage.setItem('counselor_avatar',data.counselor.avatar || '🧑‍⚕️');
      localStorage.setItem('counselor_title', data.counselor.title  || 'Counselor');
      navigate('/counselor/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <div style={s.blob1} /><div style={s.blob2} /><div style={s.dots} />

      <div style={s.container}>

        {/* Logo */}
        <div style={s.logo}>
          <span style={{ fontSize: '2rem' }}>🌿</span>
          <span style={s.logoText}>Altius</span>
        </div>
        <div style={s.subtitle}>Counselor Portal</div>

        {/* Card */}
        <div style={s.card}>

          {/* Back to roles */}
          <button style={s.backBtn} onClick={() => navigate('/')}>← Back</button>

          <div style={s.cardIcon}>🧑‍⚕️</div>
          <div style={s.cardTitle}>{mode === 'login' ? 'Welcome Back' : 'Join as Counselor'}</div>
          <div style={s.cardSub}>
            {mode === 'login' ? 'Sign in to your counselor account' : 'Create your counselor account'}
          </div>

          {/* Toggle */}
          <div style={s.toggle}>
            <button
              style={{ ...s.toggleBtn, background: mode === 'login' ? '#a78bfa' : 'transparent', color: mode === 'login' ? 'white' : '#6b8f7e' }}
              onClick={() => { setMode('login'); resetErrors(); }}
            >
              Login
            </button>
            <button
              style={{ ...s.toggleBtn, background: mode === 'register' ? '#a78bfa' : 'transparent', color: mode === 'register' ? 'white' : '#6b8f7e' }}
              onClick={() => { setMode('register'); resetErrors(); }}
            >
              Register
            </button>
          </div>

          {/* ── LOGIN FORM */}
          {mode === 'login' && (
            <div style={s.fields}>
              <div style={s.fieldWrap}>
                <div style={s.label}>EMAIL</div>
                <input style={s.input} type="email" placeholder="yourname@altius.edu"
                  value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              <div style={s.fieldWrap}>
                <div style={s.label}>PASSWORD</div>
                <input style={s.input} type="password" placeholder="Enter your password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>

              {/* Demo credentials */}
              <div style={s.demoBox}>
                <div style={s.demoTitle}>🔑 Demo Credentials</div>
                {[
                  { name: 'Dr. Priya Sharma', email: 'priya@altius.edu' },
                  { name: 'Mr. Arjun Mehta',  email: 'arjun@altius.edu' },
                ].map(c => (
                  <button
                    key={c.email}
                    style={s.demoRow}
                    onClick={() => { setEmail(c.email); setPassword('counselor123'); }}
                  >
                    <span>{c.name}</span>
                    <span style={s.demoFill}>Fill →</span>
                  </button>
                ))}
                <div style={{ fontSize: '0.72rem', color: '#92400e', marginTop: 6 }}>
                  Password for all: <strong>counselor123</strong>
                </div>
              </div>

              {error   && <div style={s.errorBox}>⚠️ {error}</div>}
              {success && <div style={s.successBox}>✅ {success}</div>}

              <button
                style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}
                onClick={handleLogin} disabled={loading}
              >
                {loading ? '⏳ Logging in...' : 'Login →'}
              </button>
            </div>
          )}

          {/* ── REGISTER FORM */}
          {mode === 'register' && (
            <div style={s.fields}>

              {/* Avatar picker */}
              <div style={s.fieldWrap}>
                <div style={s.label}>CHOOSE YOUR AVATAR</div>
                <div style={s.avatarGrid}>
                  {AVATARS.map(av => (
                    <button
                      key={av}
                      style={{ ...s.avatarBtn, borderColor: avatar === av ? '#a78bfa' : 'rgba(167,139,250,0.2)', background: avatar === av ? '#ede9fe' : 'white' }}
                      onClick={() => setAvatar(av)}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div style={s.fieldWrap}>
                <div style={s.label}>FULL NAME</div>
                <input style={s.input} placeholder="e.g. Dr. Priya Sharma"
                  value={name} onChange={e => setName(e.target.value)} />
              </div>

              <div style={s.fieldWrap}>
                <div style={s.label}>TITLE / ROLE</div>
                <select style={s.input} value={title} onChange={e => setTitle(e.target.value)}>
                  {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div style={s.fieldWrap}>
                <div style={s.label}>EMAIL</div>
                <input style={s.input} type="email" placeholder="yourname@altius.edu"
                  value={regEmail} onChange={e => setRegEmail(e.target.value)} />
              </div>

              <div style={s.twoCol}>
                <div style={s.fieldWrap}>
                  <div style={s.label}>PASSWORD</div>
                  <input style={s.input} type="password" placeholder="Min 6 characters"
                    value={regPass} onChange={e => setRegPass(e.target.value)} />
                </div>
                <div style={s.fieldWrap}>
                  <div style={s.label}>CONFIRM</div>
                  <input style={s.input} type="password" placeholder="Repeat password"
                    value={regPass2} onChange={e => setRegPass2(e.target.value)} />
                </div>
              </div>

              {error   && <div style={s.errorBox}>⚠️ {error}</div>}
              {success && <div style={s.successBox}>✅ {success}</div>}

              <button
                style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}
                onClick={handleRegister} disabled={loading}
              >
                {loading ? '⏳ Creating account...' : 'Create Account →'}
              </button>
            </div>
          )}

        </div>

        <div style={s.footer}>
          🌿 Altius — VIT Pune &nbsp;·&nbsp; SIH 2025
        </div>
      </div>
    </div>
  );
}

const s = {
  page:      { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f3ff', fontFamily:"'Plus Jakarta Sans',sans-serif", position:'relative', overflowX:'hidden', padding:24 },
  blob1:     { position:'fixed', width:500, height:500, borderRadius:'50%', background:'#ddd6fe', filter:'blur(90px)', opacity:0.35, top:-150, left:-100, zIndex:0, pointerEvents:'none' },
  blob2:     { position:'fixed', width:400, height:400, borderRadius:'50%', background:'#c4b5fd', filter:'blur(80px)', opacity:0.2, bottom:-100, right:-80, zIndex:0, pointerEvents:'none' },
  dots:      { position:'fixed', inset:0, zIndex:0, pointerEvents:'none', backgroundImage:'radial-gradient(circle, rgba(167,139,250,0.1) 1.5px, transparent 1.5px)', backgroundSize:'36px 36px' },
  container: { position:'relative', zIndex:1, width:'100%', maxWidth:480, display:'flex', flexDirection:'column', alignItems:'center' },
  logo:      { display:'flex', alignItems:'center', gap:10, marginBottom:6 },
  logoText:  { fontFamily:'Georgia,serif', fontSize:'2rem', fontWeight:900, color:'#3b0764' },
  subtitle:  { fontSize:'0.88rem', color:'#7c3aed', fontWeight:600, marginBottom:28, letterSpacing:1, textTransform:'uppercase' },
  card:      { width:'100%', background:'white', borderRadius:28, padding:'36px 32px', boxShadow:'0 8px 40px rgba(139,92,246,0.12)', border:'1px solid rgba(167,139,250,0.2)', position:'relative' },
  backBtn:   { position:'absolute', top:20, left:20, background:'none', border:'none', color:'#7c3aed', fontSize:'0.85rem', cursor:'pointer', fontFamily:'inherit' },
  cardIcon:  { fontSize:'2.2rem', textAlign:'center', marginBottom:8 },
  cardTitle: { fontFamily:'Georgia,serif', fontSize:'1.5rem', fontWeight:700, color:'#3b0764', textAlign:'center', marginBottom:4 },
  cardSub:   { fontSize:'0.82rem', color:'#7c3aed', textAlign:'center', marginBottom:24 },
  toggle:    { display:'flex', background:'#f5f3ff', borderRadius:14, padding:4, marginBottom:24 },
  toggleBtn: { flex:1, padding:9, borderRadius:11, border:'none', cursor:'pointer', fontSize:'0.85rem', fontWeight:600, fontFamily:'inherit', transition:'all 0.2s' },
  fields:    { display:'flex', flexDirection:'column', gap:16 },
  fieldWrap: { display:'flex', flexDirection:'column', gap:6 },
  label:     { fontSize:'0.68rem', fontWeight:700, color:'#7c3aed', letterSpacing:1 },
  input:     { padding:'12px 16px', borderRadius:12, border:'1.5px solid rgba(167,139,250,0.3)', background:'#faf5ff', fontFamily:'inherit', fontSize:'0.92rem', color:'#3b0764', outline:'none' },
  twoCol:    { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 },
  avatarGrid:{ display:'flex', gap:8, flexWrap:'wrap' },
  avatarBtn: { width:44, height:44, borderRadius:12, border:'1.5px solid', cursor:'pointer', fontSize:'1.4rem', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' },
  demoBox:   { background:'#fffbeb', border:'1px solid rgba(234,179,8,0.3)', borderRadius:12, padding:'12px 14px' },
  demoTitle: { fontSize:'0.68rem', fontWeight:700, color:'#92400e', letterSpacing:1, textTransform:'uppercase', marginBottom:8 },
  demoRow:   { display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', background:'none', border:'none', cursor:'pointer', padding:'6px 0', fontSize:'0.82rem', color:'#78350f', fontFamily:'inherit', borderBottom:'1px solid rgba(234,179,8,0.15)' },
  demoFill:  { fontSize:'0.72rem', color:'#a78bfa', fontWeight:700 },
  errorBox:  { background:'#fff0f4', border:'1px solid #fca5a5', borderRadius:10, padding:'10px 14px', fontSize:'0.82rem', color:'#f43f5e' },
  successBox:{ background:'#e8f7f1', border:'1px solid #b8e8d4', borderRadius:10, padding:'10px 14px', fontSize:'0.82rem', color:'#4aba8e' },
  submitBtn: { width:'100%', padding:14, background:'linear-gradient(135deg,#a78bfa,#7c3aed)', color:'white', border:'none', borderRadius:14, fontSize:'0.95rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit', marginTop:4 },
  footer:    { fontSize:'0.72rem', color:'#94a3b8', marginTop:20, textAlign:'center' },
};