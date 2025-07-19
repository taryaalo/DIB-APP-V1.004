import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';

const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();
  return (
    <div className="language-switcher" onClick={toggleLanguage}>
      <span className={language === 'en' ? 'active' : ''}>{t('english', language)}</span>
      <span className={language === 'ar' ? 'active' : ''}>{t('arabic', language)}</span>
    </div>
  );
};

export default LanguageSwitcher;
