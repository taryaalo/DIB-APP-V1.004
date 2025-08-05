import React, { useEffect, useState } from 'react';
import { LOGO_COLOR } from '../assets/imagePaths';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const ADMIN_NAME = process.env.REACT_APP_ADMIN_NAME || 'Admin';

const ReviewAddressInfoPage_EN = ({ onNavigate, state }) => {
  const { language } = useLanguage();
  const [info, setInfo] = useState(state?.personalInfo || {});
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [approved, setApproved] = useState(false);
  const [approving, setApproving] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const load = async () => {
      const params = new URLSearchParams();
      if (state?.personalInfo?.reference_number) params.append('reference', state.personalInfo.reference_number);
      else if (state?.personalInfo?.national_id) params.append('nid', state.personalInfo.national_id);
      if (params.toString()) {
        try {
          const resp = await fetch(`${API_BASE_URL}/api/address-info?${params.toString()}`);
          if (resp.ok) {
            const data = await resp.json();
            if (data) {
              setInfo(data);
              setForm(data);
              setApproved(!!data.confirmed_by_admin);
            }
          }
        } catch (e) { console.error(e); }
      }
    };
    load();
  }, [state]);

  useEffect(() => {
    if (!editing) setForm(info);
    setApproved(!!info.confirmed_by_admin);
  }, [info, editing]);

  const renderList = (obj) => (
    <ul className="confirmation-list">
      {Object.entries(obj).map(([k, v]) => (
        v ? (
          <li key={k}>
            <strong>{t(k, language)}:</strong> {v}
          </li>
        ) : null
      ))}
    </ul>
  );

  const handleSave = async () => {
    const ref = state?.personalInfo?.reference_number;
    if (!ref) return;
    try {
      await fetch(`${API_BASE_URL}/api/address-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: ref, adminChange: true, ...form })
      });
      setInfo(form);
      setEditing(false);
    } catch (e) { console.error(e); }
  };

  const toggleApproved = async () => {
    const ref = state?.personalInfo?.reference_number;
    if (!ref || approving) return;
    const newVal = !approved;
    setApproving(true);
    setApiError('');
    try {
      const resp = await fetch(`${API_BASE_URL}/api/address-validation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: ref, approved: newVal, adminName: ADMIN_NAME })
      });
      const data = await resp.json().catch(() => ({}));
      console.debug('ADDRESS_VALIDATE_RESPONSE', data);
      try {
        await fetch(`${API_BASE_URL}/api/log-activity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: `ADDRESS_VALIDATE_RESPONSE ${JSON.stringify(data)}` })
        });
      } catch (_) {}
      if (resp.ok && data && data.success) {
        setApproved(newVal);
      } else {
        setApiError(data.error || 'server_error');
      }
    } catch (e) {
      console.debug('ADDRESS_VALIDATE_ERROR', e);
      setApiError(e.message);
    }
    setApproving(false);
  };

  return (
    <div className="form-page">
      <header className="header docs-header">
        <img src={LOGO_COLOR} alt="Bank Logo" className="logo" />
        <div className="header-switchers">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
        <button onClick={() => onNavigate('reviewWorkInfo', state)} className="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          <span>{t('back', language)}</span>
        </button>
      </header>
      <main className="form-main">
        <h2 className="form-title">{t('addressInfoTitle', language)}</h2>
        {editing ? (
          <form className="form-container" onSubmit={e=>{e.preventDefault();handleSave();}}>
            <div className="form-group"><input className="form-input" value={form.country || ''} onChange={e=>setForm({...form,country:e.target.value})} placeholder={t('country', language)} /></div>
            <div className="form-group"><input className="form-input" value={form.city || ''} onChange={e=>setForm({...form,city:e.target.value})} placeholder={t('city', language)} /></div>
            <div className="form-group"><input className="form-input" value={form.area || ''} onChange={e=>setForm({...form,area:e.target.value})} placeholder={t('area', language)} /></div>
            <div className="form-group"><input className="form-input" value={form.residential_address || ''} onChange={e=>setForm({...form,residential_address:e.target.value})} placeholder={t('residentialAddress', language)} /></div>
          </form>
        ) : (
          <>
            {renderList(info)}
            <button type="button" className="btn-next" onClick={() => setEditing(true)}>{t('unlock', language)}</button>
          </>
        )}
        <div className="form-actions" style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <label style={{display:'flex',alignItems:'center',gap:'5px'}}>
            <input type="checkbox" checked={approved} onChange={toggleApproved} disabled={approving} />
            {t('valid', language)}
            {approving && <div className="loading-spinner"></div>}
          </label>
          {apiError && <p className="error-message">{apiError}</p>}
          <button className="btn-next" onClick={() => onNavigate('eServicesReg', state)}>
            {t('approve', language)}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReviewAddressInfoPage_EN;