const express  = require('express');
const router   = express.Router();
const supabase = require('../supabase');
const { requireAuth, requireOwnStudent, requireRole } = require('../middleware/auth');

// ── Severity calculators
function phq9Severity(score) {
  if (score <= 4)  return 'Minimal';
  if (score <= 9)  return 'Mild';
  if (score <= 14) return 'Moderate';
  if (score <= 19) return 'Moderately Severe';
  return 'Severe';
}

function gad7Severity(score) {
  if (score <= 4)  return 'Minimal';
  if (score <= 9)  return 'Mild';
  if (score <= 14) return 'Moderate';
  return 'Severe';
}

// ── POST /api/assessment/save
router.post('/save', requireAuth, requireOwnStudent, async (req, res) => {
  const { altius_id, phq9_score, gad7_score, phq9_answers, gad7_answers } = req.body;

  if (!altius_id || phq9_score === undefined || gad7_score === undefined) {
    return res.status(400).json({ error: 'altius_id, phq9_score and gad7_score are required' });
  }

  const phq9_label  = phq9Severity(phq9_score);
  const gad7_label  = gad7Severity(gad7_score);
  const should_flag = phq9_score >= 15 || gad7_score >= 15;

  try {
    // Save assessment result
    const { data, error } = await supabase
      .from('assessments')
      .insert([{
        altius_id,
        phq9_score,
        gad7_score,
        phq9_label,
        gad7_label,
        phq9_answers: phq9_answers || [],
        gad7_answers: gad7_answers || [],
        taken_at: new Date(),
      }])
      .select()
      .single();

    if (error) throw error;

    // Auto-flag student if severe
    try {
      if (should_flag) {
        await supabase
          .from('students')
          .update({
            flagged:      true,
            flag_reason:  `High assessment score — PHQ-9: ${phq9_score}, GAD-7: ${gad7_score}`,
            phq9_score,
            gad7_score,
            phq9_label,
            gad7_label,
          })
          .eq('altius_id', altius_id);
      } else {
        await supabase
          .from('students')
          .update({ phq9_score, gad7_score, phq9_label, gad7_label })
          .eq('altius_id', altius_id);
      }
    } catch (dbErr) {
      console.error('DB update error:', dbErr.message);
    }

    res.json({
      success: true,
      result: {
        phq9_score, phq9_label,
        gad7_score, gad7_label,
        flagged: should_flag,
      },
    });

  } catch (err) {
    console.error('Assessment save error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/assessment/history/:altius_id
router.get('/history/:altius_id', requireAuth, requireOwnStudent, async (req, res) => {
  const { altius_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('altius_id', altius_id)
      .order('taken_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    res.json({ assessments: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/assessment/stats  (for admin dashboard)
router.get('/stats', requireAuth, requireRole('admin', 'counselor'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('phq9_label, gad7_label, phq9_score, gad7_score');

    if (error) throw error;

    const severity = { Minimal: 0, Mild: 0, Moderate: 0, Severe: 0 };
    let totalPhq9 = 0, totalGad7 = 0;

    data.forEach(a => {
      if (severity[a.phq9_label] !== undefined) severity[a.phq9_label]++;
      totalPhq9 += a.phq9_score;
      totalGad7  += a.gad7_score;
    });

    res.json({
      total: data.length,
      severity,
      avgPhq9: data.length ? (totalPhq9 / data.length).toFixed(1) : 0,
      avgGad7: data.length ? (totalGad7 / data.length).toFixed(1) : 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;