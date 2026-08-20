import express from 'express';
import { getDestinationsList, getCachedDestination } from '../services/cacheService.js';

const router = express.Router();

// GET /api/destinations - returns popular destinations
router.get('/', (_req, res) => {
  try {
    const list = getDestinationsList();
    res.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch destinations',
      message: err.message,
    });
  }
});

// GET /api/destinations/:name - returns details for a specific destination
router.get('/:name', (req, res) => {
  try {
    const destinationName = req.params.name;
    const details = getCachedDestination(destinationName);
    res.json({
      success: true,
      data: details,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch destination detail',
      message: err.message,
    });
  }
});

export default router;
