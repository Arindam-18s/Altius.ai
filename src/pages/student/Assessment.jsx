import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';
import { authFetch } from '../../api';


// ── PHQ-9 Questions (Depression)
const PHQ9 = [
  'Little interest or pleasure in doing things?',
  'Feeling down, depressed, or hopeless?',
  'Trouble falling or staying asleep, or sleeping too much?',
  'Feeling tired or having little energy?',
  'Poor appetite or overeating?',
  'Feeling bad about yourself — or that you are a failure or have let yourself or your family down?',
  'Trouble concentrating on things, such as reading or studying?',
  'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless?',
  'Thoughts that you would be better off dead, or of hurting yourself in some way?',
];

// ── GAD-7 Questions (Anxiety)
const GAD7 = [
  'Feeling nervous, anxious, or on edge?',
  'Not being able to stop or control worrying?',
  'Worrying too much about different things?',
  'Trouble relaxing?',
  'Being so restless that it is hard to sit still?',
  'Becoming easily annoyed or irritable?',
  'Feeling afraid, as if something awful might happen?',
];

const OPTIONS = [
  { label: 'Not at all',       value: 0, color: '#4aba8e', bg: '#e8f7f1' },
  { label: 'Several days',     value: 1, color: '#38bdf8', bg: '#e0f5ff' },
  { label: 'More than half',   value: 2, color: '#fb923c', bg: '#fff0e8' },
  { label: 'Nearly every day', value: 3, color: '#f43f5e', bg: '#fff0f4' },
];

