import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon } from './Icons';

const ThemeSwitcher = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <div className="theme-switcher" onClick={toggleTheme}>
            <div className="theme-switcher-button">
                 {theme === 'light' ? <SunIcon /> : <MoonIcon />}
            </div>
        </div>
    );
};

export default ThemeSwitcher;