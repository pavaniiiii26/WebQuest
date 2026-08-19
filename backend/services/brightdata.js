/**
 * Bright Data Dataset API service.
 *
 * Uses the Bright Data Web Scraper / Dataset API to:
 *  1. Trigger a scraping job (returns a snapshot_id)
 *  2. Poll the snapshot status until "ready" or timeout
 *  3. Fetch and return the resulting records
 *
 * Docs: https://docs.brightdata.com/scraping-automation/web-scraper-api/overview
 */

import fetch from 'node-fetch';

const BASE_URL = 'https://api.brightdata.com';
const POLL_INTERVAL_MS = 4000;

/**
 * Trigger a Bright Data dataset snapshot job.
 * @param {string} datasetId
 * @param {object} inputParams — e.g. { keyword: "Hotels in Goa" } or { location: "Goa, India" }
 * @returns {Promise<string>} snapshot_id
 */
export async function triggerDatasetJob(datasetId, inputParams) {
  const token = process.env.BRIGHTDATA_API_TOKEN;
  if (!token) throw new Error('BRIGHTDATA_API_TOKEN not set');

  const url = `${BASE_URL}/datasets/v3/trigger?dataset_id=${datasetId}&include_errors=true`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([inputParams]),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Bright Data trigger failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  if (!data.snapshot_id) {
    throw new Error(`Bright Data did not return a snapshot_id: ${JSON.stringify(data)}`);
  }

  return data.snapshot_id;
}

/**
 * Poll a snapshot until status is "ready" or timeout.
 * @param {string} snapshotId
 * @param {number} timeoutMs
 * @returns {Promise<Array>} raw records array
 */
export async function pollSnapshotUntilReady(snapshotId, timeoutMs = 45000) {
  const token = process.env.BRIGHTDATA_API_TOKEN;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS);

    const statusRes = await fetch(
      `${BASE_URL}/datasets/v3/snapshot/${snapshotId}?format=json`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!statusRes.ok) {
      const text = await statusRes.text();
      throw new Error(`Snapshot status check failed (${statusRes.status}): ${text}`);
    }

    const contentType = statusRes.headers.get('content-type') || '';

    // If status is "running", the API returns JSON with a status field
    if (contentType.includes('application/json')) {
      const body = await statusRes.json();

      if (body.status === 'running' || body.status === 'pending') {
        continue; // still working
      }

      if (body.status === 'failed') {
        throw new Error(`Bright Data snapshot failed: ${body.message || 'unknown reason'}`);
      }

      // Ready — data returned inline
      if (Array.isArray(body)) return body;
      if (Array.isArray(body.data)) return body.data;
      return [];
    }

    // If content is NDJSON (each line is a JSON record)
    if (contentType.includes('application/x-ndjson') || contentType.includes('text/plain')) {
      const text = await statusRes.text();
      if (!text.trim()) continue;

      return text
        .trim()
        .split('\n')
        .map(line => {
          try { return JSON.parse(line); }
          catch { return null; }
        })
        .filter(Boolean);
    }
  }

  throw new Error(`Snapshot ${snapshotId} timed out after ${timeoutMs / 1000}s`);
}

/**
 * High-level helper: trigger + poll a Bright Data dataset job.
 * Returns { records, timedOut } — timedOut=true means we gave up gracefully.
 */
export async function scrapeDataset(datasetId, inputParams, timeoutMs = 45000) {
  const snapshotId = await triggerDatasetJob(datasetId, inputParams);
  const records = await pollSnapshotUntilReady(snapshotId, timeoutMs);
  return { records, snapshotId };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