export default function Assessment() {
  const navigate = useNavigate();
  const [step, setStep]         = useState('intro');   // intro | phq9 | gad7 | result | saved
  const [phq9Ans, setPhq9Ans]   = useState(Array(9).fill(null));
  const [gad7Ans, setGad7Ans]   = useState(Array(7).fill(null));
  const [current, setCurrent]   = useState(0);         // current question index
  const [section, setSection]   = useState('phq9');    // phq9 | gad7
  const [animDir, setAnimDir]   = useState('right');
  const [savedResult, setSavedResult] = useState(null);

  // ── On load: check if assessment already taken
  useEffect(() => {
    const altiusId = localStorage.getItem('altius_id');
    const key    = altiusId ? `assessment_${altiusId}` : 'assessment_result';
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setSavedResult(JSON.parse(stored));
        setStep('saved');
      } catch (e) {}
    }
  }, []);

  const questions = section === 'phq9' ? PHQ9 : GAD7;
  const answers   = section === 'phq9' ? phq9Ans : gad7Ans;
  const setAns    = section === 'phq9' ? setPhq9Ans : setGad7Ans;

  const totalQ    = PHQ9.length + GAD7.length;
  const doneQ     = phq9Ans.filter(a => a !== null).length + gad7Ans.filter(a => a !== null).length;
  const progress  = Math.round((doneQ / totalQ) * 100);

  // ── Scoring
  const phq9Score = phq9Ans.reduce((a, b) => a + (b ?? 0), 0);
  const gad7Score = gad7Ans.reduce((a, b) => a + (b ?? 0), 0);

  function getLevel(score, type) {
    if (type === 'phq9') {
      if (score <= 4)  return { label: 'Minimal',  color: '#4aba8e', bg: '#e8f7f1' };
      if (score <= 9)  return { label: 'Mild',     color: '#38bdf8', bg: '#e0f5ff' };
      if (score <= 14) return { label: 'Moderate', color: '#fb923c', bg: '#fff0e8' };
      return            { label: 'Severe',   color: '#f43f5e', bg: '#fff0f4' };
    } else {
      if (score <= 4)  return { label: 'Minimal',  color: '#4aba8e', bg: '#e8f7f1' };
      if (score <= 9)  return { label: 'Mild',     color: '#38bdf8', bg: '#e0f5ff' };
      if (score <= 14) return { label: 'Moderate', color: '#fb923c', bg: '#fff0e8' };
      return            { label: 'Severe',   color: '#f43f5e', bg: '#fff0f4' };
    }
  }

  const depLevel = getLevel(phq9Score, 'phq9');
  const anxLevel = getLevel(gad7Score, 'gad7');

  // ── Select answer
  function selectAnswer(val) {
    const updated = [...answers];
    updated[current] = val;
    setAns(updated);
  }

  // ── Next question
  function goNext() {
    if (answers[current] === null) return;
    setAnimDir('right');

    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else if (section === 'phq9') {
      // Move to GAD-7
      setSection('gad7');
      setCurrent(0);
      setStep('gad7');
    } else {
      // Done — save result and show
      setStep('result');
    }
  }

  // ── Previous question
  function goBack() {
    setAnimDir('left');
    if (current > 0) {
      setCurrent(current - 1);
    } else if (section === 'gad7') {
      setSection('phq9');
      setCurrent(PHQ9.length - 1);
      setStep('phq9');
    }
  }

  // ── Save result to localStorage whenever step becomes result
  useEffect(() => {
    if (step === 'result') {
      const altiusId = localStorage.getItem('altius_id');
      const key    = altiusId ? `assessment_${altiusId}` : 'assessment_result';
      const result = {
        phq9Score, gad7Score,
        phq9Label: getLevel(phq9Score, 'phq9').label,
        gad7Label: getLevel(gad7Score, 'gad7').label,
        takenAt:   new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' }),
      };
      localStorage.setItem(key, JSON.stringify(result));
      setSavedResult(result);

      // Also save to backend
      if (altiusId) {
       authFetch(`${API_URL}/api/assessment/save`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            altius_id:    altiusId,
            phq9_score: phq9Score,
            gad7_score: gad7Score,
            phq9_answers: phq9Ans,
            gad7_answers: gad7Ans,
          }),
        }).catch(console.error);
      }
    }
  // eslint-disable-next-line
  }, [step]);

  // ── Recommendations based on scores
  function getRecommendations() {
    const recs = [];
    if (phq9Score >= 10 || gad7Score >= 10) {
      recs.push({ icon: '🧑‍⚕️', text: 'Talk to a counselor — professional support is available for you', urgent: true });
    }
    if (gad7Score >= 5) {
      recs.push({ icon: '🌬️', text: 'Try our Breathing Game to calm your mind', urgent: false });
      recs.push({ icon: '🎵', text: 'Listen to our Calm Music playlist', urgent: false });
    }
    if (phq9Score >= 5) {
      recs.push({ icon: '▶️', text: 'Watch motivational videos in your resource library', urgent: false });
      recs.push({ icon: '👥', text: 'Connect with your peer community — you are not alone', urgent: false });
    }
    recs.push({ icon: '🧠', text: 'Play the Memory Match game to boost focus', urgent: false });
    recs.push({ icon: '🤖', text: 'Chat with Altius AI whenever you need to talk', urgent: false });
    return recs;
  }

  // ──────────────────────────────────────────
  // ── SAVED RESULT SCREEN — shown if assessment already taken
  if (step === 'saved' && savedResult) {
    const phqLvl = getLevel(savedResult.phq9Score, 'phq9');
    const gadLvl = getLevel(savedResult.gad7Score, 'gad7');
    return (
      <div style={s.page}>
        <div style={s.blob1} /><div style={s.blob2} /><div style={s.dots} />
        <aside style={s.sidebar}>
          <div style={s.sidebarLogo}>🌿 Altius</div>
          <div style={s.sidebarBottom}>
            <button style={s.backBtn} onClick={() => navigate('/student/dashboard')}>← Dashboard</button>
          </div>
        </aside>
        <main style={s.main}>
          <div style={s.savedWrap}>
            <div style={s.savedCard}>
              <div style={{ fontSize:'2.5rem', marginBottom:12 }}>📋</div>
              <div style={s.savedTitle}>Your Assessment Results</div>
              <div style={s.savedDate}>Last taken: {savedResult.takenAt}</div>

              <div style={s.savedScores}>
                {/* PHQ-9 */}
                <div style={{ ...s.savedScoreBox, background: phqLvl.bg }}>
                  <div style={s.savedScoreLabel}>Depression (PHQ-9)</div>
                  <div style={{ ...s.savedScoreNum, color: phqLvl.color }}>{savedResult.phq9Score}</div>
                  <div style={{ ...s.savedScoreBadge, background: phqLvl.bg, color: phqLvl.color }}>{phqLvl.label}</div>
                  <div style={s.savedScoreMax}>out of 27</div>
                </div>
                {/* GAD-7 */}
                <div style={{ ...s.savedScoreBox, background: gadLvl.bg }}>
                  <div style={s.savedScoreLabel}>Anxiety (GAD-7)</div>
                  <div style={{ ...s.savedScoreNum, color: gadLvl.color }}>{savedResult.gad7Score}</div>
                  <div style={{ ...s.savedScoreBadge, background: gadLvl.bg, color: gadLvl.color }}>{gadLvl.label}</div>
                  <div style={s.savedScoreMax}>out of 21</div>
                </div>
              </div>

              {/* Recommendation */}
              <div style={s.savedRec}>
                {(savedResult.phq9Score >= 10 || savedResult.gad7Score >= 10) && (
                  <div style={{ ...s.recChip, background:'#ede9fe', color:'#7c3aed' }}>
                    💜 Consider speaking with a counselor
                  </div>
                )}
                {savedResult.gad7Score >= 5 && (
                  <div style={{ ...s.recChip, background:'#e8f7f1', color:'#4aba8e' }}>
                    🌬️ Try the Breathing Game to manage anxiety
                  </div>
                )}
                {savedResult.phq9Score >= 5 && (
                  <div style={{ ...s.recChip, background:'#e0f5ff', color:'#38bdf8' }}>
                    🧠 Memory Match game can help with focus
                  </div>
                )}
              </div>

              <div style={s.savedActions}>
                <button
                  style={s.retakeBtn}
                  onClick={() => {
                    setStep('intro');
                    setPhq9Ans(Array(9).fill(null));
                    setGad7Ans(Array(7).fill(null));
                    setCurrent(0);
                    setSection('phq9');
                  }}
                >
                  🔄 Retake Assessment
                </button>
                <button
                  style={s.dashBtn}
                  onClick={() => navigate('/student/dashboard')}
                >
                  ← Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // INTRO SCREEN
  // ──────────────────────────────────────────
  if (step === 'intro') {
    return (
      <div style={s.page}>
        <div style={s.blob1} /><div style={s.blob2} /><div style={s.dots} />

        <div style={s.introWrap}>
          <button style={s.backLink} onClick={() => navigate('/student/dashboard')}>
            ← Back to Dashboard
          </button>

          <div style={s.introCard}>
            <div style={s.introEmoji}>🧠</div>
            <h1 style={s.introTitle}>Mental Health Assessment</h1>
            <p style={s.introSub}>
              This assessment uses two clinically validated tools — <strong>PHQ-9</strong> for
              depression and <strong>GAD-7</strong> for anxiety — to understand how you have
              been feeling over the past 2 weeks.
            </p>

            <div style={s.introCards}>
              <div style={s.introInfoCard}>
                <div style={s.introInfoIcon}>📋</div>
                <div style={s.introInfoTitle}>16 Questions</div>
                <div style={s.introInfoSub}>9 about depression + 7 about anxiety</div>
              </div>
              <div style={s.introInfoCard}>
                <div style={s.introInfoIcon}>⏱️</div>
                <div style={s.introInfoTitle}>5 Minutes</div>
                <div style={s.introInfoSub}>Quick and easy to complete</div>
              </div>
              <div style={s.introInfoCard}>
                <div style={s.introInfoIcon}>🔒</div>
                <div style={s.introInfoTitle}>100% Private</div>
                <div style={s.introInfoSub}>Only you can see your results</div>
              </div>
            </div>

            <div style={s.introBanner}>
              <span>💚</span>
              <span>There are no right or wrong answers. Please answer honestly — this helps us support you better.</span>
            </div>

            <button
              style={s.startBtn}
              onClick={() => { setStep('phq9'); setCurrent(0); setSection('phq9'); }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Start Assessment →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────
  // RESULT SCREEN
  // ──────────────────────────────────────────
  if (step === 'result') {
    const recs = getRecommendations();
    const needsCounselor = phq9Score >= 10 || gad7Score >= 10;

    return (
      <div style={s.page}>
        <div style={s.blob1} /><div style={s.blob2} /><div style={s.dots} />

        <div style={s.resultWrap}>
          <div style={s.resultHeader}>
            <div style={s.resultEmoji}>🌿</div>
            <h1 style={s.resultTitle}>Your Wellness Report</h1>
            <p style={s.resultSub}>Based on your answers from the past 2 weeks</p>
          </div>

          {/* Score Cards */}
          <div style={s.scoreRow}>
            <div style={{...s.scoreCard, borderTop: `4px solid ${depLevel.color}`}}>
              <div style={s.scoreIcon}>🧠</div>
              <div style={s.scoreLabel}>Depression (PHQ-9)</div>
              <div style={{...s.scoreNum, color: depLevel.color}}>{phq9Score}<span style={s.scoreMax}>/27</span></div>
              <div style={{...s.scoreBadge, background: depLevel.bg, color: depLevel.color}}>
                {depLevel.label}
              </div>
              <div style={s.scoreBar}>
                <div style={{...s.scoreBarFill, width: (phq9Score/27*100)+'%', background: depLevel.color}} />
              </div>
            </div>

            <div style={{...s.scoreCard, borderTop: `4px solid ${anxLevel.color}`}}>
              <div style={s.scoreIcon}>💭</div>
              <div style={s.scoreLabel}>Anxiety (GAD-7)</div>
              <div style={{...s.scoreNum, color: anxLevel.color}}>{gad7Score}<span style={s.scoreMax}>/21</span></div>
              <div style={{...s.scoreBadge, background: anxLevel.bg, color: anxLevel.color}}>
                {anxLevel.label}
              </div>
              <div style={s.scoreBar}>
                <div style={{...s.scoreBarFill, width: (gad7Score/21*100)+'%', background: anxLevel.color}} />
              </div>
            </div>
          </div>

          {/* Counselor Alert */}
          {needsCounselor && (
            <div style={s.counselorAlert}>
              <span style={{fontSize:'1.3rem'}}>💜</span>
              <div>
                <div style={{fontWeight:700, marginBottom:4}}>We recommend speaking with a counselor</div>
                <div style={{fontSize:'0.85rem', opacity:0.85}}>
                  Your scores suggest you may benefit from professional support. Our counselors are kind, non-judgmental, and here to help.
                </div>
              </div>
              <button style={s.counselorBtn} onClick={() => navigate('/student/counselor')}>
                Connect Now
              </button>
            </div>
          )}

          {/* Recommendations */}
          <div style={s.recsCard}>
            <div style={s.recsTitle}>✨ Personalised Recommendations For You</div>
            <div style={s.recsList}>
              {recs.map((r, i) => (
                <div key={i} style={{...s.recItem, background: r.urgent ? '#fff0f4' : '#f8fffe', borderColor: r.urgent ? '#fca5a5' : '#b8e8d4'}}>
                  <span style={s.recIcon}>{r.icon}</span>
                  <span style={s.recText}>{r.text}</span>
                  {r.urgent && <span style={s.recUrgent}>Recommended</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={s.resultActions}>
            <button style={s.actionBtnPrimary} onClick={() => navigate('/student/dashboard')}>
              Go to Dashboard →
            </button>
            <button style={s.actionBtnSecondary} onClick={() => {
              setStep('intro');
              setPhq9Ans(Array(9).fill(null));
              setGad7Ans(Array(7).fill(null));
              setCurrent(0);
            }}>
              Retake Assessment
            </button>
          </div>

          <div style={s.resultNote}>
            🔒 This report is only visible to you. Your identity remains anonymous.
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────
  // QUESTION SCREEN (PHQ-9 and GAD-7)
  // ──────────────────────────────────────────
  const globalIndex = section === 'phq9' ? current : PHQ9.length + current;

  return (
    <div style={s.page}>
      <div style={s.blob1} /><div style={s.blob2} /><div style={s.dots} />

      <div style={s.qWrap}>

        {/* Top Progress Bar */}
        <div style={s.topProgress}>
          <div style={s.progressInfo}>
            <button style={s.backLink2} onClick={() => navigate('/student/dashboard')}>← Exit</button>
            <span style={s.progressText}>{globalIndex + 1} of {totalQ} questions</span>
          </div>
          <div style={s.progressTrack}>
            <div style={{...s.progressFill, width: progress + '%'}} />
          </div>
        </div>

        {/* Section Badge */}
        <div style={{
          ...s.sectionBadge,
          background: section === 'phq9' ? '#e8f7f1' : '#ede9fe',
          color: section === 'phq9' ? '#4aba8e' : '#a78bfa',
          borderColor: section === 'phq9' ? '#b8e8d4' : '#c4b5fd',
        }}>
          {section === 'phq9' ? '🧠 PHQ-9 · Depression Assessment' : '💭 GAD-7 · Anxiety Assessment'}
        </div>

        {/* Question Card */}
        <div style={s.questionCard}>
          <div style={s.questionNum}>Question {current + 1} of {questions.length}</div>
          <div style={s.questionText}>
            Over the last 2 weeks, how often have you been bothered by:
          </div>
          <div style={s.questionMain}>"{questions[current]}"</div>

          {/* Answer Options */}
          <div style={s.optionsGrid}>
            {OPTIONS.map(opt => {
              const selected = answers[current] === opt.value;
              return (
                <div
                  key={opt.value}
                  style={{
                    ...s.optionCard,
                    background:   selected ? opt.bg    : 'white',
                    borderColor:  selected ? opt.color : 'rgba(74,186,142,0.2)',
                    transform:    selected ? 'scale(1.03)' : 'scale(1)',
                    boxShadow:    selected ? `0 8px 24px ${opt.color}33` : '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                  onClick={() => selectAnswer(opt.value)}
                  onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = opt.color; }}
                  onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(74,186,142,0.2)'; }}
                >
                  <div style={{...s.optionDot, background: selected ? opt.color : '#e2e8f0'}}>
                    {selected && <div style={s.optionCheck}>✓</div>}
                  </div>
                  <div style={{...s.optionLabel, color: selected ? opt.color : '#1e3a2f', fontWeight: selected ? 700 : 400}}>
                    {opt.label}
                  </div>
                  <div style={{...s.optionScore, color: selected ? opt.color : '#94a3b8'}}>
                    {opt.value} {opt.value === 1 ? 'point' : 'points'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div style={s.navBtns}>
          <button
            style={{...s.navBtn, ...s.navBtnBack, opacity: (current === 0 && section === 'phq9') ? 0.4 : 1}}
            onClick={goBack}
            disabled={current === 0 && section === 'phq9'}
          >
            ← Previous
          </button>

          <button
            style={{
              ...s.navBtn, ...s.navBtnNext,
              opacity: answers[current] === null ? 0.5 : 1,
              cursor:  answers[current] === null ? 'not-allowed' : 'pointer',
            }}
            onClick={goNext}
            disabled={answers[current] === null}
          >
            {current === questions.length - 1 && section === 'gad7'
              ? 'See My Results 🎉'
              : current === questions.length - 1 && section === 'phq9'
              ? 'Next Section →'
              : 'Next →'}
          </button>
        </div>

        {/* Helper Note */}
        <div style={s.helperNote}>
          💚 Take your time. There are no right or wrong answers.
        </div>

      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// STYLES
// ──────────────────────────────────────────
const s = {
  page: {
    minHeight: '100vh', background: '#f0f7f4',
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
  dots: {
    position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
    backgroundImage: 'radial-gradient(circle, rgba(74,186,142,0.12) 1.5px, transparent 1.5px)',
    backgroundSize: '36px 36px',
  },

  // ── Intro
  introWrap: {
    position: 'relative', zIndex: 1,
    maxWidth: 680, margin: '0 auto', padding: '40px 24px',
  },
  backLink: {
    background: 'none', border: 'none', color: '#6b8f7e',
    fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'inherit',
    marginBottom: 24, display: 'block', padding: 0,
  },
  introCard: {
    background: 'white', borderRadius: 28,
    padding: '48px 40px', textAlign: 'center',
    boxShadow: '0 8px 40px rgba(0,0,0,0.07)',
  },
  introEmoji: { fontSize: '3.5rem', marginBottom: 16 },
  introTitle: {
    fontFamily: 'Georgia, serif', fontSize: '1.8rem',
    fontWeight: 700, color: '#1e3a2f', marginBottom: 14,
  },
  introSub: {
    fontSize: '0.95rem', color: '#6b8f7e',
    lineHeight: 1.75, maxWidth: 480, margin: '0 auto 32px',
  },
  introCards: {
    display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
    gap: 16, marginBottom: 28,
  },
  introInfoCard: {
    background: '#f8fffe', border: '1px solid rgba(74,186,142,0.2)',
    borderRadius: 16, padding: '20px 12px', textAlign: 'center',
  },
  introInfoIcon: { fontSize: '1.5rem', marginBottom: 8 },
  introInfoTitle: { fontSize: '0.9rem', fontWeight: 700, color: '#1e3a2f', marginBottom: 4 },
  introInfoSub: { fontSize: '0.75rem', color: '#6b8f7e' },
  introBanner: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
    background: '#e8f7f1', border: '1px solid rgba(74,186,142,0.25)',
    borderRadius: 14, padding: '14px 18px',
    fontSize: '0.85rem', color: '#1e3a2f',
    textAlign: 'left', marginBottom: 32, lineHeight: 1.6,
  },
  startBtn: {
    background: 'linear-gradient(135deg, #4aba8e, #2d9e6e)',
    color: 'white', border: 'none', borderRadius: 14,
    padding: '15px 48px', fontSize: '1rem',
    fontWeight: 700, cursor: 'pointer',
    fontFamily: 'inherit', transition: 'opacity 0.2s',
  },

  // ── Question Screen
  qWrap: {
    position: 'relative', zIndex: 1,
    maxWidth: 680, margin: '0 auto', padding: '32px 24px',
  },
  topProgress: { marginBottom: 28 },
  progressInfo: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  backLink2: {
    background: 'none', border: 'none', color: '#6b8f7e',
    fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', padding: 0,
  },
  progressText: { fontSize: '0.82rem', color: '#6b8f7e', fontWeight: 600 },
  progressTrack: {
    height: 8, background: '#d1fae5', borderRadius: 10, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', borderRadius: 10,
    background: 'linear-gradient(90deg, #4aba8e, #2d9e6e)',
    transition: 'width 0.4s ease',
  },
  sectionBadge: {
    display: 'inline-flex', alignItems: 'center',
    fontSize: '0.78rem', fontWeight: 700,
    letterSpacing: '0.5px', padding: '8px 18px',
    borderRadius: 20, border: '1.5px solid',
    marginBottom: 20,
  },
  questionCard: {
    background: 'white', borderRadius: 24,
    padding: '36px 32px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.07)',
    marginBottom: 24,
  },
  questionNum: {
    fontSize: '0.75rem', fontWeight: 700, color: '#6b8f7e',
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10,
  },
  questionText: {
    fontSize: '0.88rem', color: '#6b8f7e',
    marginBottom: 8, lineHeight: 1.5,
  },
  questionMain: {
    fontFamily: 'Georgia, serif',
    fontSize: '1.2rem', fontWeight: 700,
    color: '#1e3a2f', lineHeight: 1.5,
    marginBottom: 28,
  },
  optionsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12,
  },
  optionCard: {
    border: '2px solid', borderRadius: 16,
    padding: '16px 18px', cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', gap: 12,
  },
  optionDot: {
    width: 26, height: 26, borderRadius: '50%',
    flexShrink: 0, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.2s',
  },
  optionCheck: { color: 'white', fontSize: '0.75rem', fontWeight: 700 },
  optionLabel: { fontSize: '0.88rem', flex: 1, transition: 'all 0.2s' },
  optionScore: { fontSize: '0.72rem', transition: 'color 0.2s' },

  navBtns: { display: 'flex', gap: 12, justifyContent: 'space-between' },
  navBtn: {
    flex: 1, padding: '14px', borderRadius: 14,
    fontSize: '0.92rem', fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  navBtnBack: {
    background: 'white',
    border: '1.5px solid rgba(74,186,142,0.25)',
    color: '#6b8f7e',
  },
  navBtnNext: {
    background: 'linear-gradient(135deg, #4aba8e, #2d9e6e)',
    border: 'none', color: 'white',
  },
  helperNote: {
    textAlign: 'center', fontSize: '0.8rem',
    color: '#6b8f7e', marginTop: 16,
  },

  // ── Result Screen
  resultWrap: {
    position: 'relative', zIndex: 1,
    maxWidth: 720, margin: '0 auto', padding: '40px 24px',
  },
  resultHeader: { textAlign: 'center', marginBottom: 32 },
  resultEmoji: { fontSize: '3rem', marginBottom: 12 },
  resultTitle: {
    fontFamily: 'Georgia, serif', fontSize: '2rem',
    fontWeight: 700, color: '#1e3a2f', marginBottom: 8,
  },
  resultSub: { fontSize: '0.9rem', color: '#6b8f7e' },
  scoreRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 },
  scoreCard: {
    background: 'white', borderRadius: 24,
    padding: '28px 24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  },
  scoreIcon: { fontSize: '1.8rem', marginBottom: 10 },
  scoreLabel: { fontSize: '0.78rem', color: '#6b8f7e', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  scoreNum: {
    fontFamily: 'Georgia, serif', fontSize: '2.5rem',
    fontWeight: 900, lineHeight: 1, marginBottom: 10,
  },
  scoreMax: { fontSize: '1rem', color: '#94a3b8', fontWeight: 400 },
  scoreBadge: {
    display: 'inline-block', fontSize: '0.78rem',
    fontWeight: 700, padding: '5px 14px',
    borderRadius: 20, marginBottom: 14,
  },
  scoreBar: {
    height: 8, background: '#f0f7f4',
    borderRadius: 10, overflow: 'hidden',
  },
  scoreBarFill: { height: '100%', borderRadius: 10, transition: 'width 1s ease' },
  counselorAlert: {
    display: 'flex', alignItems: 'center', gap: 16,
    background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
    border: '1px solid rgba(167,139,250,0.3)',
    borderRadius: 20, padding: '20px 24px', marginBottom: 24,
    color: '#4c1d95',
  },
  counselorBtn: {
    marginLeft: 'auto', background: '#a78bfa', color: 'white',
    border: 'none', borderRadius: 12, padding: '10px 20px',
    cursor: 'pointer', fontSize: '0.85rem',
    fontWeight: 700, fontFamily: 'inherit', whiteSpace: 'nowrap',
  },
  recsCard: {
    background: 'white', borderRadius: 24,
    padding: '28px', marginBottom: 24,
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  },
  recsTitle: { fontSize: '1rem', fontWeight: 700, color: '#1e3a2f', marginBottom: 16 },
  recsList: { display: 'flex', flexDirection: 'column', gap: 10 },
  recItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    border: '1.5px solid', borderRadius: 14,
    padding: '12px 16px',
  },
  recIcon: { fontSize: '1.2rem', flexShrink: 0 },
  recText: { fontSize: '0.88rem', color: '#1e3a2f', flex: 1, lineHeight: 1.5 },
  recUrgent: {
    fontSize: '0.7rem', fontWeight: 700, color: '#f43f5e',
    background: '#fff0f4', padding: '3px 10px',
    borderRadius: 20, whiteSpace: 'nowrap',
  },
  resultActions: { display: 'flex', gap: 12, marginBottom: 16 },
  actionBtnPrimary: {
    flex: 1, padding: '15px',
    background: 'linear-gradient(135deg, #4aba8e, #2d9e6e)',
    color: 'white', border: 'none', borderRadius: 14,
    fontSize: '0.95rem', fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  actionBtnSecondary: {
    flex: 1, padding: '15px',
    background: 'white',
    color: '#6b8f7e',
    border: '1.5px solid rgba(74,186,142,0.25)',
    borderRadius: 14, fontSize: '0.95rem',
    fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  },
  resultNote: {
    textAlign: 'center', fontSize: '0.8rem',
    color: '#6b8f7e', marginBottom: 40,
  },

  // ── Saved result screen
  savedWrap:       { display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh', padding:'24px' },
  savedCard:       { background:'white', borderRadius:28, padding:'40px 36px', maxWidth:500, width:'100%', boxShadow:'0 8px 40px rgba(0,0,0,0.08)', textAlign:'center' },
  savedTitle:      { fontFamily:'Georgia,serif', fontSize:'1.6rem', fontWeight:700, color:'#1e3a2f', marginBottom:6 },
  savedDate:       { fontSize:'0.78rem', color:'#94a3b8', marginBottom:28 },
  savedScores:     { display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:24 },
  savedScoreBox:   { borderRadius:16, padding:'20px 14px', textAlign:'center' },
  savedScoreLabel: { fontSize:'0.72rem', fontWeight:700, color:'#6b8f7e', marginBottom:8 },
  savedScoreNum:   { fontFamily:'Georgia,serif', fontSize:'2.2rem', fontWeight:900, marginBottom:6 },
  savedScoreBadge: { display:'inline-block', fontSize:'0.72rem', fontWeight:700, padding:'3px 12px', borderRadius:20, marginBottom:6 },
  savedScoreMax:   { fontSize:'0.65rem', color:'#94a3b8' },
  savedRec:        { display:'flex', flexDirection:'column', gap:8, marginBottom:24 },
  recChip:         { borderRadius:12, padding:'10px 14px', fontSize:'0.82rem', fontWeight:600, textAlign:'left' },
  savedActions:    { display:'flex', flexDirection:'column', gap:10 },
  retakeBtn:       { padding:'13px', background:'linear-gradient(135deg,#4aba8e,#2d9e6e)', color:'white', border:'none', borderRadius:14, fontSize:'0.92rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' },
  dashBtn:         { padding:'12px', background:'#f0f7f4', color:'#6b8f7e', border:'1px solid rgba(74,186,142,0.2)', borderRadius:14, fontSize:'0.88rem', cursor:'pointer', fontFamily:'inherit' },
};