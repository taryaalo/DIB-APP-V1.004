const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export async function logToServer(message) {
  try {
    await fetch(`${API_BASE_URL}/api/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
  } catch (e) {
    console.error('Log failed', e);
  }
}

export async function logErrorToServer(message) {
  try {
    await fetch(`${API_BASE_URL}/api/error-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
  } catch (e) {
    console.error('Error log failed', e);
  }
}
