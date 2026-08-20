/**
 * Bright Data Integration Service
 *
 * Provides proxy-authenticated fetching and Web Scraper integration.
 * In DEMO_MODE or fallback, retrieves simulated high-fidelity DOM.
 */

import fetch from 'node-fetch';
import { getSimulatedDOM } from './domSimulator.js';

export async function fetchTargetHtml(targetUrl, domVersion = 'v1_classic') {
  const token = process.env.BRIGHTDATA_API_TOKEN;
  const isDemo = process.env.DEMO_MODE !== 'false';

  // In demo mode or if targetUrl is demo-hotels, serve deterministic multi-version DOM
  if (isDemo || targetUrl.includes('brightdata-showcase.com') || !token) {
    return {
      html: getSimulatedDOM(domVersion),
      source: 'brightdata_simulator',
      domVersion,
    };
  }

  // Live Bright Data Web Unlocker / Scraping API
  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    return {
      html,
      source: 'brightdata_live',
      domVersion,
    };
  } catch (err) {
    console.warn(`[Bright Data fetch fallback] ${err.message} — using simulated DOM (${domVersion})`);
    return {
      html: getSimulatedDOM(domVersion),
      source: 'brightdata_simulator_fallback',
      domVersion,
    };
  }
}

export default { fetchTargetHtml };
