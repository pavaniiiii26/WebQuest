import { Router } from 'express';
import Analysis from '../models/Analysis.js';

const router = Router();

// GET all analysis records
router.get('/', async (req, res) => {
  try {
    const { targetType, targetName, analysisType, limit = 50, skip = 0 } = req.query;
    const query = {};

    if (targetType) query.targetType = targetType;
    if (targetName) query.targetName = { $regex: targetName, $options: 'i' };
    if (analysisType) query.analysisType = analysisType;

    const [analyses, total] = await Promise.all([
      Analysis.find(query).sort({ createdAt: -1 }).skip(Number(skip)).limit(Number(limit)),
      Analysis.countDocuments(query),
    ]);

    res.json({ success: true, count: analyses.length, total, data: analyses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single analysis record
router.get('/:id', async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) {
      return res.status(404).json({ success: false, error: 'Analysis record not found' });
    }
    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE / STORE analysis
router.post('/', async (req, res) => {
  try {
    const {
      targetType,
      targetId,
      targetName,
      analysisType,
      summary,
      structuredOutput,
      rawScrapedDataSummary,
      aiModel,
      tokensUsed,
    } = req.body;

    if (!targetName || !summary || !structuredOutput) {
      return res.status(400).json({
        success: false,
        error: 'targetName, summary, and structuredOutput are required',
      });
    }

    const analysis = await Analysis.create({
      targetType,
      targetId,
      targetName,
      analysisType,
      summary,
      structuredOutput,
      rawScrapedDataSummary,
      aiModel,
      tokensUsed,
    });

    res.status(201).json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE analysis
router.delete('/:id', async (req, res) => {
  try {
    const analysis = await Analysis.findByIdAndDelete(req.params.id);
    if (!analysis) {
      return res.status(404).json({ success: false, error: 'Analysis record not found' });
    }
    res.json({ success: true, message: 'Analysis record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
