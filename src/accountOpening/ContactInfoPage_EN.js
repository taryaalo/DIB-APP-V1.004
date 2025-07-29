// src/accountOpening/ContactInfoPage_EN.js

import React, { useState, useEffect } from 'react';
import { LOGO_WHITE } from '../assets/imagePaths';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import { t } from '../i18n';
import { useLanguage } from '../contexts/LanguageContext';
import { useFormData } from '../contexts/FormContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const ContactInfoPage_EN = ({ onNavigate, backPage, nextPage }) => {
    const { language } = useLanguage();
    const { formData, setFormData } = useFormData();
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [form, setForm] = useState({
        country: '',
        city: '',
        area: '',
        residentialAddress: '',
        ...(formData.addressInfo || {})
    });

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/countries`).then(r=>r.json()).then(setCountries).catch(()=>{});
    }, []);

    useEffect(() => {
        if (!form.country) { setCities([]); return; }
        fetch(`${API_BASE_URL}/api/cities?country=${form.country}`)
            .then(r=>r.json())
            .then(data => setCities(data))
            .catch(()=> setCities([]));
    }, [form.country]);

    useEffect(() => {
        const reference = formData.personalInfo?.referenceNumber || formData.personalInfo?.reference_number;
        if (!reference) return;
        async function load() {
            try {
                const resp = await fetch(`${API_BASE_URL}/api/address-info?reference=${encodeURIComponent(reference)}`);
                if (resp.ok) {
                    const data = await resp.json();
                    if (data) {
                        const mapped = {
                            country: data.country || '',
                            city: data.city || '',
                            area: data.area || '',
                            residentialAddress: data.residential_address || ''
                        };
                        setForm(f => ({ ...f, ...mapped }));
                        setFormData(d => ({ ...d, addressInfo: mapped }));
                    }
                }
            } catch (e) { console.error(e); }
        }
        load();
    }, [formData.personalInfo, setFormData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = async () => {
        setFormData(d => ({ ...d, addressInfo: form }));
        try {
            await fetch(`${API_BASE_URL}/api/cache-form`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, addressInfo: form })
            });
        } catch (e) { console.error(e); }
        // Data will be saved on confirmation page
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
                <form className="form-container" onSubmit={e => {e.preventDefault(); handleSubmit();}} noValidate>
                    <div className="form-section">
                        <h3>{t('addressInfoTitle', language)}</h3>
                        <p className="guide-message">{t('requiredFieldsHint', language)}</p>
                        <div className="form-group">
                            <label>{t('country', language)} <span className="required-star">*</span></label>
                            <select className="form-input" required name="country" value={form.country} onChange={handleChange}>
                                <option value="">{t('country', language)}</option>
                                {countries.map(c => (
                                    <option key={c.code} value={c.code}>
                                        {language === 'ar' ? c.name_ar : c.name_en}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{t('city', language)} <span className="required-star">*</span></label>
                            <select name="city" value={form.city} onChange={handleChange} required className="form-input">
                                <option value="">{t('city', language)}</option>
                                {cities.length > 0 ? cities.map(c => (
                                    <option key={c.city_code} value={c.city_code}>{language === 'ar' ? c.name_ar : c.name_en}</option>
                                )) : <option value="other">{t('other', language)}</option>}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{t('area', language)} <span className="required-star">*</span></label>
                            <input name="area" value={form.area} onChange={handleChange} type="text" required className="form-input" placeholder={t('area', language)} />
                        </div>
                        <div className="form-group">
                            <label>{t('residentialAddress', language)} <span className="required-star">*</span></label>
                            <input name="residentialAddress" value={form.residentialAddress} onChange={handleChange} type="text" required className="form-input" placeholder={t('residentialAddress', language)} />
                        </div>
                    </div>
                    <div className="form-actions"><button type="submit" className="btn-next" disabled={!form.country || !form.city || !form.area || !form.residentialAddress}>{t('next', language)}</button></div>
                </form>
            </main>
            <Footer />
        </div>
    );
}
export default ContactInfoPage_EN;