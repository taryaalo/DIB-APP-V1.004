import React from 'react';
import { LOGO_WHITE } from '../assets/imagePaths';
import LanguageSwitcher from '../common/LanguageSwitcher';
import ThemeSwitcher from '../common/ThemeSwitcher';
import Footer from '../common/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';

const EServicesLanding = ({ onNavigate }) => {
  const { language } = useLanguage();
  return (
    <div className="landing-container">
      <div className="header-switchers" style={{ position: 'absolute', top: 20, right: 20 }}>
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
      <div className="content-wrapper">
        <img src={LOGO_WHITE} alt="Bank Logo" className="landing-logo" />
        <h1 className="landing-title">{t('eservicesTitle', language)}</h1>
        <p className="landing-subtitle">{t('eservicesSub', language)}</p>
        <button className="btn-next" onClick={() => onNavigate('landing')}>
          {t('back', language)}
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default EServicesLanding;