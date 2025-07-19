import React, { useState } from 'react';
import { LOGO_WHITE } from '../assets/imagePaths';
import { t } from '../i18n';
import { useLanguage } from '../contexts/LanguageContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const LanguageSelectionPage = ({ onNavigate }) => {
    const { setLanguage, language } = useLanguage();
    const [dbStatus, setDbStatus] = useState('');

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

    return (
        <div className="lang-selection-page">
            <div className="lang-selection-box">
                <img src={LOGO_WHITE} alt="Daman Islamic Bank" className="lang-logo" />
                <div className="lang-buttons-container">
                    <button className="lang-btn" onClick={() => {setLanguage('en'); onNavigate('landing');}}>{t('english', language)}</button>
                    <button className="lang-btn" onClick={() => {setLanguage('ar'); onNavigate('landing');}}>{t('arabic', language)}</button>
                    <button className="lang-btn" onClick={testDb}>{t('testDb', language)}</button>
                    {dbStatus && (
                        <p className={`db-status ${dbStatus === 'success' ? 'success' : dbStatus === 'failed' ? 'error' : ''}`}>{
                            dbStatus === 'testing'
                                ? t('testingDb', language)
                                : dbStatus === 'success'
                                ? t('dbConnected', language)
                                : t('dbFailed', language)
                        }</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LanguageSelectionPage;
