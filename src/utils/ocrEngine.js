import Tesseract from 'tesseract.js';
import { logToServer } from './logger';
import { BoundingBox } from './geometry';

/**
 * Extract text from an image using Tesseract.js
 * @param {File|string} file - image File or URL/base64 string
 * @param {Object} options
 * @param {string} [options.lang='eng+ara'] - language code
 * @param {BoundingBox} [options.rect] - optional region of interest
 * @returns {Promise<string>} recognized text
 */
export async function extractText(file, options = {}) {
  const { lang = 'eng+ara', rect } = options;
  const image = file instanceof File ? URL.createObjectURL(file) : file;
  try {
    const recognitionOptions = {};
    if (rect instanceof BoundingBox) {
      recognitionOptions.rectangle = rect.toRectangle();
    }
    const result = await Tesseract.recognize(image, lang, recognitionOptions);
    const text = result.data.text;
    logToServer(`TESSERACT_RESULT ${text.substring(0, 100)}`);
    return text;
  } catch (e) {
    logToServer(`TESSERACT_ERROR ${e.message}`);
    throw e;
  } finally {
    if (file instanceof File) {
      URL.revokeObjectURL(image);
    }
  }
}
