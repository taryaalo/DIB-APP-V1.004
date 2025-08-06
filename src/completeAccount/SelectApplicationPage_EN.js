import React, { useEffect } from 'react';
import { LOGO_COLOR } from '../assets/imagePaths';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import { OpenAccountIcon, CompleteAccountIcon } from '../common/Icons';
import { t } from '../i18n';
import { useLanguage } from '../contexts/LanguageContext';

const SelectApplicationPage_EN = ({ onNavigate }) => {
  useEffect(() => {
    const card = document.querySelector('.tilt-effect');
    if (!card) return;
    const handleMouseMove = (e) => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      const rotateX = -1 * ((y - height / 2) / (height / 2)) * 10;
      const rotateY = ((x - width / 2) / (width / 2)) * 10;
      card.style.transform = `perspective(1000px) scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };
    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) scale(1) rotateX(0) rotateY(0)';
    };
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const { language } = useLanguage();

  return (
    <div className="app-container">
      <header className="header">
        <img src={LOGO_COLOR} alt="Bank Logo" className="logo" />
        <div className="header-switchers">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </header>
      <main className="main center-main">
        <div className="background">
          <div className="overlay"></div>
        </div>
        <div className="menu-card tilt-effect">
          <h2>{t('selectApplication', language)}</h2>
          <button onClick={() => onNavigate('pendingApplications')}>
            <CompleteAccountIcon />
            <span>{t('pendingApplications', language)}</span>
          </button>
          <button onClick={() => onNavigate('bankAccountLookup')}>
            <OpenAccountIcon />
            <span>{t('bankAccountOpening', language)}</span>
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SelectApplicationPage_EN;
