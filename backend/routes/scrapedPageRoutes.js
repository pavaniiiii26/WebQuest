import { Router } from 'express';
import ScrapedPage from '../models/ScrapedPage.js';

const router = Router();

// GET all scraped pages
router.get('/', async (req, res) => {
  try {
    const { companyId, pageType, status, limit = 50, skip = 0 } = req.query;
    const query = {};

    if (companyId) query.companyId = companyId;
    if (pageType) query.pageType = pageType;
    if (status) query.status = status;

    const [pages, total] = await Promise.all([
      ScrapedPage.find(query).sort({ createdAt: -1 }).skip(Number(skip)).limit(Number(limit)),
      ScrapedPage.countDocuments(query),
    ]);

    res.json({ success: true, count: pages.length, total, data: pages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single scraped page
router.get('/:id', async (req, res) => {
  try {
    const page = await ScrapedPage.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ success: false, error: 'Scraped page record not found' });
    }
    res.json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE / STORE scraped page
router.post('/', async (req, res) => {
  try {
    const { companyId, url, pageType, title, source, rawContent, extractedData, status, statusCode, errorMessage } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    const page = await ScrapedPage.create({
      companyId,
      url,
      pageType,
      title,
      source,
      rawContent,
      extractedData,
      status,
      statusCode,
      errorMessage,
    });

    res.status(201).json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE scraped page
router.delete('/:id', async (req, res) => {
  try {
    const page = await ScrapedPage.findByIdAndDelete(req.params.id);
    if (!page) {
      return res.status(404).json({ success: false, error: 'Scraped page record not found' });
    }
    res.json({ success: true, message: 'Scraped page record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
