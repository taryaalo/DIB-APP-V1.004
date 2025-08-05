import React, { useEffect, useState } from 'react';
import { LOGO_COLOR } from '../assets/imagePaths';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const ADMIN_NAME = process.env.REACT_APP_ADMIN_NAME || 'Admin';

const ReviewWorkInfoPage_EN = ({ onNavigate, state }) => {
  const { language } = useLanguage();
  const [work, setWork] = useState({});
  const [valid, setValid] = useState({});
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [approved, setApproved] = useState(false);
  const [approving, setApproving] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const load = async () => {
      const ref = state?.personalInfo?.reference_number;
      if (!ref) return;
      try {
        const resp = await fetch(`${API_BASE_URL}/api/work-info?reference=${encodeURIComponent(ref)}`);
        if (resp.ok) {
          const data = await resp.json();
          if (data) {
            setWork(data);
            setForm(data);
            setApproved(!!data.confirmed_by_admin);
          }
        }
      } catch (e) { console.error(e); }
    };
    load();
  }, [state]);

  useEffect(() => {
    const init = {};
    Object.keys(work || {}).forEach(k => {
      if (work[k]) init[k] = false;
    });
    setValid(init);
    if (!editing) setForm(work);
    setApproved(!!work.confirmed_by_admin);
  }, [work, editing]);

  const toggleValid = (key) => {
    setValid(v => ({ ...v, [key]: !v[key] }));
  };

  const handleSave = async () => {
    const ref = state?.personalInfo?.reference_number;
    if (!ref) return;
    try {
      await fetch(`${API_BASE_URL}/api/work-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: ref, adminChange: true, ...form })
      });
      setWork(form);
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
      const resp = await fetch(`${API_BASE_URL}/api/work-validation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: ref, approved: newVal, adminName: ADMIN_NAME })
      });
      const data = await resp.json().catch(() => ({}));
      console.debug('WORK_VALIDATE_RESPONSE', data);
      try {
        await fetch(`${API_BASE_URL}/api/log-activity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: `WORK_VALIDATE_RESPONSE ${JSON.stringify(data)}` })
        });
      } catch (_) {}
      if (resp.ok && data && data.success) {
        setApproved(newVal);
      } else {
        setApiError(data.error || 'server_error');
      }
    } catch (e) {
      console.debug('WORK_VALIDATE_ERROR', e);
      setApiError(e.message);
    }
    setApproving(false);
  };

  const renderTable = (obj) => (
    <table className="confirmation-table">
      <tbody>
        {Object.entries(obj).map(([k, v]) => (
          v ? (
            <tr key={k}>
              <td><strong>{t(k, language)}</strong></td>
              <td>{v}</td>
              <td className="checkbox-cell">
                <div className="custom-checkbox">
                  <input type="checkbox" checked={!!valid[k]} onChange={() => toggleValid(k)} />
                  <span className="checkmark"></span>
                </div>
              </td>
            </tr>
          ) : null
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="form-page">
      <header className="header docs-header">
        <img src={LOGO_COLOR} alt="Bank Logo" className="logo" />
        <div className="header-switchers">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
        <button onClick={() => onNavigate('reviewDocs', state)} className="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          <span>{t('back', language)}</span>
        </button>
      </header>
      <main className="form-main">
        <h2 className="form-title">{t('workInfoTitle', language)}</h2>
        {editing ? (
          <form className="form-container" onSubmit={e => {e.preventDefault(); handleSave();}}>
            <div className="form-group"><input name="employment_status" value={form.employment_status || ''} onChange={e=>setForm({...form, employment_status:e.target.value})} className="form-input" placeholder={t('employmentStatus', language)} /></div>
            <div className="form-group"><input name="job_title" value={form.job_title || ''} onChange={e=>setForm({...form, job_title:e.target.value})} className="form-input" placeholder={t('jobTitle', language)} /></div>
            <div className="form-group"><input name="employer" value={form.employer || ''} onChange={e=>setForm({...form, employer:e.target.value})} className="form-input" placeholder={t('employer', language)} /></div>
            <div className="form-group"><input name="employer_address" value={form.employer_address || ''} onChange={e=>setForm({...form, employer_address:e.target.value})} className="form-input" placeholder={t('employerAddress', language)} /></div>
            <div className="form-group"><input name="employer_phone" value={form.employer_phone || ''} onChange={e=>setForm({...form, employer_phone:e.target.value})} className="form-input" placeholder={t('employerPhone', language)} /></div>
            <div className="form-group"><input name="source_of_income" value={form.source_of_income || ''} onChange={e=>setForm({...form, source_of_income:e.target.value})} className="form-input" placeholder={t('sourceOfIncome', language)} /></div>
            <div className="form-group"><input name="monthly_income" value={form.monthly_income || ''} onChange={e=>setForm({...form, monthly_income:e.target.value})} className="form-input" placeholder={t('monthlyIncome', language)} /></div>
            <div className="form-group"><input name="work_country" value={form.work_country || ''} onChange={e=>setForm({...form, work_country:e.target.value})} className="form-input" placeholder={t('work_country', language)} /></div>
            <div className="form-group"><input name="work_city" value={form.work_city || ''} onChange={e=>setForm({...form, work_city:e.target.value})} className="form-input" placeholder={t('work_city', language)} /></div>
          </form>
        ) : (
          <>
            {renderTable(work)}
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
          <button className="btn-next" onClick={() => onNavigate('reviewAddressInfo', state)}>{t('approve', language)}</button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReviewWorkInfoPage_EN;