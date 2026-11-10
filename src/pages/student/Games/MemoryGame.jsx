import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EMOJIS = ['🌿','🌸','🦋','🌈','⭐','🍀','🌻','🎯'];

function createDeck() {
  const pairs = [...EMOJIS, ...EMOJIS];
  return pairs
    .sort(() => Math.random() - 0.5)
    .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
}

export default function MemoryGame() {
  const navigate = useNavigate();
  const [cards,    setCards]    = useState(createDeck());
  const [selected, setSelected] = useState([]);
  const [moves,    setMoves]    = useState(0);
  const [matches,  setMatches]  = useState(0);
  const [time,     setTime]     = useState(0);
  const [running,  setRunning]  = useState(false);
  const [finished, setFinished] = useState(false);
  const [locked,   setLocked]   = useState(false);

  // Timer
  useEffect(() => {
    if (!running || finished) return;
    const t = setInterval(() => setTime(prev => prev + 1), 1000);
    return () => clearInterval(t);
  }, [running, finished]);

  // Check match
  useEffect(() => {
    if (selected.length !== 2) return;
    setLocked(true);
    const [a, b] = selected;

    if (cards[a].emoji === cards[b].emoji) {
      // Match!
      setCards(prev => prev.map((c, i) =>
        i === a || i === b ? { ...c, matched: true } : c
      ));
      const newMatches = matches + 1;
      setMatches(newMatches);
      setSelected([]);
      setLocked(false);
      if (newMatches === EMOJIS.length) {
        setFinished(true);
        setRunning(false);
      }
    } else {
      // No match — flip back
      setTimeout(() => {
        setCards(prev => prev.map((c, i) =>
          i === a || i === b ? { ...c, flipped: false } : c
        ));
        setSelected([]);
        setLocked(false);
      }, 900);
    }
  }, [selected]);

  function flipCard(idx) {
    if (locked || cards[idx].flipped || cards[idx].matched) return;
    if (selected.length === 2) return;

    if (!running) setRunning(true);

    setCards(prev => prev.map((c, i) =>
      i === idx ? { ...c, flipped: true } : c
    ));
    setSelected(prev => [...prev, idx]);
    setMoves(prev => prev + 1);
  }

  function resetGame() {
    setCards(createDeck());
    setSelected([]);
    setMoves(0);
    setMatches(0);
    setTime(0);
    setRunning(false);
    setFinished(false);
    setLocked(false);
  }

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  function getStars() {
    if (moves <= 16) return 3;
    if (moves <= 24) return 2;
    return 1;
  }

  return (
    <div style={s.page}>
      <div style={s.blob1} /><div style={s.blob2} /><div style={s.dots} />

      <div style={s.wrap}>
        <button style={s.backBtn} onClick={() => navigate('/student/resources')}>
          ← Back to Resources
        </button>

        <div style={s.card}>
          <div style={s.gameTitle}>🧠 Memory Match</div>
          <div style={s.gameSub}>Find all matching pairs to win!</div>

          {/* Stats bar */}
          <div style={s.statsBar}>
            <div style={s.statItem}>
              <div style={s.statVal}>{moves}</div>
              <div style={s.statLbl}>Moves</div>
            </div>
            <div style={s.statItem}>
              <div style={s.statVal}>{matches}/{EMOJIS.length}</div>
              <div style={s.statLbl}>Pairs</div>
            </div>
            <div style={s.statItem}>
              <div style={s.statVal}>{formatTime(time)}</div>
              <div style={s.statLbl}>Time</div>
            </div>
          </div>

          {/* Grid */}
          <div style={s.grid}>
            {cards.map((card, idx) => (
              <div
                key={card.id}
                style={{
                  ...s.cardOuter,
                  cursor: card.matched || card.flipped ? 'default' : 'pointer',
                }}
                onClick={() => flipCard(idx)}
              >
                <div style={{
                  ...s.cardInner,
                  background: card.matched ? 'linear-gradient(135deg, #e8f7f1, #d1fae5)'
                            : card.flipped ? 'white'
                            : 'linear-gradient(135deg, #4aba8e, #2d9e6e)',
                  border: card.matched ? '2px solid #4aba8e'
                        : card.flipped ? '2px solid rgba(74,186,142,0.3)'
                        : '2px solid transparent',
                  transform: card.flipped || card.matched ? 'rotateY(180deg)' : 'rotateY(0)',
                  boxShadow: card.flipped || card.matched
                    ? '0 4px 16px rgba(74,186,142,0.2)'
                    : '0 2px 8px rgba(0,0,0,0.1)',
                }}>
                  {(card.flipped || card.matched) ? (
                    <span style={s.cardEmoji}>{card.emoji}</span>
                  ) : (
                    <span style={s.cardBack}>?</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button style={s.resetBtn} onClick={resetGame}>🔄 New Game</button>

          {/* Finished overlay */}
          {finished && (
            <div style={s.finishedOverlay}>
              <div style={s.finishedBox}>
                <div style={s.finishedEmoji}>
                  {'⭐'.repeat(getStars())}
                </div>
                <div style={s.finishedTitle}>You Won! 🎉</div>
                <div style={s.finishedStats}>
                  <div style={s.fStat}>
                    <div style={s.fStatVal}>{moves}</div>
                    <div style={s.fStatLbl}>Moves</div>
                  </div>
                  <div style={s.fStat}>
                    <div style={s.fStatVal}>{formatTime(time)}</div>
                    <div style={s.fStatLbl}>Time</div>
                  </div>
                  <div style={s.fStat}>
                    <div style={s.fStatVal}>{'⭐'.repeat(getStars())}</div>
                    <div style={s.fStatLbl}>Stars</div>
                  </div>
                </div>
                <div style={s.finishedSub}>
                  Great job! Memory games improve focus and concentration. 🧠
                </div>
                <div style={s.finishedBtns}>
                  <button style={s.againBtn} onClick={resetGame}>Play Again</button>
                  <button style={s.doneBtn} onClick={() => navigate('/student/resources')}>
                    Back to Resources
                  </button>
                </div>
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
    padding: '36px 28px', textAlign: 'center',
    boxShadow: '0 8px 40px rgba(0,0,0,0.07)',
    position: 'relative', overflow: 'hidden',
  },
  gameTitle: {
    fontFamily: 'Georgia, serif', fontSize: '1.8rem',
    fontWeight: 700, color: '#1e3a2f', marginBottom: 6,
  },
  gameSub: { fontSize: '0.88rem', color: '#6b8f7e', marginBottom: 24 },
  statsBar: {
    display: 'flex', justifyContent: 'center', gap: 32,
    background: '#f0f7f4', borderRadius: 16,
    padding: '14px', marginBottom: 24,
  },
  statItem: { textAlign: 'center' },
  statVal: {
    fontFamily: 'Georgia, serif', fontSize: '1.3rem',
    fontWeight: 700, color: '#4aba8e',
  },
  statLbl: { fontSize: '0.7rem', color: '#6b8f7e', marginTop: 2 },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 10, marginBottom: 20,
  },
  cardOuter: {
    aspectRatio: '1', perspective: 600,
  },
  cardInner: {
    width: '100%', height: '100%', borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.35s ease',
    minHeight: 72,
  },
  cardEmoji: { fontSize: '1.8rem' },
  cardBack: {
    fontSize: '1.4rem', color: 'rgba(255,255,255,0.7)',
    fontWeight: 700,
  },
  resetBtn: {
    background: '#f0f7f4', border: '1.5px solid rgba(74,186,142,0.25)',
    borderRadius: 12, padding: '10px 24px', cursor: 'pointer',
    fontSize: '0.85rem', color: '#6b8f7e', fontFamily: 'inherit',
  },
  finishedOverlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(240,247,244,0.95)',
    backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 28, zIndex: 10,
  },
  finishedBox: { textAlign: 'center', padding: '32px' },
  finishedEmoji: { fontSize: '2.5rem', marginBottom: 12 },
  finishedTitle: {
    fontFamily: 'Georgia, serif', fontSize: '1.6rem',
    fontWeight: 700, color: '#1e3a2f', marginBottom: 20,
  },
  finishedStats: { display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 16 },
  fStat: { textAlign: 'center' },
  fStatVal: {
    fontFamily: 'Georgia, serif', fontSize: '1.4rem',
    fontWeight: 700, color: '#4aba8e',
  },
  fStatLbl: { fontSize: '0.72rem', color: '#6b8f7e', marginTop: 2 },
  finishedSub: {
    fontSize: '0.88rem', color: '#6b8f7e',
    lineHeight: 1.6, marginBottom: 24, maxWidth: 320, margin: '0 auto 24px',
  },
  finishedBtns: { display: 'flex', gap: 12, marginTop: 20 },
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