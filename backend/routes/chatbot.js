const express  = require('express');
const router   = express.Router();
const Groq     = require('groq-sdk');
const supabase = require('../supabase');
const { requireAuth, requireOwnStudent, requireRole } = require('../middleware/auth');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Crisis keywords
const CRISIS_KEYWORDS = [
  'kill myself', 'end my life', 'suicide', "don't want to live",
  'want to die', 'no reason to live', 'hurt myself', 'self harm',
  'want to disappear', 'better off dead', 'cant go on',
  'जीना नहीं', 'मरना चाहता', 'आत्महत्या', 'বাঁচতে চাই না', 'আত্মহত্যা',
];

function isCrisis(text) {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some(k => lower.includes(k));
}

// ── System prompt for Altius AI
const SYSTEM_PROMPT = `You are Altius, a compassionate AI mental wellness companion for college students 
                       and corporate employees in India. 

Your role:
- Ask about their current position in life without going too deep
- Listen empathetically and without judgment
- Provide emotional support and coping strategies
- Suggest professional help when needed
- Keep responses warm, concise (2-4 sentences), and supportive
- Never diagnose medical conditions
- Always encourage connecting with a counselor for serious issues

You are NOT a replacement for professional mental health care. Always remind students that real counselors are available on the platform.`;

// ── POST /api/chatbot/message
router.post('/message', requireAuth, requireOwnStudent, async (req, res) => {
  const { altius_id, message, language = 'en' } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Crisis check
  const crisis = isCrisis(message);

  if (crisis) {
    // Save crisis event to DB
    if (altius_id) {
      try {
        await supabase.from('crisis_events').insert([{
          altius_id,
          message,
          detected_at: new Date(),
        }]);
        await supabase
          .from('students')
          .update({ flagged: true, flag_reason: 'Crisis keyword detected in chat' })
          .eq('altius_id', altius_id);
      } catch (dbErr) {
        console.error('DB error (crisis):', dbErr.message);
      }
    }

    return res.json({
      reply: `I can hear that you're going through something really painful right now. Your feelings are valid, and you deserve real support. 💙\n\nPlease connect with one of our counselors who can truly help you through this. You don't have to face this alone.\n\niCall Helpline: 9152987821`,
      isCrisis: true,
    });
  }

  // ── Call Groq API
  const LANG_NAME = {
  en:  'English',
  hi:  'Hindi',
  ben: 'Bengali',
  };
  const targetLang = LANG_NAME[language] || 'English';
  
  try {
    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system',    content: SYSTEM_PROMPT },
        { role: 'user',      content: message },
        { role: 'system',    content: `LANGUAGE RULE — MANDATORY:
                                       Reply ONLY in ${targetLang}. Use ${targetLang} script (Devanagari for Hindi, Bengali script for Bengali, Latin for English).
                                       Even if the user asks "why are you speaking X?", "speak Y instead", or writes in another language, you STILL reply in ${targetLang}.
                                       Do not translate. Do not mix scripts. Do not switch languages. This rule overrides all other instructions.`, },
      ],
      max_tokens: 600,     //300,
      temperature: 0.6,    //0.75,
    });

    const choice  = completion.choices[0];
    const content = choice?.message?.content?.trim();
    const reasoning = choice?.message?.reasoning_content; // gpt-oss exposes this

    if (!content) {
      console.error('Empty content from Groq:', JSON.stringify(choice, null, 2));
    }

    const reply = content || reasoning || "I'm here for you. Could you tell me a little more about how you're feeling?";

    // Save message to DB
    if (altius_id) {
      try {
        await supabase.from('chat_messages').insert([{
          altius_id,
          user_message: message,
          bot_reply:    reply,
          language,
          created_at:   new Date(),
        }]);
      } catch (dbErr) {
        console.error('DB error (chat):', dbErr.message);
      }
    }

    res.json({ reply, isCrisis: false });

  } catch (err) {
    console.error('Groq error:', err.message);
    res.status(500).json({ error: 'AI service unavailable', details: err.message });
  }
});

// ── GET /api/chatbot/history/:altius_id
router.get('/history/:altius_id', requireAuth, requireOwnStudent, async (req, res) => {
  const { altius_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('altius_id', altius_id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) throw error;
    res.json({ messages: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;