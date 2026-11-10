import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';
import { authFetch } from '../../api';


// ── Crisis keywords
const CRISIS_KEYWORDS = [
  'kill myself', 'end my life', 'suicide', "don't want to live",
  'want to die', 'no reason to live', 'hurt myself', 'self harm',
  'जीना नहीं', 'मरना चाहता', 'आत्महत्या', 'বাঁচতে চাই না', 'আত্মহত্যা',
];

function isCrisis(text) {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some(k => lower.includes(k));
}

const CRISIS_REPLY = `I can hear that you're going through something really painful right now. Your feelings are valid, and you deserve real support. 💙

Please connect with one of our counselors who can truly help you through this. You don't have to face this alone.`;

// ── Smart context-aware replies based on message content
function getAutoReply(message) {
  const msg = message.toLowerCase();

  // Greetings
  if (msg.match(/^(hi|hello|hey|hii|helo|namaste|namaskar|hy)[\s!.]*$/)) {
    return "Hello! 😊 I'm so glad you're here. How are you feeling today? You can share anything with me — I'm here to listen. 💚";
  }

  // How are you
  if (msg.includes('how are you') || msg.includes('how r u')) {
    return "I'm always here and ready to support you! 🦚 More importantly — how are *you* feeling today?";
  }

  // Stress / pressure
  if (msg.includes('stress') || msg.includes('pressure') || msg.includes('tensed') || msg.includes('tension') || msg.includes('tense')) {
    return "I can feel how stressed you are right now. 💛 Stress is your mind's way of saying it needs a break.\n\nTry this: Close your eyes, breathe in for 4 seconds, hold for 4, breathe out for 4. Do it 3 times. It genuinely helps. Would you like to tell me more about what's stressing you?";
  }

  // Exam / study
  if (msg.includes('exam') || msg.includes('study') || msg.includes('marks') || msg.includes('result') || msg.includes('fail') || msg.includes('board') || msg.includes('jee') || msg.includes('neet')) {
    return "Exam pressure is one of the hardest things students face. 📚 Please remember — your worth is NOT defined by your marks.\n\nOne tip that really helps: study in 25-minute blocks with 5-minute breaks (Pomodoro technique). Your brain absorbs more this way. You've got this! 💪";
  }

  // Anxiety / fear / scared
  if (msg.includes('anxious') || msg.includes('anxiety') || msg.includes('scared') || msg.includes('fear') || msg.includes('panic') || msg.includes('nervous')) {
    return "Anxiety can feel overwhelming, but you are safe right now. 🌸\n\nTry this grounding exercise: Look around and name 5 things you can see, 4 you can touch, 3 you can hear. It brings your mind back to the present.\n\nWant to talk about what's making you anxious?";
  }

  // Sad / cry / upset
  if (msg.includes('sad') || msg.includes('cry') || msg.includes('crying') || msg.includes('upset') || msg.includes('unhappy') || msg.includes('depressed') || msg.includes('depression')) {
    return "I'm really sorry you're feeling this way. 💙 Sadness is a valid emotion — you don't have to pretend to be okay.\n\nYou're brave for acknowledging how you feel. Would you like to tell me what's been going on? Sometimes just putting it into words helps a lot.";
  }

  // Lonely
  if (msg.includes('lonely') || msg.includes('alone') || msg.includes('no friends') || msg.includes('nobody')) {
    return "Feeling lonely is painful, and I want you to know — you are not alone right now. I'm here. 🤝\n\nOur peer community also has students who feel the same way. Sometimes just knowing others understand makes a big difference. Would you like to check it out?";
  }

  // Sleep problems
  if (msg.includes('sleep') || msg.includes('insomnia') || msg.includes('cant sleep') || msg.includes("can't sleep") || msg.includes('awake')) {
    return "Poor sleep makes everything harder — mood, focus, energy. 😴\n\nA few things that really help: No phone 30 minutes before bed, keep your room cool and dark, and try the 4-7-8 breathing method (inhale 4s, hold 7s, exhale 8s).\n\nHow long has sleep been a problem for you?";
  }

  // Anger
  if (msg.includes('angry') || msg.includes('anger') || msg.includes('frustrated') || msg.includes('irritated') || msg.includes('annoyed')) {
    return "It's completely okay to feel angry. 🔥 Anger usually means something important to you isn't being respected.\n\nWhen you feel it rising: step away for 2 minutes, splash cold water on your face, or write down exactly what's making you angry. Getting it out of your head helps.\n\nWhat happened?";
  }

  // Family / parents
  if (msg.includes('parents') || msg.includes('family') || msg.includes('mom') || msg.includes('dad') || msg.includes('father') || msg.includes('mother')) {
    return "Family relationships can be really complicated, especially when there's pressure around studies or life choices. 💛\n\nIt might help to have a calm conversation when everyone is relaxed — not in the middle of a conflict. Would you like to share more about the situation?";
  }

  // Thank you
  if (msg.includes('thank') || msg.includes('thanks') || msg.includes('shukriya') || msg.includes('dhanyawad')) {
    return "You're so welcome! 🦚 I'm always here whenever you need to talk. Take care of yourself — you matter. 💚";
  }

  // Motivation
  if (msg.includes('motivat') || msg.includes('inspire') || msg.includes('feel good') || msg.includes('positive')) {
    return "Here's something I want you to remember today: 🌟\n\n*Every expert was once a beginner. Every mountain was once just a small hill.*\n\nYou are growing every single day — even when it doesn't feel like it. What's one small goal you can set for today?";
  }

  // OK / fine / good
  if (msg.match(/^(ok|okay|fine|good|great|alright|hmm|hm|k)[\s.!]*$/)) {
    return "Glad to hear that! 😊 Remember I'm always here if you ever want to talk about anything — big or small. Is there anything on your mind today?";
  }

  // Default
  return "Thank you for sharing that with me. 💚 I want to make sure I understand you properly — could you tell me a little more about how you're feeling? I'm here to listen without any judgment.";
}

