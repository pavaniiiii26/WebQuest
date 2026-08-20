/**
 * Failure Detector Service
 *
 * Pinpoints root cause failure mechanisms:
 * - Card container shifts
 * - Inner field selector mutations
 * - Text/attribute extraction drop-offs
 */

export function detectFailures(selectors, scrapeOutput, validationResult, expectedCount = 20) {
  const { rawCardCount = 0, fieldCounts = {} } = scrapeOutput;
  const brokenSelectors = [];

  // Case 1: Card container selector completely failed
  if (rawCardCount === 0) {
    brokenSelectors.push({
      field: 'card',
      selector: selectors.card,
      reason: 'Container selector returned zero elements.',
      severity: 'critical',
    });
  } else {
    // Case 2: Card container exists, check each field
    for (const [field, selector] of Object.entries(selectors)) {
      if (field === 'card' || !selector) continue;

      const count = fieldCounts[field] || 0;
      if (count === 0) {
        brokenSelectors.push({
          field,
          selector,
          reason: `Selector '${selector}' matched 0 elements inside the ${rawCardCount} identified cards.`,
          severity: field === 'name' || field === 'price' ? 'critical' : 'warning',
        });
      } else if (count < rawCardCount * 0.5) {
        brokenSelectors.push({
          field,
          selector,
          reason: `Severe extraction degradation: only ${count}/${rawCardCount} items matched selector '${selector}'.`,
          severity: 'warning',
        });
      }
    }
  }

  const isBroken = brokenSelectors.length > 0 || !validationResult.isValid;
  const primaryFailure = brokenSelectors[0] || null;

  return {
    isBroken,
    primaryFailure,
    brokenSelectors,
    summary: isBroken
      ? `Failure detected in ${brokenSelectors.length} selector(s). Primary: '${primaryFailure?.selector}' (${primaryFailure?.field}).`
      : 'All selectors functioning normally.',
    expectedCount,
    recordsFound: rawCardCount,
  };
}

export default { detectFailures };
