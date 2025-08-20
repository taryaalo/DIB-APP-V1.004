import React from 'react';
import { t } from '../i18n';

const Footer = ({ noBackground = false }) => {
  return (
    <footer className={`footer${noBackground ? ' footer-transparent' : ''}`}>
      {t('copyRight')}
    </footer>
  );
};

export default Footer;
