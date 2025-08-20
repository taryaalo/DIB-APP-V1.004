import React from 'react';
import { t } from '../i18n';

const TermsDialog = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>{t('termsAndConditions')}</h3>
        <p style={{whiteSpace:'pre-wrap'}}>{t('termsContent')}</p>
        <button className="btn-next" onClick={onClose}>{t('close')}</button>
      </div>
    </div>
  );
};
export default TermsDialog;
