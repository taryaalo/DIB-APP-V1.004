// src/styles/global/base.js
import { createGlobalStyle } from 'styled-components';

const BaseStyles = createGlobalStyle`
  body {
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    font-family: ${props => props.theme.typography.fontFamily.primary};
    font-size: ${props => props.theme.typography.fontSize.body};
    line-height: ${props => props.theme.typography.lineHeight.body};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

export default BaseStyles;
