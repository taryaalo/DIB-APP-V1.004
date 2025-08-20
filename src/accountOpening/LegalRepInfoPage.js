import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LOGO_WHITE } from '../assets/imagePaths';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import { useTranslation } from 'react-i18next';

const LegalRepInfoPage_EN = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    return (
        <div className="form-page">
            <header className="header docs-header">
                <img src={LOGO_WHITE} alt="Bank Logo" className="logo" />
                <div className="header-switchers">
                    <ThemeSwitcher />
                    <LanguageSwitcher />
                </div>
                 <button onClick={() => navigate(-1)} className="btn-back">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    <span>{t('back')}</span>
                </button>
            </header>
            <main className="form-main">
                <form className="form-container" onSubmit={e => {e.preventDefault(); navigate('/financial-info');}} noValidate>
                    <div className="form-section">
                        <h3>{t('legalRepresentativeInformation')}</h3>
                        <div className="form-group">
                            <input type="text" required className="form-input" placeholder={t('fullName')} />
                        </div>
                        <div className="form-group">
                            <input type="text" required className="form-input" placeholder={t('positionTitle')} />
                        </div>
                        <div className="form-group">
                            <input type="text" required className="form-input" placeholder={t('nationalIdNumber')} />
                        </div>
                        <div className="form-group">
                            <input type="tel" required className="form-input" placeholder={t('phoneNumber')} />
                        </div>
                        <div className="form-group">
                            <input type="email" required className="form-input" placeholder={t('emailAddress')} />
                        </div>
                    </div>
                    <div className="form-actions">
                    <button type="submit" className="btn-next">{t('next')}</button>
                </div>
                </form>
            </main>
            <Footer />
        </div>
    );
};
export default LegalRepInfoPage_EN;