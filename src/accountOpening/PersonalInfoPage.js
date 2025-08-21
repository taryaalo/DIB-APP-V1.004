import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LOGO_WHITE } from '../assets/imagePaths';
import { CalendarIcon, LockIcon } from '../common/Icons';
import { logToServer } from '../utils/logger';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import FullPageLoader from '../common/FullPageLoader';
import Footer from '../common/Footer';
import TermsDialog from '../common/TermsDialog';
import { useTranslation } from 'react-i18next';
import { useFormData } from '../contexts/FormContext';
import { getCachedExtracted } from '../utils/dataCacher';
import { normalizeNationality } from '../utils/normalizeNationality';
import { mapExtractedFields } from '../utils/fieldMapper';

const PersonalInfoPage_EN = () => {
    const { t, i18n } = useTranslation();
    const { formData, setFormData } = useFormData();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({
        firstNameAr: '',
        middleNameAr: '',
        lastNameAr: '',
        surnameAr: '',
        motherFullName: '',
        maritalStatus: '',
        firstNameEn: '',
        middleNameEn: '',
        lastNameEn: '',
        surnameEn: '',
        passportNumber: '',
        passportIssueDate: '',
        passportExpiryDate: '',
        birthPlace: '',
        dob: '',
        gender: '',
        nationality: '',
        familyRecordNumber: '',
        nidDigits: Array(12).fill(''),
        phone: '',
        enableEmail: false,
        email: '',
        residenceExpiry: '',
        censusCardNumber: '',
        documentType: ''
    });
    const [locked, setLocked] = useState({});
    const [manualFields, setManualFields] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [agreements, setAgreements] = useState({ agree1: false, agree2: false });
    const [agreeError, setAgreeError] = useState(false);
    const [showVerify, setShowVerify] = useState(false);
    const [verifyStep, setVerifyStep] = useState(1); // 1=review, 2=phone otp, 3=email otp
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [otpTimer, setOtpTimer] = useState(0);
    const [showTerms, setShowTerms] = useState(false);

    useEffect(() => {
        async function loadExtracted() {
            setLoading(true);
            setError('');
            try {
                const passportRaw = await getCachedExtracted('passport');
                const nidRaw = await getCachedExtracted('nationalId');
                const passportResp = mapExtractedFields('passport', passportRaw || {});
                const nidResp = mapExtractedFields('nationalId', nidRaw || {});
                
                let updated = { ...form };

                if (passportResp && Object.keys(passportResp).length) {
                    const arabicNameParts = (passportResp.fullNameArabic || '').trim().split(/\s+/);
                    updated.firstNameAr = arabicNameParts[0] || '';
                    updated.middleNameAr = arabicNameParts[1] || '';
                    updated.lastNameAr = arabicNameParts[2] || '';
                    updated.surnameAr = arabicNameParts.length > 3 ? arabicNameParts.slice(3).join(' ') : '';
                    
                    const engNameParts = (passportResp.givenNameEng || '').trim().split(/\s+/);
                    updated.firstNameEn = engNameParts[0] || '';
                    updated.middleNameEn = engNameParts[1] || '';
                    updated.lastNameEn = engNameParts[2] || '';
                    updated.surnameEn = passportResp.surnameEng || '';

                    updated.dob = passportResp.dateOfBirth || '';
                    updated.gender = passportResp.sex === 'M' ? 'male' : passportResp.sex === 'F' ? 'female' : (passportResp.sex || '');
                    updated.nationality = normalizeNationality(passportResp.nationality) || '';
                    updated.passportNumber = passportResp.passportNo || '';
                    updated.passportIssueDate = passportResp.dateOfIssue || '';
                    updated.passportExpiryDate = passportResp.expiryDate || '';
                    updated.birthPlace = passportResp.placeOfBirth || '';
                }

                if (nidResp && Object.keys(nidResp).length) {
                    if (!updated.firstNameAr && nidResp.fullNameArabic) {
                        const arabicNameParts = (nidResp.fullNameArabic || '').trim().split(/\s+/);
                        updated.firstNameAr = arabicNameParts[0] || '';
                        updated.middleNameAr = arabicNameParts[1] || '';
                        updated.lastNameAr = arabicNameParts[2] || '';
                        updated.surnameAr = arabicNameParts.length > 3 ? arabicNameParts.slice(3).join(' ') : '';
                    }
                    if (!updated.firstNameEn && nidResp.givenNameEng) {
                        const engNameParts = (nidResp.givenNameEng || '').trim().split(/\s+/);
                        updated.firstNameEn = engNameParts[0] || '';
                        updated.middleNameEn = engNameParts[1] || '';
                        updated.lastNameEn = engNameParts[2] || '';
                    }
                    if (!updated.surnameEn && nidResp.surnameEng) {
                        updated.surnameEn = nidResp.surnameEng || '';
                    }

                    updated.nidDigits = nidResp.nationalId ? nidResp.nationalId.replace(/\D/g, '').slice(0, 12).split('') : Array(12).fill('');
                    if (!updated.gender) {
                      updated.gender = nidResp.sex === 'M' ? 'male' : nidResp.sex === 'F' ? 'female' : (nidResp.sex || '');
                    }
                    if (!updated.dob) {
                        updated.dob = nidResp.birthYear && nidResp.birthMonth && nidResp.birthDay
                            ? `${nidResp.birthYear}-${nidResp.birthMonth.toString().padStart(2,'0')}-${nidResp.birthDay.toString().padStart(2,'0')}`
                            : '';
                    }
                    if (!updated.familyRecordNumber) updated.familyRecordNumber = nidResp.familyId || '';
                    if (!updated.motherFullName) updated.motherFullName = nidResp.motherFullName || '';
                    if (!updated.maritalStatus) updated.maritalStatus = nidResp.maritalStatus || '';
                }

                setForm(updated);
                setFormData(d => ({ ...d, personalInfo: updated }));
                
                const lockedFields = {};
                Object.keys(updated).forEach(k => {
                    if(updated[k] && (!Array.isArray(updated[k]) || updated[k].some(item => item))) {
                        lockedFields[k] = true;
                    }
                });
                setLocked(lockedFields);

            } catch (e) {
                console.error(e);
                setError(t('error_extracting_data'));
            } finally {
                setLoading(false);
            }
        }
        loadExtracted();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (otpTimer <= 0) return;
        const interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [otpTimer]);

    useEffect(() => {
        if (!showVerify) setOtpTimer(0);
    }, [showVerify]);

    const handleChange = (e, index) => {
        const { name, value, type, checked } = e.target;
        if (locked[name]) return;
        if (name.startsWith('agree')) {
            setAgreements(a => ({ ...a, [name]: checked }));
        } else if (name === 'enableEmail') {
            setForm(f => ({ ...f, enableEmail: checked }));
        } else if (name.startsWith('nidDigit')) {
            const digits = [...form.nidDigits];
            digits[index] = value.replace(/[^0-9]/g, '').slice(-1);
            setForm(f => ({ ...f, nidDigits: digits }));
            if (value && e.target.nextSibling) e.target.nextSibling.focus();
        } else if (['fullName', 'firstNameAr', 'middleNameAr', 'lastNameAr', 'surnameAr', 'motherFullName'].includes(name)) {
            const arabic = value.replace(/[^\u0600-\u06FF\s]/g, '');
            setForm(f => ({ ...f, [name]: arabic }));
        } else if (['firstNameEn', 'middleNameEn', 'lastNameEn', 'surnameEn'].includes(name)) {
            const eng = value.replace(/[^A-Za-z\s]/g, '');
            setForm(f => ({ ...f, [name]: eng }));
        } else if (name === 'phone') {
            const digits = value.replace(/[^0-9]/g, '');
            setForm(f => ({ ...f, phone: digits }));
        } else if (name === 'familyRecordNumber') {
            const digits = value.replace(/[^0-9]/g, '');
            setForm(f => ({ ...f, familyRecordNumber: digits }));
        } else {
            setForm(f => ({ ...f, [name]: value }));
        }
    };

    const handleNIDKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !e.target.value && e.target.previousSibling) {
            e.target.previousSibling.focus();
        }
    };

    const handleNIDPaste = (e, index) => {
        const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, form.nidDigits.length - index);
        if (!paste) return;
        e.preventDefault();
        const digits = [...form.nidDigits];
        for (let i = 0; i < paste.length; i++) {
            if (digits[index + i] !== undefined) {
                digits[index + i] = paste[i];
            }
        }
        setForm(f => ({ ...f, nidDigits: digits }));
        const inputs = e.target.parentElement.querySelectorAll('input');
        const next = index + paste.length;
        if (inputs[next]) inputs[next].focus();
    };

    const unlockField = (name, e) => {
        setLocked(l => ({ ...l, [name]: false }));
        if (!manualFields.includes(name)) {
            setManualFields(f => [...f, name]);
        }
        logToServer(`manual_edit_${name}`);
        
        const element = e.currentTarget.closest('.form-group');
        if (element) {
            element.classList.add('unlock-animation');
            setTimeout(() => {
                element.classList.remove('unlock-animation');
            }, 500);
        }
    };
    
    const lockProps = (name) => ({
        readOnly: !!locked[name],
        className: `form-input${locked[name] ? ' locked' : ''}`,
        onDoubleClick: (e) => unlockField(name, e)
    });

    const isComplete = [
        'firstNameAr','middleNameAr','lastNameAr','surnameAr','firstNameEn','middleNameEn','lastNameEn','surnameEn',
        'motherFullName','dob','birthPlace','gender','maritalStatus','nationality','passportNumber',
        'passportIssueDate','passportExpiryDate','familyRecordNumber','phone'
    ].every(k => {
        const val = k === 'phone' ? form[k] : form[k];
        return Array.isArray(val) ? val.every(Boolean) : (val || '').toString().trim() !== '';
    }) && (!form.enableEmail || form.email.trim() !== '');

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (!agreements.agree1 || !agreements.agree2) {
            setAgreeError(true);
            return;
        }
        setAgreeError(false);
        setVerifyStep(1);
        setOtp('');
        setOtpError('');
        setShowVerify(true);
    };

    const confirmVerification = async () => {
        if (verifyStep === 1) {
            try {
                await fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/api/send-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: `+218${form.phone}`, language: i18n.language })
                });
                setVerifyStep(2);
                setOtpTimer(120);
                setOtp('');
                return;
            } catch (e) { console.error(e); }
        } else if (verifyStep === 2) {
            try {
                const resp = await fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/api/verify-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: `+218${form.phone}`, otp })
                });
                const data = await resp.json();
                if (data.verified) {
                    if (form.enableEmail) {
                        await fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/api/send-otp`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: form.email, language: i18n.language })
                        });
                        setVerifyStep(3);
                        setOtpTimer(120);
                        setOtp('');
                        return;
                    } else {
                        finalizeVerification();
                        return;
                    }
                }
            } catch (e) { console.error(e); }
            setOtpError(t('incorrectOtp'));
        } else {
            try {
                const resp = await fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/api/verify-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: form.email, otp })
                });
                const data = await resp.json();
                if (data.verified) {
                    finalizeVerification();
                    return;
                }
            } catch (e) { console.error(e); }
            setOtpError(t('incorrectEmailOtp'));
        }
    };

    const finalizeVerification = () => {
        setShowVerify(false);
        setVerifyStep(1);
        setOtp('');
        setOtpError('');
        setFormData(d => ({ ...d, personalInfo: { ...form, phone: `+218${form.phone}` } }));
        fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/api/cache-form`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, personalInfo: { ...form, phone: `+218${form.phone}` } })
        }).catch(e => console.error(e));
        navigate('/confirm', { state: { form, manualFields } });
    };

    const resendOtp = async () => {
        try {
            if (verifyStep === 2) {
                await fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/api/send-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: `+218${form.phone}`, language: i18n.language })
                });
            } else if (verifyStep === 3) {
                await fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/api/send-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: form.email, language: i18n.language })
                });
            }
            setOtpTimer(120);
        } catch (e) { console.error(e); }
    };

    const formatTime = (secs) => {
        const m = String(Math.floor(secs / 60)).padStart(2, '0');
        const s = String(secs % 60).padStart(2, '0');
        return `${m}:${s}`;
    };

    const cancelVerification = () => {
        setShowVerify(false);
        setVerifyStep(1);
        setOtp('');
        setOtpError('');
        setOtpTimer(0);
    };

    return (
        <div className="form-page">
            <header className="header docs-header">
                <img src={LOGO_WHITE} alt="Bank Logo" className="logo" />
                <div className="header-switchers">
                    <ThemeSwitcher />
                    <LanguageSwitcher />
                </div>
                 <button onClick={() => navigate(-1)} className="btn-back">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    <span>{t('back')}</span>
                </button>
            </header>
            <main className="form-main">
                <h2 className="form-title">{t('personalInfo')}</h2>
                <p className="guide-message">{t('requiredFieldsHint')}</p>
                {error && <p className="error-message">{error}</p>}
                <form className="form-container" style={{maxWidth: '900px'}} onSubmit={handleSubmit} noValidate>
                    <p className="guide-message">{t('editHint')}</p>
                    
                    <div className="form-grid-columns">
                        <div className="form-column" style={{direction: 'rtl', textAlign: 'right'}}>
                           <div className="form-group"><label>{t('firstNameAr')} *</label><div style={{position: 'relative'}}><input name="firstNameAr" value={form.firstNameAr} onChange={handleChange} required type="text" {...lockProps('firstNameAr')} /><LockIcon className="lock-icon"/></div></div>
                           <div className="form-group"><label>{t('middleNameAr')} *</label><div style={{position: 'relative'}}><input name="middleNameAr" value={form.middleNameAr} onChange={handleChange} required type="text" {...lockProps('middleNameAr')} /><LockIcon className="lock-icon"/></div></div>
                           <div className="form-group"><label>{t('lastNameAr')} *</label><div style={{position: 'relative'}}><input name="lastNameAr" value={form.lastNameAr} onChange={handleChange} required type="text" {...lockProps('lastNameAr')} /><LockIcon className="lock-icon"/></div></div>
                           <div className="form-group"><label>{t('surnameAr')} *</label><div style={{position: 'relative'}}><input name="surnameAr" value={form.surnameAr} onChange={handleChange} required type="text" {...lockProps('surnameAr')} /><LockIcon className="lock-icon"/></div></div>
                        </div>

                        <div className="form-column">
                           <div className="form-group"><label>{t('firstNameEn')} *</label><div style={{position: 'relative'}}><input name="firstNameEn" value={form.firstNameEn} onChange={handleChange} required type="text" {...lockProps('firstNameEn')} /><LockIcon className="lock-icon"/></div></div>
                           <div className="form-group"><label>{t('middleNameEn')} *</label><div style={{position: 'relative'}}><input name="middleNameEn" value={form.middleNameEn} onChange={handleChange} required type="text" {...lockProps('middleNameEn')} /><LockIcon className="lock-icon"/></div></div>
                           <div className="form-group"><label>{t('lastNameEn')} *</label><div style={{position: 'relative'}}><input name="lastNameEn" value={form.lastNameEn} onChange={handleChange} required type="text" {...lockProps('lastNameEn')} /><LockIcon className="lock-icon"/></div></div>
                           <div className="form-group"><label>{t('surnameEn')} *</label><div style={{position: 'relative'}}><input name="surnameEn" value={form.surnameEn} onChange={handleChange} required type="text" {...lockProps('surnameEn')} /><LockIcon className="lock-icon"/></div></div>
                        </div>
                    </div>
                    
                    <hr style={{margin: '20px 0'}} />

                    <div className="form-group"><label>{t('motherFullName')} *</label><div style={{position: 'relative'}}><input name="motherFullName" value={form.motherFullName} onChange={handleChange} required type="text" {...lockProps('motherFullName')} /><LockIcon className="lock-icon"/></div></div>

                    <div className="company-form-grid">
                        <div className="form-group date-input-container"><label>{t('dateOfBirth')} <span className="required-star">*</span></label><div style={{position: 'relative', width: '100%'}}><input name="dob" value={form.dob} onChange={handleChange} type="text" required {...lockProps('dob')} onFocus={e=>e.target.type='date'} onBlur={e=>e.target.type='text'} /><CalendarIcon/></div></div>
                        <div className="form-group"><label>{t('birthPlace')} <span className="required-star">*</span></label><div style={{position: 'relative'}}><input name="birthPlace" value={form.birthPlace} onChange={handleChange} type="text" required {...lockProps('birthPlace')} /><LockIcon className="lock-icon" /></div></div>
                        <div className="form-group">
                            <label>{t('gender')} *</label>
                            <div style={{position: 'relative'}}>
                                <select name="gender" value={form.gender} onChange={handleChange} required {...lockProps('gender')}>
                                    <option value="">{t('gender')}</option>
                                    <option value="male">{t('male')}</option>
                                    <option value="female">{t('female')}</option>
                                </select>
                                <LockIcon className="lock-icon" />
                            </div>
                        </div>
                        <div className="form-group">
                           <label>{t('maritalStatus')} *</label>
                           <div style={{position: 'relative'}}>
                               <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange} required {...lockProps('maritalStatus')}>
                                   <option value="">{t('maritalStatus')}</option>
                                   <option value="single">{t('single')}</option>
                                   <option value="married">{t('married')}</option>
                                   <option value="divorced">{t('divorced')}</option>
                                   <option value="widowed">{t('widowed')}</option>
                               </select>
                               <LockIcon className="lock-icon"/>
                           </div>
                       </div>
                        <div className="form-group">
                            <label>{t('nationality')} <span className="required-star">*</span></label>
                            <div style={{position: 'relative'}}>
                                <select name="nationality" value={form.nationality} onChange={handleChange} disabled={locked.nationality} required {...lockProps('nationality')}>
                                    <option value="">{t('nationality')}</option>
                                    <option value="libyan">{t('libyan')}</option>
                                    <option value="other">{t('other')}</option>
                                </select>
                                <LockIcon className="lock-icon" />
                            </div>
                        </div>
                        <div className="form-group"><label>{t('passportNumber')} <span className="required-star">*</span></label><div style={{position: 'relative'}}><input name="passportNumber" value={form.passportNumber} onChange={handleChange} type="text" required {...lockProps('passportNumber')} /><LockIcon className="lock-icon"/></div></div>
                        <div className="form-group date-input-container"><label>{t('passportIssueDate')} <span className="required-star">*</span></label><div style={{position: 'relative', width: '100%'}}><input name="passportIssueDate" value={form.passportIssueDate} onChange={handleChange} type="text" required {...lockProps('passportIssueDate')} onFocus={e=>e.target.type='date'} onBlur={e=>e.target.type='text'} /><CalendarIcon/></div></div>
                        <div className="form-group date-input-container"><label>{t('passportExpiryDate')} <span className="required-star">*</span></label><div style={{position: 'relative', width: '100%'}}><input name="passportExpiryDate" value={form.passportExpiryDate} onChange={handleChange} type="text" required {...lockProps('passportExpiryDate')} onFocus={e=>e.target.type='date'} onBlur={e=>e.target.type='text'} /><CalendarIcon/></div></div>
                    </div>
                    
                    <div className="form-group">
                        <label>{t('familyRecordNumber')} <span className="required-star">*</span></label>
                        <div style={{position: 'relative'}}>
                            <input name="familyRecordNumber" value={form.familyRecordNumber} onChange={handleChange} required type="text" {...lockProps('familyRecordNumber')} />
                            <LockIcon className="lock-icon" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>{t('nid')} <span className="required-star">*</span></label>
                        <div className="national-id-group" onDoubleClick={(e) => unlockField('nidDigits', e)}>
                            {form.nidDigits.map((d, idx) => (<input key={idx} name={`nidDigit${idx}`} value={d} onChange={(e)=>handleChange(e, idx)} onKeyDown={(e)=>handleNIDKeyDown(e, idx)} onPaste={(e)=>handleNIDPaste(e, idx)} required type="text" maxLength="1" className={`national-id-input${locked.nidDigits ? ' locked' : ''}`} readOnly={!!locked.nidDigits}/>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>{t('phoneNumber')} <span className="required-star">*</span></label>
                        <div className="phone-input-group">
                            <span className="phone-prefix">+218</span>
                            <input name="phone" value={form.phone} onChange={handleChange} required type="tel" {...lockProps('phone')} placeholder={t('phoneNumber')} className="form-input" />
                        </div>
                        <LockIcon className="lock-icon" />
                    </div>
                    <div className="form-group"><label><input type="checkbox" name="enableEmail" checked={form.enableEmail} onChange={handleChange} /> {t('enableEmail')}</label></div>
                    {form.enableEmail && (
                        <div className="form-group">
                            <label>{t('email')} <span className="required-star">*</span></label>
                            <input name="email" value={form.email} onChange={handleChange} required type="email" {...lockProps('email')} placeholder={t('email')} />
                            <LockIcon className="lock-icon" />
                        </div>
                    )}

                    <div className="form-actions">
                        <div className="agreements">
                            <label className="agreement-item"><div className="custom-checkbox"><input name="agree1" type="checkbox" checked={agreements.agree1} onChange={handleChange} required/><span className="checkmark"></span></div><span>{t('certifyCorrect')}</span></label>
                            <label className="agreement-item"><div className="custom-checkbox"><input name="agree2" type="checkbox" checked={agreements.agree2} onChange={handleChange} required/><span className="checkmark"></span></div><span>{t('agreePrefix')} <button type="button" className="terms-link" onClick={()=>setShowTerms(true)}>{t('termsAndConditions')}</button></span></label>
                        </div>
                        {agreeError && <p className="error-message">{t('agreeError')}</p>}
                        <button className="btn-next" type="submit" disabled={!isComplete || !agreements.agree1 || !agreements.agree2}>{t('submitRequest')}</button>
                    </div>
                </form>
            </main>
            <Footer />
            {showTerms && <TermsDialog onClose={() => setShowTerms(false)} />}
            {showVerify && (
                <div className="modal-overlay" onClick={cancelVerification}>
                    <div className="modal-content verify-dialog" onClick={e => e.stopPropagation()}>
                        {verifyStep === 1 ? (
                            <>
                                <h3>{t('verifyContact')}</h3>
                                <p>{t('phoneNumber')}: +218{form.phone}</p>
                                {form.enableEmail && <p>{t('email')}: {form.email}</p>}
                            </>
                        ) : (
                            <>
                                <h3>{verifyStep === 2 ? t('enterOtpPhone') : t('enterOtpEmail')}</h3>
                                <input className="otp-input" type="text" value={otp} maxLength="4" onChange={e => setOtp(e.target.value.replace(/\D/g,''))} />
                                <div className="otp-timer">
                                    {otpTimer > 0 ? (
                                        <span className="otp-countdown">{t('otpCountdown')}: {formatTime(otpTimer)}</span>
                                    ) : (
                                        <button className="btn-next resend-btn" onClick={resendOtp}>{t('resendOtp')}</button>
                                    )}
                                </div>
                                {otpError && <p className="error-message">{otpError}</p>}
                            </>
                        )}
                        <div className="verify-actions">
                            <button className="btn-back" onClick={cancelVerification}>{t('cancel')}</button>
                            <button className="btn-next" onClick={confirmVerification}>{t('confirm')}</button>
                        </div>
                    </div>
                </div>
            )}
            {loading && <FullPageLoader message={t('extracting_data')} />}
        </div>
    );
};
export default PersonalInfoPage_EN;