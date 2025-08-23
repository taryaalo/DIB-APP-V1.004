import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LOGO_WHITE, LOGO_COLOR } from '../assets/imagePaths';
import { OpenAccountIcon, CompleteAccountIcon } from '../common/Icons';
import LanguageSwitcher from '../common/LanguageSwitcher';
import ThemeSwitcher from '../common/ThemeSwitcher';
import Footer from '../common/Footer';
import { useTheme } from '../contexts/ThemeContext';
import { useFormData } from '../contexts/FormContext';

const LandingPage_EN = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { updateFormData: setFormData } = useFormData();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/api/clear-cache`, { method: 'POST' }).catch(() => {});
    if (setFormData) {
  setFormData({ provider: 'gemini' });
}
  }, [setFormData]);
  return (
    <div className="landing-container">
      <div className="header-switchers" style={{ position: 'absolute', top: 20, right: 20 }}>
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
      <div className="content-wrapper">
        <img src={theme === 'light' ? LOGO_COLOR : LOGO_WHITE} alt="Bank Logo" className="landing-logo" />
        <h1 className="landing-title">{t('welcomeTitle')}</h1>
        <p className="landing-subtitle">{t('welcomeSub')}</p>
        <div className="landing-buttons-container">
          <button onClick={() => navigate('/select-user')}>
            <OpenAccountIcon />
            <span>{t('openAccount')}</span>
          </button>
          <button onClick={() => navigate('/complete-account')} className="btn-secondary">
            <CompleteAccountIcon />
            <span>{t('completeAccount')}</span>
          </button>
          <button onClick={() => navigate('/eservices')} className="btn-secondary">
            <CompleteAccountIcon />
            <span>{t('registerEServices')}</span>
          </button>
        </div>
      </div>
      <Footer noBackground />
    </div>
  );
};
export default LandingPage_EN;
