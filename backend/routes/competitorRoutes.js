import { Router } from 'express';
import Competitor from '../models/Competitor.js';

const router = Router();

// GET all competitors
router.get('/', async (req, res) => {
  try {
    const { companyId, marketOverlap, limit = 50, skip = 0 } = req.query;
    const query = {};

    if (companyId) query.companyId = companyId;
    if (marketOverlap) query.marketOverlap = marketOverlap;

    const [competitors, total] = await Promise.all([
      Competitor.find(query).sort({ createdAt: -1 }).skip(Number(skip)).limit(Number(limit)),
      Competitor.countDocuments(query),
    ]);

    res.json({ success: true, count: competitors.length, total, data: competitors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single competitor
router.get('/:id', async (req, res) => {
  try {
    const competitor = await Competitor.findById(req.params.id);
    if (!competitor) {
      return res.status(404).json({ success: false, error: 'Competitor not found' });
    }
    res.json({ success: true, data: competitor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE competitor
router.post('/', async (req, res) => {
  try {
    const { companyId, name, websiteUrl, marketOverlap, strengths, weaknesses, pricingInsights, metrics, notes } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Competitor name is required' });
    }

    const competitor = await Competitor.create({
      companyId,
      name,
      websiteUrl,
      marketOverlap,
      strengths,
      weaknesses,
      pricingInsights,
      metrics,
      notes,
    });

    res.status(201).json({ success: true, data: competitor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE competitor
router.put('/:id', async (req, res) => {
  try {
    const competitor = await Competitor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!competitor) {
      return res.status(404).json({ success: false, error: 'Competitor not found' });
    }

    res.json({ success: true, data: competitor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE competitor
router.delete('/:id', async (req, res) => {
  try {
    const competitor = await Competitor.findByIdAndDelete(req.params.id);
    if (!competitor) {
      return res.status(404).json({ success: false, error: 'Competitor not found' });
    }
    res.json({ success: true, message: 'Competitor deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
