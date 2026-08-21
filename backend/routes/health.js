import express from 'express';
import { getHealthLogs } from '../services/selfHealingEngine.js';
import { config } from '../config/env.js';

const router = express.Router();

// GET /api/scraper-health - returns scraper health & audit logs
router.get('/', (_req, res) => {
  try {
    const logs = getHealthLogs();
    
    // Aggregate health stats
    const totalScrapes = logs.length;
    const liveScrapes = logs.filter((l) => !l.isStale).length;
    const staleCacheFallbacks = logs.filter((l) => l.isStale).length;
    const totalValidRecords = logs.reduce((acc, curr) => acc + (curr.validCount || 0), 0);

    res.json({
      success: true,
      status: 'healthy',
      engine: 'Voyalette Self-Healing Bright Data Scraper (Zero-LLM)',
      brightDataConnected: Boolean(config.brightDataApiToken),
      stats: {
        totalScrapes,
        liveScrapes,
        staleCacheFallbacks,
        totalValidRecords,
        uptime: process.uptime(),
      },
      logs,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve scraper health logs',
      message: err.message,
    });
  }
});

export default router;
