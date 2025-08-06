import React, { useState, useEffect } from 'react';
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
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      let url = `${API_BASE_URL}/api/customers-no-bank`;
      if (term.trim()) {
        const param = /^\d{12,}$/.test(term.trim()) ? `nid=${term.trim()}` : `customerId=${term.trim()}`;
        url += `?${param}`;
      }
      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        setCustomers(data);
      } else {
        const d = await resp.json().catch(() => ({ error: 'server_error' }));
        setError(t(d.error || 'server_error', language));
      }
    } catch (e) {
      setError(t('server_error', language));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startProcess = (c) => {
    onNavigate('bankAccount', { nid: c.national_id, custId: c.customer_id, personalId: c.id });
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
            placeholder={t('nidOrCustomerId', language)}
          />
          <button className="btn-next" onClick={fetchCustomers}>{t('search', language)}</button>
        </div>
        {error && <p className="error-text" style={{color:'red',marginTop:'10px'}}>{error}</p>}
        <table className="table" style={{marginTop:'20px',width:'100%'}}>
          <thead>
            <tr>
              <th>{t('fullName', language)}</th>
              <th>{t('nid', language)}</th>
              <th>{t('customerId', language)}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td>{c.full_name}</td>
                <td>{c.national_id}</td>
                <td>{c.customer_id}</td>
                <td><button className="btn-next" onClick={() => startProcess(c)}>{t('open', language)}</button></td>
              </tr>
            ))}
            {customers.length === 0 && !loading && (
              <tr><td colSpan="4" style={{textAlign:'center'}}>{t('noResults', language)}</td></tr>
            )}
          </tbody>
        </table>
      </main>
      <Footer />
      {loading && <FullPageLoader message="Loading..." />}
    </div>
  );
};

export default BankAccountLookupPage_EN;