export default function Chat() {
  const navigate = useNavigate();         // Get the real logged-in altius_id (whatever your app stores it as)      
  const altiusId = localStorage.getItem('altius_id') || JSON.parse(localStorage.getItem('user') || '{}')?.altius_id || '—';
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! I'm Altius 🦚 — your personal wellness companion. I'm here to listen, support, and help you feel better. How are you feeling today?",
      time: getTime(),
    }
  ]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [language, setLanguage]       = useState('en');
  const [isListening, setIsListening] = useState(false);
  const [crisisModal, setCrisisModal] = useState(false);
  const [speaking, setSpeaking]       = useState(false);

  const bottomRef      = useRef(null);
  const inputRef       = useRef(null);
  const recognitionRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── Send message
  async function sendMessage(text) {
    const msg = (text || input).trim();
    if (!msg) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg, time: getTime() }]);
    setLoading(true);

    // Crisis check first
    if (isCrisis(msg)) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: CRISIS_REPLY,
          time: getTime(),
          isCrisis: true,
        }]);
        setLoading(false);
        setCrisisModal(true);
      }, 800);
      return;
    }

    const metaLangQuestion = /(why|kano|kyun|kyu|kayo).*(hindi|bangla|bengali|english)/i;
    if (metaLangQuestion.test(msg)) {
      const reminder = {
        en:  `I'm set to reply in English. Is there something you'd like to talk about?`,
        hi:  `मैं हिंदी में उत्तर देने के लिए सेट हूँ। क्या आप कुछ बात करना चाहेंगे?`,
        ben: `আমি বাংলায় উত্তর দেওয়ার জন্য সেট আছি। আপনি কী নিয়ে কথা বলতে চান?`,
      };
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: reminder[language] || reminder.en,
        time: getTime(),
      }]);
      setLoading(false);
      return;
    }

    // Try real backend first, fallback to smart auto reply
  try {
  const res = await authFetch(`${API_URL}/api/chatbot/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ altius_id: altiusId, message: msg, language }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // 👇 log the REAL reason so you can see it
    console.error('Chatbot API failed:', res.status, data);
    throw new Error(data.error || data.details || `HTTP ${res.status}`);
  }

  setMessages(prev => [...prev, {
    role: 'assistant',
    text: data.reply,
    time: getTime(),
    isCrisis: data.isCrisis,
  }]);
  if (data.isCrisis) setCrisisModal(true);
} catch (err) {
  console.error('Chatbot request error:', err);
  setMessages(prev => [...prev, {
    role: 'assistant',
    text: getAutoReply(msg),
    time: getTime(),
  }]);
} finally {
  setLoading(false);
}
  }

  // ── Voice Input
  function toggleVoice() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser. Please use Chrome.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognitionRef.current = recognition;

    recognition.lang        = language === 'hi' ? 'hi-IN' : language === 'ben' ? 'ben-IN' : 'en-US';
    recognition.continuous  = false;
    recognition.interimResults = false;

    recognition.onstart  = () => setIsListening(true);
    recognition.onend    = () => setIsListening(false);
    recognition.onerror  = () => setIsListening(false);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setTimeout(() => sendMessage(transcript), 300);
    };

    recognition.start();
  }

  // ── Voice Output
const [audioPlayer, setAudioPlayer] = useState(null);

async function speakMessage(text) {
  // ── Bengali: use backend TTS (browser Bengali is broken)
  if (language === 'ben') {
    try {
      setSpeaking(true);
      const res = await fetch(`${API_URL}/api/tts/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });

      if (!res.ok) throw new Error('TTS request failed');

      const data = await res.json();
      const audio = new Audio(data.audioUrl);

      audio.onended = () => setSpeaking(false);
      audio.onerror = () => setSpeaking(false);

      await audio.play();
    } catch (err) {
      console.error('Bengali TTS error:', err);
      setSpeaking(false);
    }
    return;
  }

  // ── English / Hindi: unchanged browser TTS
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const utt  = new SpeechSynthesisUtterance(text);
  utt.lang   = language === 'hi' ? 'hi-IN' : 'en-US';
  utt.rate   = 0.92;
  utt.pitch  = 1.05;

  utt.onstart = () => setSpeaking(true);
  utt.onend   = () => setSpeaking(false);
  utt.onerror = () => setSpeaking(false);

  window.speechSynthesis.speak(utt);
}

  function stopSpeaking() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  // ── Quick suggestions
  const suggestions = {
    en: ['I feel stressed about exams 😰', "I can't sleep properly 😴", 'I feel lonely lately 🥺', 'I need some motivation 💪'],
    hi: ['परीक्षा का डर लग रहा है', 'नींद नहीं आ रही', 'अकेला महसूस हो रहा हूं', 'मुझे प्रेरणा चाहिए'],
    ben: ['পরীক্ষা নিয়ে আমি চাপে আছি', 'আমি ঠিকমতো ঘুমাতে পারছি না', 'ইদানীং আমার একা লাগছে', 'আমার কিছুটা অনুপ্রেরণা প্রয়োজন'],
  };

  return (
    <div style={s.page}>
      <div style={s.blob1} /><div style={s.blob2} /><div style={s.dots} />

      {/* ── SIDEBAR */}
      <aside style={s.sidebar}>
        <div style={s.sidebarLogo}>Altius 🦚</div>

        <div style={s.altiusBox}>
          <div style={s.altiusBoxLabel}>Chatting as</div>
          <div style={s.altiusBoxId}>{altiusId}</div>
          <div style={s.altiusBoxSub}>Identity protected 🔒</div>
        </div>

        {/* Language */}
        <div style={s.langSection}>
          <div style={s.langTitle}>Language</div>
          {[['en','English'],['hi','हिंदी'],['ben','বাংলা']].map(([code, label]) => (
            <button
              key={code}
              style={{
                ...s.langBtn,
                background:  language === code ? '#e8f7f1' : 'transparent',
                color:       language === code ? '#4aba8e' : '#6b8f7e',
                fontWeight:  language === code ? 700 : 400,
                borderColor: language === code ? '#b8e8d4' : 'transparent',
              }}
              onClick={() => setLanguage(code)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Info */}
        <div style={s.infoBox}>
          <div style={s.infoItem}>🤖 <span>AI powered by OpenAi</span></div>
          <div style={s.infoItem}>🔒 <span>Conversations are private</span></div>
          <div style={s.infoItem}>💚 <span>Available 24/7</span></div>
          <div style={s.infoItem}>🚨 <span>Crisis detection enabled</span></div>
        </div>

        <div style={s.sidebarBottom}>
          <button style={s.counselorSideBtn} onClick={() => navigate('/student/counselor')}>
            🧑‍⚕️ Talk to Counselor
          </button>
          <button style={s.backBtn} onClick={() => navigate('/student/dashboard')}>
            ← Dashboard
          </button>
        </div>
      </aside>

      {/* ── MAIN CHAT */}
      <main style={s.main}>

        {/* Header */}
        <div style={s.chatHeader}>
          <div style={s.chatHeaderLeft}>
            <div style={s.avatarWrap}>
              <div style={s.avatar}>🦚</div>
              <div style={s.onlineDot} />
            </div>
            <div>
              <div style={s.chatName}>Altuis AI</div>
              <div style={s.chatStatus}>
                {loading ? '✍️ typing...' : speaking ? '🔊 speaking...' : '● Online — always here for you'}
              </div>
            </div>
          </div>
          <div style={s.chatHeaderRight}>
            {speaking && (
              <button style={s.headerBtn} onClick={stopSpeaking}>🔇 Stop</button>
            )}
            <button style={s.headerBtn} onClick={() => setMessages([{
              role: 'assistant',
              text: "Hi! I'm Altius 🦚 — your personal wellness companion. How are you feeling today?",
              time: getTime(),
            }])}>
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={s.messagesArea}>

          {/* Quick suggestions */}
          {messages.length === 1 && (
            <div style={s.suggestionsWrap}>
              <div style={s.suggestionsLabel}>Quick starters 👇</div>
              <div style={s.suggestions}>
                {(suggestions[language] || suggestions.en).map((sug, i) => (
                  <button
                    key={i} style={s.sugChip}
                    onClick={() => sendMessage(sug)}
                    onMouseEnter={e => { e.currentTarget.style.background = '#e8f7f1'; e.currentTarget.style.borderColor = '#4aba8e'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'rgba(74,186,142,0.25)'; }}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg, i) => (
            <div key={i} style={{ ...s.msgRow, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>

              {msg.role === 'assistant' && <div style={s.msgAvatar}>🌿</div>}

              <div style={{ maxWidth: '68%' }}>
                <div style={{
                  ...s.msgBubble,
                  background:   msg.isCrisis  ? '#fff0f4'
                              : msg.role === 'user' ? 'linear-gradient(135deg, #4aba8e, #2d9e6e)'
                              : 'white',
                  color: msg.role === 'user' ? 'white' : '#1e3a2f',
                  borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  border: msg.isCrisis ? '1.5px solid #fca5a5'
                        : msg.role === 'assistant' ? '1px solid rgba(74,186,142,0.15)' : 'none',
                  boxShadow: msg.role === 'user'
                    ? '0 4px 16px rgba(74,186,142,0.3)'
                    : '0 2px 12px rgba(0,0,0,0.06)',
                }}>
                  {msg.isCrisis && <div style={s.crisisTag}>🚨 Crisis Support</div>}
                  <div style={s.msgText}>{msg.text}</div>
                  {msg.isCrisis && (
                    <button style={s.crisisConnectBtn} onClick={() => navigate('/student/counselor')}>
                      Connect to Counselor Now →
                    </button>
                  )}
                </div>

                <div style={{ ...s.msgMeta, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <span style={s.msgTime}>{msg.time}</span>
                  {msg.role === 'assistant' && (
                    <button style={s.speakBtn} onClick={() => speakMessage(msg.text)} title="Listen">🔊</button>
                  )}
                </div>
              </div>

              {msg.role === 'user' && <div style={s.msgAvatarUser}>👤</div>}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ ...s.msgRow, justifyContent: 'flex-start' }}>
              <div style={s.msgAvatar}>🦚</div>
              <div style={s.typingBubble}>
                <span style={s.typingDot} />
                <span style={{ ...s.typingDot, animationDelay: '0.2s' }} />
                <span style={{ ...s.typingDot, animationDelay: '0.4s' }} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div style={s.inputArea}>
          <button
            style={{
              ...s.micBtn,
              background:  isListening ? '#fff0f4' : '#e8f7f1',
              borderColor: isListening ? '#f43f5e' : '#b8e8d4',
            }}
            onClick={toggleVoice}
            title={isListening ? 'Stop listening' : 'Speak your message'}
          >
            {isListening ? '⏹️' : '🎤'}
          </button>

          <input
            ref={inputRef}
            style={s.textInput}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={
              isListening ? '🎤 Listening... speak now'
              : language === 'hi' ? 'यहाँ टाइप करें...'
              : language === 'ben' ? 'শুনছি... এখন বলুন'
              : 'Type your message here...'
            }
            disabled={loading || isListening}
          />

          <button
            style={{
              ...s.sendBtn,
              opacity: (!input.trim() || loading) ? 0.5 : 1,
              cursor:  (!input.trim() || loading) ? 'not-allowed' : 'pointer',
            }}
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            ➤
          </button>
        </div>

        <div style={s.inputNote}>
          Press Enter to send · 🎤 for voice · 🔊 to hear responses · Altuis AI is not a replacement for professional help
        </div>
      </main>

      {/* ── CRISIS MODAL */}
      {crisisModal && (
        <div style={s.overlay}>
          <div style={s.crisisModal}>
            <div style={s.crisisModalIcon}>💜</div>
            <div style={s.crisisModalTitle}>You Are Not Alone</div>
            <div style={s.crisisModalText}>
              It sounds like you're going through something very painful right now.
              Please reach out to one of our counselors — they are kind,
              non-judgmental, and here specifically to support you.
            </div>
            <button
              style={s.crisisModalBtn}
              onClick={() => { setCrisisModal(false); navigate('/student/counselor'); }}
            >
              Connect with a Counselor Now →
            </button>
            <button style={s.crisisModalSkip} onClick={() => setCrisisModal(false)}>
              Stay and keep chatting
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes typingBounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const s = {
  page: {
    display: 'flex', height: '100vh', overflow: 'hidden',
    background: '#f0f7f4',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    position: 'relative',
  },
  blob1: {
    position: 'fixed', width: 500, height: 500, borderRadius: '50%',
    background: '#b8f0dc', filter: 'blur(80px)', opacity: 0.25,
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
  sidebar: {
    width: 240, flexShrink: 0, zIndex: 10,
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(74,186,142,0.15)',
    display: 'flex', flexDirection: 'column',
    padding: '24px 16px',
    height: '100vh', overflowY: 'auto',
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
  altiusBoxLabel: {
    fontSize: '0.62rem', color: '#6b8f7e', fontWeight: 700,
    letterSpacing: 1, textTransform: 'uppercase',
  },
  altiusBoxId: { fontSize: '0.95rem', fontWeight: 800, color: '#1e3a2f', marginTop: 3 },
  altiusBoxSub: { fontSize: '0.62rem', color: '#6b8f7e', marginTop: 2 },
  langSection: { marginBottom: 20 },
  langTitle: {
    fontSize: '0.68rem', fontWeight: 700, color: '#6b8f7e',
    letterSpacing: 1, textTransform: 'uppercase',
    marginBottom: 8, paddingLeft: 8,
  },
  langBtn: {
    display: 'block', width: '100%', textAlign: 'left',
    padding: '9px 12px', borderRadius: 10,
    border: '1.5px solid transparent',
    cursor: 'pointer', fontSize: '0.85rem',
    fontFamily: 'inherit', marginBottom: 4, transition: 'all 0.2s',
  },
  infoBox: {
    background: '#f8fffe', border: '1px solid rgba(74,186,142,0.15)',
    borderRadius: 14, padding: 14, marginBottom: 20,
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  infoItem: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#6b8f7e' },
  sidebarBottom: { marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 },
  counselorSideBtn: {
    background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
    color: 'white', border: 'none', borderRadius: 12,
    padding: 11, cursor: 'pointer', fontSize: '0.82rem',
    fontWeight: 600, fontFamily: 'inherit',
  },
  backBtn: {
    background: 'none', border: '1px solid rgba(74,186,142,0.25)',
    borderRadius: 10, padding: 10, cursor: 'pointer',
    color: '#6b8f7e', fontSize: '0.82rem', fontFamily: 'inherit',
  },
  main: {
    flex: 1, display: 'flex', flexDirection: 'column',
    height: '100vh', overflow: 'hidden',
    position: 'relative', zIndex: 1,
  },
  chatHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 28px',
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(74,186,142,0.15)',
    flexShrink: 0,
  },
  chatHeaderLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 44, height: 44, borderRadius: '50%',
    background: 'linear-gradient(135deg, #e8f7f1, #b8f0dc)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.3rem', border: '2px solid rgba(74,186,142,0.3)',
  },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 10, height: 10, borderRadius: '50%',
    background: '#4aba8e', border: '2px solid white',
  },
  chatName: { fontSize: '1rem', fontWeight: 700, color: '#1e3a2f' },
  chatStatus: { fontSize: '0.75rem', color: '#6b8f7e', marginTop: 2 },
  chatHeaderRight: { display: 'flex', gap: 8 },
  headerBtn: {
    background: '#f0f7f4', border: '1px solid rgba(74,186,142,0.2)',
    borderRadius: 10, padding: '7px 14px', cursor: 'pointer',
    fontSize: '0.78rem', color: '#6b8f7e', fontFamily: 'inherit',
  },
  messagesArea: {
    flex: 1, overflowY: 'auto',
    padding: '24px 28px',
    display: 'flex', flexDirection: 'column', gap: 16,
  },
  suggestionsWrap: { marginBottom: 8 },
  suggestionsLabel: { fontSize: '0.78rem', color: '#6b8f7e', marginBottom: 10 },
  suggestions: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  sugChip: {
    background: 'white', border: '1.5px solid rgba(74,186,142,0.25)',
    borderRadius: 20, padding: '8px 16px', cursor: 'pointer',
    fontSize: '0.82rem', color: '#1e3a2f', fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: 10 },
  msgAvatar: {
    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg, #e8f7f1, #b8f0dc)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.9rem', border: '1.5px solid rgba(74,186,142,0.2)',
  },
  msgAvatarUser: {
    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
    background: '#f0f7f4', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '0.9rem',
    border: '1.5px solid rgba(74,186,142,0.2)',
  },
  msgBubble: { padding: '14px 18px', lineHeight: 1.65 },
  crisisTag: {
    fontSize: '0.7rem', fontWeight: 700, color: '#f43f5e',
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  msgText: { fontSize: '0.92rem', whiteSpace: 'pre-wrap' },
  crisisConnectBtn: {
    display: 'block', marginTop: 12,
    background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
    color: 'white', border: 'none', borderRadius: 10,
    padding: '10px 16px', cursor: 'pointer',
    fontSize: '0.82rem', fontWeight: 700,
    fontFamily: 'inherit', width: '100%', textAlign: 'center',
  },
  msgMeta: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, paddingLeft: 4 },
  msgTime: { fontSize: '0.68rem', color: '#94a3b8' },
  speakBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '0.8rem', padding: '0 2px', opacity: 0.6,
  },
  typingBubble: {
    background: 'white', border: '1px solid rgba(74,186,142,0.15)',
    borderRadius: '20px 20px 20px 4px',
    padding: '14px 18px',
    display: 'flex', alignItems: 'center', gap: 5,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  typingDot: {
    display: 'inline-block',
    width: 8, height: 8, borderRadius: '50%',
    background: '#4aba8e', opacity: 0.4,
    animation: 'typingBounce 1s ease infinite',
  },
  inputArea: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '16px 24px',
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(74,186,142,0.15)',
    flexShrink: 0,
  },
  micBtn: {
    width: 46, height: 46, borderRadius: '50%',
    border: '1.5px solid', cursor: 'pointer',
    fontSize: '1.1rem', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s',
  },
  textInput: {
    flex: 1, padding: '13px 18px',
    background: '#f0f7f4',
    border: '1.5px solid rgba(74,186,142,0.2)',
    borderRadius: 14, fontFamily: 'inherit',
    fontSize: '0.92rem', color: '#1e3a2f', outline: 'none',
  },
  sendBtn: {
    width: 46, height: 46, borderRadius: '50%',
    background: 'linear-gradient(135deg, #4aba8e, #2d9e6e)',
    border: 'none', cursor: 'pointer',
    fontSize: '1.1rem', color: 'white', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'opacity 0.2s',
  },
  inputNote: {
    textAlign: 'center', fontSize: '0.7rem', color: '#94a3b8',
    padding: '4px 24px 10px', flexShrink: 0,
  },
  overlay: {
    position: 'fixed', inset: 0, zIndex: 300,
    background: 'rgba(30,58,47,0.3)',
    backdropFilter: 'blur(12px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24,
  },
  crisisModal: {
    background: 'white', borderRadius: 28,
    padding: '48px 40px', maxWidth: 460, width: '100%',
    textAlign: 'center',
    boxShadow: '0 32px 80px rgba(0,0,0,0.15)',
    border: '2px solid rgba(167,139,250,0.3)',
  },
  crisisModalIcon: { fontSize: '3rem', marginBottom: 16 },
  crisisModalTitle: {
    fontFamily: 'Georgia, serif', fontSize: '1.6rem',
    fontWeight: 700, color: '#1e3a2f', marginBottom: 14,
  },
  crisisModalText: {
    fontSize: '0.92rem', color: '#6b8f7e',
    lineHeight: 1.75, marginBottom: 28,
  },
  crisisModalBtn: {
    display: 'block', width: '100%', padding: 15,
    background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
    color: 'white', border: 'none', borderRadius: 14,
    fontSize: '0.95rem', fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit', marginBottom: 12,
  },
  crisisModalSkip: {
    background: 'none', border: 'none', color: '#6b8f7e',
    fontSize: '0.85rem', cursor: 'pointer',
    fontFamily: 'inherit', textDecoration: 'underline',
  },
};