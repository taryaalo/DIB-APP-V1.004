const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

function logAIResponse(message) {
  const file = path.join(
    logsDir,
    `ai_respo_${new Date().toISOString().split('T')[0]}.log`
  );
  const entry = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFile(file, entry, err => {
    if (err) console.error('AI log error:', err);
  });
}

async function callChatGPT(prompt, base64Data, mimeType) {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  if (!apiKey) {
    logAIResponse('Missing OpenAI API key');
    throw new Error('Missing API key');
  }

  const openaiUrl =
    process.env.REACT_APP_OPENAI_URL ||
    'https://api.openai.com/v1/chat/completions';

  try {
    const resp = await fetch(openaiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You extract data from images and return JSON.' },
          {
            role: 'user',
            content: [
              { type: 'text', text: `${prompt} Only return valid JSON.` },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Data}` } },
            ],
          },
        ],
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await resp.json();
    logAIResponse(`CHATGPT_RESPONSE ${JSON.stringify(data)}`);

    if (!resp.ok) {
      throw new Error(`OpenAI request failed: ${resp.status}`);
    }

    return data;
  } catch (err) {
    logAIResponse(`CHATGPT_ERROR ${err.message}`);
    throw err;
  }
}

async function callGemini(payload) {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  if (!apiKey) {
    logAIResponse('Missing Gemini API key');
    throw new Error('Missing API key');
  }
  const geminiUrl =
    process.env.REACT_APP_GEMINI_URL ||
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  const apiUrl = `${geminiUrl}?key=${apiKey}`;
  try {
    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    logAIResponse(`GEMINI_RESPONSE ${JSON.stringify(data)}`);
    if (!resp.ok) {
      throw new Error(`Gemini request failed: ${resp.status}`);
    }
    return data;
  } catch (err) {
    logAIResponse(`GEMINI_ERROR ${err.message}`);
    throw err;
  }
}

module.exports = {
  callChatGPT,
  callGemini,
  logAIResponse,
};