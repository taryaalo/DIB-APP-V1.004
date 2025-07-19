import { logToServer } from './logger';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export const fileToBase64 = (file) => new Promise((resolve, reject) => {
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
    expiryDate: { type: 'STRING' }
  }
};

const nidSchema = {
  type: 'OBJECT',
  properties: {
    familyId: { type: 'STRING' },
    nationalId: { type: 'STRING' },
    sex: { type: 'STRING' },
    birthDay: { type: 'STRING' },
    birthMonth: { type: 'STRING' },
    birthYear: { type: 'STRING' },
    motherFullName: { type: 'STRING' },
    maritalStatus: { type: 'STRING' }
  }
};

async function callGemini(payload) {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  const geminiUrl = process.env.REACT_APP_GEMINI_URL ||
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  const apiUrl = `${geminiUrl}?key=${apiKey}`;
  const resp = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await resp.json();
  if (result.candidates && result.candidates[0].content.parts[0].text) {
    try {
      return JSON.parse(result.candidates[0].content.parts[0].text);
    } catch {
      return null;
    }
  }
  return null;
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

export async function extractPassportData(file, provider = 'gemini') {
  const base64Data = await fileToBase64(file);
  const prompt = 'Extract the following fields from the passport image: Full Name (Arabic), Given Name (English), Surname (English), Passport No, Date of Birth, Place of Birth, Date of Issue, Issuing Place, Sex, Nationality, and Expiry Date. Return the data in the specified JSON format.';
  if (provider === 'chatgpt') {
    return callChatGPT(prompt, base64Data, file.type || 'image/png');
  }
  const payload = {
    contents: [{
      parts: [
        { text: prompt },
        { inlineData: { mimeType: file.type || 'image/png', data: base64Data } }
      ]
    }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: passportSchema
    }
  };
  return callGemini(payload);
}

export async function extractNIDData(file, provider = 'gemini') {
  const base64Data = await fileToBase64(file);
  const prompt = 'Extract the following fields from the NID document image: Family Record Number (\u0631\u0642\u0645 \u0642\u064a\u062f \u0627\u0644\u0639\u0627\u0626\u0644\u0629), National ID (\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0648\u0637\u0646\u064a), Sex (\u0627\u0644\u062c\u0646\u0633), Day of Birth, Month of Birth, Year of Birth, Mother\'s Full Name, and Marital Status. Return the data in the specified JSON format.';
  if (provider === 'chatgpt') {
    return callChatGPT(prompt, base64Data, file.type || 'image/png');
  }
  const payload = {
    contents: [{
      parts: [
        { text: prompt },
        { inlineData: { mimeType: file.type || 'image/png', data: base64Data } }
      ]
    }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: nidSchema
    }
  };
  return callGemini(payload);
}