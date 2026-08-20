/**
 * Scrapers API Router
 *
 * Provides endpoints for running, breaking, diagnosing, healing, and inspecting scrapers.
 */

import { Router } from 'express';
import Scraper from '../models/Scraper.js';
import ScrapeRun from '../models/ScrapeRun.js';
import HealingAttempt from '../models/HealingAttempt.js';
import ScrapeResult from '../models/ScrapeResult.js';

import { fetchTargetHtml } from '../services/brightdata.js';
import { executeScrape } from '../services/scraper.js';
import { validateScrapeResults } from '../services/validator.js';
import { detectFailures } from '../services/failureDetector.js';
import { diagnoseAndHeal } from '../services/healingEngine.js';
import { ensureDefaultScraper } from '../services/mongo.js';

const router = Router();

// ── GET /api/scrapers ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    let scrapers = await Scraper.find().sort({ createdAt: -1 });
    if (scrapers.length === 0) {
      const defaultScraper = await ensureDefaultScraper();
      scrapers = defaultScraper ? [defaultScraper] : [];
    }
    res.json({ success: true, count: scrapers.length, data: scrapers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── POST /api/scrapers ────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const scraper = await Scraper.create(req.body);
    res.status(201).json({ success: true, data: scraper });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /api/scrapers/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const scraper = await Scraper.findById(req.params.id);
    if (!scraper) {
      return res.status(404).json({ success: false, error: 'Scraper not found' });
    }
    res.json({ success: true, data: scraper });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── POST /api/scrapers/:id/run ────────────────────────────────────────────────
router.post('/:id/run', async (req, res) => {
  try {
    const scraper = await Scraper.findById(req.params.id);
    if (!scraper) {
      return res.status(404).json({ success: false, error: 'Scraper not found' });
    }

    // 1. Fetch HTML (live or simulated version)
    const { html, source, domVersion } = await fetchTargetHtml(
      scraper.targetUrl,
      scraper.targetDomVersion || 'v1_classic'
    );

    // 2. Execute extraction
    const scrapeOutput = executeScrape(html, scraper.selectors);

    // 3. Validate extracted items
    const validation = validateScrapeResults(scrapeOutput, scraper.expectedCount);

    // 4. Run Failure Detection
    const failureDiagnosis = detectFailures(
      scraper.selectors,
      scrapeOutput,
      validation,
      scraper.expectedCount
    );

    const isSuccess = validation.isValid && !failureDiagnosis.isBroken;
    const runStatus = isSuccess ? 'success' : 'failed';

    // 5. Update Scraper metrics in DB
    scraper.totalRuns += 1;
    if (isSuccess) {
      scraper.successfulRuns += 1;
      scraper.lastSuccessfulRunAt = new Date();
      scraper.status = 'healthy';
    } else {
      scraper.failedRuns += 1;
      scraper.lastFailureAt = new Date();
      scraper.status = 'broken';
    }
    await scraper.save();

    // 6. Record ScrapeRun in DB
    const scrapeRun = await ScrapeRun.create({
      scraperId: scraper._id,
      runNumber: scraper.totalRuns,
      status: runStatus,
      domVersion,
      recordsExtracted: scrapeOutput.rawCardCount,
      expectedCount: scraper.expectedCount,
      validationSummary: {
        totalChecks: validation.totalChecks,
        passedChecks: validation.passedChecks,
        failedChecks: validation.failedChecks,
        scorePct: validation.scorePct,
      },
      validationErrors: validation.errors,
      selectorsUsed: scraper.selectors,
      durationMs: scrapeOutput.durationMs,
      source,
    });

    // 7. Save extracted items in DB
    await ScrapeResult.create({
      scraperId: scraper._id,
      runId: scrapeRun._id,
      items: scrapeOutput.items,
      itemsCount: scrapeOutput.items.length,
    });

    res.json({
      success: true,
      data: {
        runId: scrapeRun._id,
        runStatus,
        scraperStatus: scraper.status,
        recordsExtracted: scrapeOutput.rawCardCount,
        expectedCount: scraper.expectedCount,
        validation,
        failureDiagnosis,
        selectors: scraper.selectors,
        items: scrapeOutput.items,
        domVersion,
        durationMs: scrapeOutput.durationMs,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── POST /api/scrapers/:id/break ──────────────────────────────────────────────
router.post('/:id/break', async (req, res) => {
  try {
    const scraper = await Scraper.findById(req.params.id);
    if (!scraper) {
      return res.status(404).json({ success: false, error: 'Scraper not found' });
    }

    // Advance to next broken layout (V1 -> V2 or V2 -> V3)
    let nextVersion = 'v2_modern_classes';
    if (scraper.targetDomVersion === 'v2_modern_classes') {
      nextVersion = 'v3_data_attributes';
    } else if (scraper.targetDomVersion === 'v3_data_attributes') {
      nextVersion = 'v2_modern_classes';
    }

    scraper.targetDomVersion = nextVersion;
    scraper.status = 'broken';
    await scraper.save();

    res.json({
      success: true,
      message: `Website structure intentionally broken! Target DOM switched to ${nextVersion}. Selectors will now fail validation.`,
      data: {
        scraperId: scraper._id,
        status: scraper.status,
        targetDomVersion: scraper.targetDomVersion,
        activeSelectors: scraper.selectors,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── POST /api/scrapers/:id/diagnose ───────────────────────────────────────────
router.post('/:id/diagnose', async (req, res) => {
  try {
    const { userHint = '' } = req.body;
    const scraper = await Scraper.findById(req.params.id);
    if (!scraper) {
      return res.status(404).json({ success: false, error: 'Scraper not found' });
    }

    // 1. Fetch current broken DOM
    const { html } = await fetchTargetHtml(scraper.targetUrl, scraper.targetDomVersion);

    // 2. Perform test scrape to identify failed fields
    const scrapeOutput = executeScrape(html, scraper.selectors);
    const validation = validateScrapeResults(scrapeOutput, scraper.expectedCount);
    const failureDiagnosis = detectFailures(scraper.selectors, scrapeOutput, validation, scraper.expectedCount);

    if (!failureDiagnosis.isBroken) {
      return res.json({
        success: true,
        isBroken: false,
        message: 'Scraper is functioning normally with current selectors. No repairs needed.',
      });
    }

    // 3. For each broken selector, run the deterministic self-healing engine
    const proposedRepairs = [];

    for (const broken of failureDiagnosis.brokenSelectors) {
      const diagnosis = diagnoseAndHeal(
        html,
        broken.field,
        broken.selector,
        scraper.selectors.card,
        userHint,
        scraper.expectedCount
      );

      if (diagnosis.highestCandidate) {
        proposedRepairs.push({
          field: broken.field,
          oldSelector: broken.selector,
          candidateSelector: diagnosis.highestCandidate.selector,
          confidence: diagnosis.highestCandidate.confidence,
          matches: diagnosis.highestCandidate.matchCount,
          sampleText: diagnosis.highestCandidate.sampleText,
          scoreBreakdown: diagnosis.highestCandidate.scoreBreakdown,
          allCandidates: diagnosis.candidatesScored,
        });
      }
    }

    // Primary repair candidate
    const primaryRepair = proposedRepairs[0] || null;

    res.json({
      success: true,
      data: {
        isBroken: true,
        failureSummary: failureDiagnosis.summary,
        brokenSelectors: failureDiagnosis.brokenSelectors,
        primaryRepair,
        proposedRepairs,
        expectedRecords: scraper.expectedCount,
        recordsFound: scrapeOutput.rawCardCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── POST /api/scrapers/:id/heal ───────────────────────────────────────────────
router.post('/:id/heal', async (req, res) => {
  try {
    const { repairs = [], failureDescription = '' } = req.body;
    const scraper = await Scraper.findById(req.params.id);
    if (!scraper) {
      return res.status(404).json({ success: false, error: 'Scraper not found' });
    }

    // Fetch HTML for diagnosis & re-run
    const { html, domVersion, source } = await fetchTargetHtml(scraper.targetUrl, scraper.targetDomVersion);

    // If repairs not provided in request body, auto-diagnose them
    let repairsToApply = repairs;
    if (repairsToApply.length === 0) {
      const initialScrape = executeScrape(html, scraper.selectors);
      const val = validateScrapeResults(initialScrape, scraper.expectedCount);
      const diag = detectFailures(scraper.selectors, initialScrape, val, scraper.expectedCount);

      for (const broken of diag.brokenSelectors) {
        const healingResult = diagnoseAndHeal(
          html,
          broken.field,
          broken.selector,
          scraper.selectors.card,
          failureDescription,
          scraper.expectedCount
        );
        if (healingResult.highestCandidate) {
          repairsToApply.push({
            field: broken.field,
            oldSelector: broken.selector,
            newSelector: healingResult.highestCandidate.selector,
            confidence: healingResult.highestCandidate.confidence,
            candidatesScored: healingResult.candidatesScored,
          });
        }
      }
    }

    if (repairsToApply.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid repairs could be generated or applied.' });
    }

    // 1. Snapshot previous selectors
    scraper.previousSelectors = { ...scraper.selectors };

    // 2. Apply new selectors
    repairsToApply.forEach(r => {
      if (r.field && r.newSelector) {
        scraper.selectors[r.field] = r.newSelector;
      }
    });

    scraper.status = 'healing';
    await scraper.save();

    // 3. Re-run scraper automatically with new selectors
    const reScrapeOutput = executeScrape(html, scraper.selectors);
    const postValidation = validateScrapeResults(reScrapeOutput, scraper.expectedCount);

    const isHealed = postValidation.isValid;
    scraper.status = isHealed ? 'healthy' : 'broken';
    scraper.healingAttemptsCount += 1;
    if (isHealed) {
      scraper.lastHealedAt = new Date();
      scraper.successfulRuns += 1;
      scraper.lastSuccessfulRunAt = new Date();
    }
    scraper.totalRuns += 1;
    await scraper.save();

    // 4. Record ScrapeRun for the healed run
    const healedRun = await ScrapeRun.create({
      scraperId: scraper._id,
      runNumber: scraper.totalRuns,
      status: isHealed ? 'success' : 'failed',
      domVersion,
      recordsExtracted: reScrapeOutput.rawCardCount,
      expectedCount: scraper.expectedCount,
      validationSummary: {
        totalChecks: postValidation.totalChecks,
        passedChecks: postValidation.passedChecks,
        failedChecks: postValidation.failedChecks,
        scorePct: postValidation.scorePct,
      },
      validationErrors: postValidation.errors,
      selectorsUsed: scraper.selectors,
      durationMs: reScrapeOutput.durationMs,
      source,
    });

    // 5. Store healed records
    await ScrapeResult.create({
      scraperId: scraper._id,
      runId: healedRun._id,
      items: reScrapeOutput.items,
      itemsCount: reScrapeOutput.items.length,
    });

    // 6. Log HealingAttempt in DB
    const primaryRepair = repairsToApply[0];
    const healingAttempt = await HealingAttempt.create({
      scraperId: scraper._id,
      runId: healedRun._id,
      failedSelector: primaryRepair.oldSelector,
      failedField: primaryRepair.field,
      replacementSelector: primaryRepair.newSelector,
      failureDescription,
      confidence: primaryRepair.confidence || 94,
      candidatesScored: primaryRepair.candidatesScored || [],
      validationBefore: {
        recordsFound: 0,
        expectedCount: scraper.expectedCount,
      },
      validationAfter: {
        recordsFound: reScrapeOutput.rawCardCount,
        expectedCount: scraper.expectedCount,
        passedChecks: postValidation.passedChecks,
        totalChecks: postValidation.totalChecks,
      },
      status: isHealed ? 'verified' : 'applied',
    });

    res.json({
      success: true,
      message: isHealed
        ? `SCRAPER HEALED SUCCESSFULLY: ${reScrapeOutput.rawCardCount}/${scraper.expectedCount} records recovered!`
        : 'Repair applied but validation still failing.',
      data: {
        healingAttemptId: healingAttempt._id,
        scraperStatus: scraper.status,
        repairsApplied: repairsToApply,
        previousSelectors: scraper.previousSelectors,
        activeSelectors: scraper.selectors,
        recordsExtracted: reScrapeOutput.rawCardCount,
        validation: postValidation,
        items: reScrapeOutput.items,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── POST /api/scrapers/:id/reset ──────────────────────────────────────────────
router.post('/:id/reset', async (req, res) => {
  try {
    const scraper = await Scraper.findById(req.params.id);
    if (!scraper) {
      return res.status(404).json({ success: false, error: 'Scraper not found' });
    }

    scraper.targetDomVersion = 'v1_classic';
    scraper.status = 'healthy';
    scraper.selectors = {
      card: '.hotel-card',
      name: '.hotel-name',
      price: '.price',
      rating: '.rating',
      location: '.location',
      image: '.hotel-img',
    };
    scraper.previousSelectors = {
      card: null,
      name: null,
      price: null,
      rating: null,
      location: null,
      image: null,
    };
    await scraper.save();

    res.json({
      success: true,
      message: 'Scraper reset to baseline V1 configuration.',
      data: scraper,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /api/scrapers/:id/history ─────────────────────────────────────────────
router.get('/:id/history', async (req, res) => {
  try {
    const [runs, healings] = await Promise.all([
      ScrapeRun.find({ scraperId: req.params.id }).sort({ createdAt: -1 }).limit(30),
      HealingAttempt.find({ scraperId: req.params.id }).sort({ createdAt: -1 }).limit(30),
    ]);

    res.json({
      success: true,
      data: {
        runs,
        healings,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /api/scrapers/:id/results ─────────────────────────────────────────────
router.get('/:id/results', async (req, res) => {
  try {
    const latestResult = await ScrapeResult.findOne({ scraperId: req.params.id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: latestResult ? latestResult.items : [],
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
