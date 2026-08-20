import express from 'express';
import { SearchQuerySchema } from '../schemas/travelSchemas.js';
import { executeSelfHealingScrape } from '../services/selfHealingEngine.js';

const router = express.Router();

// POST /api/search - triggers self-healing search pipeline
router.post('/', async (req, res) => {
  try {
    const parseResult = SearchQuerySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid search request parameters',
        details: parseResult.error.flatten(),
      });
    }

    const result = await executeSelfHealingScrape(parseResult.data);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error('Error executing search route:', err);
    res.status(500).json({
      success: false,
      error: 'Self-healing scrape search failed',
      message: err.message,
    });
  }
});

export default router;
