import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LOGO_WHITE } from '../assets/imagePaths';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import { t } from '../i18n';
import { useFormData } from '../contexts/FormContext';
import { CalendarIcon } from '../common/Icons';
import i18n from 'i18next';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const WorkInfoPage_EN = () => {
    const { formData, setFormData } = useFormData();
    const navigate = useNavigate();
    const [sources, setSources] = useState([]);
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
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
        workCountry: '',
        workCity: '',
        ...(formData.workInfo || {})
    });

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/income-sources`).then(r=>r.json()).then(setSources).catch(()=>{});
        fetch(`${API_BASE_URL}/api/countries`).then(r=>r.json()).then(setCountries).catch(()=>{});
    }, []);

    useEffect(() => {
        if (!form.workCountry) { setCities([]); return; }
        fetch(`${API_BASE_URL}/api/cities?country=${form.workCountry}`)
            .then(r=>r.json())
            .then(data => setCities(data))
            .catch(()=> setCities([]));
    }, [form.workCountry]);

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
                        const mapped = {
                            employmentStatus: data.employment_status || '',
                            jobTitle: data.job_title || '',
                            employer: data.employer || '',
                            employerAddress: data.employer_address || '',
                            employerPhone: data.employer_phone || '',
                            sourceOfIncome: data.source_of_income || '',
                            monthlyIncome: data.monthly_income || '',
                            workSector: data.work_sector || '',
                            fieldOfWork: data.field_of_work || '',
                            workStartDate: data.work_start_date ? new Date(data.work_start_date).toISOString().split('T')[0] : '',
                            workCountry: data.work_country || '',
                            workCity: data.work_city || ''
                        };
                        setForm(f => ({ ...f, ...mapped }));
                        setFormData(d => ({ ...d, workInfo: mapped }));
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
        navigate('/personal-info');
    };

    const isComplete = form.jobTitle && form.employer && form.workSector && form.fieldOfWork &&
        form.workStartDate && form.sourceOfIncome && form.monthlyIncome && form.workCountry && form.workCity;

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
                 <form className="form-container" onSubmit={e => {e.preventDefault(); handleSubmit();}} noValidate>
                    <div className="form-section">
                        <h3>{t('workInfoTitle')}</h3>
                        <p className="guide-message">{t('requiredFieldsHint')}</p>
                        <div className="form-group">
                            <label>{t('jobTitle')} <span className="required-star">*</span></label>
                            <input name="jobTitle" value={form.jobTitle} onChange={handleChange} type="text" required className="form-input" placeholder={t('jobTitle')} />
                        </div>
                        <div className="form-group">
                            <label>{t('employer')} <span className="required-star">*</span></label>
                            <input name="employer" value={form.employer} onChange={handleChange} type="text" required className="form-input" placeholder={t('employer')} />
                        </div>
                        <div className="form-group">
                            <label>{t('workSector')} <span className="required-star">*</span></label>
                            <select name="workSector" value={form.workSector} onChange={handleChange} className="form-input" required>
                                <option value="">{t('workSector')}</option>
                                <option value="private">{t('workSectorPrivate')}</option>
                                <option value="public">{t('workSectorPublic')}</option>
                                <option value="freelance">{t('workSectorFreelance')}</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{t('fieldOfWork')} <span className="required-star">*</span></label>
                            <input name="fieldOfWork" value={form.fieldOfWork} onChange={handleChange} type="text" required className="form-input" placeholder={t('fieldOfWork')} />
                        </div>
                        <div className="form-group date-input-container">
                            <label>{t('workStartDate')} <span className="required-star">*</span></label>
                            <input name="workStartDate" value={form.workStartDate} onChange={handleChange} type="text" required className="form-input" placeholder={t('workStartDate')} onFocus={(e) => e.target.type='date'} onBlur={(e) => e.target.type='text'}/><CalendarIcon/>
                        </div>
                        <div className="form-group">
                            <label>{t('employerAddress')}</label>
                            <input name="employerAddress" value={form.employerAddress} onChange={handleChange} type="text" className="form-input" placeholder={t('employerAddress')} />
                        </div>
                        <div className="form-group">
                            <label>{t('country')} <span className="required-star">*</span></label>
                            <select name="workCountry" value={form.workCountry} onChange={handleChange} required className="form-input">
                                <option value="">{t('country')}</option>
                                {countries.map(c => (
                                    <option key={c.countryCode} value={c.countryCode}>{i18n.language === 'ar' ? c.nameAr : c.nameEn}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{t('city')} <span className="required-star">*</span></label>
                            <select name="workCity" value={form.workCity} onChange={handleChange} required className="form-input">
                                <option value="">{t('city')}</option>
                                {cities.length > 0 ? cities.map(c => (
                                    <option key={c.cityCode} value={c.cityCode}>{i18n.language === 'ar' ? c.nameAr : c.nameEn}</option>
                                )) : <option value="other">{t('other')}</option>}
                            </select>
                        </div>
                        <div className="form-group">
                            <div className="phone-input-group">
                               <span className="phone-prefix">+218</span>
                               <input name="employerPhone" value={form.employerPhone} onChange={handleChange} type="tel" className="form-input" placeholder={t('employerPhone')} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>{t('sourceOfIncome')} <span className="required-star">*</span></label>
                            <select name="sourceOfIncome" value={form.sourceOfIncome} onChange={handleChange} className="form-input" required>
                                <option value="">{t('sourceOfIncome')}</option>
                                {sources.map(s => (
                                    <option key={s.id} value={s.nameEn}>
                                        {i18n.language === 'ar' ? s.nameAr : s.nameEn}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{t('monthlyIncome')} <span className="required-star">*</span></label>
                            <select name="monthlyIncome" value={form.monthlyIncome} onChange={handleChange} className="form-input" required>
                                <option value="">{t('monthlyIncome')}</option>
                                <option value="<2000">{t('incomeLess2000')}</option>
                                <option value="2000-5000">{t('income2000to5000')}</option>
                                <option value=">5000">{t('incomeMore5000')}</option>
                            </select>
                        </div>
                        {formData.serviceType !== 'personal' && (
                        <div className="form-group">
                            <label>{t('residenceCertificate')}</label>
                            <input type="file" accept="image/*" className="form-input" required={formData.serviceType === 'expat'} />
                        </div>
                        )}
                    </div>
                    <div className="form-actions"><button type="submit" className="btn-next" disabled={!isComplete}>{t('next')}</button></div>
                </form>
            </main>
            <Footer />
        </div>
    );
}
export default WorkInfoPage_EN;