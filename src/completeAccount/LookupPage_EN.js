import React, { useState, useEffect } from 'react';
import '../styles/LookupPage_EN.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const LookupPage_EN = ({ onNavigate }) => {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch(`${API_BASE_URL}/api/applications`);
        if (resp.ok) {
          const data = await resp.json();
          setApplications(data);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = applications
    .filter(app => statusFilter === 'All' || (app.status || 'Pending') === statusFilter)
    .filter(app => {
      const term = search.toLowerCase();
      const name = `${app.personalInfo.first_name || ''} ${app.personalInfo.last_name || ''}`.toLowerCase();
      const reference = (app.personalInfo.reference_number || '').toLowerCase();
      return name.includes(term) || reference.includes(term);
    });

  const pageSize = 10;
  const totalPages = Math.ceil(filtered.length / pageSize);
  const current = filtered.slice(page * pageSize, page * pageSize + pageSize);

  const formatDate = d => {
    if (!d) return '';
    const dt = new Date(d);
    return isNaN(dt) ? d : dt.toLocaleDateString();
  };

  const statusClass = s => {
    const key = (s || 'Pending').toLowerCase();
    return `status-badge status-${key}`;
  };

  return (
    <div className="lookup-container">
      <div className="lookup-wrapper">
        <header className="lookup-header">
          <h1>Pending Applications</h1>
        </header>

        <div className="filter-search">
          <div className="select-wrapper">
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
              className="status-select"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="search-input"
            />
            <span className="search-icon" role="img" aria-label="search">
              &#128269;
            </span>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="applications-table">
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
                <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading...</td></tr>
              )}
              {!loading && current.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center' }}>No applications found.</td></tr>
              )}
              {!loading && current.map(app => (
                <tr key={app.personalInfo.id} data-status={app.status || 'Pending'}>
                  <td>{app.personalInfo.full_name || `${app.personalInfo.first_name} ${app.personalInfo.last_name}`}</td>
                  <td className="font-mono">{app.personalInfo.reference_number}</td>
                  <td>{app.personalInfo.service_type}</td>
                  <td>{formatDate(app.personalInfo.created_at)}</td>
                  <td>
                    <span className={statusClass(app.status)}>
                      {app.status || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="review-btn"
                      onClick={() => onNavigate('reviewDocs', app)}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <nav className="pagination">
            <ul>
              {Array.from({ length: totalPages }).map((_, i) => (
                <li key={i}>
                  <button
                    onClick={() => setPage(i)}
                    className={`page-btn ${i === 0 ? 'first' : ''} ${i === totalPages - 1 ? 'last' : ''} ${i === page ? 'active' : ''}`}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
};

export default LookupPage_EN;
