// src/accountOpening/WorkInfoPage_EN.js

import React, { useState, useEffect } from 'react';
import { LOGO_WHITE } from '../assets/imagePaths';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import { t } from '../i18n';
import { useLanguage } from '../contexts/LanguageContext';
import { useFormData } from '../contexts/FormContext';
import { CalendarIcon } from '../common/Icons';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const WorkInfoPage_EN = ({ onNavigate, backPage, nextPage }) => {
    const { language } = useLanguage();
    const { formData, setFormData } = useFormData();
    const [sources, setSources] = useState([]);
    const [form, setForm] = useState({
        employmentStatus: '',
        jobTitle: '',
        employer: '',
        employerAddress: '',
        employerPhone: '',
        sourceOfIncome: '',
        monthlyIncome: '',
        workSector: '',
        fieldOfWork: '',
        workStartDate: '',
        ...(formData.workInfo || {})
    });

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/income-sources`).then(r=>r.json()).then(setSources).catch(()=>{});
    }, []);

    useEffect(() => {
        const reference = formData.personalInfo?.referenceNumber || formData.personalInfo?.reference_number;
        if (!reference) return;
        async function load() {
            try {
                const resp = await fetch(`${API_BASE_URL}/api/work-info?reference=${encodeURIComponent(reference)}`);
                if (resp.ok) {
                    const data = await resp.json();
                    if (data) {
                        // Format date for input field
                        if (data.work_start_date) {
                            data.workStartDate = new Date(data.work_start_date).toISOString().split('T')[0];
                        }
                        setForm(f => ({ ...f, ...data }));
                        setFormData(d => ({ ...d, workInfo: data }));
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
        setFormData(d => ({ ...d, workInfo: form }));
        try {
            await fetch(`${API_BASE_URL}/api/cache-form`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, workInfo: form })
            });
        } catch (e) { console.error(e); }
        // Data will be saved on confirmation page
        onNavigate(nextPage);
    };

    const isComplete = form.jobTitle && form.employer && form.workSector && form.fieldOfWork &&
        form.workStartDate && form.sourceOfIncome && form.monthlyIncome;

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
                        <h3>{t('workInfoTitle', language)}</h3>
                        <div className="form-group">
                            <label>{t('jobTitle', language)} <span className="required-star">*</span></label>
                            <input name="jobTitle" value={form.jobTitle} onChange={handleChange} type="text" required className="form-input" placeholder={t('jobTitle', language)} />
                        </div>
                        <div className="form-group">
                            <label>{t('employer', language)} <span className="required-star">*</span></label>
                            <input name="employer" value={form.employer} onChange={handleChange} type="text" required className="form-input" placeholder={t('employer', language)} />
                        </div>
                        <div className="form-group">
                            <label>{t('workSector', language)} <span className="required-star">*</span></label>
                            <select name="workSector" value={form.workSector} onChange={handleChange} className="form-input" required>
                                <option value="">{t('workSector', language)}</option>
                                <option value="private">{t('workSectorPrivate', language)}</option>
                                <option value="public">{t('workSectorPublic', language)}</option>
                                <option value="freelance">{t('workSectorFreelance', language)}</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{t('fieldOfWork', language)} <span className="required-star">*</span></label>
                            <input name="fieldOfWork" value={form.fieldOfWork} onChange={handleChange} type="text" required className="form-input" placeholder={t('fieldOfWork', language)} />
                        </div>
                        <div className="form-group date-input-container">
                            <label>{t('workStartDate', language)} <span className="required-star">*</span></label>
                            <input name="workStartDate" value={form.workStartDate} onChange={handleChange} type="text" required className="form-input" placeholder={t('workStartDate', language)} onFocus={(e) => e.target.type='date'} onBlur={(e) => e.target.type='text'}/><CalendarIcon/>
                        </div>
                        <div className="form-group">
                            <label>{t('employerAddress', language)}</label>
                            <input name="employerAddress" value={form.employerAddress} onChange={handleChange} type="text" className="form-input" placeholder={t('employerAddress', language)} />
                        </div>
                        <div className="form-group">
                            <div className="phone-input-group">
                               <span className="phone-prefix">+218</span>
                               <input name="employerPhone" value={form.employerPhone} onChange={handleChange} type="tel" className="form-input" placeholder={t('employerPhone', language)} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>{t('sourceOfIncome', language)} <span className="required-star">*</span></label>
                            <select name="sourceOfIncome" value={form.sourceOfIncome} onChange={handleChange} className="form-input" required>
                                <option value="">{t('sourceOfIncome', language)}</option>
                                {sources.map(s => (
                                    <option key={s.id} value={s.name_en}>
                                        {language === 'ar' ? s.name_ar : s.name_en}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{t('monthlyIncome', language)} <span className="required-star">*</span></label>
                            <select name="monthlyIncome" value={form.monthlyIncome} onChange={handleChange} className="form-input" required>
                                <option value="">{t('monthlyIncome', language)}</option>
                                <option value="<2000">{t('incomeLess2000', language)}</option>
                                <option value="2000-5000">{t('income2000to5000', language)}</option>
                                <option value=">5000">{t('incomeMore5000', language)}</option>
                            </select>
                        </div>
                        {formData.serviceType !== 'personal' && (
                        <div className="form-group">
                            <label>{t('residenceCertificate', language)}</label>
                            <input type="file" accept="image/*" className="form-input" required={formData.serviceType === 'expat'} />
                        </div>
                        )}
                    </div>
                    <div className="form-actions"><button type="submit" className="btn-next" disabled={!isComplete}>{t('next', language)}</button></div>
                </form>
            </main>
            <Footer />
        </div>
    );
}
export default WorkInfoPage_EN;