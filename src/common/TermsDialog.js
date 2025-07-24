import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';

const TermsDialog = ({ onClose }) => {
  const { language } = useLanguage();
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>{t('termsAndConditions', language)}</h3>
        <p style={{whiteSpace:'pre-wrap'}}>{t('termsContent', language)}</p>
        <button className="btn-next" onClick={onClose}>{t('close', language)}</button>
      </div>
    </div>
  );
};
export default TermsDialog;
