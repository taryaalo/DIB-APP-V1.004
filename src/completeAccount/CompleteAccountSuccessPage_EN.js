import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import html2canvas from 'html2canvas';
import { LOGO_WHITE, LOGO_COLOR } from '../assets/imagePaths';
import '../styles/CompleteAccountSuccessPage_EN.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const CompleteAccountSuccessPage_EN = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const [feesDeposited, setFeesDeposited] = useState(false);
  const cardRef = useRef(null);
  const receiptRef = useRef(null);

  const customer = state?.customer || {};
  const accountNumber = state?.accountNumber || '';
  const custId = state?.custId || '';
  const photo = state?.photo ? `${API_BASE_URL}/${state.photo}` : '';

  const fullNameEn = [customer.first_name, customer.middle_name, customer.last_name, customer.surname_en]
    .filter(Boolean)
    .join(' ') || customer.full_name || '';
  const fullNameAr = [customer.first_name_ar, customer.middle_name_ar, customer.last_name_ar, customer.surname_ar]
    .filter(Boolean)
    .join(' ') || customer.full_name || '';
  const branch = customer.branch_name || customer.branch_id || '';
  const phone = customer.phone || '';

  const qrData = { customerId: custId, accountNumber };
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify(qrData))}`;

  const handleExportCard = () => {
    const cardElement = cardRef.current;
    if (cardElement) {
      html2canvas(cardElement, { useCORS: true, scale: 3 }).then((canvas) => {
        const link = document.createElement('a');
        link.download = 'customer-id-card.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  const copyStyles = (target) => {
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
    styles.forEach((style) => {
      target.document.write(style.outerHTML);
    });
  };

  const handlePrintCard = () => {
    const cardElement = cardRef.current;
    if (!cardElement) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print Card</title>');
    copyStyles(printWindow);
    printWindow.document.write('</head><body>');
    printWindow.document.write(cardElement.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handlePrintReceipt = () => {
    const receiptElement = receiptRef.current;
    if (!receiptElement) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print Receipt</title>');
    copyStyles(printWindow);
    printWindow.document.write('</head><body>');
    printWindow.document.write(receiptElement.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="form-page">
      <header className="header docs-header">
        <img src={LOGO_WHITE} alt="Bank Logo" className="logo" />
        <div className="header-switchers">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </header>
      <main className="sp-container" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <h1 className="sp-main-title">{t('successAccount', language)}</h1>
        <div className="sp-content-layout">
          <div className="sp-card-section">
            <h2>{t('customerCard', language)}</h2>
            <div ref={cardRef}>
              <div className="sp-id-card">
                <div className="id-card-header">
                  <img src={LOGO_WHITE} alt="Bank Logo" className="id-card-logo" />
                </div>
                <div className="id-card-body">
                  <div className="id-card-photo-wrapper">
                    {photo && <img src={photo} alt="Customer" className="id-card-photo" />}
                  </div>
                  <p className="id-card-name-en">{fullNameEn}</p>
                  <p className="id-card-name-ar">{fullNameAr}</p>
                  <div className="id-card-details">
                    <div className="id-card-info">
                      <p><strong>{t('accountNumber', language)}</strong> {accountNumber}</p>
                      <p><strong>{t('branch', language)}</strong> {branch}</p>
                      <p><strong>{t('phoneNumber', language)}</strong> {phone}</p>
                    </div>
                    <div className="id-card-qr-wrapper">
                      <img src={qrCodeUrl} alt="QR Code" className="id-card-qr-code" />
                      <p className="id-card-qr-label"><strong>{t('customerId', language)}:</strong> {custId}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="sp-actions-section">
            <h2>{t('receipt', language)}</h2>
            <div ref={receiptRef}>
              <div className="sp-receipt">
                <div className="sp-receipt-header">
                  <img src={LOGO_COLOR} alt="Bank Logo" className="sp-receipt-logo" />
                  <h3>{t('officialReceipt', language)}</h3>
                </div>
                <div className="sp-receipt-body">
                  <p><span>{t('customerId', language)}</span> <strong>{custId}</strong></p>
                  <p><span>{t('fees', language)}</span> <strong>150.00 LYD</strong></p>
                </div>
                <div className="sp-receipt-footer">
                  <p>{t('thankYou', language)}</p>
                </div>
              </div>
            </div>
            <button className="sp-button sp-button-secondary" onClick={handlePrintReceipt}>{t('printReceipt', language)}</button>
            <div className="sp-fee-confirmation">
              <label>
                <input type="checkbox" checked={feesDeposited} onChange={(e) => setFeesDeposited(e.target.checked)} /> {t('confirmFee', language)}
              </label>
            </div>
            <button onClick={handlePrintCard} className="sp-button sp-button-primary" disabled={!feesDeposited}>{t('printCard', language)}</button>
            <button onClick={handleExportCard} className="sp-button sp-button-primary" disabled={!feesDeposited}>{t('exportCard', language)}</button>
          </div>
        </div>
        <button className="sp-button sp-home-button" onClick={() => navigate('/landing')}>{t('goHome', language)}</button>
      </main>
      <Footer />
    </div>
  );
};

export default CompleteAccountSuccessPage_EN;
