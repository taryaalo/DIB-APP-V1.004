import React, { useState, useRef, useEffect } from 'react';
import { extractPassportData, extractNIDData } from '../utils/passportNidExtractors';
import { mapExtractedFields } from '../utils/fieldMapper';
import { uploadDocument } from '../utils/fileUploader';
import { cacheExtractedData } from '../utils/dataCacher';
import { normalizeNationality } from '../utils/normalizeNationality';
import { t } from '../i18n';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import AIProviderSwitcher from '../common/AIProviderSwitcher';
import Footer from '../common/Footer';
import { UploadIcon, SuccessIcon } from '../common/Icons';
import { LOGO_WHITE } from '../assets/imagePaths';
import { useLanguage } from '../contexts/LanguageContext';
import { useFormData } from '../contexts/FormContext';
import '../styles/SequentialDocsPage.css';

const DOCS = [
  { key: 'passport', labelKey: 'passportPhoto' },
  { key: 'nationalId', labelKey: 'approvedNationalId' },
  { key: 'letter', labelKey: 'accountOpeningLetter' },
  { key: 'photo', labelKey: 'recentPersonalPhoto' },
];

const SequentialDocsPage_EN = ({ onNavigate, backPage, nextPage }) => {
    const { language } = useLanguage();
    const { setFormData, formData } = useFormData();
    const [current, setCurrent] = useState(0);
    const [data, setData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [error, setError] = useState('');
    const [image, setImage] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);
    const [provider, setProvider] = useState(formData.provider || 'chatgpt');
    const fileInputRef = useRef(null);

    useEffect(() => {
        setFormData(d => ({ ...d, provider }));
    }, [provider, setFormData]);
    
    const resetComponentState = () => {
        setImage(null);
        setError('');
        setScanComplete(false);
        setUploadedFile(null);
        setData({});
    };

    const handleDragEvents = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
        else if (e.type === 'dragleave') setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async (file) => {
        if (!file) return;
        setUploadedFile(file);
        setScanComplete(false);
        const reader = new FileReader();
        reader.onloadend = () => setImage(reader.result);
        reader.readAsDataURL(file);
        
        setIsLoading(true);
        setError('');
        try {
            await uploadDocument(file, DOCS[current].key);

            if (current === 0 && !formData.personalInfo?.referenceNumber) {
                const initResp = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/initialize-application`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ aiModel: provider, serviceType: formData.serviceType })
                });
                if (initResp.ok) {
                    const initData = await initResp.json();
                    setFormData(d => ({ ...d, personalInfo: { ...d.personalInfo, referenceNumber: initData.referenceNumber } }));
                }
            }
            
            let result = {};
            if (DOCS[current].key === 'passport') {
                result = await extractPassportData(file, provider);
                result = mapExtractedFields('passport', result);
                 if (result) {
                  const names = (result.givenNameEng || '').trim().split(/\s+/);
                  const firstName = names[0] || '';
                  const middleName = names.slice(1).join(' ');
                  const genderVal = result.sex === 'M' ? 'male' : result.sex === 'F' ? 'female' : (result.sex || '');
                  setFormData((d) => ({ ...d, personalInfo: { ...(d.personalInfo || {}), fullName: result.fullNameArabic, firstNameEn: firstName, middleNameEn: middleName, lastNameEn: result.surnameEng, dob: result.dateOfBirth, gender: genderVal, nationality: normalizeNationality(result.nationality), passportNumber: result.passportNo, passportIssueDate: result.dateOfIssue, passportExpiryDate: result.expiryDate, birthPlace: result.placeOfBirth, }, passportData: result, }));
                }
            } else if (DOCS[current].key === 'nationalId') {
                result = await extractNIDData(file, provider);
                result = mapExtractedFields('nationalId', result);
                if (result) {
                  const nidDigits = result.nationalId ? result.nationalId.replace(/\D/g, '').slice(0, 12).split('') : [];
                  setFormData((d) => {
                    const genderVal = result.sex === 'M' ? 'male' : result.sex === 'F' ? 'female' : (result.sex || '');
                    const dob = result.birthYear && result.birthMonth && result.birthDay
                      ? `${result.birthYear}-${result.birthMonth.toString().padStart(2, '0')}-${result.birthDay.toString().padStart(2, '0')}`
                      : d.personalInfo?.dob || '';
                    return { ...d, personalInfo: { ...(d.personalInfo || {}), familyRecordNumber: result.familyId, nidDigits: nidDigits.length ? nidDigits : d.personalInfo?.nidDigits || Array(12).fill(''), gender: d.personalInfo?.gender || genderVal, dob: d.personalInfo?.dob || dob, }, nidData: result, };
                  });
                }
            } else {
                result = { uploaded: true };
            }
            
            setData((d) => ({ ...d, [DOCS[current].key]: result }));
            await cacheExtractedData(DOCS[current].key, result);
            setScanComplete(true);

        } catch (e) {
            console.error(e);
            setError(t('error_extracting_data', language));
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm = () => {
        setIsConfirming(true);
        setTimeout(() => { 
            if (current < DOCS.length - 1) {
                setCurrent(c => c + 1);
                resetComponentState();
            } else {
                onNavigate(nextPage);
            }
            setIsConfirming(false);
        }, 500);
    };

    const handleRefresh = () => {
        if (uploadedFile) {
            handleUpload(uploadedFile);
        }
    };

    const doc = DOCS[current];

    return (
        <div className="form-page sequential-docs-page">
            <header className="header docs-header">
                <img src={LOGO_WHITE} alt="Bank Logo" className="logo" />
                <div className="header-switchers">
                    <AIProviderSwitcher provider={provider} onChange={setProvider} />
                    <ThemeSwitcher />
                    <LanguageSwitcher />
                </div>
                <button onClick={() => onNavigate(backPage)} className="btn-back">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    <span>{t('back', language)}</span>
                </button>
            </header>
            <main className="form-main">
                 <input type="file" ref={fileInputRef} onChange={(e) => handleUpload(e.target.files[0])} accept="image/*" style={{ display: 'none' }} />

                <div className="controls-header">
                   <h2 className="page-title">{t(doc.labelKey)}</h2>
                    {image && (
                      <button onClick={handleRefresh} className="btn-refresh">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0114.13-3.36L23 10"></path><path d="M20.49 15a9 9 0 01-14.13 3.36L1 14"></path></svg>
                        <span>{t('refresh', language)}</span>
                      </button>
                    )}
                </div>
                
                {!image ? (
                  <div className={`upload-area ${isDragging ? 'drag-over' : ''}`} onClick={() => fileInputRef.current.click()} onDragEnter={handleDragEvents} onDragOver={handleDragEvents} onDragLeave={handleDragEvents} onDrop={handleDrop}>
                    <div className="upload-icon"><UploadIcon /></div>
                    <h2>{t('upload_prompt', language)}</h2>
                  </div>
                ) : (
                  <div className="result-container">
                      <div className="image-preview-box">
                        <div className={`image-container ${isLoading ? 'scanning' : ''}` }>
                          <img src={image} alt="preview" className={`image-to-stamp ${scanComplete ? 'stamped' : ''}`} />
                          <div className={`scan-complete-overlay ${scanComplete && !isLoading ? 'visible' : ''}`}>
                            <div className="stamp-wrapper">
                                <svg className="stamp-icon" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
                                    <circle className="stamp-circle" cx="26" cy="26" r="25" fill="none" />
                                    <path className="stamp-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                                </svg>
                            </div>
                          </div>
                        </div>
                      <button type="button" onClick={() => fileInputRef.current.click()} className="btn-change" style={{ marginTop: 'auto' }}>
                        {t('change_document', language)}
                      </button>
                    </div>

                    <div className="data-result-box">
                       <div className="data-result-header">
                         <h3>{t('extractedData', language)}</h3>
                       </div>
                       {isLoading ? (
                         <div className="loading-container">
                           <div className="arrow-spinner"></div>
                           <p>{t('extracting_data', language)}</p>
                         </div>
                       ) : data[doc.key] && Object.keys(data[doc.key]).length > 0 ? (
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>Field</th>
                                        <th>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(data[doc.key]).map(([key, value]) => (
                                        <tr key={key}>
                                            <td>{key}</td>
                                            <td>{String(value) || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                           <div className="loading-container">
                               <p>{t('no_data_found', language)}</p>
                           </div>
                       )}
                    </div>
                  </div>
                )}
                {error && <p className="error-message">{error}</p>}
                
                <div className="form-actions" style={{marginTop: '30px'}}>
                    <button className="btn-next" onClick={handleConfirm} disabled={!image || isLoading || isConfirming}>
                        {isConfirming ? <div className="loader"></div> : t('next', language)}
                    </button>
                </div>

            </main>
            <Footer />
        </div>
    );
};
export default SequentialDocsPage_EN;