import React, { useState } from 'react';
import { LOGO_WHITE } from '../assets/imagePaths';
import { CalendarIcon } from '../common/Icons';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import { t } from '../i18n';
import { useLanguage } from '../contexts/LanguageContext';

const CompanyInfoPage_EN = ({ onNavigate, backPage, nextPage }) => {
    const { language } = useLanguage();
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
        onNavigate(nextPage);
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    <span>{t('back', language)}</span>
                </button>
            </header>
            <main className="form-main">
                <form className="form-container" onSubmit={handleSubmit} noValidate>
                    <div className="form-section">
                        <h3>Basic Company Information</h3>
                        <div className="company-form-grid">
                            <div className="form-group"><input name="companyName" value={form.companyName} onChange={handleChange} type="text" required className="form-input" placeholder="Full Company Name" /></div>
                            <div className="form-group"><input name="country" value={form.country} onChange={handleChange} type="text" required className="form-input" placeholder="Country" /></div>
                            <div className="form-group"><input name="tradeName" value={form.tradeName} onChange={handleChange} type="text" required className="form-input" placeholder="Trade Name" /></div>
                            <div className="form-group"><input name="city" value={form.city} onChange={handleChange} type="text" required className="form-input" placeholder="City" /></div>
                            <div className="form-group"><input name="registrationNo" value={form.registrationNo} onChange={handleChange} type="text" required className="form-input" placeholder="Commercial Registration No." /></div>
                            <div className="form-group"><input name="headOffice" value={form.headOffice} onChange={handleChange} type="text" required className="form-input" placeholder="Head Office Address" /></div>
                            <div className="form-group"><input name="licenseNo" value={form.licenseNo} onChange={handleChange} type="text" required className="form-input" placeholder="Activity License No." /></div>
                             <div className="form-group"><input name="postalCode" value={form.postalCode} onChange={handleChange} type="text" required className="form-input" placeholder="Postal Code" /></div>
                            <div className="form-group date-input-container"><input name="registrationDate" value={form.registrationDate} onChange={handleChange} type="text" required className="form-input" placeholder="Company Registration Date" onFocus={(e) => e.target.type='date'} onBlur={(e) => e.target.type='text'}/><CalendarIcon/></div>
                             <div className="form-group"></div>
                             <div className="form-group"><select name="companyType" value={form.companyType} onChange={handleChange} className="form-input" required><option value="">Company Type</option><option value="limited">Limited Liability</option><option value="joint">Joint Stock</option></select></div>
                             <div className="form-group"></div>
                             <div className="form-group"><select name="businessActivity" value={form.businessActivity} onChange={handleChange} className="form-input" required><option value="">Business Activity</option><option value="trade">Trade</option><option value="services">Services</option><option value="industry">Industry</option></select></div>
                        </div>
                    </div>
                    <div className="form-actions"><button type="submit" className="btn-next">{t('next', language)}</button></div>
                </form>
            </main>
            <Footer />
        </div>
    );
};
export default CompanyInfoPage_EN;