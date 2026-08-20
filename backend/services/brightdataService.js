import fetch from 'node-fetch';
import { config } from '../config/env.js';

/**
 * Trigger Bright Data Dataset API collection run
 */
export async function triggerDatasetRun(datasetId, params = {}) {
  const token = config.brightDataApiToken;
  if (!token) {
    throw new Error('BRIGHTDATA_API_TOKEN is not configured.');
  }

  const url = `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${encodeURIComponent(datasetId)}&format=json`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([params]),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Bright Data Trigger API failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  // Bright Data returns { snapshot_id: '...' }
  const snapshotId = data.snapshot_id || data.id || data.snapshotId;
  if (!snapshotId) {
    throw new Error('Bright Data trigger response did not contain a valid snapshot_id.');
  }

  return snapshotId;
}

/**
 * Poll Bright Data Dataset snapshot progress until ready or timeout
 */
export async function pollSnapshotStatus(snapshotId, maxAttempts = 10, delayMs = 2000) {
  const token = config.brightDataApiToken;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const url = `https://api.brightdata.com/datasets/v3/progress/${snapshotId}`;
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const status = data.status || data.state;
        if (status === 'ready' || status === 'completed') {
          return true;
        }
        if (status === 'failed') {
          throw new Error(`Bright Data snapshot ${snapshotId} failed during processing.`);
        }
      }
    } catch (err) {
      if (attempt === maxAttempts) throw err;
    }

    // Wait before next poll attempt
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error(`Bright Data snapshot ${snapshotId} timed out waiting for ready status.`);
}

/**
 * Fetch data snapshot results from Bright Data
 */
export async function fetchSnapshotData(snapshotId) {
  const token = config.brightDataApiToken;
  const url = `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Bright Data Snapshot Fetch failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [data];
}

/**
 * Fallback: Fetch raw HTML via Bright Data Web Unlocker proxy/API
 */
export async function fetchViaWebUnlocker(targetUrl) {
  const token = config.brightDataApiToken;
  const unlockerUrl = `https://api.brightdata.com/zone/unblocker`;

  try {
    const response = await fetch(unlockerUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: targetUrl,
        country: 'us',
        render_js: true,
      }),
    });

    if (response.ok) {
      return await response.text();
    }
  } catch (err) {
    console.warn(`Bright Data Web Unlocker API call error: ${err.message}`);
  }

  // Direct fetch fallback if API unblocker endpoint is not available
  const directRes = await fetch(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });
  return await directRes.text();
}
