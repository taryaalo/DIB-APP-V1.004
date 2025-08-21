import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Footer from '../common/Footer';
import { LOGO_WHITE } from '../assets/imagePaths';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const NidVerificationPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [nid, setNid] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [nidData, setNidData] = useState(null);
    const [showOtpForm, setShowOtpForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const phoneInputRef = useRef(null);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');
        setNidData(null);

        try {
            // This is a placeholder for the actual API call.
            // In a real application, you would use:
            // const response = await fetch('/api/nid/verify', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ nid, phone }),
            // });
            // const data = await response.json();

            // Mocking API responses for development
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
            let data;
            if (nid === '123456789012' && phone === '912345678') {
                data = {
                    success: true,
                    data: {
                        nidData: {
                            firstName: 'أحمد',
                            fatherName: 'محمد',
                            grandFatherName: 'علي',
                            familyName: 'الليبي'
                        },
                        phoneMatch: { isMatching: true }
                    }
                };
            } else if (nid === '123456789012' && phone !== '912345678') {
                data = {
                    success: true,
                    data: {
                        nidData: {
                            firstName: 'أحمد',
                            fatherName: 'محمد',
                            grandFatherName: 'علي',
                            familyName: 'الليبي'
                        },
                        phoneMatch: { isMatching: false }
                    }
                };
            } else {
                data = { success: false, error: 'Nid Not Found!' };
            }


            if (!data.success) {
                throw new Error(data.error || 'An unknown error occurred.');
            }

            const { nidData: apiNidData, phoneMatch } = data.data;

            if (phoneMatch.isMatching) {
                // Scenario A: Full Success
                setNidData(apiNidData);
                setSuccessMessage('Your data has been successfully verified. Please enter the OTP sent to your phone to proceed.');
                setShowOtpForm(true);
            } else {
                // Scenario B: Phone Mismatch
                setNidData(apiNidData);
                setError('Your phone number does not match the NID database. Please insert the correct phone number. (رقمك غير مربوط مع قاعدة البيانات الوطنية الرجاء استعمال رقم مربوط)');
                if (phoneInputRef.current) {
                    phoneInputRef.current.focus();
                }
            }
        } catch (err) {
            // Scenario C: NID Not Found or Other API Error
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleProceed = (e) => {
        e.preventDefault();
        // Here you would typically verify the OTP with another backend call.
        // For now, we'll just navigate to the next page.
        navigate('/contact-info');
    };

    const handleLogoClick = () => {
        navigate('/');
    };

    return (
        <div className="form-page" style={{ backgroundColor: 'var(--color-background)' }}>
            <header className="header docs-header">
                <div role="button" tabIndex="0" onClick={handleLogoClick} onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()} style={{ cursor: 'pointer' }}>
                    <img src={LOGO_WHITE} alt="Bank Logo" className="logo" />
                </div>
                <div className="header-switchers">
                    <ThemeSwitcher />
                    <LanguageSwitcher />
                </div>
            </header>
            <main className="form-main" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <div style={{width: '100%', maxWidth: '500px', padding: '2rem', backgroundColor: 'var(--color-surface)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
                    <h2 className="form-title" style={{textAlign: 'center', color: 'var(--color-primary)'}}>{t('personalInfoVerification')}</h2>

                    {error && (
                        <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaTimesCircle />
                            <span>{error}</span>
                        </div>
                    )}

                    {successMessage && !showOtpForm && (
                         <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaCheckCircle />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {!showOtpForm ? (
                        <form onSubmit={handleVerify}>
                            <div className="form-group">
                                <label htmlFor="nid">{t('nationalId')}</label>
                                <input
                                    id="nid"
                                    type="text"
                                    className="form-input"
                                    value={nid}
                                    onChange={(e) => setNid(e.target.value)}
                                    required
                                    placeholder={t('enterNid')}
                                    style={{borderColor: 'var(--color-border)'}}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone">{t('phoneNumber')}</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    className="form-input"
                                    ref={phoneInputRef}
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    placeholder={t('enterPhone')}
                                    style={{borderColor: 'var(--color-border)'}}
                                />
                            </div>
                             <button type="submit" className="btn-next" disabled={loading} style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'}}>
                                {loading ? <FaSpinner className="spin" /> : t('verify')}
                            </button>
                        </form>
                    ) : (
                        <div>
                            <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FaCheckCircle />
                                <span>{successMessage}</span>
                            </div>
                            <form onSubmit={handleProceed}>
                                <div className="form-group">
                                    <label htmlFor="otp">{t('otp')}</label>
                                    <input
                                        id="otp"
                                        type="text"
                                        className="form-input"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        placeholder={t('enterOtp')}
                                        style={{borderColor: 'var(--color-border)'}}
                                    />
                                </div>
                                <button type="submit" className="btn-next" style={{width: '100%'}}>{t('proceed')}</button>
                            </form>
                        </div>
                    )}

                    {(nidData) && (
                        <div style={{marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem'}}>
                             <h3 style={{color: 'var(--color-text-secondary)'}}>{t('officialArabicNames')}</h3>
                             <div style={{ padding: '1rem', backgroundColor: 'var(--color-background)', borderRadius: '4px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                                <p><strong>{t('firstName')}:</strong> {nidData.firstName}</p>
                                <p><strong>{t('fatherName')}:</strong> {nidData.fatherName}</p>
                                <p><strong>{t('grandFatherName')}:</strong> {nidData.grandFatherName}</p>
                                <p><strong>{t('familyName')}:</strong> {nidData.familyName}</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default NidVerificationPage;
