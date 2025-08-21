import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LOGO_COLOR } from '../assets/imagePaths';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Footer from '../common/Footer';
import { PersonalIcon, GuaranteedIcon, BusinessmenIcon, CompaniesIcon } from '../common/Icons';
import { t } from '../i18n';
import { useFormData } from '../contexts/FormContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const SelectUserPage_EN = () => {
    const navigate = useNavigate();
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
    }
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const { formData, updateFormData, updateHighestCompletedStep } = useFormData();

  const selectService = async (type, page) => {
    // Update the userType in the central form data
    updateFormData({ userType: type });

    // Mark step 1 as complete
    updateHighestCompletedStep(1);

    // Persist to backend/cache if needed (optional, depends on requirements)
    try {
      await fetch(`${API_BASE_URL}/api/cache-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Pass the latest data, though formData from context might be slightly stale
        // A better approach would be to have updateFormData return the new state
        body: JSON.stringify({ ...formData, userType: type })
      });
    } catch (e) { console.error(e); }

    // Navigate to the next page
    navigate(`/${page}`);
  };

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
          <h2>{t('selectService')}</h2>
          <button onClick={() => selectService('personal', 'personal-docs')}><PersonalIcon /><span>{t('personal')}</span></button>
          <button onClick={() => selectService('expat', 'expat-docs')}><PersonalIcon /><span>{t('expat')}</span></button>
          <button onClick={() => selectService('guaranteed', 'guaranteed-docs')}><GuaranteedIcon /><span>{t('guaranteed')}</span></button>
          <button onClick={() => selectService('businessmen', 'businessmen-docs')}><BusinessmenIcon /><span>{t('businessmen')}</span></button>
          <button onClick={() => selectService('companies', 'companies-docs')}><CompaniesIcon /><span>{t('companies')}</span></button>
        </div>
      </main>
            <Footer />
    </div>
  );
};
export default SelectUserPage_EN;