// src/completeAccount/BankAccountPage_EN.js
import React, { useState } from 'react';
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
  const personalInfo = state?.personalInfo || {};
  const photo = state?.photo;
  const custId = state?.custId;
  const [signatureUrl, setSignatureUrl] = useState('');
  const [uploading, setUploading] = useState(false);
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
      formData.append('reference', personalInfo.reference_number);
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
        <h2 className="form-title">Bank Account Opening</h2>
        <p className="guide-message">Customer ID: {custId}</p>
        <div style={{display:'flex',gap:'20px',alignItems:'center',marginBottom:'20px'}}>
          {photo && <img src={`${API_BASE_URL}/${photo}`} alt="Customer" style={{width:'120px',height:'120px',objectFit:'cover',borderRadius:'8px'}} />}
          <div>
            <div style={{fontWeight:'600'}}>{personalInfo.full_name}</div>
            <div style={{opacity:0.7}}>{personalInfo.national_id}</div>
          </div>
        </div>
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
        {signatureUrl && <button className="btn-next" style={{marginTop:'20px'}} onClick={() => alert('Bank account created')}>Create Bank Account</button>}
      </main>
      <Footer />
      {uploading && <FullPageLoader message="Uploading..." />}
    </div>
  );
};

export default BankAccountPage_EN;
