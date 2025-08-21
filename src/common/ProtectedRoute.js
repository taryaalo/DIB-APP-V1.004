import React from 'react';
import { Navigate } from 'react-router-dom';
import { useFormData } from '../contexts/FormContext';

const ProtectedRoute = ({ children, stepIndex }) => {
  const { formData } = useFormData();
  // Ensure we have a fallback for highestCompletedStep if formData is not ready
  const highestCompletedStep = formData?.highestCompletedStep ?? 0;

  // Allow access to the language selection page at any time.
  if (stepIndex === 0) {
    return children;
  }

  // The user is allowed to visit any page they have already completed,
  // or the next immediate step.
  if (stepIndex > highestCompletedStep + 1) {
    const getPathForStep = (step) => {
      // This function determines the correct URL for a given step,
      // handling the different user flows.
      if (formData.userType === 'companies') {
        // Companies Flow
        switch (step) {
          case 0: return '/';
          case 1: return '/select-user';
          case 2: return '/companies-docs';
          case 3: return '/company-info';
          case 4: return '/company-contact';
          case 5: return '/legal-rep-info';
          case 6: return '/financial-info';
          case 7: return '/confirm';
          case 8: return '/success';
          default: return '/';
        }
      } else {
        // Default/Personal/Other Flows
        switch (step) {
          case 0: return '/';
          case 1: return '/select-user';
          case 2:
            switch (formData.userType) {
              case 'businessmen': return '/businessmen-docs';
              case 'guaranteed': return '/guaranteed-docs';
              case 'expat': return '/expat-docs';
              case 'personal':
              default:
                return '/personal-docs';
            }
          case 3: return '/face-registration';
          case 4: return '/personal-info';
          case 5: return '/work-info';
          case 6: return '/contact-info';
          case 7: return '/confirm';
          case 8: return '/success';
          default: return '/';
        }
      }
    };

    // Redirect the user to the next step they are authorized to visit.
    const redirectToPath = getPathForStep(highestCompletedStep + 1);
    return <Navigate to={redirectToPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
