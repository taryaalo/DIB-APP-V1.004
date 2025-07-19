const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export async function uploadDocument(file, docType) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('docType', docType);

  const resp = await fetch(`${API_BASE_URL}/api/cache-upload`, {
    method: 'POST',
    body: formData,
  });

  if (!resp.ok) {
    throw new Error('Upload failed');
  }

  return true;
}
