import React, { useState } from 'react';
import { LOGO_COLOR } from '../assets/imagePaths';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import FullPageLoader from '../common/FullPageLoader';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const BankAccountLookupPage_EN = ({ onNavigate }) => {
  const { language } = useLanguage();
  const [term, setTerm] = useState('');
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!term.trim()) {
      setError(t('missing_identifier', language));
      return;
    }
    setLoading(true);
    setError('');
    setCustomer(null);
    try {
      const query = /^\d{12,}$/.test(term.trim()) ? `nid=${term.trim()}` : `reference=${term.trim()}`;
      const resp = await fetch(`${API_BASE_URL}/api/customer?${query}`);
      if (resp.ok) {
        const data = await resp.json();
        setCustomer(data);
      } else {
        const d = await resp.json().catch(() => ({ error: 'server_error' }));
        setError(t(d.error || 'server_error', language));
      }
    } catch (e) {
      setError(t('server_error', language));
    }
    setLoading(false);
  };

  const startProcess = () => {
    if (!customer) return;
    const photo = customer.uploadedDocuments.find(d => d.doc_type === 'personal_photo')?.file_name;
    onNavigate('bankAccount', { personalInfo: customer.personalInfo, photo, custId: customer.personalInfo.cust_id });
  };

  return (
    <div className="form-page">
      <header className="header docs-header">
        <img src={LOGO_COLOR} alt="Bank Logo" className="logo" />
        <div className="header-switchers">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
        <button onClick={() => onNavigate('completeAccount')} className="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          <span>{t('back', language)}</span>
        </button>
      </header>
      <main className="form-main" style={{maxWidth:'600px'}}>
        <h2 className="form-title">{t('bankAccountOpening', language)}</h2>
        <div className="form-group" style={{display:'flex',gap:'10px'}}>
          <input
            type="text"
            className="form-input"
            value={term}
            onChange={e => setTerm(e.target.value)}
            placeholder={t('referenceOrNid', language)}
          />
          <button className="btn-next" onClick={handleSearch}>{t('search', language)}</button>
        </div>
        {error && <p className="error-text" style={{color:'red',marginTop:'10px'}}>{error}</p>}
        {customer && !error && (
          <div style={{marginTop:'20px'}}>
            <div style={{fontWeight:'600'}}>{customer.personalInfo.full_name}</div>
            <div style={{opacity:0.7}}>{customer.personalInfo.national_id}</div>
            <button className="btn-next" style={{marginTop:'20px'}} onClick={startProcess}>{t('next', language)}</button>
          </div>
        )}
      </main>
      <Footer />
      {loading && <FullPageLoader message="Loading..." />}
    </div>
  );
};

export default BankAccountLookupPage_EN;
