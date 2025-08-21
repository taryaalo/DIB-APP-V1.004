import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { FormProvider } from './contexts/FormContext';
import GlobalStyles from './styles/GlobalStyles';
import ProtectedRoute from './common/ProtectedRoute';

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
            {/* Standalone/Entry Pages */}
            <Route path="/landing" element={<LandingPage_EN />} />
            <Route path="/eservices" element={<EServicesLanding />} />

            {/* Account Opening Flow */}
            <Route path="/" element={<ProtectedRoute stepIndex={0}><LanguageSelectionPage /></ProtectedRoute>} />
            <Route path="/select-user" element={<ProtectedRoute stepIndex={1}><SelectUserPage_EN /></ProtectedRoute>} />

            {/* Personal/Individual Flow */}
            <Route path="/personal-docs" element={<ProtectedRoute stepIndex={2}><SequentialDocsPage flow="personal" /></ProtectedRoute>} />
            <Route path="/businessmen-docs" element={<ProtectedRoute stepIndex={2}><SequentialDocsPage flow="businessmen" /></ProtectedRoute>} />
            <Route path="/guaranteed-docs" element={<ProtectedRoute stepIndex={2}><SequentialDocsPage flow="guaranteed" /></ProtectedRoute>} />
            <Route path="/expat-docs" element={<ProtectedRoute stepIndex={2}><SequentialDocsPage flow="expat" /></ProtectedRoute>} />
            <Route path="/face-registration" element={<ProtectedRoute stepIndex={3}><SelfiePage /></ProtectedRoute>} />
            <Route path="/personal-info" element={<ProtectedRoute stepIndex={4}><PersonalInfoPage /></ProtectedRoute>} />
            <Route path="/work-info" element={<ProtectedRoute stepIndex={5}><WorkInfoPage_EN /></ProtectedRoute>} />
            <Route path="/contact-info" element={<ProtectedRoute stepIndex={6}><ContactInfoPage /></ProtectedRoute>} />

            {/* Companies Flow */}
            <Route path="/companies-docs" element={<ProtectedRoute stepIndex={2}><CompaniesDocsPage /></ProtectedRoute>} />
            <Route path="/company-info" element={<ProtectedRoute stepIndex={3}><CompanyInfoPage /></ProtectedRoute>} />
            <Route path="/company-contact" element={<ProtectedRoute stepIndex={4}><CompanyContactPage /></ProtectedRoute>} />
            <Route path="/legal-rep-info" element={<ProtectedRoute stepIndex={5}><LegalRepInfoPage /></ProtectedRoute>} />
            <Route path="/financial-info" element={<ProtectedRoute stepIndex={6}><FinancialInfoPage /></ProtectedRoute>} />

            {/* Common Final Steps */}
            <Route path="/confirm" element={<ProtectedRoute stepIndex={7}><ConfirmPage /></ProtectedRoute>} />
            <Route path="/success" element={<ProtectedRoute stepIndex={8}><SuccessPage_EN /></ProtectedRoute>} />

            {/* Complete Account Flow (Not protected by sequential logic for now) */}
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