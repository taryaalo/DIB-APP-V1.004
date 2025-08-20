import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LOGO_WHITE } from '../assets/imagePaths';
import { CalendarIcon } from '../common/Icons';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import { useTranslation } from 'react-i18next';

const CompanyInfoPage_EN = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        companyName: '',
        country: '',
        tradeName: '',
        city: '',
        registrationNo: '',
        headOffice: '',
        licenseNo: '',
        postalCode: '',
        registrationDate: '',
        companyType: '',
        businessActivity: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/company-contact');
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
                <form className="form-container" onSubmit={handleSubmit} noValidate>
                    <div className="form-section">
                        <h3>{t('basicCompanyInfo')}</h3>
                        <div className="company-form-grid">
                            <div className="form-group"><input name="companyName" value={form.companyName} onChange={handleChange} type="text" required className="form-input" placeholder={t('fullCompanyName')} /></div>
                            <div className="form-group"><input name="country" value={form.country} onChange={handleChange} type="text" required className="form-input" placeholder={t('country')} /></div>
                            <div className="form-group"><input name="tradeName" value={form.tradeName} onChange={handleChange} type="text" required className="form-input" placeholder={t('tradeName')} /></div>
                            <div className="form-group"><input name="city" value={form.city} onChange={handleChange} type="text" required className="form-input" placeholder={t('city')} /></div>
                            <div className="form-group"><input name="registrationNo" value={form.registrationNo} onChange={handleChange} type="text" required className="form-input" placeholder={t('commercialRegistrationNo')} /></div>
                            <div className="form-group"><input name="headOffice" value={form.headOffice} onChange={handleChange} type="text" required className="form-input" placeholder={t('headOfficeAddress')} /></div>
                            <div className="form-group"><input name="licenseNo" value={form.licenseNo} onChange={handleChange} type="text" required className="form-input" placeholder={t('activityLicenseNo')} /></div>
                             <div className="form-group"><input name="postalCode" value={form.postalCode} onChange={handleChange} type="text" required className="form-input" placeholder={t('postalCode')} /></div>
                            <div className="form-group date-input-container"><input name="registrationDate" value={form.registrationDate} onChange={handleChange} type="text" required className="form-input" placeholder={t('companyRegistrationDate')} onFocus={(e) => e.target.type='date'} onBlur={(e) => e.target.type='text'}/><CalendarIcon/></div>
                             <div className="form-group"></div>
                             <div className="form-group"><select name="companyType" value={form.companyType} onChange={handleChange} className="form-input" required><option value="">{t('companyType')}</option><option value="limited">{t('limitedLiability')}</option><option value="joint">{t('jointStock')}</option></select></div>
                             <div className="form-group"></div>
                             <div className="form-group"><select name="businessActivity" value={form.businessActivity} onChange={handleChange} className="form-input" required><option value="">{t('businessActivity')}</option><option value="trade">{t('trade')}</option><option value="services">{t('services')}</option><option value="industry">{t('industry')}</option></select></div>
                        </div>
                    </div>
                    <div className="form-actions"><button type="submit" className="btn-next">{t('next')}</button></div>
                </form>
            </main>
            <Footer />
        </div>
    );
};
export default CompanyInfoPage_EN;