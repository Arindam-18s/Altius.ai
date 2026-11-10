import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const COLORS = [
  '#4aba8e','#a78bfa','#fb923c','#38bdf8',
  '#ec4899','#eab308','#f43f5e','#34d399',
];

let nextId = 0;
function createBubble() {
  const size = 48 + Math.random() * 56;
  return {
    id: nextId++,
    x: 5 + Math.random() * 88,
    y: 110,
    size,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    speed: 0.4 + Math.random() * 0.6,
    wobble: Math.random() * 2 - 1,
    popped: false,
    opacity: 1,
  };
}

export default function BubbleGame() {
  const navigate = useNavigate();
  const [bubbles,  setBubbles]  = useState([]);
  const [score,    setScore]    = useState(0);
  const [running,  setRunning]  = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [finished, setFinished] = useState(false);
  const [combo,    setCombo]    = useState(0);
  const [popEffects, setPopEffects] = useState([]);

  // Spawn bubbles
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setBubbles(prev => [...prev.slice(-18), createBubble()]);
    }, 700);
    return () => clearInterval(t);
  }, [running]);

  // Move bubbles up
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setBubbles(prev => prev
        .map(b => ({
          ...b,
          y: b.y - b.speed,
          x: b.x + Math.sin(b.y * 0.05) * 0.3,
        }))
        .filter(b => b.y > -10)
      );
    }, 30);
    return () => clearInterval(t);
  }, [running]);

  // Timer
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setRunning(false);
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  function popBubble(id, x, y, color) {
    setBubbles(prev => prev.filter(b => b.id !== id));
    setScore(prev => prev + 1);
    setCombo(prev => prev + 1);

    // Pop effect
    const effect = { id: Date.now(), x, y, color };
    setPopEffects(prev => [...prev, effect]);
    setTimeout(() => {
      setPopEffects(prev => prev.filter(e => e.id !== effect.id));
    }, 500);

    // Reset combo after 2s of no pops
    clearTimeout(window._comboTimer);
    window._comboTimer = setTimeout(() => setCombo(0), 2000);
  }

  function startGame() {
    setBubbles([]);
    setScore(0);
    setTimeLeft(30);
    setFinished(false);
    setCombo(0);
    setRunning(true);
  }

  function getRating() {
    if (score >= 25) return { stars: '⭐⭐⭐', label: 'Amazing!' };
    if (score >= 15) return { stars: '⭐⭐',   label: 'Great job!' };
    return                  { stars: '⭐',     label: 'Good start!' };
  }

  const rating = getRating();

  return (
    <div style={s.page}>
      <div style={s.blob1} /><div style={s.blob2} /><div style={s.dots} />

      <div style={s.wrap}>
        <button style={s.backBtn} onClick={() => navigate('/student/resources')}>
          ← Back to Resources
        </button>

        <div style={s.card}>
          <div style={s.gameTitle}>🫧 Bubble Pop</div>
          <div style={s.gameSub}>Pop bubbles to release stress!</div>

          {/* Stats bar */}
          <div style={s.statsBar}>
            <div style={s.statItem}>
              <div style={s.statVal}>{score}</div>
              <div style={s.statLbl}>Score</div>
            </div>
            <div style={s.statItem}>
              <div style={{
                ...s.statVal,
                color: timeLeft <= 10 ? '#f43f5e' : '#4aba8e',
              }}>
                {timeLeft}s
              </div>
              <div style={s.statLbl}>Time</div>
            </div>
            <div style={s.statItem}>
              <div style={{...s.statVal, color: '#fb923c'}}>{combo}x</div>
              <div style={s.statLbl}>Combo</div>
            </div>
          </div>

          {/* Game area */}
          <div style={s.gameArea}>
            {!running && !finished && (
              <div style={s.startOverlay}>
                <div style={s.startEmoji}>🫧</div>
                <div style={s.startText}>Pop as many bubbles as you can in 30 seconds!</div>
                <button style={s.startBtn} onClick={startGame}>
                  Start Popping! 🫧
                </button>
              </div>
            )}

            {/* Bubbles */}
            {bubbles.map(bubble => (
              <div
                key={bubble.id}
                style={{
                  position: 'absolute',
                  left: `${bubble.x}%`,
                  top:  `${bubble.y}%`,
                  width:  bubble.size,
                  height: bubble.size,
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 35% 35%, ${bubble.color}dd, ${bubble.color}88)`,
                  border: `2px solid ${bubble.color}aa`,
                  cursor: 'pointer',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: `0 4px 16px ${bubble.color}44, inset 0 -4px 8px rgba(0,0,0,0.1)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  userSelect: 'none',
                  transition: 'transform 0.1s',
                }}
                onClick={() => popBubble(bubble.id, bubble.x, bubble.y, bubble.color)}
                onMouseEnter={e => e.currentTarget.style.transform = 'translate(-50%,-50%) scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translate(-50%,-50%) scale(1)'}
              >
                <span style={{fontSize: bubble.size * 0.35, userSelect:'none'}}>○</span>
              </div>
            ))}

            {/* Pop effects */}
            {popEffects.map(effect => (
              <div key={effect.id} style={{
                position: 'absolute',
                left: `${effect.x}%`,
                top:  `${effect.y}%`,
                transform: 'translate(-50%,-50%)',
                fontSize: '1.4rem',
                pointerEvents: 'none',
                animation: 'popAnim 0.5s ease forwards',
                color: effect.color,
                fontWeight: 700,
                zIndex: 10,
              }}>
                ✨
              </div>
            ))}

            {/* Combo indicator */}
            {combo >= 3 && running && (
              <div style={{
                position: 'absolute', top: 10, left: '50%',
                transform: 'translateX(-50%)',
                background: '#fb923c', color: 'white',
                borderRadius: 20, padding: '6px 16px',
                fontSize: '0.85rem', fontWeight: 700,
                zIndex: 10, animation: 'popAnim 0.3s ease',
              }}>
                🔥 {combo}x Combo!
              </div>
            )}
          </div>

          {/* Finished */}
          {finished && (
            <div style={s.finishedBox}>
              <div style={s.finishedEmoji}>{rating.stars}</div>
              <div style={s.finishedTitle}>{rating.label}</div>
              <div style={s.finishedScore}>
                You popped <span style={{color:'#4aba8e', fontWeight:700}}>{score}</span> bubbles!
              </div>
              <div style={s.finishedSub}>
                Popping bubbles is a great way to release tension and stress. Feel better? 💚
              </div>
              <div style={s.finishedBtns}>
                <button style={s.againBtn} onClick={startGame}>Play Again</button>
                <button style={s.doneBtn} onClick={() => navigate('/student/resources')}>
                  Back to Resources
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes popAnim {
          0%   { opacity: 1; transform: translate(-50%,-50%) scale(0.8); }
          50%  { opacity: 1; transform: translate(-50%,-50%) scale(1.3); }
          100% { opacity: 0; transform: translate(-50%,-80%) scale(1); }
        }
      `}</style>
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
    padding: '36px 28px', textAlign: 'center',
    boxShadow: '0 8px 40px rgba(0,0,0,0.07)',
  },
  gameTitle: {
    fontFamily: 'Georgia, serif', fontSize: '1.8rem',
    fontWeight: 700, color: '#1e3a2f', marginBottom: 6,
  },
  gameSub: { fontSize: '0.88rem', color: '#6b8f7e', marginBottom: 24 },
  statsBar: {
    display: 'flex', justifyContent: 'center', gap: 40,
    background: '#f0f7f4', borderRadius: 16,
    padding: '14px', marginBottom: 16,
  },
  statItem: { textAlign: 'center' },
  statVal: {
    fontFamily: 'Georgia, serif', fontSize: '1.4rem',
    fontWeight: 700, color: '#4aba8e', transition: 'color 0.3s',
  },
  statLbl: { fontSize: '0.7rem', color: '#6b8f7e', marginTop: 2 },
  gameArea: {
    position: 'relative', height: 340,
    background: 'linear-gradient(180deg, #f0f7f4 0%, #e8f7f1 100%)',
    borderRadius: 20, overflow: 'hidden',
    border: '1.5px solid rgba(74,186,142,0.2)',
    marginBottom: 20,
  },
  startOverlay: {
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: 16, zIndex: 5,
  },
  startEmoji: { fontSize: '3rem' },
  startText: {
    fontSize: '0.9rem', color: '#6b8f7e',
    maxWidth: 260, lineHeight: 1.6,
  },
  startBtn: {
    background: 'linear-gradient(135deg, #4aba8e, #2d9e6e)',
    color: 'white', border: 'none', borderRadius: 14,
    padding: '13px 32px', fontSize: '1rem', fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  finishedBox: {
    background: 'linear-gradient(135deg, #e8f7f1, #d1fae5)',
    border: '1px solid rgba(74,186,142,0.25)',
    borderRadius: 20, padding: '28px',
  },
  finishedEmoji: { fontSize: '2rem', marginBottom: 8 },
  finishedTitle: {
    fontFamily: 'Georgia, serif', fontSize: '1.4rem',
    fontWeight: 700, color: '#1e3a2f', marginBottom: 8,
  },
  finishedScore: { fontSize: '1rem', color: '#1e3a2f', marginBottom: 8 },
  finishedSub: {
    fontSize: '0.85rem', color: '#6b8f7e',
    lineHeight: 1.6, marginBottom: 20,
  },
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
};