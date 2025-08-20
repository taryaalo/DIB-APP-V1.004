import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LOGO_COLOR } from '../assets/imagePaths';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logToServer } from '../utils/logger';

const mockFetchCustomerId = () =>
  new Promise(resolve => setTimeout(() => resolve('CUST-0001'), 500));

const AccountSummaryPage_EN = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const [customerId, setCustomerId] = useState('');

  useEffect(() => {
    mockFetchCustomerId().then(setCustomerId);
  }, []);

  const renderList = (obj) => (
    <ul className="confirmation-list">
      {Object.entries(obj || {}).map(([k, v]) => (
        v ? (
          <li key={k}>
            <strong>{t(k)}:</strong> {v}
          </li>
        ) : null
      ))}
    </ul>
  );

  const handleExport = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.addImage(LOGO_COLOR, 'PNG', pageWidth / 2 - 20, 10, 40, 40);
      doc.setFontSize(16);
      doc.text(t('accountSummary'), pageWidth / 2, 55, { align: 'center' });

      const rows = [];
      const pushRows = (obj) => {
        Object.entries(obj || {}).forEach(([k, v]) => {
          if (!v) return;
          rows.push([t(k), Array.isArray(v) ? v.join('') : v]);
        });
      };
      pushRows(state.personalInfo);
      pushRows(state.addressInfo);
      pushRows(state.workInfo);
      pushRows({
        mobileApp: state.eServices?.mobileApp ? t('yes') : t('no'),
        sms: state.eServices?.sms ? t('yes') : t('no'),
        localCard: state.eServices?.localCard ? t('yes') : t('no'),
        internationalCard: state.eServices?.internationalCard ? t('yes') : t('no')
      });
      rows.push([t('customerId'), customerId]);

      autoTable(doc, {
        startY: 65,
        head: [[t('label'), t('value')]],
        body: rows,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 10 }
      });
      doc.save('account_summary.pdf');
    } catch (e) {
      logToServer(`PDF_EXPORT_ERROR ${e.message}`);
    }
  };

  return (
    <div className="form-page">
      <header className="header docs-header">
        <img src={LOGO_COLOR} alt="Bank Logo" className="logo" />
        <div className="header-switchers">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
        <button onClick={() => navigate('/eservices-reg', { state })} className="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          <span>{t('back', language)}</span>
        </button>
      </header>
      <main className="form-main">
        <h2 className="form-title">{t('accountSummary', language)}</h2>
        <div className="confirmation-document">
          <div className="confirmation-header">{t('personalInfo', language)}</div>
          {renderList(state.personalInfo)}
          <div className="confirmation-header">{t('addressInfoTitle', language)}</div>
          {renderList(state.addressInfo)}
          <div className="confirmation-header">{t('workInfoTitle', language)}</div>
          {renderList(state.workInfo)}
          <div className="confirmation-header">{t('registerEServices', language)}</div>
          <ul className="confirmation-list">
            <li><strong>{t('registerMobileApp', language)}:</strong> {state.eServices?.mobileApp ? t('yes', language) : t('no', language)}</li>
            <li><strong>{t('registerSmsService', language)}:</strong> {state.eServices?.sms ? t('yes', language) : t('no', language)}</li>
            <li><strong>{t('registerLocalCard', language)}:</strong> {state.eServices?.localCard ? t('yes', language) : t('no', language)}</li>
            <li><strong>{t('registerInternationalCard', language)}:</strong> {state.eServices?.internationalCard ? t('yes', language) : t('no', language)}</li>
          </ul>
          <div className="confirmation-header">{t('customerId', language)}</div>
          <p>{customerId || '...'}</p>
        </div>
        <div className="form-actions">
          <button className="btn-export" onClick={handleExport} style={{marginRight:'10px'}}>{t('exportPdf', language)}</button>
          <button className="btn-next" onClick={() => navigate('/landing')}>{t('backToHome', language)}</button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccountSummaryPage_EN;
