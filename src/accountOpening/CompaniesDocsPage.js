import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LOGO_WHITE } from '../assets/imagePaths';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';

const CompaniesDocsPage_EN = () => {
    const { t } = useTranslation();
    const [files, setFiles] = useState({});
    const navigate = useNavigate();

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
                <button onClick={() => navigate(-1)} className="btn-back">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    <span>{t('back')}</span>
                </button>
            </header>
            <main className="form-main">
                <h2 className="form-title">{t('requiredDocs')}</h2>
                <div className="docs-grid">
                    <div className="upload-box"><p>{t('bankStatement')}</p><div className="upload-placeholder"><input type="file" accept="image/*" required capture="environment" onChange={e => handleFileChange(e, 'bankStatement')} /></div></div>
                    <div className="upload-box"><p>{t('taxCard')}</p><div className="upload-placeholder"><input type="file" accept="image/*" required capture="environment" onChange={e => handleFileChange(e, 'taxCard')} /></div></div>
                    <div className="upload-box"><p>{t('commercialChamberCertificate')}</p><div className="upload-placeholder"><input type="file" accept="image/*" required capture="environment" onChange={e => handleFileChange(e, 'commercialChamberCertificate')} /></div></div>
                    <div className="upload-box"><p>{t('legalRepAuth')}</p><div className="upload-placeholder"><input type="file" accept="image/*" required capture="environment" onChange={e => handleFileChange(e, 'legalRepAuth')} /></div></div>
                    <div className="upload-box"><p>{t('commercialRegisterCopy')}</p><div className="upload-placeholder"><input type="file" accept="image/*" required capture="environment" onChange={e => handleFileChange(e, 'commercialRegisterCopy')} /></div></div>
                    <div className="upload-box"><p>{t('nationalIdPhotos')}</p><div className="multi-upload-placeholders"><input type="file" accept="image/*" required capture="environment" multiple onChange={e => handleFileChange(e, 'nationalIdPhotos')} /></div></div>
                    <div className="upload-box"><p>{t('personalPhotos')}</p><div className="multi-upload-placeholders"><input type="file" accept="image/*" required capture="environment" multiple onChange={e => handleFileChange(e, 'personalPhotos')} /></div></div>
                </div>
                <div className="form-actions"><button className="btn-next" onClick={() => navigate('/company-info')} disabled={!isFormValid()}>{t('next')}</button></div>
            </main>
            <Footer />
        </div>
    );
}
export default CompaniesDocsPage_EN;