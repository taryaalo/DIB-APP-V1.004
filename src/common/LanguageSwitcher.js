import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  return (
    <div className="language-switcher">
      <span className={i18n.language === 'en' ? 'active' : ''} onClick={() => i18n.changeLanguage('en')}>English</span>
      <span className={i18n.language === 'ar' ? 'active' : ''} onClick={() => i18n.changeLanguage('ar')}>العربية</span>
    </div>
  );
};

export default LanguageSwitcher;
