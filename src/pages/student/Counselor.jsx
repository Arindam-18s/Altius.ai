import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const COUNSELORS = [
  {
    id: 1,
    name: 'Dr. Priya Sharma',
    avatar: '👩‍⚕️',
    title: 'Clinical Psychologist',
    specialties: ['Anxiety', 'Exam Stress', 'Depression'],
    languages: ['English', 'Hindi'],
    experience: '8 years',
    rating: 4.9,
    reviews: 124,
    bio: 'Dr. Priya specializes in helping students manage academic pressure and anxiety. She uses CBT and mindfulness-based approaches in a warm, non-judgmental space.',
    available: true,
    color: '#e8f7f1',
    accent: '#4aba8e',
  },
  {
    id: 2,
    name: 'Mr. Arjun Mehta',
    avatar: '🧑‍⚕️',
    title: 'Counselling Psychologist',
    specialties: ['Stress', 'Family Issues', 'Self-esteem'],
    languages: ['English', 'Hindi', 'Marathi'],
    experience: '5 years',
    rating: 4.8,
    reviews: 89,
    bio: 'Arjun focuses on helping students navigate family pressures and build self-confidence. He creates a very comfortable environment for students to open up.',
    available: true,
    color: '#ede9fe',
    accent: '#a78bfa',
  },
  {
    id: 3,
    name: 'Ms. Kavya Nair',
    avatar: '👩‍💼',
    title: 'Student Wellness Counselor',
    specialties: ['Loneliness', 'Social Anxiety', 'Motivation'],
    languages: ['English', 'Marathi'],
    experience: '4 years',
    rating: 4.7,
    reviews: 67,
    bio: 'Kavya is passionate about student wellness and peer relationships. She helps students build social confidence and find motivation in their personal journey.',
    available: false,
    color: '#fff0e8',
    accent: '#fb923c',
  },
];

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '2:00 PM', '2:30 PM', '3:00 PM',
  '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM',
];
const TAKEN_SLOTS = ['9:30 AM', '10:30 AM', '2:30 PM', '4:00 PM'];

// ── Crisis keywords (checked FIRST, highest priority)
const CRISIS_KEYWORDS = [
  'want to die', 'kill myself', 'end my life', 'suicide', "don't want to live",
  'dont want to live', 'no reason to live', 'hurt myself', 'self harm', 'selfharm',
  'want to disappear', 'better off dead', 'not want to live', 'cant go on',
  "can't go on", 'end it all', 'no point living', 'rather be dead',
  'जीना नहीं', 'मरना चाहता', 'आत्महत्या', 'मरना है',
];

