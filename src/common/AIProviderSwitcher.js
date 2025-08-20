import React from 'react';
import { t } from '../i18n';

const AIProviderSwitcher = ({ provider, onChange }) => {
  return (
    <div className="language-switcher ai-provider-switcher">
      <span
        className={provider === 'gemini' ? 'active' : ''}
        onClick={() => onChange('gemini')}
      >
        {t('gemini')}
      </span>
      <span
        className={provider === 'chatgpt' ? 'active' : ''}
        onClick={() => onChange('chatgpt')}
      >
        {t('chatgpt')}
      </span>
      <span
        className={provider === 'tesseract' ? 'active' : ''}
        onClick={() => onChange('tesseract')}
      >
        {t('tesseract')}
      </span>
    </div>
  );
};

export default AIProviderSwitcher;
