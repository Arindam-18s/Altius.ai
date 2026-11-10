const express  = require('express');
const router   = express.Router();
const supabase = require('../supabase');
const { requireAuth, requireRole } = require('../middleware/auth');
router.use(requireAuth, requireRole('admin'));

// ── GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [
      { count: totalStudents },
      { count: flaggedStudents },
      { count: totalCounselors },
      { count: totalSessions },
      { count: totalAssessments },
      { count: totalChats },
    ] = await Promise.all([
      supabase.from('students').select('*', { count:'exact', head:true }),
      supabase.from('students').select('*', { count:'exact', head:true }).eq('flagged', true),
      supabase.from('counselors').select('*', { count:'exact', head:true }),
      supabase.from('sessions').select('*', { count:'exact', head:true }),
      supabase.from('assessments').select('*', { count:'exact', head:true }),
      supabase.from('chat_messages').select('*', { count:'exact', head:true }),
    ]);

    // Get average scores
    const { data: assessData } = await supabase
      .from('assessments')
      .select('phq9_score, gad7_score');

    let avgPHQ9 = 0, avgGAD7 = 0;
    if (assessData && assessData.length > 0) {
      avgPHQ9 = (assessData.reduce((a,b) => a + b.phq9_score, 0) / assessData.length).toFixed(1);
      avgGAD7 = (assessData.reduce((a,b) => a + b.gad7_score, 0) / assessData.length).toFixed(1);
    }

    res.json({
      totalStudents:     totalStudents    || 0,
      flaggedStudents:   flaggedStudents  || 0,
      totalCounselors:   totalCounselors  || 0,
      counselorSessions: totalSessions   || 0,
      assessmentsDone:   totalAssessments || 0,
      resourcesUsed:     totalChats      || 0,
      avgPHQ9:           parseFloat(avgPHQ9) || 0,
      avgGAD7:           parseFloat(avgGAD7) || 0,
      activeThisWeek:    totalStudents   || 0,
    });
  } catch (err) {
    console.error('Admin stats error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/students
router.get('/students', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ students: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/counselors
router.get('/counselors', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('counselors')
      .select('id, name, email, title, avatar, available, created_at')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Get session count per counselor
    const counselorsWithSessions = await Promise.all(
      (data || []).map(async c => {
        const { count } = await supabase
          .from('sessions')
          .select('*', { count:'exact', head:true })
          .eq('counselor_id', c.id);
        return { ...c, sessions: count || 0, rating: 4.8 };
      })
    );

    res.json({ counselors: counselorsWithSessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/alerts
router.get('/alerts', async (req, res) => {
  try {
    // Flagged students
    const { data: flagged } = await supabase
      .from('students')
      .select('altius_id, flag_reason, phq9_score, gad7_score, last_seen')
      .eq('flagged', true)
      .order('last_seen', { ascending: false });

    // Crisis events
    const { data: crises } = await supabase
      .from('crisis_events')
      .select('*')
      .eq('resolved', false)
      .order('detected_at', { ascending: false })
      .limit(10);

    const alerts = [
      ...(crises || []).map(c => ({
        id:     `crisis-${c.id}`,
        altiusId: c.altius_id,
        msg:    'Crisis keyword detected in AI chat session',
        time:   new Date(c.detected_at).toLocaleString('en-IN'),
        level:  'high',
      })),
      ...(flagged || []).map(s => ({
        id:     `flag-${s.altius_id}`,
        altiusId: s.altius_id,
        msg:    s.flag_reason || `PHQ-9: ${s.phq9_score}, GAD-7: ${s.gad7_score}`,
        time:   s.last_seen ? new Date(s.last_seen).toLocaleString('en-IN') : 'Recently',
        level:  (s.phq9_score >= 15 || s.gad7_score >= 15) ? 'high' : 'medium',
      })),
    ];

    res.json({ alerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/severity
router.get('/severity', async (req, res) => {
  try {
    const { data } = await supabase
      .from('assessments')
      .select('phq9_label, gad7_label');

    const severity = { Minimal:0, Mild:0, Moderate:0, Severe:0 };
    (data || []).forEach(a => {
      if (severity[a.phq9_label] !== undefined) severity[a.phq9_label]++;
    });

    res.json({ severity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;