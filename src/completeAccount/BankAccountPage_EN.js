import React, { useState, useEffect } from 'react';
import FullPageLoader from '../common/FullPageLoader';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import { LOGO_COLOR } from '../assets/imagePaths';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';
import { LockIcon } from '../common/Icons';
import '../styles/BankAccountPage_EN.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const BankAccountPage_EN = ({ onNavigate, state }) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const nid = state?.nid;
  const custId = state?.custId;
  const personalId = state?.personalId || state?.personalInfo?.id;

  const [customer, setCustomer] = useState(null);
  const [branchDate, setBranchDate] = useState('');
  const [locked, setLocked] = useState({});
  const [signatureUrl, setSignatureUrl] = useState('');
  const [signatureName, setSignatureName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [checks, setChecks] = useState({
    doc1: false,
    doc2: false,
    doc3: false,
    doc4: false,
    doc5: false
  });

  const handleCheck = key => e => {
    setChecks({ ...checks, [key]: e.target.checked });
  };

  const handleSignature = async e => {
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
        setSignatureName(file.name);
      }
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  useEffect(() => {
    const load = async () => {
      try {
        if (state?.personalInfo) {
          setCustomer(state.personalInfo);
          const initLocks = {};
          ['full_name','branch_id','branch_name','city_code','city_name','passport_number','passport_expiry_date'].forEach(f=>{
            if(state.personalInfo[f]) initLocks[f] = true;
          });
          setLocked(initLocks);
          if (state.personalInfo.branch_id) {
            const br = await fetch(`${API_BASE_URL}/api/branch-date`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ branch: state.personalInfo.branch_id })
            });
            if (br.ok) {
              const bd = await br.json();
              const bdVal = typeof bd === 'string' ? bd : (bd.branch_date || bd.date || '');
              setBranchDate(bdVal);
              setLocked(l => ({ ...l, branchDate: !!bdVal }));
            }
          }
          setLoading(false);
          return;
        }
        if (!nid) {
          setLoading(false);
          return;
        }
        const resp = await fetch(`${API_BASE_URL}/api/customer?nid=${nid}`);
        if (resp.ok) {
          const data = await resp.json();
          setCustomer(data.personalInfo);
          const initLocks = {};
          ['full_name','branch_id','branch_name','city_code','city_name','passport_number','passport_expiry_date'].forEach(f=>{
            if(data.personalInfo[f]) initLocks[f] = true;
          });
          setLocked(initLocks);
          if (data.personalInfo?.branch_id) {
            const br = await fetch(`${API_BASE_URL}/api/branch-date`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ branch: data.personalInfo.branch_id })
            });
            if (br.ok) {
              const bd = await br.json();
              const bdVal = typeof bd === 'string' ? bd : (bd.branch_date || bd.date || '');
              setBranchDate(bdVal);
              setLocked(l => ({ ...l, branchDate: !!bdVal }));
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [nid, state]);

  const allChecked = Object.values(checks).every(Boolean);
  const canCreate = signatureUrl && allChecked;

  const handleChange = e => {
    const { name, value } = e.target;
    if (locked[name]) return;
    if (name === 'branchDate') setBranchDate(value);
    else setCustomer(c => ({ ...c, [name]: value }));
  };

  const toggleLock = (name, e) => {
    setLocked(l => ({ ...l, [name]: !l[name] }));
    const el = e.currentTarget.closest('.form-group');
    if (el) {
      el.classList.add('unlock-animation');
      setTimeout(() => el.classList.remove('unlock-animation'), 500);
    }
  };

  const lockProps = name => ({
    readOnly: !!locked[name],
    className: `form-input${locked[name] ? ' locked' : ''}`,
    onDoubleClick: e => toggleLock(name, e)
  });

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
        onNavigate('completeAccountSuccess', {
          accountNumber: data.accountNumber,
          customer,
          custId,
          photo: state?.photo
        });
      } else {
        setError(data.error || t('server_error', language));
      }
    } catch (err) {
      setError(t('server_error', language));
    }
    setCreating(false);
  };

  return (
    <div className={`bank-account-page ${isArabic ? 'font-arabic' : 'font-english'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <header className="header docs-header">
        <img src={LOGO_COLOR} alt="Bank Logo" className="logo" />
        <div className="header-switchers">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
        <button onClick={() => onNavigate('completeAccount')} className="btn-back">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>{t('back', language)}</span>
        </button>
      </header>
      <main className="bank-account-main">
        <div className="bank-account-content">
          <h1 className="page-title">{t('bankAccountOpening', language)}</h1>
          <div>
            <span className="customer-badge">{`${t('customerId', language)}: ${custId || ''}`}</span>
          </div>
          {customer && (
            <div className="info-grid">
              <div className="form-group">
                <p className="field-label">{t('fullName', language)}</p>
                <div style={{position:'relative'}}>
                  <input name="full_name" value={customer.full_name || ''} onChange={handleChange} {...lockProps('full_name')} />
                  <LockIcon className="lock-icon" />
                </div>
              </div>
              <div className="form-group">
                <p className="field-label">{t('branch', language)}</p>
                <div style={{position:'relative'}}>
                  <input name="branch_id" value={customer.branch_id || ''} onChange={handleChange} {...lockProps('branch_id')} />
                  <LockIcon className="lock-icon" />
                </div>
              </div>
              <div className="form-group">
                <p className="field-label">{t('branchName', language)}</p>
                <div style={{position:'relative'}}>
                  <input name="branch_name" value={customer.branch_name || ''} onChange={handleChange} {...lockProps('branch_name')} />
                  <LockIcon className="lock-icon" />
                </div>
              </div>
              <div className="form-group">
                <p className="field-label">{t('cityCode', language)}</p>
                <div style={{position:'relative'}}>
                  <input name="city_code" value={customer.city_code || ''} onChange={handleChange} {...lockProps('city_code')} />
                  <LockIcon className="lock-icon" />
                </div>
              </div>
              <div className="form-group">
                <p className="field-label">{t('city', language)}</p>
                <div style={{position:'relative'}}>
                  <input name="city_name" value={customer.city_name || ''} onChange={handleChange} {...lockProps('city_name')} />
                  <LockIcon className="lock-icon" />
                </div>
              </div>
              <div className="form-group">
                <p className="field-label">{t('passportNumber', language)}</p>
                <div style={{position:'relative'}}>
                  <input name="passport_number" value={customer.passport_number || ''} onChange={handleChange} {...lockProps('passport_number')} />
                  <LockIcon className="lock-icon" />
                </div>
              </div>
              <div className="form-group">
                <p className="field-label">{t('passportExpiryDate', language)}</p>
                <div style={{position:'relative'}}>
                  <input name="passport_expiry_date" value={customer.passport_expiry_date || ''} onChange={handleChange} {...lockProps('passport_expiry_date')} dir="ltr" />
                  <LockIcon className="lock-icon" />
                </div>
              </div>
              <div className="form-group">
                <p className="field-label">{t('branchDate', language)}</p>
                <div style={{position:'relative'}}>
                  <input name="branchDate" value={branchDate} onChange={handleChange} {...lockProps('branchDate')} dir="ltr" />
                  <LockIcon className="lock-icon" />
                </div>
              </div>
            </div>
          )}
          <div className="signature-section">
            <p className="field-label">{t('customerSignature', language)}</p>
            <div className={`signature-controls ${isArabic ? 'rtl' : ''}`}>
              <input type="file" id="signature-upload" className="hidden" onChange={handleSignature} />
              <label htmlFor="signature-upload" className="secondary-btn">{t('uploadFile', language)}</label>
              <span className="field-label">{signatureName}</span>
            </div>
          </div>
          <div className="doc-list">
            <h2 className="doc-title">{t('contractMustBeSigned', language)}</h2>
            <div className={`doc-item ${isArabic ? 'rtl' : ''}`}>
              <input type="checkbox" id="doc1" className="document-checkbox" checked={checks.doc1} onChange={handleCheck('doc1')} />
              <label htmlFor="doc1">{t('docMobileApp', language)}</label>
            </div>
            <div className={`doc-item ${isArabic ? 'rtl' : ''}`}>
              <input type="checkbox" id="doc2" className="document-checkbox" checked={checks.doc2} onChange={handleCheck('doc2')} />
              <label htmlFor="doc2">{t('docSmsService', language)}</label>
            </div>
            <div className={`doc-item ${isArabic ? 'rtl' : ''}`}>
              <input type="checkbox" id="doc3" className="document-checkbox" checked={checks.doc3} onChange={handleCheck('doc3')} />
              <label htmlFor="doc3">{t('docLocalCard', language)}</label>
            </div>
            <div className={`doc-item ${isArabic ? 'rtl' : ''}`}>
              <input type="checkbox" id="doc4" className="document-checkbox" checked={checks.doc4} onChange={handleCheck('doc4')} />
              <label htmlFor="doc4">{t('docInternationalCard', language)}</label>
            </div>
            <div className={`doc-item ${isArabic ? 'rtl' : ''}`}>
              <input type="checkbox" id="doc5" className="document-checkbox" checked={checks.doc5} onChange={handleCheck('doc5')} />
              <label htmlFor="doc5">{t('docBankAgreement', language)}</label>
            </div>
          </div>
          <div className="action-buttons">
            <button
              id="create-account-button"
              onClick={createAccount}
              disabled={!canCreate}
              className="primary-btn"
            >
              {t('createAccount', language)}
            </button>
            <button className="secondary-btn">{t('reprintDocuments', language)}</button>
          </div>
          {error && <p className="error-message">{error}</p>}
        </div>
      </main>
      <Footer />
      {(uploading || loading || creating) && (
        <FullPageLoader message={creating ? t('creating', language) : t('loading', language)} />
      )}
    </div>
  );
};

export default BankAccountPage_EN;
