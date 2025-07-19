const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export async function cacheExtractedData(docType, data) {
  const resp = await fetch(`${API_BASE_URL}/api/cache-extracted`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ docType, data }),
  });
  if (!resp.ok) {
    throw new Error('Cache failed');
  }
  return true;
}

export async function getCachedExtracted(docType) {
  const resp = await fetch(`${API_BASE_URL}/api/cache-extracted/${docType}`);
  if (!resp.ok) {
    throw new Error('Fetch failed');
  }
  return resp.json();
}
