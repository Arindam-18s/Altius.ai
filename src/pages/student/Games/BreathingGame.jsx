import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const PHASES = [
  { label: 'Inhale',  duration: 4, color: '#4aba8e', scale: 1.6, instruction: 'Breathe in slowly through your nose' },
  { label: 'Hold',    duration: 7, color: '#a78bfa', scale: 1.6, instruction: 'Hold your breath gently'              },
  { label: 'Exhale',  duration: 8, color: '#38bdf8', scale: 1.0, instruction: 'Breathe out slowly through your mouth'},
];

export default function BreathingGame() {
  const navigate = useNavigate();
  const [started,   setStarted]   = useState(false);
  const [phaseIdx,  setPhaseIdx]  = useState(0);
  const [counter,   setCounter]   = useState(PHASES[0].duration);
  const [cycles,    setCycles]    = useState(0);
  const [finished,  setFinished]  = useState(false);
  const intervalRef = useRef(null);
  const TARGET_CYCLES = 4;

  const phase = PHASES[phaseIdx];

  useEffect(() => {
    if (!started || finished) return;

    intervalRef.current = setInterval(() => {
      setCounter(prev => {
        if (prev <= 1) {
          // Move to next phase
          const nextIdx = (phaseIdx + 1) % PHASES.length;
          setPhaseIdx(nextIdx);
          setCounter(PHASES[nextIdx].duration);

          // Count completed cycles
          if (nextIdx === 0) {
            setCycles(c => {
              if (c + 1 >= TARGET_CYCLES) {
                setFinished(true);
                setStarted(false);
              }
              return c + 1;
            });
          }
          return PHASES[nextIdx].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [started, phaseIdx, finished]);

  function startGame() {
    setStarted(true);
    setPhaseIdx(0);
    setCounter(PHASES[0].duration);
    setCycles(0);
    setFinished(false);
  }

  function stopGame() {
    clearInterval(intervalRef.current);
    setStarted(false);
    setPhaseIdx(0);
    setCounter(PHASES[0].duration);
  }

  return (
    <div style={s.page}>
      <div style={s.blob1} /><div style={s.blob2} /><div style={s.dots} />

      <div style={s.wrap}>
        {/* Back */}
        <button style={s.backBtn} onClick={() => navigate('/student/resources')}>
          ← Back to Resources
        </button>

        <div style={s.card}>
          <div style={s.gameTitle}>🌬️ Breathing Exercise</div>
          <div style={s.gameSub}>4 - 7 - 8 Breathing Technique</div>

          {/* Breathing Circle */}
          <div style={s.circleWrap}>
            {/* Outer ring */}
            <div style={{
              ...s.outerRing,
              borderColor: started ? phase.color : '#b8e8d4',
            }} />

            {/* Main breathing circle */}
            <div style={{
              ...s.circle,
              background: started
                ? `radial-gradient(circle, ${phase.color}33, ${phase.color}11)`
                : 'radial-gradient(circle, #e8f7f1, #d1fae5)',
              border: `3px solid ${started ? phase.color : '#b8e8d4'}`,
              transform: `scale(${started ? phase.scale : 1})`,
              transition: `transform ${started ? phase.duration : 0.5}s ease-in-out,
                           background 0.5s ease, border-color 0.5s ease`,
            }}>
              {/* Counter */}
              <div style={{...s.counter, color: started ? phase.color : '#4aba8e'}}>
                {started ? counter : '🌿'}
              </div>
              {/* Phase label */}
              <div style={{...s.phaseLabel, color: started ? phase.color : '#6b8f7e'}}>
                {started ? phase.label : 'Ready'}
              </div>
            </div>
          </div>

          {/* Instruction */}
          <div style={s.instruction}>
            {started ? phase.instruction : 'Click Start to begin your breathing session'}
          </div>

          {/* Phase indicators */}
          <div style={s.phaseRow}>
            {PHASES.map((p, i) => (
              <div key={i} style={{
                ...s.phaseChip,
                background: (started && phaseIdx === i) ? p.color : '#f0f7f4',
                color:      (started && phaseIdx === i) ? 'white'  : '#6b8f7e',
              }}>
                {p.label} {p.duration}s
              </div>
            ))}
          </div>

          {/* Cycle counter */}
          <div style={s.cycleRow}>
            {Array(TARGET_CYCLES).fill(0).map((_, i) => (
              <div key={i} style={{
                ...s.cycleDot,
                background: i < cycles ? '#4aba8e' : '#e2e8f0',
              }} />
            ))}
            <span style={s.cycleLabel}>{cycles}/{TARGET_CYCLES} cycles</span>
          </div>

          {/* Buttons */}
          {!started && !finished && (
            <button style={s.startBtn} onClick={startGame}>
              Start Breathing 🌬️
            </button>
          )}
          {started && (
            <button style={s.stopBtn} onClick={stopGame}>
              Stop
            </button>
          )}

          {/* Finished */}
          {finished && (
            <div style={s.finishedBox}>
              <div style={s.finishedEmoji}>🎉</div>
              <div style={s.finishedTitle}>Well done!</div>
              <div style={s.finishedSub}>
                You completed {TARGET_CYCLES} breathing cycles. Your mind should feel calmer now. 💚
              </div>
              <div style={s.finishedBtns}>
                <button style={s.againBtn} onClick={startGame}>Do it again</button>
                <button style={s.doneBtn} onClick={() => navigate('/student/resources')}>
                  Back to Resources
                </button>
              </div>
            </div>
          )}

          {/* Benefits */}
          {!started && !finished && (
            <div style={s.benefits}>
              <div style={s.benefitsTitle}>Why 4-7-8 breathing?</div>
              <div style={s.benefitsList}>
                {[
                  '😴 Helps you fall asleep faster',
                  '😌 Reduces anxiety in minutes',
                  '🧠 Improves focus before exams',
                  '❤️ Lowers heart rate and stress',
                ].map((b, i) => (
                  <div key={i} style={s.benefitItem}>{b}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh', background: '#f0f7f4',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    position: 'relative',
  },
  blob1: {
    position: 'fixed', width: 500, height: 500, borderRadius: '50%',
    background: '#b8f0dc', filter: 'blur(80px)', opacity: 0.3,
    top: -150, left: -100, zIndex: 0, pointerEvents: 'none',
  },
  blob2: {
    position: 'fixed', width: 400, height: 400, borderRadius: '50%',
    background: '#ddd6fe', filter: 'blur(80px)', opacity: 0.2,
    bottom: -100, right: -80, zIndex: 0, pointerEvents: 'none',
  },
  dots: {
    position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
    backgroundImage: 'radial-gradient(circle, rgba(74,186,142,0.1) 1.5px, transparent 1.5px)',
    backgroundSize: '36px 36px',
  },
  wrap: {
    position: 'relative', zIndex: 1,
    maxWidth: 560, margin: '0 auto', padding: '32px 24px',
  },
  backBtn: {
    background: 'none', border: 'none', color: '#6b8f7e',
    fontSize: '0.88rem', cursor: 'pointer',
    fontFamily: 'inherit', marginBottom: 24, padding: 0,
  },
  card: {
    background: 'white', borderRadius: 28,
    padding: '40px 32px', textAlign: 'center',
    boxShadow: '0 8px 40px rgba(0,0,0,0.07)',
  },
  gameTitle: {
    fontFamily: 'Georgia, serif', fontSize: '1.8rem',
    fontWeight: 700, color: '#1e3a2f', marginBottom: 6,
  },
  gameSub: { fontSize: '0.88rem', color: '#6b8f7e', marginBottom: 40 },
  circleWrap: {
    position: 'relative', width: 220, height: 220,
    margin: '0 auto 32px', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute', inset: -16,
    borderRadius: '50%', border: '2px dashed',
    transition: 'border-color 0.5s',
    animation: 'spin 20s linear infinite',
  },
  circle: {
    width: 180, height: 180, borderRadius: '50%',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative', zIndex: 1,
  },
  counter: {
    fontFamily: 'Georgia, serif', fontSize: '3rem',
    fontWeight: 900, lineHeight: 1,
  },
  phaseLabel: {
    fontSize: '0.85rem', fontWeight: 700,
    letterSpacing: 1, textTransform: 'uppercase', marginTop: 6,
  },
  instruction: {
    fontSize: '0.9rem', color: '#6b8f7e',
    lineHeight: 1.6, marginBottom: 24, minHeight: 44,
  },
  phaseRow: { display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 },
  phaseChip: {
    fontSize: '0.75rem', fontWeight: 600,
    padding: '6px 14px', borderRadius: 20,
    transition: 'all 0.3s',
  },
  cycleRow: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 8, marginBottom: 28,
  },
  cycleDot: {
    width: 12, height: 12, borderRadius: '50%',
    transition: 'background 0.3s',
  },
  cycleLabel: { fontSize: '0.78rem', color: '#6b8f7e', marginLeft: 4 },
  startBtn: {
    background: 'linear-gradient(135deg, #4aba8e, #2d9e6e)',
    color: 'white', border: 'none', borderRadius: 14,
    padding: '14px 40px', fontSize: '1rem', fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit', marginBottom: 32,
  },
  stopBtn: {
    background: '#fff0f4', color: '#f43f5e',
    border: '1.5px solid #fca5a5', borderRadius: 14,
    padding: '12px 32px', fontSize: '0.9rem', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', marginBottom: 32,
  },
  finishedBox: {
    background: 'linear-gradient(135deg, #e8f7f1, #d1fae5)',
    border: '1px solid rgba(74,186,142,0.25)',
    borderRadius: 20, padding: '28px', marginBottom: 16,
  },
  finishedEmoji: { fontSize: '2.5rem', marginBottom: 10 },
  finishedTitle: {
    fontFamily: 'Georgia, serif', fontSize: '1.3rem',
    fontWeight: 700, color: '#1e3a2f', marginBottom: 8,
  },
  finishedSub: { fontSize: '0.88rem', color: '#6b8f7e', lineHeight: 1.6, marginBottom: 20 },
  finishedBtns: { display: 'flex', gap: 12 },
  againBtn: {
    flex: 1, padding: '12px',
    background: 'white', border: '1.5px solid rgba(74,186,142,0.3)',
    borderRadius: 12, cursor: 'pointer', fontSize: '0.85rem',
    fontWeight: 600, color: '#4aba8e', fontFamily: 'inherit',
  },
  doneBtn: {
    flex: 1, padding: '12px',
    background: 'linear-gradient(135deg, #4aba8e, #2d9e6e)',
    border: 'none', borderRadius: 12, cursor: 'pointer',
    fontSize: '0.85rem', fontWeight: 700,
    color: 'white', fontFamily: 'inherit',
  },
  benefits: {
    background: '#f8fffe', border: '1px solid rgba(74,186,142,0.15)',
    borderRadius: 16, padding: '20px', textAlign: 'left',
  },
  benefitsTitle: {
    fontSize: '0.82rem', fontWeight: 700, color: '#1e3a2f',
    marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  benefitsList: { display: 'flex', flexDirection: 'column', gap: 8 },
  benefitItem: { fontSize: '0.85rem', color: '#6b8f7e' },
};