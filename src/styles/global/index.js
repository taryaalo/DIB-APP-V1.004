// src/styles/global/index.js
import React from 'react';
import ResetStyles from './reset';
import FontStyles from './fonts';
import BaseStyles from './base';

const GlobalStyles = () => (
  <>
    <ResetStyles />
    <FontStyles />
    <BaseStyles />
  </>
);

export default GlobalStyles;
