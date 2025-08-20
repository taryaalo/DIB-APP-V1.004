import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LOGO_WHITE } from '../assets/imagePaths';
import LanguageSwitcher from '../common/LanguageSwitcher';
import ThemeSwitcher from '../common/ThemeSwitcher';
import Footer from '../common/Footer';
import { useTranslation } from 'react-i18next';

const EServicesLanding = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="landing-container">
      <div className="header-switchers" style={{ position: 'absolute', top: 20, right: 20 }}>
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
      <div className="content-wrapper">
        <img src={LOGO_WHITE} alt="Bank Logo" className="landing-logo" />
        <h1 className="landing-title">{t('eservicesTitle')}</h1>
        <p className="landing-subtitle">{t('eservicesSub')}</p>
        <button className="btn-next" onClick={() => navigate('/landing')}>
          {t('back')}
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default EServicesLanding;