/**
 * Selector Finder Service
 *
 * Traverses and inspects HTML DOM structures to discover candidate selectors.
 * Detects class patterns, data attributes, tag hierarchies, and repeating clusters.
 */

import * as cheerio from 'cheerio';

export function findCandidateSelectors(html, targetField, cardSelector = null, expectedCount = 20) {
  const $ = cheerio.load(html);
  const candidates = new Map();

  // Helper to register candidate
  const register = (selector, sampleText = '', sampleAttr = {}) => {
    if (!selector || selector.includes(':') || selector === 'script' || selector === 'style') return;

    try {
      const matchCount = $(selector).length;
      if (matchCount === 0) return;

      if (!candidates.has(selector)) {
        candidates.set(selector, {
          selector,
          matchCount,
          sampleText,
          sampleAttr,
          depth: selector.split(' ').length,
        });
      }
    } catch (_) {
      // Invalid selector syntax ignored
    }
  };

  if (targetField === 'card') {
    // ── Search for Repeating Card Containers ────────────────────────────────
    // Check all articles, sections, divs with repeating classes or testids
    $('article, div, li, section').each((_, el) => {
      const elem = $(el);
      const tag = el.name;
      const classAttr = elem.attr('class') || '';
      const testId = elem.attr('data-testid') || '';

      if (classAttr) {
        classAttr.split(/\s+/).forEach(cls => {
          if (cls && !cls.startsWith('ng-') && !cls.startsWith('js-')) {
            register(`.${cls}`);
            register(`${tag}.${cls}`);
          }
        });
      }

      if (testId) {
        register(`[data-testid="${testId}"]`);
      }
    });
  } else {
    // ── Search for Field Selectors inside Target Card ────────────────────────
    let searchScope = $('body');
    if (cardSelector && $(cardSelector).length > 0) {
      searchScope = $(cardSelector);
    }

    searchScope.find('*').each((_, el) => {
      const elem = $(el);
      const tag = el.name;
      const classAttr = elem.attr('class') || '';
      const dataField = elem.attr('data-field') || '';
      const text = elem.text().trim();
      const src = elem.attr('src') || '';

      // 1. Data fields
      if (dataField) {
        register(`[data-field="${dataField}"]`, text);
        register(`${tag}[data-field="${dataField}"]`, text);
      }

      // 2. Class names
      if (classAttr) {
        classAttr.split(/\s+/).forEach(cls => {
          if (cls) {
            register(`.${cls}`, text);
            register(`${tag}.${cls}`, text);
          }
        });
      }

      // 3. Tag names for titles and images
      if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') {
        register(tag, text);
      }
      if (tag === 'img' && src) {
        register('img', '', { src });
      }
    });
  }

  return Array.from(candidates.values());
}

export default { findCandidateSelectors };
