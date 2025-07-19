import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';

const Footer = ({ noBackground = false }) => {
  const { language } = useLanguage();
  return (
    <footer className={`footer${noBackground ? ' footer-transparent' : ''}`}>
      {t('copyRight', language)}
    </footer>
  );
};

export default Footer;
