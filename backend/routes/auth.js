const express  = require('express');
const router   = express.Router();
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const supabase = require('../supabase');
const { requireAuth, requireOwnStudent, requireRole } = require('../middleware/auth');

// ── Generate unique ALTIUS ID
function generateAltiusId() {
  const year   = new Date().getFullYear();
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `ALTIUS-${year}-${number}`;
}

// ── POST /api/auth/student/register
// Creates anonymous student account — no name/email required
router.post('/student/register', async (req, res) => {
  try {
    const altius_id  = generateAltiusId();
    const password = req.body.password || Math.random().toString(36).slice(-8);
    const hash     = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('students')
      .insert([{ altius_id, password_hash: hash, created_at: new Date() }])
      .select()
      .single();

    if (error) throw error;

    const token = jwt.sign(
      { altius_id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, altius_id, password, token });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/student/login
router.post('/student/login', async (req, res) => {
  const { altius_id, password } = req.body;

  try {
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('altius_id', altius_id)
      .single();

    if (error || !student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const valid = await bcrypt.compare(password, student.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const token = jwt.sign(
      { altius_id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, altius_id, token });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/counselor/login
router.post('/counselor/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: counselor, error } = await supabase
      .from('counselors')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !counselor) {
      return res.status(404).json({ error: 'Counselor not found' });
    }

    const valid = await bcrypt.compare(password, counselor.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const token = jwt.sign(
      { id: counselor.id, email, role: 'counselor' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, counselor: { id: counselor.id, name: counselor.name, email, avatar: counselor.avatar, title: counselor.title }, token });
  } catch (err) {
    console.error('Counselor login error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/counselor/register
router.post('/counselor/register', async (req, res) => {
  const { name, email, password, title, avatar } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    // Check if email already exists
    const { data: existing } = await supabase
      .from('counselors')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return res.status(409).json({ error: 'A counselor with this email already exists' });
    }

    const hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('counselors')
      .insert([{
        name,
        email,
        password_hash: hash,
        title:     title   || 'Counselor',
        avatar:    avatar  || '🧑‍⚕️',
        available: true,
        created_at: new Date(),
      }])
      .select()
      .single();

    if (error) throw error;

    const token = jwt.sign(
      { id: data.id, email, role: 'counselor' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, counselor: { id: data.id, name: data.name, email }, token });
  } catch (err) {
    console.error('Counselor register error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/admin/login
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  // Simple admin check from env (no DB needed for single admin)
  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  const token = jwt.sign(
    { email, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({ success: true, token });
});

// ── POST /api/auth/seed-counselors
// Run once to seed counselors with correct password hashes
router.post('/seed-counselors', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const hash = await bcrypt.hash('counselor123', 10);

    const counselors = [
      { name: 'Dr. Priya Sharma', email: 'priya@altius.edu', password_hash: hash, title: 'Clinical Psychologist',    avatar: '👩‍⚕️', available: true  },
      { name: 'Mr. Arjun Mehta',  email: 'arjun@altius.edu', password_hash: hash, title: 'Counseling Psychologist',  avatar: '🧑‍⚕️', available: true  },
      { name: 'Ms. Kavya Nair',   email: 'kavya@altius.edu', password_hash: hash, title: 'Student Wellness Advisor', avatar: '👩‍💼', available: false },
    ];

    // Delete existing and re-insert
    await supabase.from('counselors').delete().neq('id', 0);

    const { data, error } = await supabase
      .from('counselors')
      .insert(counselors)
      .select();

    if (error) throw error;

    res.json({ success: true, message: '3 counselors seeded with correct password hashes', data });
  } catch (err) {
    console.error('Seed error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;