import React from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';


export const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

export const CheckIcon = () => <FaCheckCircle />;
export const ErrorIcon = () => <FaTimesCircle />;

export const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);

export const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
);

export const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);

export const SuccessIcon: React.FC = () => (
    <svg
      className="success-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 52 52"
      width="52"
      height="52"
    >
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="3"
            floodColor="#4caf50"
            floodOpacity="0.6"
          />
        </filter>
        <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4caf50" />
          <stop offset="100%" stopColor="#8bc34a" />
        </linearGradient>
      </defs>
  
      <style>{`
        .success-icon circle {
          stroke-dasharray: 157;
          stroke-dashoffset: 157;
          animation: draw-circle 0.6s ease-out forwards;
        }
        .success-icon path {
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: draw-check 0.3s 0.6s ease-out forwards;
        }
        @keyframes draw-circle {
          to { stroke-dashoffset: 0; }
        }
        @keyframes draw-check {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
  
      <circle
        cx="26"
        cy="26"
        r="25"
        fill="none"
        stroke="url(#successGradient)"
        strokeWidth="2.5"
        filter="url(#shadow)"
      />
      <path
        fill="none"
        stroke="url(#successGradient)"
        strokeWidth="3.5"
        strokeLinecap="round"
        d="M14.1 27.2l7.1 7.2 16.7-16.8"
      />
    </svg>
  );
  

export const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
);

export const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
);

export const OpenAccountIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2.5a5.5 5.5 0 0 1 5.5 5.5c0 1.573-1.022 3.204-2.272 4.428-.465.46-.93.89-1.385 1.294l-.06.052c-.52.452-1.044.866-1.577 1.216l-.21.138a.5.5 0 0 1-.492 0l-.21-.138c-.533-.35-1.057-.764-1.577-1.216l-.06-.052c-.455-.403-.92-.833-1.385-1.294C7.522 11.204 6.5 9.573 6.5 8a5.5 5.5 0 0 1 5.5-5.5zm0 1.5a4 4 0 0 0-4 4c0 1.206.812 2.59 1.95 3.687.421.411.84.793 1.27 1.14l.05.043c.472.4.94.76 1.4.973.46-.213.928-.573 1.4-.973l.05-.043c.43-.347.85-.73 1.27-1.14C15.688 10.59 16.5 9.206 16.5 8a4 4 0 0 0-4-4zm-6 15a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm.5 2a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11z"/></svg>
);

export const CompleteAccountIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M19.5 2a.5.5 0 0 1 .5.5v19a.5.5 0 0 1-.5.5h-15a.5.5 0 0 1-.5-.5v-19a.5.5 0 0 1 .5-.5h15zm-.5 1h-14v18h14v-18zM8 6a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 8 6zm.5 3a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7zm0 4a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4z"/></svg>
);

export const PersonalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2.5a5.5 5.5 0 0 1 5.5 5.5c0 1.573-1.022 3.204-2.272 4.428-.465.46-.93.89-1.385 1.294l-.06.052c-.52.452-1.044.866-1.577 1.216l-.21.138a.5.5 0 0 1-.492 0l-.21-.138c-.533-.35-1.057-.764-1.577-1.216l-.06-.052c-.455-.403-.92-.833-1.385-1.294C7.522 11.204 6.5 9.573 6.5 8a5.5 5.5 0 0 1 5.5-5.5zM12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm-6 13a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/></svg>
);

export const GuaranteedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 1.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zM8.25 5a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0zM12 10.5A6.75 6.75 0 0 0 5.25 17.25a.75.75 0 0 0 .75.75h12a.75.75 0 0 0 .75-.75A6.75 6.75 0 0 0 12 10.5z"/></svg>
);

export const BusinessmenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M8 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm3 .5a.5.5 0 0 1 .5.5v2.5h2.5a.5.5 0 0 1 0 1h-6a.5.5 0 0 1 0-1H10V4a.5.5 0 0 1 .5-.5zM8 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm1 2h-2a6 6 0 0 0-6 6v1a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-1a6 6 0 0 0-6-6h-2a1 1 0 0 1 0 2h2a4 4 0 0 1 4 4v.5H3v-.5a4 4 0 0 1 4-4h2a1 1 0 0 1 0-2z"/></svg>
);

export const CompaniesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M0 5.5A1.5 1.5 0 0 1 1.5 4h14A1.5 1.5 0 0 1 17 5.5V11H0V5.5zM1.5 5a.5.5 0 0 0-.5.5v4h15V5.5a.5.5 0 0 0-.5-.5h-14zM0 20v-7h17v7a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 0 20zm16-1H1v-5h15v5zM19 4h3.5a.5.5 0 0 1 .5.5v15a.5.5 0 0 1-.5.5H19v-1h3v-14h-3V4zm-6-2h2v2h-2V2zM5 7h2v2H5V7zm4 0h2v2H9V7z"/></svg>
);

export const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="upload-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
);

export const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
export const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);

export const UnlockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9 0"></path></svg>
);

export const MobileAppIcon = () => (

<svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 0 30 30" width="30px" fill="currentColor">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
</svg>);

export const SmsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 30 30">
    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
  </svg>
  );

export const CardIcon = () => (
<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 24 24">
  <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zM20 18H4v-6h16v6zm0-10H4V6h16v2z"/>
  <path d="M0 0h24v24H0z" fill="none"/>
</svg>
    );

export const VisaMasterIcon = () => (
<svg xmlns="http://www.w.w3.org/2000/svg" height="30" width="30" fill="currentColor" viewBox="0 0 24 24">
  <text x="2" y="16" font-family="sans-serif" font-size="9" font-weight="bold">VISA</text>
</svg>
);
