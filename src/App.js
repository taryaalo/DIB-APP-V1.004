import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { FormProvider } from './contexts/FormContext';
import GlobalStyles from './styles/GlobalStyles';

// Import Page Components
import LanguageSelectionPage from './components/LanguageSelectionPage';
// English Pages - Account Opening flow
import LandingPage_EN from './accountOpening/LandingPage_EN';
import SelectUserPage_EN from './accountOpening/SelectUserPage_EN';
import CompaniesDocsPage_EN from './accountOpening/CompaniesDocsPage_EN';
import ContactInfoPage_EN from './accountOpening/ContactInfoPage_EN';
import WorkInfoPage_EN from './accountOpening/WorkInfoPage_EN';
import PersonalInfoPage_EN from './accountOpening/PersonalInfoPage_EN';
import CompanyInfoPage_EN from './accountOpening/CompanyInfoPage_EN';
import CompanyContactPage_EN from './accountOpening/CompanyContactPage_EN';
import LegalRepInfoPage_EN from './accountOpening/LegalRepInfoPage_EN';
import FinancialInfoPage_EN from './accountOpening/FinancialInfoPage_EN';
import SuccessPage_EN from './accountOpening/SuccessPage_EN';
import ConfirmPage_EN from './accountOpening/ConfirmPage_EN';
import EServicesLanding from './eServices/EServicesLandingPage';
import SequentialDocsPage_EN from './accountOpening/SequentialDocsPage_EN';
import LookupPage_EN from './completeAccount/LookupPage_EN';
import ReviewDocsPage_EN from './completeAccount/ReviewDocsPage_EN';
import ReviewWorkInfoPage_EN from './completeAccount/ReviewWorkInfoPage_EN';
import ReviewAddressInfoPage_EN from './completeAccount/ReviewAddressInfoPage_EN';
import EServicesRegistrationPage_EN from './completeAccount/EServicesRegistrationPage_EN';
import AccountSummaryPage_EN from './completeAccount/AccountSummaryPage_EN';


// ---=== Main App Component ===---
const AppContent = () => {
  const [navigation, setNavigation] = useState({ page: 'languageSelection', flow: null, state: null });
  const { theme } = useTheme();
  const { language } = useLanguage();

  useEffect(() => {
    document.body.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.body.setAttribute('data-theme', theme);
  }, [theme, language]);

  const handleNavigation = (page, state = null) => {
    const pageFlows = {
        personalDocs: 'personal',
        businessmenDocs: 'businessmen',
        guaranteedDocs: 'guaranteed',
        expatDocs: 'expat',
        companiesDocs: 'companies'
    };
    const newFlow = pageFlows[page] || navigation.flow;

    setNavigation({ page, flow: newFlow, state });
  };

  const renderPage = () => {
      const { page, flow, state } = navigation;

      if (page === 'languageSelection') {
          return <LanguageSelectionPage onNavigate={handleNavigation} />;
      }

      switch(page) {
            case 'landing': return <LandingPage_EN onNavigate={handleNavigation} />;
            case 'eServices': return <EServicesLanding onNavigate={handleNavigation} />;
            case 'selectUser': return <SelectUserPage_EN onNavigate={handleNavigation} />;
            case 'completeAccount': return <LookupPage_EN onNavigate={handleNavigation} />;
            case 'reviewDocs': return <ReviewDocsPage_EN onNavigate={handleNavigation} state={state} />;
            case 'reviewWorkInfo': return <ReviewWorkInfoPage_EN onNavigate={handleNavigation} state={state} />;
            case 'reviewAddressInfo': return <ReviewAddressInfoPage_EN onNavigate={handleNavigation} state={state} />;
            case 'eServicesReg': return <EServicesRegistrationPage_EN onNavigate={handleNavigation} state={state} />;
            case 'accountSummary': return <AccountSummaryPage_EN onNavigate={handleNavigation} state={state} />;
            
            case 'personalDocs':
            case 'businessmenDocs':
            case 'guaranteedDocs':
            case 'expatDocs':
              return <SequentialDocsPage_EN onNavigate={handleNavigation} backPage="selectUser" nextPage="contactInfo" />;

            case 'companiesDocs': return <CompaniesDocsPage_EN onNavigate={handleNavigation} backPage="selectUser" nextPage="companyInfo" />;
            case 'companyInfo': return <CompanyInfoPage_EN onNavigate={handleNavigation} backPage="companiesDocs" nextPage="companyContact" />;
            case 'companyContact': return <CompanyContactPage_EN onNavigate={handleNavigation} backPage="companyInfo" nextPage="legalRepInfo" />;
            case 'legalRepInfo': return <LegalRepInfoPage_EN onNavigate={handleNavigation} backPage="companyContact" nextPage="financialInfo" />;
            case 'financialInfo': return <FinancialInfoPage_EN onNavigate={handleNavigation} backPage="legalRepInfo" />;

            case 'contactInfo': {
                let backPage = 'selectUser';
                if (flow === 'personal') backPage = 'personalDocs';
                if (flow === 'guaranteed') backPage = 'guaranteedDocs';
                if (flow === 'businessmen') backPage = 'businessmenDocs';
                if (flow === 'expat') backPage = 'expatDocs';
                return <ContactInfoPage_EN onNavigate={handleNavigation} backPage={backPage} nextPage="workInfo" />;
            }
            case 'workInfo': return <WorkInfoPage_EN onNavigate={handleNavigation} backPage="contactInfo" nextPage="personalInfo" />;
            case 'personalInfo': return <PersonalInfoPage_EN onNavigate={handleNavigation} backPage="workInfo" flow={flow} state={state} />;
            case 'confirm': return <ConfirmPage_EN onNavigate={handleNavigation} state={state} />;
            
            case 'success': return <SuccessPage_EN onNavigate={handleNavigation} state={state} />;
            default: return <LanguageSelectionPage onNavigate={handleNavigation} />;
        }
  }

  return <>{renderPage()}</>;
}


export default function App() {
    return (
        <LanguageProvider>
            <ThemeProvider>
                <FormProvider>
                    <GlobalStyles />
                    <AppContent />
                </FormProvider>
            </ThemeProvider>
        </LanguageProvider>
    );
}