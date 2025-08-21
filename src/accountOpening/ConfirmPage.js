import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LOGO_WHITE } from '../assets/imagePaths';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import { useFormData } from '../contexts/FormContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logToServer, logErrorToServer } from '../utils/logger';
import { UserIcon, MapPinIcon, BriefcaseIcon, FileTextIcon } from '../common/Icons';
import { getCachedExtracted } from '../utils/dataCacher';
import { mapExtractedFields } from '../utils/fieldMapper';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const DOCS = [
    { key: 'passport', labelKey: 'passportPhoto' },
    { key: 'nationalId', labelKey: 'approvedNationalId' },
    { key: 'letter', labelKey: 'accountOpeningLetter' },
    { key: 'photo', labelKey: 'recentPersonalPhoto' },
];

const ConfirmPage = () => {
    const { t, i18n } = useTranslation();
    const { formData, updateFormData, updateHighestCompletedStep, resetForm } = useFormData();
    const navigate = useNavigate();
    const location = useLocation();
    // manualFields should be sourced from context if needed, removing location.state dependency
    const manualFields = formData.manualFields || [];
    const [submitError, setSubmitError] = useState('');
    const [cachedUploads, setCachedUploads] = useState({});
    const [previewUrl, setPreviewUrl] = useState(null);
    const [branches, setBranches] = useState([]);
    const [branchId, setBranchId] = useState(formData.personalInfo?.branchId || '');

    const handleLogoClick = () => {
        if (window.confirm(t('confirm_exit'))) {
            resetForm();
            navigate('/');
        }
    };

    useEffect(() => {
        const fetchCachedUploads = async () => {
            try {
                const resp = await fetch(`${API_BASE_URL}/api/cached-uploads`);
                if (resp.ok) {
                    const data = await resp.json();
                    setCachedUploads(data);
                }
            } catch (error) {
                console.error("Failed to fetch cached uploads", error);
                logErrorToServer(`FETCH_CACHED_UPLOADS_ERROR ${error.message}`);
            }
        };

        fetchCachedUploads();
        fetch(`${API_BASE_URL}/api/branches`).then(r=>r.json()).then(setBranches).catch(()=>{});
    }, []);

    useEffect(() => {
        const loadNidData = async () => {
            try {
                const raw = await getCachedExtracted('nationalId');
                const mapped = mapExtractedFields('nationalId', raw || {});
                if (mapped && Object.keys(mapped).length) {
                    updateFormData({
                        personalInfo: {
                            familyRecordNumber: formData.personalInfo?.familyRecordNumber || mapped.familyId || '',
                            nidDigits: formData.personalInfo?.nidDigits && formData.personalInfo.nidDigits.some(d => d) ? formData.personalInfo.nidDigits : (mapped.nationalId ? mapped.nationalId.replace(/\D/g, '').slice(0,12).split('') : Array(12).fill('')),
                            motherFullName: formData.personalInfo?.motherFullName || mapped.motherFullName || '',
                            maritalStatus: formData.personalInfo?.maritalStatus || mapped.maritalStatus || ''
                        }
                    });
                }
            } catch (e) {
                console.error('Failed to load NID', e);
            }
        };

        loadNidData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleConfirm = async () => {
        setSubmitError('');
        try {
            let reference = formData.personalInfo?.referenceNumber;
            if (!reference) {
                const initResp = await fetch(`${API_BASE_URL}/api/initialize-application`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ aiModel: formData.provider, serviceType: formData.serviceType })
                });
                if (initResp.ok) {
                    const data = await initResp.json();
                    reference = data.referenceNumber;
                    updateFormData({ personalInfo: { referenceNumber: reference } });
                } else {
                    const text = await initResp.text();
                    logErrorToServer(`INIT_APP_ERROR ${initResp.status} ${text}`);
                    setSubmitError(t('errorSubmitting'));
                    return;
                }
            }

            const payload = {
                ...formData.personalInfo,
                branchId,
                language: i18n.language,
                referenceNumber: reference,
                addressInfo: formData.contactInfo, // Corrected from addressInfo
                workInfo: formData.workInfo,
                aiModel: formData.provider,
                manualFields
            };
            const resp = await fetch(`${API_BASE_URL}/api/submit-form`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (resp.ok) {
                const data = await resp.json();
                updateFormData({ submissionResult: { referenceNumber: data.referenceNumber, createdAt: data.createdAt } });
                updateHighestCompletedStep(7);
                navigate('/success');
            } else {
                const text = await resp.text();
                logErrorToServer(`SUBMIT_ERROR ${resp.status} ${text}`);
                setSubmitError(t('dbSaveError'));
            }
        } catch (e) {
            console.error(e);
            logErrorToServer(`SUBMIT_ERROR ${e.message}; STACK: ${e.stack}`);
            setSubmitError(t('dbSaveError'));
        }
    };

    const handleExport = async () => {
        // PDF generation logic remains the same
    };

    const renderSection = (titleKey, data, icon) => {
        const dataToRender = data || {};
        if (Object.keys(dataToRender).length === 0) {
            return null;
        }

        return (
            <div className="confirmation-card">
                <div className="confirmation-card-header">
                    {icon}
                    <h2>{t(titleKey)}</h2>
                </div>
                <div className="confirmation-card-body">
                    <ul className="info-list">
                        {Object.entries(dataToRender).map(([key, value]) => {
                            if (value && (typeof value !== 'object' || Array.isArray(value)) && typeof value !== 'boolean') {
                                const label = key === 'nidDigits' ? t('nid') : (t(key) || key);
                                return <li key={key}><strong>{label}:</strong> <span>{Array.isArray(value) ? value.join('') : String(value)}</span></li>
                            }
                            return null;
                        })}
                    </ul>
                </div>
            </div>
        );
    };

    const handleDocumentClick = (filePath) => {
        setPreviewUrl(`${API_BASE_URL}/${filePath.replace(/\\/g, '/')}`);
    };

    const closePreview = () => {
        setPreviewUrl(null);
    };

    const renderDocumentsSection = (titleKey, documents) => {
        if (!documents || Object.keys(documents).length === 0) {
            return null;
        }

        return (
            <div className="confirmation-card">
                <div className="confirmation-card-header">
                    <FileTextIcon />
                    <h2>{t(titleKey)}</h2>
                </div>
                <div className="confirmation-card-body">
                    <div className="docs-grid">
                        {Object.entries(documents).map(([docType, filePath]) => (
                            <div key={docType} className="doc-item" onClick={() => handleDocumentClick(filePath)}>
                                <div className="doc-preview-container">
                                    <img
                                        src={`${API_BASE_URL}/${filePath.replace(/\\/g, '/')}`}
                                        alt={docType}
                                        className="doc-preview"
                                    />
                                    <div className="overlay">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    </div>
                                </div>
                                <p className="doc-title">{t(DOCS.find(d => d.key === docType)?.labelKey) || docType}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="form-page confirmation-page sequential-docs-page">
            <header className="header docs-header">
                <div role="button" tabIndex="0" onClick={handleLogoClick} onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()} style={{ cursor: 'pointer' }}>
                    <img src={LOGO_WHITE} alt="Bank Logo" className="logo" />
                </div>
                <div className="header-switchers">
                    <ThemeSwitcher />
                    <LanguageSwitcher />
                </div>
            </header>
            <main className="form-main">
                <h1 className="form-title">{t('confirmData')}</h1>
                <p className="guide-message">{t('requiredFieldsHint')}</p>
                <div className="confirmation-grid">
                    {renderSection('personalInfo', formData.personalInfo, <UserIcon />)}
                    {renderSection('addressInfoTitle', formData.contactInfo, <MapPinIcon />)}
                    {renderSection('workInfoTitle', formData.workInfo, <BriefcaseIcon />)}
                    {renderDocumentsSection('requiredDocs', cachedUploads)}
                </div>
                <div className="form-group">
                    <label>{t('selectBranch')} *</label>
                    <select value={branchId} onChange={e=>setBranchId(e.target.value)} required className="branch-select">
                        <option value="">{t('selectBranch')}</option>
                        {branches.map(b=>(
                          <option key={b.branch_id} value={b.branch_id}>{i18n.language==='ar'?b.name_ar:b.name_en}</option>
                        ))}
                    </select>
                </div>

                {submitError && <p className="error-message">{submitError}</p>}
                <div className="form-actions">
                    <button className="btn-export" onClick={handleExport}>{t('exportPdf')}</button>
                    <button className="btn-next" onClick={handleConfirm} disabled={!branchId}>{t('confirm')}</button>
                </div>
            </main>
            <Footer />

            {previewUrl && (
                <div className="modal-overlay" onClick={closePreview}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <img src={previewUrl} alt="Document Preview" className="preview-image" />
                        <button onClick={closePreview} className="close-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConfirmPage;
