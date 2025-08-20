import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { t } from '../i18n';
import { SuccessIcon } from '../common/Icons';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import { LOGO_WHITE } from '../assets/imagePaths';
import '../styles/SuccessPage_EN.css';
import { useFormData } from '../contexts/FormContext';

const SuccessPage_EN = () => {
  const { setFormData } = useFormData();
  const location = useLocation();
  const navigate = useNavigate();
  const reference = location.state?.referenceNumber;
  const createdAt = location.state?.createdAt;
  const aiModel = location.state?.aiModel;

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/api/clear-cache`, { method: 'POST' }).catch(() => {});
    setFormData({ provider: 'gemini' });
  }, [setFormData]);

  return (
    <div className="form-page success-page sequential-docs-page">
      <header className="header docs-header">
        <img src={LOGO_WHITE} alt="Bank Logo" className="logo" />
        <div className="header-switchers">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </header>
      <main className="form-main" style={{ textAlign: 'center' }}>
        <SuccessIcon />
        <h1 className="success-title">{t('successTitle')}</h1>
        <p className="success-message">{t('successMsg')}</p>
        {reference && (
          <div className="reference-number">
            {t('referenceLabel')}: {reference}
          </div>
        )}
        {createdAt && (
          <p>
            {t('createdAt')}:{' '}
            {new Date(createdAt).toLocaleString()}
          </p>
        )}
        {aiModel && (
          <p>
            {t('aiModelUsed')}: {aiModel}
          </p>
        )}
        <button className="btn-next" onClick={() => navigate('/landing')}>
          {t('backToHome')}
        </button>
      </main>
      <Footer />
    </div>
  );
};

export default SuccessPage_EN;
