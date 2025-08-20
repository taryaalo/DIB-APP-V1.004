// src/completeAccount/LookupPage_EN.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LOGO_COLOR } from '../assets/imagePaths';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import { MobileAppIcon, SmsIcon, CardIcon, VisaMasterIcon } from '../common/Icons';
import '../styles/LookupPageTheme.css';
import '../styles/LookupPage_EN.css';
import { logErrorToServer } from '../utils/logger';
import FullPageLoader from '../common/FullPageLoader';
import { t } from '../i18n';
import { useLanguage } from '../contexts/LanguageContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const ADMIN_NAME = process.env.REACT_APP_ADMIN_NAME || 'Admin';

const LookupPage_EN = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [page, setPage] = useState(0);
    const [statusFilter, setStatusFilter] = useState('Pending');
    const [imageModalUrl, setImageModalUrl] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [newFiles, setNewFiles] = useState({});
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [approving, setApproving] = useState(false);
    const [apiError, setApiError] = useState('');
    const { language } = useLanguage();
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const resp = await fetch(`${API_BASE_URL}/api/applications`);
                if (resp.ok) {
                    const data = await resp.json();
                    setApps(data);
                }
            } catch (e) { console.error(e); }
            setLoading(false);
        };
        load();
    }, []);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/countries`).then(r=>r.json()).then(setCountries).catch(()=>{});
    }, []);

    useEffect(() => {
        if (!editData.addressInfo?.country) { setCities([]); return; }
        fetch(`${API_BASE_URL}/api/cities?country=${editData.addressInfo.country}`)
            .then(r=>r.json())
            .then(data => setCities(data))
            .catch(()=> setCities([]));
    }, [editData.addressInfo?.country]);
    
    useEffect(() => {
        if (selected) {
            const p = { ...selected.personalInfo };
            const w = { ...selected.workInfo };
            const fmt = (d) => {
                if (!d) return '';
                const dt = new Date(d);
                return isNaN(dt) ? d : dt.toISOString().split('T')[0];
            };
            ['passport_issue_date','passport_expiry_date','dob','residence_expiry'].forEach(k=>{
                if (p[k]) p[k] = fmt(p[k]);
            });
            if (w && w.work_start_date) w.work_start_date = fmt(w.work_start_date);
            setEditData({
                personalInfo: p,
                addressInfo: { ...selected.addressInfo },
                workInfo: w
            });
        }
    }, [selected]);


    const handleEditChange = (section, field, value) => {
        setEditData(prev => {
            const updated = { ...prev[section], [field]: value };
            if (section === 'addressInfo' && field === 'country') {
                updated.city = '';
            }
            return { ...prev, [section]: updated };
        });
    };
    
    const handleFileChange = (docType, file) => {
        setNewFiles(prev => ({...prev, [docType]: file}));
    }

    const handleSave = async () => {
        try {
            const fmt = (d) => {
                if (!d) return '';
                const dt = new Date(d);
                return isNaN(dt) ? d : dt.toISOString().split('T')[0];
            };
            const p = { ...editData.personalInfo };
            ['passport_issue_date','passport_expiry_date','dob','residence_expiry'].forEach(k=>{ if(p[k]) p[k]=fmt(p[k]); });
            const w = { ...editData.workInfo };
            if (w.work_start_date) w.work_start_date = fmt(w.work_start_date);

            await fetch(`${API_BASE_URL}/api/update-personal-info`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference_number: selected.personalInfo.reference_number, ...p })
            });
            await fetch(`${API_BASE_URL}/api/update-address-info`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference_number: selected.personalInfo.reference_number, ...editData.addressInfo })
            });
            await fetch(`${API_BASE_URL}/api/update-work-info`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference_number: selected.personalInfo.reference_number, ...w })
            });

            for (const docType in newFiles) {
                const file = newFiles[docType];
                const existingDoc = selected.uploadedDocuments.find(d => d.doc_type === docType);
                const formData = new FormData();
                formData.append('file', file);
                
                if (existingDoc) {
                    await fetch(`${API_BASE_URL}/api/update-document/${existingDoc.id}`, { method: 'POST', body: formData });
                } else {
                    formData.append('docType', docType);
                    formData.append('reference', selected.personalInfo.reference_number);
                    await fetch(`${API_BASE_URL}/api/add-document`, { method: 'POST', body: formData });
                }
            }

            // Refresh data
            const resp = await fetch(`${API_BASE_URL}/api/applications`);
            if (resp.ok) {
                const data = await resp.json();
                setApps(data);
            }
            setIsEditing(false);
            setSelected(null);
            setNewFiles({});
        } catch (e) {
            console.error(e);
        }
    };


    const filtered = apps
        .filter(a => statusFilter === 'All' || a.status === statusFilter)
        .filter(a => {
            const term = search.toLowerCase();
            return (
                (a.personalInfo.full_name || '').toLowerCase().includes(term) ||
                (a.personalInfo.first_name || '').toLowerCase().includes(term) ||
                (a.personalInfo.last_name || '').toLowerCase().includes(term) ||
                (a.personalInfo.reference_number || '').toLowerCase().includes(term)
            );
        });

    const totalPages = Math.ceil(filtered.length / 10);
    const paged = filtered.slice(page * 10, page * 10 + 10);

    const infoSection = (title, data, sectionName) => {
        if (!data) return null;
        if (isEditing) {
            return (
                <div className="confirmation-document">
                    <div className="confirmation-header">{title}</div>
                    {Object.entries(data).map(([k,v]) => (
                        (v !== null && typeof v !== 'object' && !['id', 'created_at', 'reference_number', 'ai_model', 'confirmed_by_admin', 'approved_by_admin_name', 'approved_by_admin_ip', 'full_name'].includes(k)) && (
                            <div className="form-group" key={k}>
                                <label>{k.replace(/_/g,' ')}</label>
                                {sectionName === 'addressInfo' && k === 'country' ? (
                                    <select className="form-input" value={editData.addressInfo?.country || ''} onChange={e=>{handleEditChange('addressInfo','country',e.target.value);}}>
                                        <option value="">{t('country', language)}</option>
                                        {countries.map(c => <option key={c.code} value={c.code}>{c.name_en}</option>)}
                                    </select>
                                ) : sectionName === 'addressInfo' && k === 'city' ? (
                                    <select className="form-input" value={editData.addressInfo?.city || ''} onChange={e=>handleEditChange('addressInfo','city',e.target.value)}>
                                        <option value="">{t('city', language)}</option>
                                        {cities.length > 0 ? cities.map(c => <option key={c.city_code} value={c.city_code}>{c.name_en}</option>) : <option value="other">{t('other', language)}</option>}
                                    </select>
                                ) : (
                                    <input
                                        className="form-input"
                                        type={k.includes('date') ? 'date' : 'text'}
                                        value={editData[sectionName]?.[k] || ''}
                                        onChange={(e) => handleEditChange(sectionName, k, e.target.value)}
                                    />
                                )}
                            </div>
                        )
                    ))}
                </div>
            )
        }
        return (
            <div className="confirmation-document">
                <div className="confirmation-header">{title}</div>
                <ul className="confirmation-list">
                    {Object.entries(data).map(([k,v]) => (
                        (v !== null && typeof v !== 'object') && (
                            <li key={k}><strong>{k.replace(/_/g,' ')}:</strong> {v}</li>
                        )
                    ))}
                </ul>
            </div>
        );
    };

    const docsSection = (docs) => {
        if (!docs || docs.length === 0) return null;
        return (
            <div className="confirmation-document">
                <div className="confirmation-header">{t('uploadedDocuments', language)}</div>
                <div className="doc-grid">
                    {docs.map(doc => {
                        const file = doc.file_name.replace(/\\/g,'/').split('/').pop();
                        const path = `${API_BASE_URL}/user_document/${doc.reference_number}/${file}`;
                        return (
                        <div key={doc.file_name} className="doc-item">
                           <img src={path} alt={doc.doc_type} className="doc-img" onClick={() => setImageModalUrl(path)} />
                           {isEditing && (
                               <input type="file" onChange={(e) => handleFileChange(doc.doc_type, e.target.files[0])} />
                           )}
                            <p className="doc-label">{doc.doc_type}</p>
                        </div>
                    )})}
                </div>
            </div>
        );
    };

    const ApproveDialog = ({ onConfirm, onCancel }) => {
        const [services, setServices] = useState({ mobileApp: true, sms: true, localCard: true, internationalCard: true });
        const handleChange = (e) => {
            const { name, checked } = e.target;
            setServices(s => ({ ...s, [name]: checked }));
        };
        const icons = {
            mobileApp: <MobileAppIcon />,
            sms: <SmsIcon />,
            localCard: <CardIcon />,
            internationalCard: <VisaMasterIcon />
        };
        const serviceLabels = {
            mobileApp: t('registerMobileApp', language),
            sms: t('registerSmsService', language),
            localCard: t('registerLocalCard', language),
            internationalCard: t('registerInternationalCard', language)
        };
        return (
            <div className="modal-backdrop" onClick={e=>{if(e.target.classList.contains('modal-backdrop')) onCancel();}}>
                <div className="modal-content">
                    <h3 className="modal-title">{t('registerEServices', language)}</h3>
                    <ul className="confirmation-list">
                        {['mobileApp','sms','localCard','internationalCard'].map(key=> (
                            <li key={key}>
                                <label className="agreement-item">
                                    <div className="custom-checkbox">
                                        <input type="checkbox" name={key} checked={services[key]} onChange={handleChange} />
                                        <span className="checkmark"></span>
                                    </div>
                                    {icons[key]}
                                    <span>{serviceLabels[key]}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                    {apiError && <div className="error-message">{t(apiError, language)}</div>}
                    <div className="modal-actions">
                        <button onClick={onCancel} className="btn-next btn-cancel" disabled={approving}>{t('cancel', language)}</button>
                        <button onClick={()=>onConfirm(services)} className="btn-next btn-confirm" disabled={approving}>{t('confirm', language)}</button>
                    </div>
                </div>
            </div>
        );
    };

    const updateStatus = async (id, status) => {
        setApps(a => a.map(app => app.personalInfo.id === id ? { ...app, status } : app));
        setSelected(null);
        try {
            await fetch(`${API_BASE_URL}/api/application-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status, adminName: ADMIN_NAME })
            });
        } catch (e) { console.error(e); }
    };

    const handleApproveConfirm = async (services) => {
        if (!selected?.personalInfo?.reference_number) return;
        setApproving(true);
        setApiError('');
        try {
            const resp = await fetch(`${API_BASE_URL}/api/create-custid`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference: selected.personalInfo.reference_number, admin: ADMIN_NAME })
            });
            const data = await resp.json().catch(() => ({}));
            if (resp.ok && data && data.CUSTID) {
                updateStatus(selected.personalInfo.id, 'Approved');
                setShowApproveDialog(false);
                const photoDoc = selected.uploadedDocuments.find(d => d.doc_type === 'photo');
                navigate('/bank-account', { state: { personalInfo: selected.personalInfo, photo: photoDoc?.file_name, custId: data.CUSTID } });
            } else {
                const errMsg = data.error || 'server_error';
                setApiError(errMsg);
                logErrorToServer(`CREATE_CUSTID_ERROR ${resp.status} ${errMsg}`);
            }
        } catch (e) {
            setApiError(e.message);
            logErrorToServer(`CREATE_CUSTID_ERROR ${e.message}`);
        }
        setApproving(false);
    };

    return (
        <div className="form-page">
            <header className="header docs-header">
                <img src={LOGO_COLOR} alt="Bank Logo" className="logo" />
                <div className="header-switchers">
                    <ThemeSwitcher />
                    <LanguageSwitcher />
                </div>
            </header>
            <main className="form-main lookup-main">
                <div className="lookup-header">
                    <h2 className="lookup-title">{t('pendingApplications', language)}</h2>
                    <div className="header-actions">
                        <select className="form-input" value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(0);}}>
                            {['Pending','Approved','Rejected','All'].map(opt => (
                                <option key={opt} value={opt}>{t(opt.toLowerCase(), language)}</option>
                            ))}
                        </select>
                        <input className="form-input search-input" placeholder={t('search', language) + '...'} value={search} onChange={e=>setSearch(e.target.value)} />
                    </div>
                </div>
                <table className="lookup-table">
                    <thead>
                        <tr>
                            <th>{t('applicantName', language)}</th>
                            <th>{t('referenceLabel', language)}</th>
                            <th>{t('serviceType', language)}</th>
                            <th>{t('submissionDate', language)}</th>
                            <th>{t('status', language)}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan="6" className="info-row">{t('loading', language)}</td></tr>
                        )}
                        {paged.map(app => (
                            <tr key={app.personalInfo.id} className="hover-row">
                                <td>
                                    <div className="app-name">{app.personalInfo.first_name} {app.personalInfo.last_name}</div>
                                    <div className="app-fullname">{app.personalInfo.full_name}</div>
                                </td>
                                <td>{app.personalInfo.reference_number}</td>
                                <td>{app.personalInfo.service_type}</td>
                                <td>{new Date(app.personalInfo.created_at).toLocaleDateString()}</td>
                                <td><span className={`status-badge status-${(app.status || 'Pending').toLowerCase()}`}>{t((app.status || 'Pending').toLowerCase(), language)}</span></td>
                                <td><button onClick={() => setSelected(app)}>{t('review', language)}</button></td>
                            </tr>
                        ))}
                        {!loading && filtered.length === 0 && (
                            <tr><td colSpan="6" className="info-row">{t('noResults', language)}</td></tr>
                        )}
                    </tbody>
                </table>
                <div className="pagination">
                    {Array.from({length: totalPages}).map((_,i)=>(
                        <button key={i} onClick={()=>setPage(i)} className={`page-btn ${i===page?'active':''}`}>{i+1}</button>
                    ))}
                </div>
            </main>
            <Footer />
            {(loading || approving) && <FullPageLoader message={t(loading ? 'loading' : 'processing', language)} />}
            {selected && (
                <div className="modal-backdrop" onClick={e=>{if(e.target.classList.contains('modal-backdrop')) setSelected(null);}}>
                    <div className="modal-content">
                        <div className="detail-header">
                            <div>
                                <h2 className="detail-title">{selected.personalInfo.first_name} {selected.personalInfo.last_name}</h2>
                                <p className="detail-ref">{selected.personalInfo.reference_number}</p>
                            </div>
                            <button onClick={()=>{setSelected(null); setIsEditing(false);}} className="close-btn">&times;</button>
                        </div>
                        {infoSection(t('personalInfo', language), selected.personalInfo, 'personalInfo')}
                        {infoSection(t('addressInfoTitle', language), selected.addressInfo, 'addressInfo')}
                        {infoSection(t('workInfoTitle', language), selected.workInfo, 'workInfo')}
                        {docsSection(selected.uploadedDocuments)}
                        <div className="detail-actions">
                            {isEditing ? (
                                <button onClick={handleSave} className="btn-next btn-save">{t('save', language)}</button>
                            ) : (
                                <>
                                {selected.status !== 'Approved' && (
                                    <>
                                    <button onClick={()=>updateStatus(selected.personalInfo.id,'Rejected')} className="btn-next btn-reject">
                                        {t('reject', language)}
                                    </button>
                                    <button onClick={() => setIsEditing(true)} className="btn-next btn-edit">
                                        {t('edit', language)}
                                    </button>
                                    <button onClick={()=>setShowApproveDialog(true)} className="btn-next btn-approve">
                                        {t('approve', language)}
                                    </button>
                                    </>
                                )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {imageModalUrl && (
                <div className="modal-backdrop" onClick={() => setImageModalUrl(null)}>
                    <div className="modal-content image-modal-content">
                        <img src={imageModalUrl} alt="Enlarged document" className="image-modal-img" />
                    </div>
                </div>
            )}
            {showApproveDialog && <ApproveDialog onConfirm={handleApproveConfirm} onCancel={()=>setShowApproveDialog(false)} />}
        </div>
    );
};

export default LookupPage_EN;
