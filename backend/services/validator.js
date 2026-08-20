/**
 * Validator Service
 *
 * Enforces strict schema integrity, minimum records threshold, and field-level formatting rules.
 */

export function validateScrapeResults(scrapeOutput, expectedCount = 20) {
  const { items = [], rawCardCount = 0, fieldCounts = {} } = scrapeOutput;

  const errors = [];
  let totalChecks = 0;
  let passedChecks = 0;

  // ── 1. Container / Card Count Check ───────────────────────────────────────
  totalChecks++;
  if (rawCardCount === 0) {
    errors.push({
      field: 'card',
      message: `Card container selector found 0 elements (Expected ${expectedCount}).`,
      severity: 'critical',
    });
  } else if (rawCardCount < expectedCount) {
    errors.push({
      field: 'card',
      message: `Card count discrepancy: found ${rawCardCount} elements, expected ${expectedCount}.`,
      severity: 'warning',
    });
    passedChecks += 0.5;
  } else {
    passedChecks++;
  }

  // ── 2. Name Field Check ───────────────────────────────────────────────────
  totalChecks++;
  const nameMatches = fieldCounts.name || 0;
  if (rawCardCount > 0 && nameMatches === 0) {
    errors.push({
      field: 'name',
      message: 'Name selector returned zero text values across all cards.',
      severity: 'critical',
    });
  } else if (rawCardCount > 0 && nameMatches < rawCardCount) {
    errors.push({
      field: 'name',
      message: `Incomplete names: only ${nameMatches}/${rawCardCount} cards populated with a name.`,
      severity: 'warning',
    });
    passedChecks += nameMatches / rawCardCount;
  } else if (rawCardCount > 0 && nameMatches >= rawCardCount) {
    passedChecks++;
  }

  // ── 3. Price Field & Format Check ─────────────────────────────────────────
  totalChecks++;
  const priceMatches = fieldCounts.price || 0;
  if (rawCardCount > 0 && priceMatches === 0) {
    errors.push({
      field: 'price',
      message: 'Price selector returned zero values across all cards.',
      severity: 'critical',
    });
  } else if (rawCardCount > 0) {
    // Check if extracted prices have numerical values
    const validNumericPrices = items.filter(i => i.priceNumber !== null && i.priceNumber > 0).length;
    if (validNumericPrices === rawCardCount) {
      passedChecks++;
    } else {
      passedChecks += validNumericPrices / rawCardCount;
      errors.push({
        field: 'price',
        message: `Format error: only ${validNumericPrices}/${rawCardCount} cards contain valid numeric pricing.`,
        severity: 'warning',
      });
    }
  }

  // ── 4. Rating Field Check ─────────────────────────────────────────────────
  totalChecks++;
  const ratingMatches = fieldCounts.rating || 0;
  if (rawCardCount > 0 && ratingMatches === 0) {
    errors.push({
      field: 'rating',
      message: 'Rating selector returned zero values.',
      severity: 'warning',
    });
  } else if (rawCardCount > 0) {
    const validRatings = items.filter(i => i.ratingNumber !== null && i.ratingNumber >= 1.0 && i.ratingNumber <= 5.0).length;
    if (validRatings === rawCardCount) {
      passedChecks++;
    } else {
      passedChecks += validRatings / rawCardCount;
    }
  }

  // ── 5. Overall Pass / Fail Calculation ────────────────────────────────────
  const scorePct = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
  const isValid = rawCardCount >= expectedCount && scorePct >= 90 && !errors.some(e => e.severity === 'critical');

  return {
    isValid,
    scorePct,
    totalChecks,
    passedChecks: Math.round(passedChecks * 10) / 10,
    failedChecks: errors.length,
    errors,
  };
}

export default { validateScrapeResults };
