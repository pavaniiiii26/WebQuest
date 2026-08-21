const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export async function fetchDestinations() {
  const response = await fetch(`${API_BASE_URL}/destinations`);
  if (!response.ok) throw new Error('Failed to fetch destinations');
  const json = await response.json();
  return json.data;
}

export async function fetchDestinationDetail(name) {
  const response = await fetch(`${API_BASE_URL}/destinations/${encodeURIComponent(name)}`);
  if (!response.ok) throw new Error('Failed to fetch destination detail');
  const json = await response.json();
  return json.data;
}

export async function searchDestinations(query) {
  const response = await fetch(`${API_BASE_URL}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  });
  if (!response.ok) throw new Error('Search failed');
  const json = await response.json();
  return json.data;
}

export async function fetchScraperHealth() {
  const response = await fetch(`${API_BASE_URL}/scraper-health`);
  if (!response.ok) throw new Error('Failed to fetch scraper health');
  return await response.json();
}
