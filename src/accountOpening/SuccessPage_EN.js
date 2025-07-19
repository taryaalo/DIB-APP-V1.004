import React, { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';
import { SuccessIcon } from '../common/Icons';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import { LOGO_WHITE } from '../assets/imagePaths';
import { useFormData } from '../contexts/FormContext';

const SuccessPage_EN = ({ onNavigate, state }) => {
  const { language } = useLanguage();
  const { setFormData } = useFormData();
  const reference = state?.referenceNumber;
  const createdAt = state?.createdAt;
  const aiModel = state?.aiModel;

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/api/clear-cache`, { method: 'POST' }).catch(() => {});
    setFormData({ provider: 'gemini' });
  }, [setFormData]);

  return (
    <div className="form-page success-page">
      <header className="header docs-header">
        <img src={LOGO_WHITE} alt="Bank Logo" className="logo" />
        <div className="header-switchers">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </header>
      <main className="form-main" style={{ textAlign: 'center' }}>
        <SuccessIcon />
        <h1 className="success-title">{t('successTitle', language)}</h1>
        <p className="success-message">{t('successMsg', language)}</p>
        {reference && (
          <div className="reference-number">
            {t('referenceLabel', language)}: {reference}
          </div>
        )}
        {createdAt && (
          <p>
            {t('createdAt', language)}:{' '}
            {new Date(createdAt).toLocaleString()}
          </p>
        )}
        {aiModel && (
          <p>
            {t('aiModelUsed', language)}: {aiModel}
          </p>
        )}
        <button className="btn-next" onClick={() => onNavigate('landing')}>
          {t('backToHome', language)}
        </button>
      </main>
      <Footer />
    </div>
  );
};

export default SuccessPage_EN;
