/**
 * Healing API Router
 *
 * Dedicated endpoints for retrieving self-healing logs and candidate evaluations.
 */

import { Router } from 'express';
import HealingAttempt from '../models/HealingAttempt.js';

const router = Router();

// ── GET /api/healing/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const attempt = await HealingAttempt.findById(req.params.id);
    if (!attempt) {
      return res.status(404).json({ success: false, error: 'Healing attempt not found' });
    }
    res.json({ success: true, data: attempt });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /api/healing ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const attempts = await HealingAttempt.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: attempts.length, data: attempts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
