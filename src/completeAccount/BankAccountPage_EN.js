// src/completeAccount/BankAccountPage_EN.js
import React, { useState, useEffect } from 'react';
import { LOGO_WHITE } from '../assets/imagePaths';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import FullPageLoader from '../common/FullPageLoader';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const BankAccountPage_EN = ({ onNavigate, state }) => {
  const { language } = useLanguage();
  const nid = state?.nid;
  const custId = state?.custId;
  const personalId = state?.personalId;
  const [customer, setCustomer] = useState(null);
  const [branchDate, setBranchDate] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [error, setError] = useState('');
  const [checks, setChecks] = useState({
    mobile: false,
    sms: false,
    localCard: false,
    internationalCard: false
  });

  const handleCheck = (key) => (e) => {
    setChecks({ ...checks, [key]: e.target.checked });
  };

  const handleSignature = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (customer?.reference_number) {
        formData.append('reference', customer.reference_number);
      }
      formData.append('docType', 'signature');
      const resp = await fetch(`${API_BASE_URL}/api/add-document`, { method: 'POST', body: formData });
      if (resp.ok) {
        setSignatureUrl(URL.createObjectURL(file));
      }
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch(`${API_BASE_URL}/api/customer?nid=${nid}`);
        if (resp.ok) {
          const data = await resp.json();
          setCustomer(data.personalInfo);
          if (data.personalInfo?.branch_id) {
            console.log('Posting to /api/branch-date', { branch: data.personalInfo.branch_id });
            const br = await fetch(`${API_BASE_URL}/api/branch-date`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ branch: data.personalInfo.branch_id })
            });
            if (br.ok) {
              const bd = await br.json();
              console.log('Branch date response', bd);
              setBranchDate(bd.branch_date || bd.date || '');
            } else {
              const text = await br.text();
              console.error('Branch date error', br.status, text);
            }
          }
        }
      } catch (err) {}
      setLoading(false);
    };
    load();
  }, [nid]);

  const createAccount = async () => {
    if (!customer || !branchDate) return;
    setCreating(true);
    setError('');
    try {
      const payload = {
        personalId,
        name: customer.full_name,
        branch: customer.branch_id,
        accId: custId,
        acc_class: 'CAIN',
        ccy: 'LYD',
        ACCLSTYP: 'S',
        ACCOPENDT: branchDate,
        LOC: customer.city_code,
        MEDIA: 'MAIL',
        ACSTATUS: 'NORM',
        PASS_SUBMISSION_DATE: customer.passport_expiry_date
      };
      const resp = await fetch(`${API_BASE_URL}/api/create-bank-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setAccountNumber(data.accountNumber);
      } else {
        setError(data.error || t('server_error', language));
      }
    } catch (err) {
      setError(t('server_error', language));
    }
    setCreating(false);
  };

  return (
    <div className="form-page">
      <header className="header docs-header">
        <img src={LOGO_WHITE} alt="Bank Logo" className="logo" />
        <div className="header-switchers">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
        <button onClick={() => onNavigate('completeAccount')} className="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          <span>{t('back', language)}</span>
        </button>
      </header>
      <main className="form-main" style={{maxWidth:'800px'}}>
        <h2 className="form-title">{t('bankAccountOpening', language)}</h2>
        <p className="guide-message">{t('customerId', language)}: {custId}</p>
        {customer && (
          <table className="table" style={{marginBottom:'20px'}}>
            <tbody>
              <tr><td>{t('fullName', language)}</td><td>{customer.full_name}</td></tr>
              <tr><td>{t('branch', language)}</td><td>{customer.branch_id}</td></tr>
              <tr><td>{t('branchName', language)}</td><td>{customer.branch_name}</td></tr>
              <tr><td>{t('cityCode', language)}</td><td>{customer.city_code}</td></tr>
              <tr><td>{t('city', language)}</td><td>{customer.city_name}</td></tr>
              <tr><td>{t('passportNumber', language)}</td><td>{customer.passport_number}</td></tr>
              <tr><td>{t('passportExpiryDate', language)}</td><td>{customer.passport_expiry_date}</td></tr>
              <tr><td>Branch Date</td><td>{branchDate}</td></tr>
            </tbody>
          </table>
        )}
        <div className="form-group">
          <label>Customer Signature</label>
          <input type="file" accept="image/*" onChange={handleSignature} />
          {signatureUrl && <img src={signatureUrl} alt="Signature" style={{maxWidth:'200px',marginTop:'10px'}} />}
        </div>
        <ul className="confirmation-list">
          <li>
            <label className="agreement-item">
              <div className="custom-checkbox">
                <input type="checkbox" checked={checks.mobile} onChange={handleCheck('mobile')} />
                <span className="checkmark"></span>
              </div>
              <span>Document the Mobile APP registration form signed by the customer</span>
            </label>
          </li>
          <li>
            <label className="agreement-item">
              <div className="custom-checkbox">
                <input type="checkbox" checked={checks.sms} onChange={handleCheck('sms')} />
                <span className="checkmark"></span>
              </div>
              <span>Document the SMS service registration form signed by the customer</span>
            </label>
          </li>
          <li>
            <label className="agreement-item">
              <div className="custom-checkbox">
                <input type="checkbox" checked={checks.localCard} onChange={handleCheck('localCard')} />
                <span className="checkmark"></span>
              </div>
              <span>Document the Local Card registration form signed by the customer</span>
            </label>
          </li>
          <li>
            <label className="agreement-item">
              <div className="custom-checkbox">
                <input type="checkbox" checked={checks.internationalCard} onChange={handleCheck('internationalCard')} />
                <span className="checkmark"></span>
              </div>
              <span>Document the international Card registration form signed by the customer</span>
            </label>
          </li>
        </ul>
        {signatureUrl && !accountNumber && (
          <button className="btn-next" style={{marginTop:'20px'}} onClick={createAccount}>{t('createAccount', language)}</button>
        )}
        {accountNumber && <div style={{marginTop:'20px',fontWeight:'600'}}>{t('accountNumber', language)}: {accountNumber}</div>}
        {error && <p className="error-text" style={{color:'red',marginTop:'10px'}}>{error}</p>}
      </main>
      <Footer />
      {(uploading || loading || creating) && <FullPageLoader message={creating ? t('creating', language) : 'Loading...'} />}
    </div>
  );
};

export default BankAccountPage_EN;
