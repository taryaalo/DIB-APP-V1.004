import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { FormProvider } from './contexts/FormContext';
import GlobalStyles from './styles/GlobalStyles';

// Import Page Components
import LanguageSelectionPage from './components/LanguageSelectionPage';
// English Pages - Account Opening flow
import LandingPage_EN from './accountOpening/LandingPage_EN';
import SelectUserPage_EN from './accountOpening/SelectUserPage_EN';
import CompaniesDocsPage from './accountOpening/CompaniesDocsPage';
import ContactInfoPage from './accountOpening/ContactInfoPage';
import WorkInfoPage_EN from './accountOpening/WorkInfoPage_EN';
import PersonalInfoPage from './accountOpening/PersonalInfoPage';
import CompanyInfoPage from './accountOpening/CompanyInfoPage';
import CompanyContactPage from './accountOpening/CompanyContactPage';
import LegalRepInfoPage from './accountOpening/LegalRepInfoPage';
import FinancialInfoPage from './accountOpening/FinancialInfoPage';
import SuccessPage_EN from './accountOpening/SuccessPage_EN';
import ConfirmPage from './accountOpening/ConfirmPage';
import EServicesLanding from './eServices/EServicesLandingPage';
import SequentialDocsPage from './accountOpening/SequentialDocsPage';
import SelfiePage from './accountOpening/SelfiePage';
import LookupPage_EN from './completeAccount/LookupPage_EN';
import SelectApplicationPage_EN from './completeAccount/SelectApplicationPage_EN';
import BankAccountLookupPage from './completeAccount/BankAccountLookupPage';
import ReviewDocsPage_EN from './completeAccount/ReviewDocsPage_EN';
import ReviewWorkInfoPage_EN from './completeAccount/ReviewWorkInfoPage_EN';
import ReviewAddressInfoPage_EN from './completeAccount/ReviewAddressInfoPage_EN';
import EServicesRegistrationPage_EN from './completeAccount/EServicesRegistrationPage_EN';
import AccountSummaryPage_EN from './completeAccount/AccountSummaryPage_EN';
import BankAccountPage from './completeAccount/BankAccountPage';
import CompleteAccountSuccessPage_EN from './completeAccount/CompleteAccountSuccessPage_EN';

const AppContent = () => {
    const { theme } = useTheme();
    const { i18n } = useTranslation();
    const location = useLocation();

    useEffect(() => {
        document.body.dir = i18n.dir();
        document.body.setAttribute('data-theme', theme);
    }, [i18n, theme, i18n.language]);

    return (
        <Routes location={location}>
            <Route path="/" element={<LanguageSelectionPage />} />
            <Route path="/landing" element={<LandingPage_EN />} />
            <Route path="/eservices" element={<EServicesLanding />} />
            <Route path="/select-user" element={<SelectUserPage_EN />} />
            <Route path="/complete-account" element={<SelectApplicationPage_EN />} />
            <Route path="/pending-applications" element={<LookupPage_EN />} />
            <Route path="/bank-account-lookup" element={<BankAccountLookupPage />} />
            <Route path="/review-docs" element={<ReviewDocsPage_EN />} />
            <Route path="/review-work-info" element={<ReviewWorkInfoPage_EN />} />
            <Route path="/review-address-info" element={<ReviewAddressInfoPage_EN />} />
            <Route path="/eservices-reg" element={<EServicesRegistrationPage_EN />} />
            <Route path="/account-summary" element={<AccountSummaryPage_EN />} />
            <Route path="/bank-account" element={<BankAccountPage />} />
            <Route path="/complete-account-success" element={<CompleteAccountSuccessPage_EN />} />
            <Route path="/personal-docs" element={<SequentialDocsPage flow="personal" />} />
            <Route path="/businessmen-docs" element={<SequentialDocsPage flow="businessmen" />} />
            <Route path="/guaranteed-docs" element={<SequentialDocsPage flow="guaranteed" />} />
            <Route path="/expat-docs" element={<SequentialDocsPage flow="expat" />} />
            <Route path="/face-registration" element={<SelfiePage />} />
            <Route path="/companies-docs" element={<CompaniesDocsPage />} />
            <Route path="/company-info" element={<CompanyInfoPage />} />
            <Route path="/company-contact" element={<CompanyContactPage />} />
            <Route path="/legal-rep-info" element={<LegalRepInfoPage />} />
            <Route path="/financial-info" element={<FinancialInfoPage />} />
            <Route path="/contact-info" element={<ContactInfoPage />} />
            <Route path="/work-info" element={<WorkInfoPage_EN />} />
            <Route path="/personal-info" element={<PersonalInfoPage />} />
            <Route path="/confirm" element={<ConfirmPage />} />
            <Route path="/success" element={<SuccessPage_EN />} />
        </Routes>
    );
};

export default function App() {
    return (
        <ThemeProvider>
            <FormProvider>
                <GlobalStyles />
                <AppContent />
            </FormProvider>
        </ThemeProvider>
    );
}