function getCounselorReply(message) {
  const msg = message.toLowerCase().trim();

  // ── 1. CRISIS — always checked first
  if (CRISIS_KEYWORDS.some(k => msg.includes(k))) {
    return `I hear you, and I want you to know — what you just shared matters deeply to me. 💙

Please know you are not alone in this moment. I am right here with you.

Can you tell me what's been happening that brought you to this point? I'm not going anywhere. Take your time. You are safe here.

📞 iCall Helpline: 9152987821 (free, confidential, available now)`;
  }

  // ── 2. NOT FEELING WELL
  if (msg.includes('not feeling good') || msg.includes('not feeling well') ||
      msg.includes('feeling bad') || msg.includes('feel bad') || msg.includes('feel terrible') ||
      msg.includes('not well') || msg.includes('not good') || msg.includes('feel awful')) {
    return `I'm sorry to hear you're not feeling good right now. 💙 Thank you for reaching out — that takes courage.

Can you tell me a little more about what's going on? Is it more of a physical feeling, an emotional one, or both? I'm here to listen. 🌿`;
  }

  // ── 3. GREETINGS
  if (msg.match(/^(hi+|hello+|hey+|hii+|helo|namaste|namaskar|good morning|good afternoon|good evening)[\s!.]*$/)) {
    return `Hello! I'm so glad you reached out today. This is a safe and confidential space — please share whatever is on your mind. How are you feeling right now? 💙`;
  }

  // ── 4. HOW ARE YOU
  if (msg.includes('how are you') || msg.includes('how r u') || msg.includes('how are u')) {
    return `I'm here and fully present for you! More importantly — how are *you* feeling today? Please share whatever is on your mind. 🌿`;
  }

  // ── 5. ANXIETY / PANIC / FEAR
  if (msg.includes('anxious') || msg.includes('anxiety') || msg.includes('panic') ||
      msg.includes('panic attack') || msg.includes('nervous') || msg.includes('scared') ||
      msg.includes('fear') || msg.includes('phobia') || msg.includes('worried') || msg.includes('worry')) {
    return `I hear you — anxiety can feel really overwhelming, especially when you're already under pressure. Thank you for trusting me with this. 🌸

Can you tell me more about what's been triggering these feelings? I want to understand your situation fully so I can support you better.`;
  }

  // ── 6. EXAM / STUDY / MARKS / RESULT
  if (msg.includes('exam') || msg.includes('study') || msg.includes('marks') || msg.includes('score') ||
      msg.includes('fail') || msg.includes('failed') || msg.includes('result') || msg.includes('board') ||
      msg.includes('jee') || msg.includes('neet') || msg.includes('competitive') || msg.includes('rank')) {
    return `Exam pressure is something many students carry silently, and it can feel unbearable at times. I want you to know — your worth is not defined by your grades or rank. 💚

Let's talk about what's worrying you the most right now. What's going on with your studies?`;
  }

  // ── 7. SAD / DEPRESSED / HOPELESS / CRYING
  if (msg.includes('sad') || msg.includes('depress') || msg.includes('cry') || msg.includes('crying') ||
      msg.includes('unhappy') || msg.includes('hopeless') || msg.includes('worthless') ||
      msg.includes('empty') || msg.includes('numb') || msg.includes('broken') || msg.includes('hurt')) {
    return `Thank you for trusting me with this. Feeling sad, empty, or hopeless is really painful — and it takes real courage to talk about it. 💙

You don't have to carry this alone. Would you like to share what's been weighing on your heart lately? I'm here to listen without any judgment.`;
  }

  // ── 8. STRESS / PRESSURE / OVERWHELMED
  if (msg.includes('stress') || msg.includes('stressed') || msg.includes('pressure') ||
      msg.includes('overwhelmed') || msg.includes('too much') || msg.includes('burden') ||
      msg.includes('exhausted') || msg.includes('burnout') || msg.includes('tired of everything')) {
    return `It sounds like you're carrying a lot right now, and that's truly exhausting. 💛

Let's slow down together. Tell me — what's been the heaviest thing on your mind lately? You can share everything here, without any judgment.`;
  }

  // ── 9. PARENTS / FAMILY PRESSURE
  if (msg.includes('parents') || msg.includes('family') || msg.includes('mom') || msg.includes('mum') ||
      msg.includes('dad') || msg.includes('father') || msg.includes('mother') || msg.includes('comparison') ||
      msg.includes('comparing') || msg.includes('relative') || msg.includes('sibling')) {
    return `Family pressure can be really difficult to navigate, especially when you're already dealing with so much. You don't have to handle this alone. 💛

Can you tell me more about what's been happening at home? I want to fully understand what you're going through.`;
  }

  // ── 10. LONELY / ISOLATED / NO FRIENDS
  if (msg.includes('lonely') || msg.includes('alone') || msg.includes('no friends') || msg.includes('no one') ||
      msg.includes('nobody') || msg.includes('isolated') || msg.includes('left out') || msg.includes('rejected')) {
    return `Loneliness is one of the most painful feelings, and I want you to know — you are not alone in this moment. I'm right here with you. 🤝

Many students feel this way, especially during stressful times. What does your day-to-day life feel like right now? I'd like to understand.`;
  }

  // ── 11. SLEEP PROBLEMS
  if (msg.includes('sleep') || msg.includes('insomnia') || msg.includes("can't sleep") ||
      msg.includes('cant sleep') || msg.includes('awake at night') || msg.includes('not sleeping') ||
      msg.includes('nightmares') || msg.includes('oversleeping')) {
    return `Poor sleep affects everything — your mood, energy, focus, and how you see the world. I'm glad you brought this up. 😴

How long has sleep been difficult for you? And do you notice what's on your mind when you can't sleep at night?`;
  }

  // ── 12. ANGRY / FRUSTRATED
  if (msg.includes('angry') || msg.includes('anger') || msg.includes('frustrated') ||
      msg.includes('frustration') || msg.includes('irritated') || msg.includes('annoyed') ||
      msg.includes('rage') || msg.includes('furious')) {
    return `It's completely valid to feel angry or frustrated. Anger often signals that something important to you isn't being respected. 🔥

I'd like to understand — what's been making you feel this way? There's no judgment here at all.`;
  }

  // ── 13. LOW CONFIDENCE / SELF WORTH
  if (msg.includes('confidence') || msg.includes('not good enough') || msg.includes('loser') ||
      msg.includes('failure') || msg.includes('stupid') || msg.includes('dumb') ||
      msg.includes('useless') || msg.includes('hate myself') || msg.includes('self esteem')) {
    return `I want to stop you right there — you are not a failure, and you are not worthless. I hear that you're in a lot of pain right now, and those thoughts can feel very real. 💙

Can you tell me more about when these thoughts started? I want to understand what's been happening for you.`;
  }

  // ── 14. RELATIONSHIP / BREAKUP / FRIENDSHIP
  if (msg.includes('breakup') || msg.includes('break up') || msg.includes('boyfriend') ||
      msg.includes('girlfriend') || msg.includes('relationship') || msg.includes('love') ||
      msg.includes('heartbreak') || msg.includes('friendship') || msg.includes('fight with friend')) {
    return `Relationship pain — whether it's a breakup, a falling out with a friend, or feeling unseen by someone you care about — can be deeply exhausting. 💙

Thank you for sharing this with me. Would you like to tell me what happened? I'm here to listen fully.`;
  }

  // ── 15. THANK YOU
  if (msg.includes('thank') || msg.includes('thanks') || msg.includes('helpful') || msg.includes('better now')) {
    return `You are so welcome. I'm really glad our conversation is helping. 💚

Please remember — you can reach out to me anytime you need support. You're taking a brave step by being here, and you deserve to feel better.`;
  }

  // ── 16. SHORT / UNCLEAR (ok, yes, no, hmm)
  if (msg.match(/^(ok|okay|fine|good|alright|hmm+|hm+|k|yes|no|yeah|nope|sure|maybe|idk|i don't know)[\s.!?]*$/)) {
    return `Take your time — there's no rush here at all. 🌿

Is there something specific on your mind today that you'd like to talk about? Even if it feels small or hard to put into words, I'm here to listen.`;
  }

  // ── 17. DEFAULT — thoughtful, not generic
  return `Thank you for sharing that with me. 💙

What you're going through sounds really significant, and I want to make sure I understand it fully. Could you tell me a little more about how this has been affecting your daily life? I'm listening carefully, and I'm not going anywhere.`;
}

export default function Counselor() {
  const navigate = useNavigate();
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [selectedDate,      setSelectedDate]      = useState('');
  const [selectedSlot,      setSelectedSlot]      = useState('');
  const [sessionType,       setSessionType]       = useState('');
  const [step,              setStep]              = useState('list');
  const [reason,            setReason]            = useState('');

  // Chat session state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput,    setChatInput]    = useState('');
  const [chatLoading,  setChatLoading]  = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  function getNextDays() {
    const days = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        date: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      });
    }
    return days;
  }

  function getTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function startChatWithCounselor(c) {
    setSelectedCounselor(c);
    setChatMessages([{
      role: 'counselor',
      text: `Hello! I'm ${c.name}. I'm really glad you reached out today. This is a safe, confidential space — you can share anything with me. How are you feeling right now? 💙`,
      time: getTime(),
    }]);
    setStep('chatSession');
  }

  function openChoose(counselor) {
    setSelectedCounselor(counselor);
    setSelectedDate('');
    setSelectedSlot('');
    setReason('');
    setSessionType('');
    setStep('choose');
  }

  function openBooking(type) {
    setSessionType(type);
    setStep('book');
  }

  function confirmBooking() {
    if (!selectedDate || !selectedSlot) return;
    setStep('confirm');
  }

  function startCall() {
    setStep('call');
  }

  function sendChatMessage() {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'student', text: msg, time: getTime() }]);
    setChatLoading(true);
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        role: 'counselor',
        text: getCounselorReply(msg),
        time: getTime(),
      }]);
      setChatLoading(false);
    }, 1200 + Math.random() * 800);
  }

  // ── CHAT SESSION SCREEN
  if (step === 'chatSession' && selectedCounselor) {
    return (
      <div style={s.chatPage}>
        <div style={s.blob1} /><div style={s.blob2} /><div style={s.dots} />

        {/* Header */}
        <div style={s.chatHeader}>
          <div style={s.chatHeaderLeft}>
            <div style={s.chatAvatar}>{selectedCounselor.avatar}</div>
            <div>
              <div style={s.chatCounselorName}>{selectedCounselor.name}</div>
              <div style={s.chatCounselorStatus}>
                {chatLoading ? '✍️ typing...' : '● Online — Secure & Confidential'}
              </div>
            </div>
          </div>
          <div style={s.chatHeaderRight}>
            <button
              style={s.switchToVideoBtn}
              onClick={() => { setSessionType('video'); setStep('book'); }}
            >
              🎥 Switch to Video
            </button>
            <button style={s.endChatBtn} onClick={() => setStep('list')}>
              End Session
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={s.chatMessages}>
          <div style={s.chatInfoBanner}>
            🔒 This conversation is private and confidential. Only you and {selectedCounselor.name} can see these messages.
          </div>

          {chatMessages.map((msg, i) => (
            <div key={i} style={{
              ...s.msgRow,
              justifyContent: msg.role === 'student' ? 'flex-end' : 'flex-start',
            }}>
              {msg.role === 'counselor' && (
                <div style={s.msgAvatarCounselor}>{selectedCounselor.avatar}</div>
              )}
              <div style={{ maxWidth: '68%' }}>
                <div style={{
                  ...s.msgBubble,
                  background: msg.role === 'student'
                    ? `linear-gradient(135deg, ${selectedCounselor.accent}, ${selectedCounselor.accent}cc)`
                    : 'white',
                  color: msg.role === 'student' ? 'white' : '#1e3a2f',
                  borderRadius: msg.role === 'student' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  border: msg.role === 'counselor' ? `1px solid ${selectedCounselor.color}` : 'none',
                  boxShadow: msg.role === 'student'
                    ? `0 4px 16px ${selectedCounselor.accent}44`
                    : '0 2px 12px rgba(0,0,0,0.06)',
                }}>
                  <div style={s.msgText}>{msg.text}</div>
                </div>
                <div style={{
                  ...s.msgMeta,
                  justifyContent: msg.role === 'student' ? 'flex-end' : 'flex-start',
                }}>
                  <span style={s.msgTime}>{msg.time}</span>
                </div>
              </div>
              {msg.role === 'student' && (
                <div style={s.msgAvatarStudent}>👤</div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {chatLoading && (
            <div style={{ ...s.msgRow, justifyContent: 'flex-start' }}>
              <div style={s.msgAvatarCounselor}>{selectedCounselor.avatar}</div>
              <div style={s.typingBubble}>
                <span style={s.dot} />
                <span style={{ ...s.dot, animationDelay: '0.2s' }} />
                <span style={{ ...s.dot, animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={s.chatInputArea}>
          <input
            style={s.chatTextInput}
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
            placeholder={`Message ${selectedCounselor.name}...`}
            disabled={chatLoading}
          />
          <button
            style={{
              ...s.chatSendBtn,
              background: `linear-gradient(135deg, ${selectedCounselor.accent}, ${selectedCounselor.accent}cc)`,
              opacity: (!chatInput.trim() || chatLoading) ? 0.5 : 1,
              cursor: (!chatInput.trim() || chatLoading) ? 'not-allowed' : 'pointer',
            }}
            onClick={sendChatMessage}
            disabled={!chatInput.trim() || chatLoading}
          >
            ➤
          </button>
        </div>
        <div style={s.chatNote}>
          Press Enter to send · Everything shared here is confidential
        </div>

        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); opacity: 0.4; }
            50% { transform: translateY(-5px); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // ── VIDEO CALL SCREEN
  if (step === 'call' && selectedCounselor) {
    const roomName = `altius-counselor-${selectedCounselor.id}-${Date.now()}`;
    return (
      <div style={s.callPage}>
        <div style={s.callHeader}>
          <div style={s.callHeaderLeft}>
            <span style={{ fontSize: '1.5rem' }}>{selectedCounselor.avatar}</span>
            <div>
              <div style={s.callName}>Session with {selectedCounselor.name}</div>
              <div style={s.callStatus}>🔴 Live Video Session</div>
            </div>
          </div>
          <button style={s.endCallBtn2} onClick={() => setStep('list')}>End Session</button>
        </div>
        <iframe
          title="Counselor Video Call"
          src={`https://meet.jit.si/${roomName}#config.startWithVideoMuted=false&config.startWithAudioMuted=false&userInfo.displayName=Student+ALTIUS-2025-047`}
          style={s.jitsiFrame}
          allow="camera; microphone; fullscreen; display-capture"
        />
        <div style={s.callNote2}>
          🔒 This session is private and confidential. Only you and your counselor can join this room.
        </div>
      </div>
    );
  }

  // ── CONFIRM SCREEN
  if (step === 'confirm' && selectedCounselor) {
    return (
      <div style={s.page}>
        <div style={s.blob1} /><div style={s.blob2} /><div style={s.dots} />
        <div style={s.centeredWrap}>
          <div style={s.confirmCard}>
            <div style={s.confirmEmoji}>🎉</div>
            <div style={s.confirmTitle}>Session Booked!</div>
            <div style={s.confirmSub}>
              Your session has been confirmed. You'll receive a reminder before the session.
            </div>
            <div style={s.confirmDetails}>
              {[
                ['Counselor', `${selectedCounselor.avatar} ${selectedCounselor.name}`],
                ['Date', new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })],
                ['Time', selectedSlot],
                ['Format', sessionType === 'video' ? '🎥 Video Call (Jitsi)' : '💬 Text Chat'],
                ['Duration', '45 minutes'],
              ].map(([label, value]) => (
                <div key={label} style={s.confirmRow}>
                  <span style={s.confirmLabel}>{label}</span>
                  <span style={s.confirmValue}>{value}</span>
                </div>
              ))}
            </div>
            <div style={s.confirmBtns}>
              <button style={s.joinCallBtn} onClick={startCall}>
                {sessionType === 'video' ? '🎥 Join Video Session Now' : '💬 Start Chat Session Now'}
              </button>
              <button style={s.backDashBtn} onClick={() => navigate('/student/dashboard')}>
                Back to Dashboard
              </button>
            </div>
            <div style={s.confirmNote}>
              💙 Everything you share is confidential. Your counselor is here to support you.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── BOOKING SCREEN
  if (step === 'book' && selectedCounselor) {
    const days = getNextDays();
    return (
      <div style={s.page}>
        <div style={s.blob1} /><div style={s.blob2} /><div style={s.dots} />
        <div style={s.centeredWrap}>
          <button style={s.backLink} onClick={() => setStep('choose')}>← Back</button>
          <div style={s.bookCard}>
            <div style={{ ...s.miniProfile, background: selectedCounselor.color }}>
              <div style={s.miniAvatar}>{selectedCounselor.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={s.miniName}>{selectedCounselor.name}</div>
                <div style={s.miniTitle}>{selectedCounselor.title}</div>
              </div>
              <div style={{
                ...s.sessionTypePill,
                background: sessionType === 'video' ? '#1e3a2f' : '#a78bfa',
              }}>
                {sessionType === 'video' ? '🎥 Video Call' : '💬 Text Chat'}
              </div>
            </div>

            <div style={s.bookSection}>
              <div style={s.bookSectionTitle}>📅 Select a Date</div>
              <div style={s.daysGrid}>
                {days.map(d => (
                  <button
                    key={d.date}
                    style={{
                      ...s.dayBtn,
                      background:  selectedDate === d.date ? selectedCounselor.accent : 'white',
                      color:       selectedDate === d.date ? 'white' : '#1e3a2f',
                      borderColor: selectedDate === d.date ? selectedCounselor.accent : 'rgba(74,186,142,0.2)',
                      fontWeight:  selectedDate === d.date ? 700 : 400,
                    }}
                    onClick={() => { setSelectedDate(d.date); setSelectedSlot(''); }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div style={s.bookSection}>
                <div style={s.bookSectionTitle}>⏰ Select a Time Slot</div>
                <div style={s.slotsGrid}>
                  {TIME_SLOTS.map(slot => {
                    const taken  = TAKEN_SLOTS.includes(slot);
                    const chosen = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        style={{
                          ...s.slotBtn,
                          background:     taken  ? '#f0f7f4' : chosen ? selectedCounselor.accent : 'white',
                          color:          taken  ? '#94a3b8' : chosen ? 'white' : '#1e3a2f',
                          borderColor:    taken  ? 'transparent' : chosen ? selectedCounselor.accent : 'rgba(74,186,142,0.2)',
                          cursor:         taken  ? 'not-allowed' : 'pointer',
                          textDecoration: taken  ? 'line-through' : 'none',
                        }}
                        onClick={() => !taken && setSelectedSlot(slot)}
                        disabled={taken}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedSlot && (
              <div style={s.bookSection}>
                <div style={s.bookSectionTitle}>💬 What would you like to talk about? (optional)</div>
                <textarea
                  style={s.reasonInput}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. I've been feeling very anxious about my upcoming exams..."
                  rows={3}
                  maxLength={300}
                />
                <div style={s.reasonNote}>🔒 Shared only with your counselor to help them prepare.</div>
              </div>
            )}

            <button
              style={{
                ...s.confirmBtn,
                opacity:    (selectedDate && selectedSlot) ? 1 : 0.5,
                cursor:     (selectedDate && selectedSlot) ? 'pointer' : 'not-allowed',
                background: `linear-gradient(135deg, ${selectedCounselor.accent}, ${selectedCounselor.accent}cc)`,
              }}
              onClick={confirmBooking}
              disabled={!selectedDate || !selectedSlot}
            >
              Confirm Booking →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── CHOOSE SESSION TYPE SCREEN
  if (step === 'choose' && selectedCounselor) {
    return (
      <div style={s.page}>
        <div style={s.blob1} /><div style={s.blob2} /><div style={s.dots} />
        <div style={s.centeredWrap}>
          <button style={s.backLink} onClick={() => setStep('list')}>← Back to Counselors</button>
          <div style={s.chooseCard}>
            <div style={{ ...s.chooseBanner, background: selectedCounselor.color }}>
              <div style={s.chooseAvatar}>{selectedCounselor.avatar}</div>
              <div>
                <div style={s.chooseName}>{selectedCounselor.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#6b8f7e', marginTop: 3 }}>{selectedCounselor.title}</div>
              </div>
            </div>

            <div style={s.chooseTitle2}>How would you like to connect?</div>
            <div style={s.chooseSub}>
              Both options are completely private and confidential. Choose what feels comfortable for you.
            </div>

            <div style={s.chooseGrid}>
              {/* Chat option */}
              <div
                style={s.chooseOption}
                onClick={() => startChatWithCounselor(selectedCounselor)}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#a78bfa';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(167,139,250,0.2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(74,186,142,0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{ ...s.chooseIcon, background: '#ede9fe' }}>💬</div>
                <div style={s.chooseOptionTitle}>Text Chat</div>
                <div style={s.chooseOptionDesc}>
                  Type messages back and forth with your counselor. Great if you're not comfortable with video.
                </div>
                <div style={s.chooseOptionTags}>
                  <span style={{ ...s.chooseTag, background: '#ede9fe', color: '#a78bfa' }}>No camera needed</span>
                  <span style={{ ...s.chooseTag, background: '#ede9fe', color: '#a78bfa' }}>Start immediately</span>
                  <span style={{ ...s.chooseTag, background: '#ede9fe', color: '#a78bfa' }}>Most private</span>
                </div>
                <button style={{ ...s.chooseBtn, background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}>
                  Start Chat Now →
                </button>
              </div>

              {/* Video option */}
              <div
                style={s.chooseOption}
                onClick={() => openBooking('video')}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = selectedCounselor.accent;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 12px 32px ${selectedCounselor.accent}33`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(74,186,142,0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{ ...s.chooseIcon, background: selectedCounselor.color }}>🎥</div>
                <div style={s.chooseOptionTitle}>Video Call</div>
                <div style={s.chooseOptionDesc}>
                  A face-to-face session over video. More personal and easier to express yourself.
                </div>
                <div style={s.chooseOptionTags}>
                  <span style={{ ...s.chooseTag, background: selectedCounselor.color, color: selectedCounselor.accent }}>More personal</span>
                  <span style={{ ...s.chooseTag, background: selectedCounselor.color, color: selectedCounselor.accent }}>Book a slot</span>
                  <span style={{ ...s.chooseTag, background: selectedCounselor.color, color: selectedCounselor.accent }}>45 minutes</span>
                </div>
                <button style={{ ...s.chooseBtn, background: `linear-gradient(135deg, ${selectedCounselor.accent}, ${selectedCounselor.accent}cc)` }}>
                  Book Video Session →
                </button>
              </div>
            </div>

            <div style={s.chooseNote}>
              💙 Not sure which to choose? Start with text chat — you can always switch to video later.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── COUNSELOR LIST (default)
  return (
    <div style={s.page}>
      <div style={s.blob1} /><div style={s.blob2} /><div style={s.dots} />

      <aside style={s.sidebar}>
        <div style={s.sidebarLogo}>🌿 Altius</div>
        <div style={s.altiusBox}>
          <div style={s.altiusBoxLabel}>Booking as</div>
          <div style={s.altiusBoxId}>ALTIUS-2025-047</div>
          <div style={s.altiusBoxSub}>Sessions are confidential 🔒</div>
        </div>
        <div style={s.infoBox}>
          <div style={s.infoTitle}>Session Options</div>
          {[
            '💬 Text Chat — start immediately',
            '🎥 Video Call — book a slot',
            '⏱ 45 minutes per session',
            '🔒 Fully confidential',
            '💚 Completely free',
          ].map((item, i) => <div key={i} style={s.infoItem}>{item}</div>)}
        </div>
        <div style={s.infoBox}>
          <div style={s.infoTitle}>How it works</div>
          {[
            '1️⃣ Choose a counselor',
            '2️⃣ Pick chat or video',
            '3️⃣ Connect instantly or book slot',
            '4️⃣ Talk freely — no judgment',
          ].map((item, i) => <div key={i} style={s.infoItem}>{item}</div>)}
        </div>
        <div style={s.sidebarBottom}>
          <button style={s.chatBtn} onClick={() => navigate('/student/chat')}>
            🤖 Chat with Altius AI
          </button>
          <button style={s.backBtn} onClick={() => navigate('/student/dashboard')}>
            ← Dashboard
          </button>
        </div>
      </aside>

      <main style={s.main}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>🧑‍⚕️ Counselor Connect</h1>
            <p style={s.subtitle}>Talk to a professional counselor — via chat or video call, anonymous and free</p>
          </div>
        </div>

        <div style={s.crisisBanner}>
          <span style={{ fontSize: '1.2rem' }}>🚨</span>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>Feeling in crisis right now?</div>
            <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>
              If you're having thoughts of self-harm, please reach out immediately.
            </div>
          </div>
          <button style={s.crisisBtn} onClick={() => navigate('/student/chat')}>
            Talk to Altius Now →
          </button>
        </div>

        <div style={s.counselorGrid}>
          {COUNSELORS.map(c => (
            <div key={c.id} style={{ ...s.counselorCard, border: `1.5px solid ${c.color}` }}>
              <div style={{
                ...s.availBadge,
                background: c.available ? '#e8f7f1' : '#f0f7f4',
                color:      c.available ? '#4aba8e' : '#94a3b8',
              }}>
                {c.available ? '● Available' : '○ Unavailable'}
              </div>
              <div style={{ ...s.counselorTop, background: c.color }}>
                <div style={s.counselorAvatar}>{c.avatar}</div>
                <div style={s.counselorName}>{c.name}</div>
                <div style={s.counselorTitleText}>{c.title}</div>
                <div style={s.ratingRow}>
                  <span>⭐</span>
                  <span style={{ ...s.ratingNum, color: c.accent }}>{c.rating}</span>
                  <span style={s.ratingCount}>({c.reviews} reviews)</span>
                </div>
              </div>
              <div style={s.counselorBody}>
                <div style={s.counselorBio}>{c.bio}</div>
                <div style={s.tagsRow}>
                  {c.specialties.map(sp => (
                    <span key={sp} style={{ ...s.specTag, background: c.color, color: c.accent }}>{sp}</span>
                  ))}
                </div>
                <div style={s.infoRow}>
                  <div style={s.infoChip}>🗣 {c.languages.join(', ')}</div>
                  <div style={s.infoChip}>📅 {c.experience}</div>
                </div>
                {c.available ? (
                  <div style={s.connectBtns}>
                    <button
                      style={{ ...s.connectBtn, background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}
                      onClick={() => startChatWithCounselor(c)}
                    >
                      💬 Chat Now
                    </button>
                    <button
                      style={{ ...s.connectBtn, background: `linear-gradient(135deg, ${c.accent}, ${c.accent}cc)` }}
                      onClick={() => openChoose(c)}
                    >
                      🎥 Book Video
                    </button>
                  </div>
                ) : (
                  <button style={{ ...s.connectBtn, background: '#e2e8f0', color: '#94a3b8', cursor: 'not-allowed', width: '100%' }} disabled>
                    Currently Unavailable
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={s.faqCard}>
          <div style={s.faqTitle}>❓ Frequently Asked Questions</div>
          <div style={s.faqGrid}>
            {[
              { q: 'Is my session truly anonymous?',   a: 'Yes. The counselor only sees your ALTIUS ID, never your real name or identity.' },
              { q: 'Is it really free?',               a: 'Yes, completely free. Altius is built for students and all services are provided at no cost.' },
              { q: 'Can I switch from chat to video?', a: 'Yes! During a chat session you can click "Switch to Video" anytime if you feel comfortable.' },
              { q: 'Will my college know I visited?',  a: 'No. Your data is encrypted and never shared with any institution without your consent.' },
            ].map((item, i) => (
              <div key={i} style={s.faqItem}>
                <div style={s.faqQ}>{item.q}</div>
                <div style={s.faqA}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

const s = {
  page: {
    display: 'flex', minHeight: '100vh', background: '#f0f7f4',
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
    position: 'fixed', top: 0, left: 0, bottom: 0, width: 240, zIndex: 10,
    background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(74,186,142,0.15)',
    display: 'flex', flexDirection: 'column',
    padding: '24px 16px', overflowY: 'auto',
  },
  sidebarLogo: {
    fontFamily: 'Georgia, serif', fontSize: '1.4rem',
    fontWeight: 900, color: '#4aba8e', marginBottom: 20, paddingLeft: 8,
  },
  altiusBox: {
    background: 'linear-gradient(135deg, #e8f7f1, #d1fae5)',
    border: '1px solid rgba(74,186,142,0.25)',
    borderRadius: 14, padding: '12px 14px', marginBottom: 16,
  },
  altiusBoxLabel: { fontSize: '0.62rem', color: '#6b8f7e', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' },
  altiusBoxId: { fontSize: '0.95rem', fontWeight: 800, color: '#1e3a2f', marginTop: 3 },
  altiusBoxSub: { fontSize: '0.62rem', color: '#6b8f7e', marginTop: 2 },
  infoBox: {
    background: '#f8fffe', border: '1px solid rgba(74,186,142,0.15)',
    borderRadius: 14, padding: 14, marginBottom: 12,
  },
  infoTitle: {
    fontSize: '0.68rem', fontWeight: 700, color: '#6b8f7e',
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10,
  },
  infoItem: { fontSize: '0.78rem', color: '#6b8f7e', marginBottom: 7, lineHeight: 1.4 },
  sidebarBottom: { marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 },
  chatBtn: {
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
  main: { marginLeft: 240, flex: 1, padding: '32px 36px', position: 'relative', zIndex: 1 },
  header: { marginBottom: 20 },
  title: {
    fontFamily: 'Georgia, serif', fontSize: '1.8rem',
    fontWeight: 700, color: '#1e3a2f', margin: 0, marginBottom: 6,
  },
  subtitle: { fontSize: '0.88rem', color: '#6b8f7e', margin: 0 },
  crisisBanner: {
    display: 'flex', alignItems: 'center', gap: 14,
    background: 'linear-gradient(135deg, #fff0f4, #fce7f3)',
    border: '1px solid rgba(244,63,94,0.2)',
    borderRadius: 18, padding: '16px 20px', marginBottom: 28, color: '#1e3a2f',
  },
  crisisBtn: {
    marginLeft: 'auto', background: '#f43f5e', color: 'white',
    border: 'none', borderRadius: 12, padding: '10px 18px',
    cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
    fontFamily: 'inherit', whiteSpace: 'nowrap',
  },
  counselorGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 28 },
  counselorCard: {
    background: 'white', borderRadius: 22,
    overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    position: 'relative',
  },
  availBadge: {
    position: 'absolute', top: 14, right: 14,
    fontSize: '0.68rem', fontWeight: 700, padding: '4px 10px', borderRadius: 20, zIndex: 1,
  },
  counselorTop: { padding: '28px 20px 20px', textAlign: 'center' },
  counselorAvatar: { fontSize: '2.8rem', marginBottom: 10 },
  counselorName: {
    fontFamily: 'Georgia, serif', fontSize: '1rem',
    fontWeight: 700, color: '#1e3a2f', marginBottom: 4,
  },
  counselorTitleText: { fontSize: '0.78rem', color: '#6b8f7e', marginBottom: 10 },
  ratingRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 },
  ratingNum: { fontSize: '0.88rem', fontWeight: 700 },
  ratingCount: { fontSize: '0.72rem', color: '#94a3b8' },
  counselorBody: { padding: '16px 20px 20px' },
  counselorBio: { fontSize: '0.82rem', color: '#6b8f7e', lineHeight: 1.65, marginBottom: 14 },
  tagsRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  specTag: { fontSize: '0.68rem', fontWeight: 700, padding: '4px 10px', borderRadius: 20 },
  infoRow: { display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  infoChip: { fontSize: '0.72rem', color: '#6b8f7e', background: '#f0f7f4', borderRadius: 20, padding: '4px 10px' },
  connectBtns: { display: 'flex', gap: 8 },
  connectBtn: {
    flex: 1, padding: '11px 8px', border: 'none', borderRadius: 12,
    color: 'white', fontSize: '0.78rem', fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.2s',
  },
  centeredWrap: { position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto', padding: '32px 24px' },
  backLink: {
    background: 'none', border: 'none', color: '#6b8f7e',
    fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'inherit',
    marginBottom: 20, padding: 0, display: 'block',
  },
  chooseCard: {
    background: 'white', borderRadius: 24, padding: 32,
    boxShadow: '0 8px 40px rgba(0,0,0,0.07)',
  },
  chooseBanner: {
    display: 'flex', alignItems: 'center', gap: 14,
    borderRadius: 16, padding: '16px 20px', marginBottom: 28,
  },
  chooseAvatar: { fontSize: '2rem' },
  chooseName: { fontFamily: 'Georgia, serif', fontSize: '1.05rem', fontWeight: 700, color: '#1e3a2f' },
  chooseTitle2: {
    fontFamily: 'Georgia, serif', fontSize: '1.3rem',
    fontWeight: 700, color: '#1e3a2f', marginBottom: 8, textAlign: 'center',
  },
  chooseSub: {
    fontSize: '0.88rem', color: '#6b8f7e', lineHeight: 1.7,
    textAlign: 'center', marginBottom: 28, maxWidth: 480, margin: '0 auto 28px',
  },
  chooseGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
  chooseOption: {
    border: '2px solid rgba(74,186,142,0.2)', borderRadius: 20,
    padding: 24, textAlign: 'center', cursor: 'pointer',
    transition: 'all 0.25s', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  },
  chooseIcon: {
    width: 56, height: 56, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.6rem', margin: '0 auto 14px',
  },
  chooseOptionTitle: {
    fontFamily: 'Georgia, serif', fontSize: '1.1rem',
    fontWeight: 700, color: '#1e3a2f', marginBottom: 8,
  },
  chooseOptionDesc: { fontSize: '0.82rem', color: '#6b8f7e', lineHeight: 1.65, marginBottom: 14 },
  chooseOptionTags: { display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 18 },
  chooseTag: { fontSize: '0.68rem', fontWeight: 700, padding: '4px 10px', borderRadius: 20 },
  chooseBtn: {
    width: '100%', padding: 12, border: 'none', borderRadius: 12,
    color: 'white', fontSize: '0.85rem', fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  chooseNote: {
    textAlign: 'center', fontSize: '0.82rem', color: '#6b8f7e', lineHeight: 1.6, marginTop: 4,
  },
  sessionTypePill: {
    color: 'white', fontSize: '0.72rem',
    fontWeight: 700, padding: '5px 12px', borderRadius: 20,
  },
  bookCard: { background: 'white', borderRadius: 24, padding: 28, boxShadow: '0 8px 40px rgba(0,0,0,0.07)' },
  miniProfile: { display: 'flex', alignItems: 'center', gap: 14, borderRadius: 16, padding: '16px 20px', marginBottom: 24 },
  miniAvatar: { fontSize: '2rem' },
  miniName: { fontFamily: 'Georgia, serif', fontSize: '1.05rem', fontWeight: 700, color: '#1e3a2f' },
  miniTitle: { fontSize: '0.78rem', color: '#6b8f7e', marginTop: 3 },
  bookSection: { marginBottom: 24 },
  bookSectionTitle: { fontSize: '0.85rem', fontWeight: 700, color: '#1e3a2f', marginBottom: 12 },
  daysGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  dayBtn: {
    padding: '10px 8px', border: '1.5px solid', borderRadius: 12,
    cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit',
    transition: 'all 0.2s', textAlign: 'center',
  },
  slotsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  slotBtn: {
    padding: 10, border: '1.5px solid', borderRadius: 10,
    fontSize: '0.78rem', fontFamily: 'inherit', transition: 'all 0.2s',
  },
  reasonInput: {
    width: '100%', padding: '12px 16px',
    background: '#f8fffe', border: '1.5px solid rgba(74,186,142,0.2)',
    borderRadius: 12, fontFamily: 'inherit', fontSize: '0.88rem',
    color: '#1e3a2f', resize: 'none', outline: 'none',
    lineHeight: 1.65, boxSizing: 'border-box', marginBottom: 8,
  },
  reasonNote: { fontSize: '0.72rem', color: '#94a3b8' },
  confirmBtn: {
    width: '100%', padding: 14, border: 'none', borderRadius: 14,
    color: 'white', fontSize: '0.95rem', fontWeight: 700,
    fontFamily: 'inherit', transition: 'opacity 0.2s',
  },
  confirmCard: {
    background: 'white', borderRadius: 24, padding: 40,
    textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.07)',
  },
  confirmEmoji: { fontSize: '3rem', marginBottom: 12 },
  confirmTitle: { fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 700, color: '#1e3a2f', marginBottom: 8 },
  confirmSub: { fontSize: '0.9rem', color: '#6b8f7e', lineHeight: 1.7, marginBottom: 28 },
  confirmDetails: {
    background: '#f8fffe', border: '1px solid rgba(74,186,142,0.15)',
    borderRadius: 16, padding: 20, marginBottom: 24, textAlign: 'left',
  },
  confirmRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #f0f7f4',
  },
  confirmLabel: { fontSize: '0.78rem', color: '#6b8f7e', fontWeight: 600 },
  confirmValue: { fontSize: '0.88rem', color: '#1e3a2f', fontWeight: 600 },
  confirmBtns: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 },
  joinCallBtn: {
    padding: 15, background: 'linear-gradient(135deg, #4aba8e, #2d9e6e)',
    color: 'white', border: 'none', borderRadius: 14,
    fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
  },
  backDashBtn: {
    padding: 13, background: 'white', color: '#6b8f7e',
    border: '1.5px solid rgba(74,186,142,0.25)', borderRadius: 14,
    fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  },
  confirmNote: { fontSize: '0.8rem', color: '#6b8f7e', lineHeight: 1.6 },
  chatPage: {
    display: 'flex', flexDirection: 'column', height: '100vh',
    background: '#f0f7f4', fontFamily: "'Plus Jakarta Sans', sans-serif",
    position: 'relative',
  },
  chatHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 28px',
    background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(74,186,142,0.15)',
    zIndex: 10, flexShrink: 0,
  },
  chatHeaderLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  chatAvatar: {
    width: 44, height: 44, borderRadius: '50%',
    background: '#e8f7f1', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '1.3rem', border: '2px solid rgba(74,186,142,0.3)',
  },
  chatCounselorName: { fontSize: '1rem', fontWeight: 700, color: '#1e3a2f' },
  chatCounselorStatus: { fontSize: '0.75rem', color: '#4aba8e', marginTop: 2 },
  chatHeaderRight: { display: 'flex', gap: 10 },
  switchToVideoBtn: {
    background: '#e8f7f1', border: '1.5px solid rgba(74,186,142,0.3)',
    borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
    fontSize: '0.78rem', color: '#4aba8e', fontWeight: 600, fontFamily: 'inherit',
  },
  endChatBtn: {
    background: '#fff0f4', border: '1.5px solid #fca5a5',
    borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
    fontSize: '0.78rem', color: '#f43f5e', fontWeight: 600, fontFamily: 'inherit',
  },
  chatMessages: {
    flex: 1, overflowY: 'auto',
    padding: '20px 28px',
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  chatInfoBanner: {
    textAlign: 'center', fontSize: '0.75rem', color: '#6b8f7e',
    background: 'rgba(255,255,255,0.8)', borderRadius: 12,
    padding: '10px 16px', marginBottom: 8,
    border: '1px solid rgba(74,186,142,0.12)',
  },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: 10 },
  msgAvatarCounselor: {
    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
    background: '#e8f7f1', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '1rem', border: '1.5px solid rgba(74,186,142,0.2)',
  },
  msgAvatarStudent: {
    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
    background: '#f0f7f4', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '1rem', border: '1.5px solid rgba(74,186,142,0.2)',
  },
  msgBubble: { padding: '14px 18px', lineHeight: 1.65 },
  msgText: { fontSize: '0.92rem', whiteSpace: 'pre-wrap' },
  msgMeta: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, paddingLeft: 4 },
  msgTime: { fontSize: '0.68rem', color: '#94a3b8' },
  typingBubble: {
    background: 'white', border: '1px solid rgba(74,186,142,0.15)',
    borderRadius: '20px 20px 20px 4px', padding: '14px 18px',
    display: 'flex', alignItems: 'center', gap: 5,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  dot: {
    display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
    background: '#4aba8e', opacity: 0.4,
    animation: 'bounce 1s ease infinite',
  },
  chatInputArea: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '14px 24px',
    background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(74,186,142,0.15)',
    flexShrink: 0,
  },
  chatTextInput: {
    flex: 1, padding: '13px 18px',
    background: '#f0f7f4', border: '1.5px solid rgba(74,186,142,0.2)',
    borderRadius: 14, fontFamily: 'inherit',
    fontSize: '0.92rem', color: '#1e3a2f', outline: 'none',
  },
  chatSendBtn: {
    width: 46, height: 46, borderRadius: '50%',
    border: 'none', color: 'white', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.1rem', transition: 'opacity 0.2s',
  },
  chatNote: {
    textAlign: 'center', fontSize: '0.7rem', color: '#94a3b8',
    padding: '4px 24px 10px', flexShrink: 0,
  },
  callPage: {
    display: 'flex', flexDirection: 'column', height: '100vh',
    background: '#1e3a2f', fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  callHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 24px', background: 'rgba(0,0,0,0.3)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  callHeaderLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  callName: { fontSize: '1rem', fontWeight: 700, color: 'white' },
  callStatus: { fontSize: '0.75rem', color: '#f43f5e', marginTop: 2 },
  endCallBtn2: {
    background: '#f43f5e', color: 'white', border: 'none', borderRadius: 10,
    padding: '10px 20px', cursor: 'pointer', fontSize: '0.88rem',
    fontWeight: 700, fontFamily: 'inherit',
  },
  jitsiFrame: { flex: 1, border: 'none', width: '100%' },
  callNote2: {
    textAlign: 'center', fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)', padding: '10px 24px',
  },
  faqCard: {
    background: 'white', borderRadius: 20, padding: 28,
    marginBottom: 40, boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
  },
  faqTitle: { fontSize: '1rem', fontWeight: 700, color: '#1e3a2f', marginBottom: 20 },
  faqGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  faqItem: {
    background: '#f8fffe', border: '1px solid rgba(74,186,142,0.12)',
    borderRadius: 14, padding: 16,
  },
  faqQ: { fontSize: '0.85rem', fontWeight: 700, color: '#1e3a2f', marginBottom: 6 },
  faqA: { fontSize: '0.8rem', color: '#6b8f7e', lineHeight: 1.6 },
};