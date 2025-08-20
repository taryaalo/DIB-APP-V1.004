import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LOGO_COLOR } from '../assets/imagePaths';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';
import { MobileAppIcon, SmsIcon, CardIcon, VisaMasterIcon } from '../common/Icons';

const EServicesRegistrationPage_EN = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const [services, setServices] = useState({
    mobileApp: true,
    sms: true,
    localCard: true,
    internationalCard: true
  });

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setServices(s => ({ ...s, [name]: checked }));
  };

  return (
    <div className="form-page">
      <header className="header docs-header">
        <img src={LOGO_COLOR} alt="Bank Logo" className="logo" />
        <div className="header-switchers">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
        <button onClick={() => navigate('/review-address-info', { state })} className="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          <span>{t('back', language)}</span>
        </button>
      </header>
      <main className="form-main">
        <h2 className="form-title">{t('registerEServices', language)}</h2>
        <div className="confirmation-document">
          <ul className="confirmation-list">
            <li>
              <label className="agreement-item">
                <div className="custom-checkbox">
                  <input type="checkbox" name="mobileApp" checked={services.mobileApp} onChange={handleChange} />
                  <span className="checkmark"></span>
                </div>
                <MobileAppIcon />
                <span>{t('registerMobileApp', language)}</span>
              </label>
            </li>
            <li>
              <label className="agreement-item">
                <div className="custom-checkbox">
                  <input type="checkbox" name="sms" checked={services.sms} onChange={handleChange} />
                  <span className="checkmark"></span>
                </div>
                <SmsIcon />
                <span>{t('registerSmsService', language)}</span>
              </label>
            </li>
            <li>
              <label className="agreement-item">
                <div className="custom-checkbox">
                  <input type="checkbox" name="localCard" checked={services.localCard} onChange={handleChange} />
                  <span className="checkmark"></span>
                </div>
                <CardIcon />
                <span>{t('registerLocalCard', language)}</span>
              </label>
            </li>
            <li>
              <label className="agreement-item">
                <div className="custom-checkbox">
                  <input type="checkbox" name="internationalCard" checked={services.internationalCard} onChange={handleChange} />
                  <span className="checkmark"></span>
                </div>
                <VisaMasterIcon />
                <span>{t('registerInternationalCard', language)}</span>
              </label>
            </li>
          </ul>
        </div>
        <div className="form-actions">
          <button className="btn-next" onClick={() => navigate('/account-summary', { state: { ...state, eServices: services } })}>
            {t('completeAccountRequest', language)}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EServicesRegistrationPage_EN;
