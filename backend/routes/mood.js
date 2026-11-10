const express  = require('express');
const router   = express.Router();
const supabase = require('../supabase');
const { requireAuth, requireOwnStudent } = require('../middleware/auth');

// ── POST /api/mood/save
router.post('/save', requireAuth, requireOwnStudent, async (req, res) => {
  const { altius_id, date, value, label, emoji, note, time } = req.body;

  if (!altius_id || !date || !value) {
    return res.status(400).json({ error: 'altius_id, date and value are required' });
  }

  try {
    // Upsert — update if exists for today, insert if not
    const { data, error } = await supabase
      .from('mood_logs')
      .upsert([{ altius_id, date, value, label, emoji, note: note || '', time, logged_at: new Date() }],
              { onConflict: 'altius_id,date' })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, entry: data });
  } catch (err) {
    console.error('Mood save error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/mood/:altius_id
router.get('/:altius_id', requireAuth, requireOwnStudent, async (req, res) => {
  const { altius_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('altius_id', altius_id)
      .order('date', { ascending: false })
      .limit(30);

    if (error) throw error;
    res.json({ logs: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;