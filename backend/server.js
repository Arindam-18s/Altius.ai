const express    = require('express');
const cors       = require('cors');
const dotenv     = require('dotenv');

dotenv.config();

const app = express();

// ── Middleware
app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      'http://localhost:4001',
      'https://altius-ai-khaki.vercel.app'
    ];
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// ── Routes
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/chatbot',    require('./routes/chatbot'));
app.use('/api/assessment', require('./routes/assessment'));
app.use('/api/sessions',   require('./routes/sessions'));
app.use('/api/mood',       require('./routes/mood'));
app.use('/api/admin',      require('./routes/admin'));
app.use('/api/tts',        require('./routes/bengali_tts'));

// ── Health check
app.get('/', (req, res) => {
  res.json({ status: '🦚 Altius backend is running!', time: new Date() });
});

// ── Keep-alive ping (hits Supabase to prevent pausing)
const supabase = require('./supabase');
app.get('/ping', async (req, res) => {
  try {
    await supabase.from('students').select('altius_id').limit(1);
    res.json({ status: '✅ alive', time: new Date() });
  } catch (err) {
    res.json({ status: '⚠️ ping failed', error: err.message });
  }
});

// ── Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n🦚 Altius backend running on http://localhost:${PORT}`);
  console.log(`   Groq AI   : ${process.env.GROQ_API_KEY ? '✅ Connected' : '❌ Missing key'}`);
  console.log(`   Supabase  : ${process.env.SUPABASE_URL ? '✅ Connected' : '❌ Missing key'}\n`);
});