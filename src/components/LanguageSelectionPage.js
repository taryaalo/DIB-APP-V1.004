import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LOGO_WHITE } from '../assets/imagePaths';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const LanguageSelectionPage = () => {
    const { t, i18n } = useTranslation();
    const [dbStatus, setDbStatus] = useState('');
    const navigate = useNavigate();

    const testDb = async () => {
        setDbStatus('testing');
        try {
            const resp = await fetch(`${API_BASE_URL}/api/test-db`);
            if (resp.ok) {
                setDbStatus('success');
            } else {
                setDbStatus('failed');
            }
        } catch (e) {
            setDbStatus('failed');
        }
    };

    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang);
        navigate('/landing');
    };

    return (
        <div className="lang-selection-page">
            <div className="lang-selection-box">
                <img src={LOGO_WHITE} alt="Daman Islamic Bank" className="lang-logo" />
                <div className="lang-buttons-container">
                    <button className="lang-btn" onClick={() => handleLanguageChange('en')}>{t('english')}</button>
                    <button className="lang-btn" onClick={() => handleLanguageChange('ar')}>{t('arabic')}</button>
                    <button className="lang-btn" onClick={testDb}>{t('testDb')}</button>
                    {dbStatus && (
                        <p className={`db-status ${dbStatus === 'success' ? 'success' : dbStatus === 'failed' ? 'error' : ''}`}>{
                            dbStatus === 'testing'
                                ? t('testingDb')
                                : dbStatus === 'success'
                                ? t('dbConnected')
                                : t('dbFailed')
                        }</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LanguageSelectionPage;
