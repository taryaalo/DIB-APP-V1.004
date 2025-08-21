// src/accountOpening/ContactInfoPage_EN.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LOGO_WHITE } from '../assets/imagePaths';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import { useTranslation } from 'react-i18next';
import { useFormData } from '../contexts/FormContext';
import useFetchDropdownData from '../hooks/useFetchDropdownData';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const ContactInfoPage_EN = () => {
    const { t, i18n } = useTranslation();
    const { formData, updateFormData, updateHighestCompletedStep, resetForm } = useFormData();
    const navigate = useNavigate();
    const { contactInfo } = formData;

    const handleLogoClick = () => {
        if (window.confirm(t('confirm_exit'))) {
            resetForm();
            navigate('/');
        }
    };

    const { data: countries } = useFetchDropdownData('/api/countries');
    const { data: cities, loading: citiesLoading } = useFetchDropdownData(contactInfo.country ? `/api/cities?country=${contactInfo.country}` : null);

    useEffect(() => {
        // If the selected city is no longer in the list of available cities for the new country, reset it.
        if (contactInfo.country && !citiesLoading && cities.length > 0) {
            const cityExists = cities.some(c => c.cityCode === contactInfo.city);
            if (!cityExists) {
                updateFormData({ contactInfo: { city: '' } });
            }
        }
    }, [contactInfo.country, cities, citiesLoading, contactInfo.city, updateFormData]);

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
                        updateFormData({ contactInfo: mapped });
                    }
                }
            } catch (e) { console.error(e); }
        }
        if (!contactInfo.country) {
            load();
        }
    }, [formData.personalInfo, updateFormData, contactInfo.country]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        updateFormData({ contactInfo: { [name]: value } });
    };

    const handleSubmit = async () => {
        updateHighestCompletedStep(6);
        try {
            await fetch(`${API_BASE_URL}/api/cache-form`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        } catch (e) { console.error(e); }
        navigate('/confirm');
    };

    return (
        <div className="form-page">
            <header className="header docs-header">
                <div role="button" tabIndex="0" onClick={handleLogoClick} onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()} style={{ cursor: 'pointer' }}>
                    <img src={LOGO_WHITE} alt="Bank Logo" className="logo" />
                </div>
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
                <form className="form-container" onSubmit={e => {e.preventDefault(); handleSubmit();}} noValidate>
                    <div className="form-section">
                        <h3>{t('addressInfoTitle')}</h3>
                        <p className="guide-message">{t('requiredFieldsHint')}</p>
                        <div className="form-group">
                            <label>{t('country')} <span className="required-star">*</span></label>
                            <select className="form-input" required name="country" value={contactInfo.country} onChange={handleChange}>
                                <option value="">{t('country')}</option>
                                {countries.map(c => (
                                    <option key={c.countryCode} value={c.countryCode}>
                                        {i18n.language === 'ar' ? c.nameAr : c.nameEn}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{t('city')} <span className="required-star">*</span></label>
                            <select name="city" value={contactInfo.city} onChange={handleChange} required className="form-input" disabled={!contactInfo.country || citiesLoading}>
                                <option value="">{t('city')}</option>
                                {cities.length > 0 ? cities.map(c => (
                                    <option key={c.cityCode} value={c.cityCode}>{i18n.language === 'ar' ? c.nameAr : c.nameEn}</option>
                                )) : (!citiesLoading && <option value="other">{t('other')}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{t('area')} <span className="required-star">*</span></label>
                            <input name="area" value={contactInfo.area} onChange={handleChange} type="text" required className="form-input" placeholder={t('area')} />
                        </div>
                        <div className="form-group">
                            <label>{t('residentialAddress')} <span className="required-star">*</span></label>
                            <input name="residentialAddress" value={contactInfo.residentialAddress} onChange={handleChange} type="text" required className="form-input" placeholder={t('residentialAddress')} />
                        </div>
                    </div>
                    <div className="form-actions"><button type="submit" className="btn-next" disabled={!contactInfo.country || !contactInfo.city || !contactInfo.area || !contactInfo.residentialAddress}>{t('next')}</button></div>
                </form>
            </main>
            <Footer />
        </div>
    );
}
export default ContactInfoPage_EN;