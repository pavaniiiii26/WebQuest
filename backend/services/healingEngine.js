/**
 * Self-Healing Engine
 *
 * Deterministic multi-factor scoring algorithm.
 * Evaluates candidate replacement selectors with ZERO LLM reliance.
 */

import { findCandidateSelectors } from './selectorFinder.js';

// Semantic synonym dictionary for deterministic lexical alignment
const FIELD_SYNONYMS = {
  card: ['card', 'item', 'stay', 'property', 'listing', 'hotel', 'unit', 'container', 'box', 'entry'],
  name: ['title', 'name', 'heading', 'header', 'label', 'property', 'hotel', 'resort', 'headline'],
  price: ['amount', 'price', 'rate', 'cost', 'nightly', 'fee', 'charge', 'pricing', 'total', 'dollar'],
  rating: ['score', 'rating', 'stars', 'badge', 'review', 'grade', 'points', 'rank'],
  location: ['location', 'address', 'city', 'region', 'area', 'neighborhood', 'place', 'geo'],
  image: ['thumb', 'image', 'photo', 'picture', 'cover', 'img', 'media', 'preview', 'thumbnail'],
};

export function diagnoseAndHeal(html, failedField, failedSelector, cardSelector = null, userHint = '', expectedCount = 20) {
  const startTime = Date.now();

  // 1. Gather all candidates from DOM
  const rawCandidates = findCandidateSelectors(html, failedField, cardSelector, expectedCount);

  if (rawCandidates.length === 0) {
    return {
      highestCandidate: null,
      candidatesScored: [],
      confidence: 0,
      durationMs: Date.now() - startTime,
    };
  }

  // 2. Parse user hint for deterministic keyword tokens
  const hintTokens = (userHint || '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);

  // 3. Score each candidate
  const candidatesScored = rawCandidates.map(candidate => {
    const { selector, matchCount, sampleText = '', sampleAttr = {} } = candidate;

    // ── Factor 1: Count Parity (30 points max) ──────────────────────────────
    let countParity = 0;
    const diff = Math.abs(matchCount - expectedCount);
    if (diff === 0) {
      countParity = 30;
    } else if (diff <= 2) {
      countParity = 25;
    } else if (diff <= 5) {
      countParity = 15;
    } else {
      countParity = Math.max(0, 30 - diff * 2);
    }

    // ── Factor 2: Field Type Validity (25 points max) ───────────────────────
    let typeValidity = 0;
    const textLower = sampleText.toLowerCase();

    if (failedField === 'price') {
      const hasCurrency = /[$€£]|usd|eur|\/night|night/i.test(sampleText);
      const hasNumber = /\d+/.test(sampleText);
      if (hasCurrency && hasNumber) typeValidity = 25;
      else if (hasNumber) typeValidity = 15;
    } else if (failedField === 'rating') {
      const hasStar = /★|star|rating/i.test(sampleText);
      const isRatingNumber = /[1-5]\.[0-9]|[1-9]\/10|[1-5]/.test(sampleText);
      if (hasStar || isRatingNumber) typeValidity = 25;
      else if (sampleText.length > 0 && sampleText.length <= 10) typeValidity = 12;
    } else if (failedField === 'name') {
      const isWordy = sampleText.length >= 4 && sampleText.length <= 90;
      const isNotPriceOrRating = !/^\$\d+/.test(sampleText) && !/^\d\.\d\s*★?$/.test(sampleText);
      if (isWordy && isNotPriceOrRating) typeValidity = 25;
      else if (isWordy) typeValidity = 12;
    } else if (failedField === 'image') {
      const isImgTag = selector.includes('img') || Boolean(sampleAttr.src);
      if (isImgTag) typeValidity = 25;
    } else if (failedField === 'card') {
      if (matchCount === expectedCount) typeValidity = 25;
    } else {
      if (sampleText.length > 0) typeValidity = 20;
    }

    // ── Factor 3: Structural Tree Similarity (20 points max) ────────────────
    let structuralSimilarity = 10;
    if (failedField === 'name' && (selector.includes('h3') || selector.includes('h2') || selector.includes('title'))) {
      structuralSimilarity = 20;
    } else if (failedField === 'card' && (selector.includes('article') || selector.includes('card') || selector.includes('stay') || selector.includes('item'))) {
      structuralSimilarity = 20;
    } else if (failedField === 'image' && selector.includes('img')) {
      structuralSimilarity = 20;
    }

    // ── Factor 4: Lexical Similarity & Synonyms (15 points max) ──────────────
    let lexicalSimilarity = 0;
    const selectorTokens = selector.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(Boolean);
    const synonyms = FIELD_SYNONYMS[failedField] || [];

    const matchesSynonym = selectorTokens.some(tok => synonyms.includes(tok));
    if (matchesSynonym) {
      lexicalSimilarity = 15;
    } else {
      // Levenshtein similarity against failed selector clean name
      const cleanFailed = failedSelector.replace(/[^a-z0-9]/gi, '').toLowerCase();
      const cleanCandidate = selector.replace(/[^a-z0-9]/gi, '').toLowerCase();
      const levScore = calculateStringSimilarity(cleanFailed, cleanCandidate);
      lexicalSimilarity = Math.round(levScore * 15);
    }

    // ── Factor 5: User Hint Bonus (10 points max) ───────────────────────────
    let hintBonus = 0;
    if (hintTokens.length > 0) {
      const matchesHint = hintTokens.some(hint => selector.toLowerCase().includes(hint));
      if (matchesHint) {
        hintBonus = 10;
      }
    }

    // ── Total Confidence Calculation ────────────────────────────────────────
    const totalScore = Math.min(100, Math.round(countParity + typeValidity + structuralSimilarity + lexicalSimilarity + hintBonus));

    return {
      selector,
      matchCount,
      confidence: totalScore,
      sampleText: sampleText.length > 60 ? `${sampleText.substring(0, 60)}...` : sampleText,
      typeMatch: typeValidity >= 15,
      scoreBreakdown: {
        countParity,
        typeValidity,
        structuralSimilarity,
        lexicalSimilarity,
        hintBonus,
      },
    };
  });

  // Sort descending by confidence
  candidatesScored.sort((a, b) => b.confidence - a.confidence);

  const highestCandidate = candidatesScored[0] || null;

  return {
    highestCandidate,
    candidatesScored: candidatesScored.slice(0, 8), // Top 8 candidates
    confidence: highestCandidate ? highestCandidate.confidence : 0,
    durationMs: Date.now() - startTime,
  };
}

/**
 * Standard Levenshtein / Dice Coefficient string similarity
 */
function calculateStringSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 1;

  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;
  if (longer.includes(shorter)) return 0.7;

  // Simple token/bigram overlap
  const getBigrams = s => {
    const bigrams = new Set();
    for (let i = 0; i < s.length - 1; i++) {
      bigrams.add(s.substring(i, i + 2));
    }
    return bigrams;
  };

  const b1 = getBigrams(str1);
  const b2 = getBigrams(str2);
  let intersection = 0;

  for (const b of b1) {
    if (b2.has(b)) intersection++;
  }

  return (2.0 * intersection) / (b1.size + b2.size || 1);
}

export default { diagnoseAndHeal };
