import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LOGO_COLOR } from '../assets/imagePaths';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import FullPageLoader from '../common/FullPageLoader';
import { useTranslation } from 'react-i18next';
import '../styles/LookupPageTheme.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const BankAccountLookupPage_EN = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
        setError(t(d.error || 'server_error'));
      }
    } catch (e) {
      setError(t('server_error'));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startProcess = (c) => {
    navigate('/bank-account', { state: { nid: c.national_id, custId: c.customer_id, personalId: c.id } });
  };

  return (
    <div className="form-page">
      <header className="header docs-header">
        <img src={LOGO_COLOR} alt="Bank Logo" className="logo" />
        <div className="header-switchers">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
        <button onClick={() => navigate('/complete-account')} className="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          <span>{t('back')}</span>
        </button>
      </header>
      <main className="form-main" style={{ width:'100%', maxWidth:'1000px', margin:'0 auto' }}>
        <h2 style={{fontSize:'1.5rem',fontWeight:'700'}}>{t('bankAccountOpening')}</h2>
        <div className="form-group" style={{display:'flex',gap:'10px',marginBottom:'20px'}}>
          <input
            type="text"
            className="form-input"
            value={term}
            onChange={e => setTerm(e.target.value)}
            placeholder={t('nidOrCustomerId')}
          />
          <button className="btn-next" onClick={fetchCustomers}>{t('search')}</button>
        </div>
        {error && <p className="error-text" style={{color:'red',marginTop:'10px'}}>{error}</p>}
        <table className="lookup-table" style={{marginTop:'20px',width:'100%'}}>
          <thead>
            <tr>
              <th>{t('fullName')}</th>
              <th>{t('nid')}</th>
              <th>{t('customerId')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="4" style={{textAlign:'center',padding:'20px'}}>{t('loading')}</td></tr>
            )}
            {!loading && customers.map(c => (
              <tr key={c.id} className="hover-row">
                <td>{c.full_name}</td>
                <td>{c.national_id}</td>
                <td>{c.customer_id}</td>
                <td><button className="btn-next" onClick={() => startProcess(c)}>{t('open')}</button></td>
              </tr>
            ))}
            {!loading && customers.length === 0 && (
              <tr><td colSpan="4" style={{textAlign:'center'}}>{t('noResults')}</td></tr>
            )}
          </tbody>
        </table>
      </main>
      <Footer />
      {loading && <FullPageLoader message={t('loading')} />}
    </div>
  );
};

export default BankAccountLookupPage_EN;
