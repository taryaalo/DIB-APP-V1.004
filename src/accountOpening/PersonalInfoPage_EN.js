import React, { useState, useEffect } from 'react';
import { LOGO_WHITE } from '../assets/imagePaths';
import { CalendarIcon, LockIcon } from '../common/Icons';
import { logToServer } from '../utils/logger';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import TermsDialog from '../common/TermsDialog';
import { t } from '../i18n';
import { useLanguage } from '../contexts/LanguageContext';
import { useFormData } from '../contexts/FormContext';
import { getCachedExtracted } from '../utils/dataCacher';
import { normalizeNationality } from '../utils/normalizeNationality';
import { mapExtractedFields } from '../utils/fieldMapper';

const PersonalInfoPage_EN = ({ onNavigate, backPage, flow, state }) => {
    const { language } = useLanguage();
    const { formData, setFormData } = useFormData();
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
                    updated.nidDigits = nidResp.nationalId ? nidResp.nationalId.replace(/\D/g, '').slice(0, 12).split('') : Array(12).fill('');
                    if (!updated.gender) {
                      updated.gender = nidResp.sex === 'M' ? 'male' : nidResp.sex === 'F' ? 'female' : (nidResp.sex || '');
                    }
                    if (!updated.dob) {
                        updated.dob = nidResp.birthYear && nidResp.birthMonth && nidResp.birthDay
                            ? `${nidResp.birthYear}-${nidResp.birthMonth.toString().padStart(2,'0')}-${nidResp.birthDay.toString().padStart(2,'0')}`
                            : '';
                    }
                    updated.familyRecordNumber = nidResp.familyId || '';
                    updated.motherFullName = nidResp.motherFullName || '';
                    updated.maritalStatus = nidResp.maritalStatus || '';
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
                setError(t('error_extracting_data', language));
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
                    body: JSON.stringify({ phone: `+218${form.phone}`, language })
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
                            body: JSON.stringify({ email: form.email, language })
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
            setOtpError(t('incorrectOtp', language));
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
            setOtpError(t('incorrectEmailOtp', language));
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
        onNavigate('confirm', { form, manualFields });
    };

    const resendOtp = async () => {
        try {
            if (verifyStep === 2) {
                await fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/api/send-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: `+218${form.phone}`, language })
                });
            } else if (verifyStep === 3) {
                await fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/api/send-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: form.email, language })
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
                 <button onClick={() => onNavigate(backPage)} className="btn-back">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    <span>{t('back', language)}</span>
                </button>
            </header>
            <main className="form-main">
                <h2 className="form-title">{t('personalInfo', language)}</h2>
                {loading && (
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:'20px'}}>
                        <div className="loading-spinner"></div>
                        <p style={{marginTop:'20px'}}>{t('extracting_data', language)}</p>
                    </div>
                )}
                {error && <p className="error-message">{error}</p>}
                <form className="form-container" style={{maxWidth: '900px'}} onSubmit={handleSubmit} noValidate>
                    <p className="guide-message">{t('editHint', language)}</p>
                    
                    <div className="form-grid-columns">
                        <div className="form-column" style={{direction: 'rtl', textAlign: 'right'}}>
                           <div className="form-group"><label>{t('firstNameAr', language)} *</label><div style={{position: 'relative'}}><input name="firstNameAr" value={form.firstNameAr} onChange={handleChange} required type="text" {...lockProps('firstNameAr')} /><LockIcon className="lock-icon"/></div></div>
                           <div className="form-group"><label>{t('middleNameAr', language)} *</label><div style={{position: 'relative'}}><input name="middleNameAr" value={form.middleNameAr} onChange={handleChange} required type="text" {...lockProps('middleNameAr')} /><LockIcon className="lock-icon"/></div></div>
                           <div className="form-group"><label>{t('lastNameAr', language)} *</label><div style={{position: 'relative'}}><input name="lastNameAr" value={form.lastNameAr} onChange={handleChange} required type="text" {...lockProps('lastNameAr')} /><LockIcon className="lock-icon"/></div></div>
                           <div className="form-group"><label>{t('surnameAr', language)} *</label><div style={{position: 'relative'}}><input name="surnameAr" value={form.surnameAr} onChange={handleChange} required type="text" {...lockProps('surnameAr')} /><LockIcon className="lock-icon"/></div></div>
                        </div>

                        <div className="form-column">
                           <div className="form-group"><label>{t('firstNameEn', language)} *</label><div style={{position: 'relative'}}><input name="firstNameEn" value={form.firstNameEn} onChange={handleChange} required type="text" {...lockProps('firstNameEn')} /><LockIcon className="lock-icon"/></div></div>
                           <div className="form-group"><label>{t('middleNameEn', language)} *</label><div style={{position: 'relative'}}><input name="middleNameEn" value={form.middleNameEn} onChange={handleChange} required type="text" {...lockProps('middleNameEn')} /><LockIcon className="lock-icon"/></div></div>
                           <div className="form-group"><label>{t('lastNameEn', language)} *</label><div style={{position: 'relative'}}><input name="lastNameEn" value={form.lastNameEn} onChange={handleChange} required type="text" {...lockProps('lastNameEn')} /><LockIcon className="lock-icon"/></div></div>
                           <div className="form-group"><label>{t('surnameEn', language)} *</label><div style={{position: 'relative'}}><input name="surnameEn" value={form.surnameEn} onChange={handleChange} required type="text" {...lockProps('surnameEn')} /><LockIcon className="lock-icon"/></div></div>
                        </div>
                    </div>
                    
                    <hr style={{margin: '20px 0'}} />

                    <div className="form-group"><label>{t('motherFullName', language)} *</label><div style={{position: 'relative'}}><input name="motherFullName" value={form.motherFullName} onChange={handleChange} required type="text" {...lockProps('motherFullName')} /><LockIcon className="lock-icon"/></div></div>

                    <div className="company-form-grid">
                        <div className="form-group date-input-container"><label>{t('dateOfBirth', language)}</label><div style={{position: 'relative', width: '100%'}}><input name="dob" value={form.dob} onChange={handleChange} type="text" {...lockProps('dob')} onFocus={e=>e.target.type='date'} onBlur={e=>e.target.type='text'} /><CalendarIcon/></div></div>
                        <div className="form-group"><label>{t('birthPlace', language)}</label><div style={{position: 'relative'}}><input name="birthPlace" value={form.birthPlace} onChange={handleChange} type="text" {...lockProps('birthPlace')} /><LockIcon className="lock-icon" /></div></div>
                        <div className="form-group">
                            <label>{t('gender', language)} *</label>
                            <div style={{position: 'relative'}}>
                                <select name="gender" value={form.gender} onChange={handleChange} required {...lockProps('gender')}>
                                    <option value="">{t('gender', language)}</option>
                                    <option value="male">{t('male', language)}</option>
                                    <option value="female">{t('female', language)}</option>
                                </select>
                                <LockIcon className="lock-icon" />
                            </div>
                        </div>
                        <div className="form-group">
                           <label>{t('maritalStatus', language)} *</label>
                           <div style={{position: 'relative'}}>
                               <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange} required {...lockProps('maritalStatus')}>
                                   <option value="">{t('maritalStatus', language)}</option>
                                   <option value="single">{t('single', language)}</option>
                                   <option value="married">{t('married', language)}</option>
                                   <option value="divorced">{t('divorced', language)}</option>
                                   <option value="widowed">{t('widowed', language)}</option>
                               </select>
                               <LockIcon className="lock-icon"/>
                           </div>
                       </div>
                        <div className="form-group">
                            <label>{t('nationality', language)} *</label>
                            <div style={{position: 'relative'}}>
                                <select name="nationality" value={form.nationality} onChange={handleChange} disabled={locked.nationality} {...lockProps('nationality')}>
                                    <option value="">{t('nationality', language)}</option>
                                    <option value="libyan">{t('libyan', language)}</option>
                                    <option value="other">{t('other', language)}</option>
                                </select>
                                <LockIcon className="lock-icon" />
                            </div>
                        </div>
                        <div className="form-group"><label>{t('passportNumber', language)}</label><div style={{position: 'relative'}}><input name="passportNumber" value={form.passportNumber} onChange={handleChange} type="text" {...lockProps('passportNumber')} /><LockIcon className="lock-icon"/></div></div>
                        <div className="form-group date-input-container"><label>{t('passportIssueDate', language)}</label><div style={{position: 'relative', width: '100%'}}><input name="passportIssueDate" value={form.passportIssueDate} onChange={handleChange} type="text" {...lockProps('passportIssueDate')} onFocus={e=>e.target.type='date'} onBlur={e=>e.target.type='text'} /><CalendarIcon/></div></div>
                        <div className="form-group date-input-container"><label>{t('passportExpiryDate', language)}</label><div style={{position: 'relative', width: '100%'}}><input name="passportExpiryDate" value={form.passportExpiryDate} onChange={handleChange} type="text" {...lockProps('passportExpiryDate')} onFocus={e=>e.target.type='date'} onBlur={e=>e.target.type='text'} /><CalendarIcon/></div></div>
                    </div>
                    
                    <div className="form-group">
                        <label>{t('familyRecordNumber', language)}</label>
                        <div style={{position: 'relative'}}>
                            <input name="familyRecordNumber" value={form.familyRecordNumber} onChange={handleChange} required type="text" {...lockProps('familyRecordNumber')} />
                            <LockIcon className="lock-icon" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>{t('nid', language)}</label>
                        <div className="national-id-group" onDoubleClick={(e) => unlockField('nidDigits', e)}>
                            {form.nidDigits.map((d, idx) => (<input key={idx} name={`nidDigit${idx}`} value={d} onChange={(e)=>handleChange(e, idx)} onKeyDown={(e)=>handleNIDKeyDown(e, idx)} onPaste={(e)=>handleNIDPaste(e, idx)} required type="text" maxLength="1" className={`national-id-input${locked.nidDigits ? ' locked' : ''}`} readOnly={!!locked.nidDigits}/>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="phone-input-group">
                            <span className="phone-prefix">+218</span>
                            <input name="phone" value={form.phone} onChange={handleChange} required type="tel" {...lockProps('phone')} placeholder={t('phoneNumber', language)} className="form-input" />
                        </div>
                        <LockIcon className="lock-icon" />
                    </div>
                    <div className="form-group"><label><input type="checkbox" name="enableEmail" checked={form.enableEmail} onChange={handleChange} /> {t('enableEmail', language)}</label></div>
                    {form.enableEmail && (
                        <div className="form-group">
                            <input name="email" value={form.email} onChange={handleChange} required type="email" {...lockProps('email')} placeholder={t('email', language)} />
                            <LockIcon className="lock-icon" />
                        </div>
                    )}

                    <div className="form-actions">
                        <div className="agreements">
                            <label className="agreement-item"><div className="custom-checkbox"><input name="agree1" type="checkbox" checked={agreements.agree1} onChange={handleChange} required/><span className="checkmark"></span></div><span>{t('certifyCorrect', language)}</span></label>
                            <label className="agreement-item"><div className="custom-checkbox"><input name="agree2" type="checkbox" checked={agreements.agree2} onChange={handleChange} required/><span className="checkmark"></span></div><span>{t('agreePrefix', language)} <button type="button" className="terms-link" onClick={()=>setShowTerms(true)}>{t('termsAndConditions', language)}</button></span></label>
                        </div>
                        {agreeError && <p className="error-message">{t('agreeError', language)}</p>}
                        <button className="btn-next" type="submit" disabled={!agreements.agree1 || !agreements.agree2}>{t('submitRequest', language)}</button>
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
                                <h3>{t('verifyContact', language)}</h3>
                                <p>{t('phoneNumber', language)}: +218{form.phone}</p>
                                {form.enableEmail && <p>{t('email', language)}: {form.email}</p>}
                            </>
                        ) : (
                            <>
                                <h3>{verifyStep === 2 ? t('enterOtpPhone', language) : t('enterOtpEmail', language)}</h3>
                                <input className="otp-input" type="text" value={otp} maxLength="4" onChange={e => setOtp(e.target.value.replace(/\D/g,''))} />
                                <div className="otp-timer">
                                    {otpTimer > 0 ? (
                                        <span className="otp-countdown">{t('otpCountdown', language)}: {formatTime(otpTimer)}</span>
                                    ) : (
                                        <button className="btn-next resend-btn" onClick={resendOtp}>{t('resendOtp', language)}</button>
                                    )}
                                </div>
                                {otpError && <p className="error-message">{otpError}</p>}
                            </>
                        )}
                        <div className="verify-actions">
                            <button className="btn-back" onClick={cancelVerification}>{t('cancel', language)}</button>
                            <button className="btn-next" onClick={confirmVerification}>{t('confirm', language)}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default PersonalInfoPage_EN;