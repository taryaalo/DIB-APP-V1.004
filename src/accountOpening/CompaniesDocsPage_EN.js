import React, { useState } from 'react';
import { LOGO_WHITE } from '../assets/imagePaths';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import { t } from '../i18n';
import { useLanguage } from '../contexts/LanguageContext';

const CompaniesDocsPage_EN = ({ onNavigate, backPage, nextPage }) => {
    const { language } = useLanguage();
    const [files, setFiles] = useState({});

    const handleFileChange = (e, docType) => {
        setFiles(f => ({ ...f, [docType]: e.target.files[0] }));
    };

    const isFormValid = () => {
        // Example validation: check if all 7 documents are uploaded
        return Object.keys(files).length === 7;
    };

    return (
        <div className="form-page">
            <header className="header docs-header">
                <img src={LOGO_WHITE} alt="Bank Logo" className="logo" />
                <div className="header-switchers">
                    <ThemeSwitcher />
                    <LanguageSwitcher />
                </div>
                <button onClick={() => onNavigate(backPage)} className="btn-back">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    <span>{t('back', language)}</span>
                </button>
            </header>
            <main className="form-main">
                <h2 className="form-title">{t('requiredDocs', language)}</h2>
                <div className="docs-grid">
                    <div className="upload-box"><p>{t('bankStatement', language)}</p><div className="upload-placeholder"><input type="file" accept="image/*" required capture="environment" onChange={e => handleFileChange(e, 'bankStatement')} /></div></div>
                    <div className="upload-box"><p>{t('taxCard', language)}</p><div className="upload-placeholder"><input type="file" accept="image/*" required capture="environment" onChange={e => handleFileChange(e, 'taxCard')} /></div></div>
                    <div className="upload-box"><p>{t('commercialChamberCertificate', language)}</p><div className="upload-placeholder"><input type="file" accept="image/*" required capture="environment" onChange={e => handleFileChange(e, 'commercialChamberCertificate')} /></div></div>
                    <div className="upload-box"><p>{t('legalRepAuth', language)}</p><div className="upload-placeholder"><input type="file" accept="image/*" required capture="environment" onChange={e => handleFileChange(e, 'legalRepAuth')} /></div></div>
                    <div className="upload-box"><p>{t('commercialRegisterCopy', language)}</p><div className="upload-placeholder"><input type="file" accept="image/*" required capture="environment" onChange={e => handleFileChange(e, 'commercialRegisterCopy')} /></div></div>
                    <div className="upload-box"><p>{t('nationalIdPhotos', language)}</p><div className="multi-upload-placeholders"><input type="file" accept="image/*" required capture="environment" multiple onChange={e => handleFileChange(e, 'nationalIdPhotos')} /></div></div>
                    <div className="upload-box"><p>{t('personalPhotos', language)}</p><div className="multi-upload-placeholders"><input type="file" accept="image/*" required capture="environment" multiple onChange={e => handleFileChange(e, 'personalPhotos')} /></div></div>
                </div>
                <div className="form-actions"><button className="btn-next" onClick={() => onNavigate(nextPage)} disabled={!isFormValid()}>{t('next', language)}</button></div>
            </main>
            <Footer />
        </div>
    );
}
export default CompaniesDocsPage_EN;