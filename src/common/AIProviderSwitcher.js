import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';

const AIProviderSwitcher = ({ provider, onChange }) => {
  const { language } = useLanguage();
  return (
    <div className="language-switcher ai-provider-switcher">
      <span
        className={provider === 'gemini' ? 'active' : ''}
        onClick={() => onChange('gemini')}
      >
        {t('gemini', language)}
      </span>
      <span
        className={provider === 'chatgpt' ? 'active' : ''}
        onClick={() => onChange('chatgpt')}
      >
        {t('chatgpt', language)}
      </span>
    </div>
  );
};

export default AIProviderSwitcher;
