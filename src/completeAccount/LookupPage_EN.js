// src/completeAccount/LookupPage_EN.js

import React, { useState, useEffect } from 'react';
import { LOGO_COLOR } from '../assets/imagePaths';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import '../styles/LookupPageTheme.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const ADMIN_NAME = process.env.REACT_APP_ADMIN_NAME || 'Admin';

const LookupPage_EN = ({ onNavigate }) => {
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
        if (selected) {
            setEditData({
                personalInfo: { ...selected.personalInfo },
                addressInfo: { ...selected.addressInfo },
                workInfo: { ...selected.workInfo }
            });
        }
    }, [selected]);


    const handleEditChange = (section, field, value) => {
        setEditData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };
    
    const handleFileChange = (docType, file) => {
        setNewFiles(prev => ({...prev, [docType]: file}));
    }

    const handleSave = async () => {
        try {
            await fetch(`${API_BASE_URL}/api/update-personal-info`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference_number: selected.personalInfo.reference_number, ...editData.personalInfo })
            });
            await fetch(`${API_BASE_URL}/api/update-address-info`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference_number: selected.personalInfo.reference_number, ...editData.addressInfo })
            });
            await fetch(`${API_BASE_URL}/api/update-work-info`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference_number: selected.personalInfo.reference_number, ...editData.workInfo })
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
                <div className="confirmation-document" style={{marginBottom:'20px'}}>
                    <div className="confirmation-header">{title}</div>
                    {Object.entries(data).map(([k,v]) => (
                        (v !== null && typeof v !== 'object' && !['id', 'created_at', 'reference_number', 'ai_model', 'confirmed_by_admin', 'approved_by_admin_name', 'approved_by_admin_ip'].includes(k)) && (
                            <div className="form-group" key={k}>
                                <label>{k.replace(/_/g,' ')}</label>
                                <input 
                                    className="form-input" 
                                    value={editData[sectionName]?.[k] || ''} 
                                    onChange={(e) => handleEditChange(sectionName, k, e.target.value)} 
                                />
                            </div>
                        )
                    ))}
                </div>
            )
        }
        return (
            <div className="confirmation-document" style={{marginBottom:'20px'}}>
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
            <div className="confirmation-document" style={{marginBottom:'20px'}}>
                <div className="confirmation-header">Uploaded Documents</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'15px'}}>
                    {docs.map(doc => {
                        const file = doc.file_name.replace(/\\/g,'/').split('/').pop();
                        const path = `${API_BASE_URL}/user_document/${doc.reference_number}/${file}`;
                        return (
                        <div key={doc.file_name} style={{textAlign:'center'}}>
                           <img src={path} alt={doc.doc_type} style={{width:'100%',height:'120px',objectFit:'cover',borderRadius:'8px',marginBottom:'5px', cursor: 'pointer'}} onClick={() => setImageModalUrl(path)} />
                           {isEditing && (
                               <input type="file" onChange={(e) => handleFileChange(doc.doc_type, e.target.files[0])} />
                           )}
                            <p style={{fontSize:'0.9rem',fontWeight:'600'}}>{doc.doc_type}</p>
                        </div>
                    )})}
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

    return (
        <div className="form-page">
            <header className="header docs-header">
                <img src={LOGO_COLOR} alt="Bank Logo" className="logo" />
                <div className="header-switchers">
                    <ThemeSwitcher />
                    <LanguageSwitcher />
                </div>
            </header>
            <main className="form-main" style={{width:'100%',maxWidth:'1000px',margin:'0 auto'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px',width:'100%'}}>
                    <h2 style={{fontSize:'1.5rem',fontWeight:'700'}}>Pending Applications</h2>
                    <div style={{display:'flex',gap:'10px'}}>
                        <select className="form-input" value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(0);}}>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="All">All</option>
                        </select>
                        <input className="form-input" style={{maxWidth:'250px'}} placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} />
                    </div>
                </div>
                <table className="lookup-table">
                    <thead>
                        <tr>
                            <th>Applicant Name</th>
                            <th>Reference No.</th>
                            <th>Service Type</th>
                            <th>Submission Date</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan="6" style={{textAlign:'center',padding:'20px'}}>Loading...</td></tr>
                        )}
                        {paged.map(app => (
                            <tr key={app.personalInfo.id} className="hover-row">
                                <td>
                                    <div style={{fontWeight:'600'}}>{app.personalInfo.first_name} {app.personalInfo.last_name}</div>
                                    <div style={{fontSize:'0.9rem',opacity:0.7}}>{app.personalInfo.full_name}</div>
                                </td>
                                <td>{app.personalInfo.reference_number}</td>
                                <td>{app.personalInfo.service_type}</td>
                                <td>{new Date(app.personalInfo.created_at).toLocaleDateString()}</td>
                                <td><span className={`status-badge status-${(app.status || '').toLowerCase()}`}>{app.status || 'Pending'}</span></td>
                                <td><button onClick={() => setSelected(app)}>Review</button></td>
                            </tr>
                        ))}
                        {!loading && filtered.length === 0 && (
                            <tr><td colSpan="6" style={{textAlign:'center',padding:'20px'}}>No applications found.</td></tr>
                        )}
                    </tbody>
                </table>
                <div style={{marginTop:'10px',display:'flex',justifyContent:'center',gap:'5px'}}>
                    {Array.from({length: totalPages}).map((_,i)=>(
                        <button key={i} onClick={()=>setPage(i)} style={{padding:'6px 12px',borderRadius:'4px',background:i===page?'var(--primary-color)':'var(--form-input-bg)',color:i===page?'var(--text-color-light)':'var(--text-color-dark)',border:'none',cursor:'pointer'}}>{i+1}</button>
                    ))}
                </div>
            </main>
            <Footer />
            {selected && (
                <div className="modal-backdrop" onClick={e=>{if(e.target.classList.contains('modal-backdrop')) setSelected(null);}}>
                    <div className="modal-content">
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                            <div>
                                <h2 style={{margin:'0'}}>{selected.personalInfo.first_name} {selected.personalInfo.last_name}</h2>
                                <p style={{margin:'0',opacity:0.7}}>{selected.personalInfo.reference_number}</p>
                            </div>
                            <button onClick={()=>{setSelected(null); setIsEditing(false);}} style={{background:'none',border:'none',fontSize:'1.5rem',cursor:'pointer',color:'var(--text-color-dark)'}}>&times;</button>
                        </div>
                        {infoSection('Personal Information', selected.personalInfo, 'personalInfo')}
                        {infoSection('Address Information', selected.addressInfo, 'addressInfo')}
                        {infoSection('Work & Income', selected.workInfo, 'workInfo')}
                        {docsSection(selected.uploadedDocuments)}
                        <div style={{display:'flex',justifyContent:'flex-end',gap:'10px',marginTop:'20px'}}>
                            {isEditing ? (
                                <button onClick={handleSave} className="btn-next" style={{backgroundColor:'var(--success-color)'}}>Save</button>
                            ) : (
                                <>
                                <button onClick={()=>updateStatus(selected.personalInfo.id,'Rejected')} className="btn-next" style={{backgroundColor:'var(--error-color)'}}>
                                    Reject
                                </button>
                                <button onClick={() => setIsEditing(true)} className="btn-next" style={{backgroundColor:'var(--accent-color)'}}>
                                    Edit
                                </button>
                                <button onClick={()=>updateStatus(selected.personalInfo.id,'Approved')} className="btn-next" style={{backgroundColor:'var(--success-color)'}}>
                                    Approve
                                </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {imageModalUrl && (
                <div className="modal-backdrop" onClick={() => setImageModalUrl(null)}>
                    <div className="modal-content" style={{maxWidth: '90vw', maxHeight: '90vh'}}>
                        <img src={imageModalUrl} alt="Enlarged document" style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default LookupPage_EN;
