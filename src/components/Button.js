// src/components/Button.js
import styled from 'styled-components';

const Button = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.neutral100};
  border: none;
  padding: ${props => props.theme.spacing.space4} ${props => props.theme.spacing.space12};
  font-size: ${props => props.theme.typography.fontSize.large};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  border-radius: ${props => props.theme.spacing.space3};
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 400px;

  &:hover {
    background-color: ${props => props.theme.colors.primaryDark};
  }

  &:disabled {
    background-color: ${props => props.theme.colors.neutral500};
    cursor: not-allowed;
  }
`;

export default Button;
