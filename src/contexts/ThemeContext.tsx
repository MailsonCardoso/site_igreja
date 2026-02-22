import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = {
    name: string;
    primary: string;
    sidebar?: string;
    ring?: string;
};

const themes: Record<string, Theme> = {
    purple: {
        name: 'Royal Purple',
        primary: '270 60% 55%',
    },
    teal: {
        name: 'Teal Ocean',
        primary: '180 55% 45%',
    },
    emerald: {
        name: 'Emerald Forest',
        primary: '150 55% 40%',
    },
    amber: {
        name: 'Amber Sunrise',
        primary: '35 85% 55%',
    },
    slate: {
        name: 'Slate Blue',
        primary: '220 45% 55%',
    },
    indigo: {
        name: 'Indigo Night',
        primary: '250 55% 45%',
    },
    burgundy: {
        name: 'Burgundy',
        primary: '349 60% 35%',
    },
};

interface ThemeContextType {
    currentTheme: string;
    setTheme: (themeName: string) => void;
    themes: Record<string, Theme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState(() => {
        return localStorage.getItem('app-theme') || 'purple';
    });

    useEffect(() => {
        const theme = themes[currentTheme] || themes.purple;
        const root = document.documentElement;

        // Apply primary color
        root.style.setProperty('--primary', theme.primary);
        root.style.setProperty('--sidebar-primary', theme.primary);
        root.style.setProperty('--chart-amber', theme.primary);
        root.style.setProperty('--ring', theme.primary);
        root.style.setProperty('--sidebar-ring', theme.primary);

        // Update gradients (we have to manually update them as they are defined with hsl values in CSS utilities)
        // Actually, it's better to use CSS variables for gradients too if possible, 
        // but for now we'll just update the --primary and hope the utilities use var(--primary)
        // Wait, the index.css had hardcoded HSL values in utilities. Let's fix that too.

        localStorage.setItem('app-theme', currentTheme);
    }, [currentTheme]);

    return (
        <ThemeContext.Provider value={{ currentTheme, setTheme: setCurrentTheme, themes }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
