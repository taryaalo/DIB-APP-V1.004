import React from 'react';
import { LOGO_WHITE, LOGO_COLOR } from '../assets/imagePaths';
import { OpenAccountIcon, CompleteAccountIcon } from '../common/Icons';
import LanguageSwitcher from '../common/LanguageSwitcher';
import ThemeSwitcher from '../common/ThemeSwitcher';
import Footer from '../common/Footer';
import { t } from '../i18n';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const LandingPage_EN = ({ onNavigate }) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  return (
    <div className="landing-container">
      <div className="header-switchers" style={{ position: 'absolute', top: 20, right: 20 }}>
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
      <div className="content-wrapper">
        <img src={theme === 'light' ? LOGO_COLOR : LOGO_WHITE} alt="Bank Logo" className="landing-logo" />
        <h1 className="landing-title">{t('welcomeTitle', language)}</h1>
        <p className="landing-subtitle">{t('welcomeSub', language)}</p>
        <div className="landing-buttons-container">
          <button onClick={() => onNavigate('selectUser')}>
            <OpenAccountIcon />
            <span>{t('openAccount', language)}</span>
          </button>
          <button onClick={() => onNavigate('completeAccount')} className="btn-secondary">
            <CompleteAccountIcon />
            <span>{t('completeAccount', language)}</span>
          </button>
          <button onClick={() => onNavigate('eServices')} className="btn-secondary">
            <CompleteAccountIcon />
            <span>{t('registerEServices', language)}</span>
          </button>
        </div>
      </div>
      <Footer noBackground />
    </div>
  );
};
export default LandingPage_EN;