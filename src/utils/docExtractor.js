import { t } from '../i18n';
import { logToServer } from './logger';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

// Convert a file to base64 string
const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result.split(',')[1]);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const passportSchema = {
  type: 'OBJECT',
  properties: {
    fullNameArabic: { type: 'STRING' },
    givenNameEng: { type: 'STRING' },
    surnameEng: { type: 'STRING' },
    passportNo: { type: 'STRING' },
    dateOfBirth: { type: 'STRING' },
    placeOfBirth: { type: 'STRING' },
    dateOfIssue: { type: 'STRING' },
    issuingPlace: { type: 'STRING' },
    sex: { type: 'STRING' },
    nationality: { type: 'STRING' },
    expiryDate: { type: 'STRING' },
  },
};

const genericSchema = { type: 'OBJECT' };

const DOC_CONFIGS = {
  passport: {
    instruction: `Extract the following fields from the passport image: ${Object.keys(passportSchema.properties).join(', ')}. Return the data in the specified JSON format.`,
    schema: passportSchema,
  },
  nationalId: {
    instruction: 'Extract any readable fields from the National ID image in JSON format.',
    schema: genericSchema,
  },
  letter: {
    instruction: 'Extract any structured data from this letter image in JSON format.',
    schema: genericSchema,
  },
  photo: {
    instruction: 'Describe the person in the photo in JSON format with a single field "description".',
    schema: { type: 'OBJECT', properties: { description: { type: 'STRING' } } },
  },
};

async function callGemini(payload) {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const text = await resp.text();
      logToServer(`GEMINI_ERROR ${resp.status} ${text}`);
      throw new Error(`Gemini request failed: ${resp.status}`);
    }

    const result = await resp.json();
    logToServer(`GEMINI_RESPONSE ${JSON.stringify(result)}`);
    return result;
  } catch (e) {
    logToServer(`GEMINI_ERROR ${e.message}`);
    throw e;
  }
}

async function callChatGPT(prompt, base64Data, mimeType) {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/chatgpt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, base64Data, mimeType }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      logToServer(`CHATGPT_ERROR ${resp.status} ${text}`);
      throw new Error(`OpenAI request failed: ${resp.status}`);
    }

    const result = await resp.json();
    logToServer(`CHATGPT_RESPONSE ${JSON.stringify(result)}`);
    if (result.choices && result.choices[0].message && result.choices[0].message.content) {
      try {
        return JSON.parse(result.choices[0].message.content);
      } catch {
        return null;
      }
    }
    return null;
  } catch (e) {
    logToServer(`CHATGPT_ERROR ${e.message}`);
    throw e;
  }
}

export async function extractDocumentData(file, docType, provider = 'gemini') {
  const config = DOC_CONFIGS[docType] || DOC_CONFIGS.passport;
  const base64Data = await fileToBase64(file);
  if (provider === 'chatgpt') {
    return callChatGPT(config.instruction, base64Data, file.type || 'image/png');
  }
  const payload = {
    contents: [{
      parts: [
        { text: config.instruction },
        { inlineData: { mimeType: file.type || 'image/png', data: base64Data } },
      ],
    }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: config.schema,
    },
  };
  return callGemini(payload);
}
