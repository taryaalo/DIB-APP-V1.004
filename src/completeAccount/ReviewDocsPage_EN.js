// src/completeAccount/ReviewDocsPage_EN.js

import React, { useEffect, useState } from 'react';
import { LOGO_COLOR } from '../assets/imagePaths';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';
import { SuccessIcon } from '../common/Icons';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const ADMIN_NAME = process.env.REACT_APP_ADMIN_NAME || 'Admin';

const DOC_LABELS = {
  passport: 'passportPhoto',
  nationalId: 'approvedNationalId',
  letter: 'accountOpeningLetter',
  photo: 'recentPersonalPhoto'
};
const DOC_TYPES = Object.keys(DOC_LABELS);

const ReviewDocsPage_EN = ({ onNavigate, state }) => {
  const { language } = useLanguage();
  const [docs, setDocs] = useState([]);
  const [valid, setValid] = useState({});
  const [uploading, setUploading] = useState({});

  useEffect(() => {
    const uploaded = state?.uploadedDocuments || [];
    const sorted = [...uploaded].sort((a, b) => a.doc_type.localeCompare(b.doc_type));
    setDocs(sorted);
    const initValid = {};
    sorted.forEach(d => {
      initValid[d.id] = d.confirmed_by_admin;
    });
    setValid(initValid);
  }, [state]);

  const toggleValid = async (id) => {
    const newVal = !valid[id];
    setValid(v => ({ ...v, [id]: newVal }));
    try {
      await fetch(`${API_BASE_URL}/api/approve-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved: newVal, adminName: ADMIN_NAME })
      });
    } catch (e) { console.error(e); }
  };

  const handleFileChange = async (docId, file) => {
    if (!file) return;
    setUploading(u => ({ ...u, [docId]: true }));
    const formData = new FormData();
    formData.append('file', file);
    try {
      const resp = await fetch(`${API_BASE_URL}/api/update-document/${docId}`, {
        method: 'POST',
        body: formData
      });
      if (resp.ok) {
        const data = await resp.json();
        setDocs(d => d.map(doc => doc.id === docId ? { ...doc, file_name: data.path, confirmed_by_admin: false } : doc));
        setValid(v => ({ ...v, [docId]: false }));
      }
    } catch (e) { console.error(e); }
    setUploading(u => ({ ...u, [docId]: false }));
  };

  const handleNewDoc = async (docType, file) => {
    if (!file) return;
    setUploading(u => ({ ...u, [docType]: true }));
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', docType);
    formData.append('reference', state.personalInfo.reference_number);
    try {
      const resp = await fetch(`${API_BASE_URL}/api/add-document`, { method: 'POST', body: formData });
      if (resp.ok) {
        const data = await resp.json();
        const newDoc = { id: data.id, doc_type: docType, file_name: data.path, reference_number: data.referenceNumber, confirmed_by_admin: false };
        setDocs(d => [...d, newDoc]);
        setValid(v => ({ ...v, [newDoc.id]: false }));
      }
    } catch (e) { console.error(e); }
    setUploading(u => ({ ...u, [docType]: false }));
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
      <main className="form-main">
        <h2 className="form-title">{t('reviewDocuments', language)}</h2>
        <div className="docs-grid">
          {DOC_TYPES.map(type => {
            const doc = docs.find(d => d.doc_type === type);
            return doc ? (
              <div key={doc.id} className="image-preview-box" style={{alignItems:'center', position: 'relative'}}>
                <img src={`${API_BASE_URL}/${doc.file_name}`} alt={doc.doc_type} />
                {valid[doc.id] && <div className="stamp-overlay"><SuccessIcon /></div>}
                <div style={{marginTop:'10px', fontWeight:'600'}}>{t(DOC_LABELS[doc.doc_type] || doc.doc_type, language)}</div>
                <label style={{marginTop:'10px', display:'flex', alignItems:'center', gap:'5px'}}>
                  <input type="checkbox" checked={!!valid[doc.id]} onChange={() => toggleValid(doc.id)} />
                  {t('valid', language)}
                </label>
                <div style={{marginTop:'10px'}}>
                  <input type="file" onChange={e => handleFileChange(doc.id, e.target.files[0])} />
                </div>
              </div>
            ) : (
              <div key={type} className="image-preview-box" style={{alignItems:'center', justifyContent:'center'}}>
                <div style={{fontWeight:'600'}}>{t(DOC_LABELS[type], language)}</div>
                <div style={{marginTop:'10px'}}>
                  <input type="file" onChange={e => handleNewDoc(type, e.target.files[0])} disabled={uploading[type]} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="form-actions">
          <button className="btn-next" disabled={!DOC_TYPES.every(t => docs.some(d => d.doc_type === t && valid[d.id]))} onClick={() => onNavigate('reviewWorkInfo', { ...state, uploadedDocuments: docs })}>{t('next', language)}</button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReviewDocsPage_EN;