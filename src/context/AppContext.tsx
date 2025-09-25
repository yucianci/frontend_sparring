import { createContext, useState, useEffect, ReactNode } from 'react';
import { AppContextType, Organization, AnalysisResult } from '../types';
import { organizations } from '../data/organizations';

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(
    organizations[0]
  );
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('aviation-ai-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    localStorage.setItem('aviation-ai-dark-mode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const value: AppContextType = {
    selectedOrganization,
    setSelectedOrganization,
    isDarkMode,
    toggleDarkMode,
    analysisResult,
    setAnalysisResult,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
