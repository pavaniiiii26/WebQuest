import { Router } from 'express';
import Company from '../models/Company.js';

const router = Router();

// GET all companies
router.get('/', async (req, res) => {
  try {
    const { search, industry, limit = 50, skip = 0 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { domain: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (industry) {
      query.industry = industry;
    }

    const [companies, total] = await Promise.all([
      Company.find(query).sort({ createdAt: -1 }).skip(Number(skip)).limit(Number(limit)),
      Company.countDocuments(query),
    ]);

    res.json({ success: true, count: companies.length, total, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single company by ID
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }
    res.json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE company
router.post('/', async (req, res) => {
  try {
    const { name, domain, websiteUrl, industry, description, location, tags, metadata } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Company name is required' });
    }

    const company = await Company.create({
      name,
      domain,
      websiteUrl,
      industry,
      description,
      location,
      tags,
      metadata,
    });

    res.status(201).json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE company
router.put('/:id', async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    res.json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE company
router.delete('/:id', async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }
    res.json({ success: true, message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
