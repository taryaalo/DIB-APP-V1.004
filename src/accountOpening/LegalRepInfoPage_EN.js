import React, { useState } from 'react';
import { LOGO_WHITE } from '../assets/imagePaths';
import { CalendarIcon } from '../common/Icons';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import { t } from '../i18n';
import { useLanguage } from '../contexts/LanguageContext';

const LegalRepInfoPage_EN = ({ onNavigate, backPage, nextPage }) => {
    const { language } = useLanguage();
    const [nid, setNid] = useState(Array(12).fill(''));
    const [form, setForm] = useState({
        fullName: '',
        passportNumber: '',
        capacity: '',
        phone: '',
        email: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleNIDChange = (e, index) => {
        const newNid = [...nid];
        newNid[index] = e.target.value;
        setNid(newNid);
    };

    const handleNIDKeyDown = (e) => {
        if (e.key === 'Backspace' && !e.target.value && e.target.previousSibling) {
            e.target.previousSibling.focus();
        }
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
                        <h3>Legal Representative Information</h3>
                        <p style={{marginTop: "-15px", marginBottom: "20px"}}>This data is for the person responsible for opening the account in the company's name.</p>
                        <div className="form-group">
                            <input name="fullName" value={form.fullName} onChange={handleChange} type="text" required className="form-input" placeholder="Full Name" />
                        </div>
                        <div className="form-group">
                            <label>National ID</label>
                            <div className="national-id-group">
                                {nid.map((digit, index) => (
                                    <input key={index} value={digit} onChange={e => handleNIDChange(e, index)} type="text" maxLength="1" onKeyDown={handleNIDKeyDown} className="national-id-input" required />
                                ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <input name="passportNumber" value={form.passportNumber} onChange={handleChange} type="text" required className="form-input" placeholder="Passport Number" />
                        </div>
                        <div className="form-group">
                            <select name="capacity" value={form.capacity} onChange={handleChange} className="form-input" required>
                                <option value="">Legal Representative's Capacity</option>
                                <option value="owner">Owner</option>
                                <option value="ceo">CEO</option>
                                <option value="manager">Manager</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <div className="phone-input-group">
                               <span className="phone-prefix">+218</span>
                               <input name="phone" value={form.phone} onChange={handleChange} type="tel" required className="form-input" placeholder="Mobile Phone Number" />
                            </div>
                        </div>
                        <div className="form-group">
                            <input name="email" value={form.email} onChange={handleChange} type="email" required className="form-input" placeholder="Personal Email" />
                        </div>
                    </div>
                    <div className="form-actions">
                    <button type="submit" className="btn-next">{t('next', language)}</button>
                </div>
                </form>
            </main>
            <Footer />
        </div>
    );
};
export default LegalRepInfoPage_EN;