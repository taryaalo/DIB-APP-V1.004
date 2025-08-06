import React from 'react';

const FullPageLoader = ({ message }) => (
  <div className="loading-overlay">
    <div className="loading-spinner"></div>
    {message && <p className="loading-message">{message}</p>}
  </div>
);

export default FullPageLoader;
