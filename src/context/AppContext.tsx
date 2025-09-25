import { createContext, useState, useEffect, ReactNode } from 'react';
import { AppContextType, Organization, AnalysisResult } from '../types';
import { fetchOrganizations } from '../services/organizations';

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganizationState] = useState<Organization | null>(
    null
  );
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('aviation-ai-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState<boolean>(true);

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setIsLoadingOrganizations(true);
        const fetched = await fetchOrganizations();
        setOrganizations(fetched);
        setSelectedOrganizationState((current) => {
          if (!fetched.length) {
            return null;
          }

          if (current) {
            const matched = fetched.find((org) => org.id === current.id);
            if (matched) {
              return matched;
            }
          }

          return fetched[0];
        });
      } catch (error) {
        console.error('Erro ao carregar organizações:', error);
        setOrganizations([]);
        setSelectedOrganizationState(null);
      } finally {
        setIsLoadingOrganizations(false);
      }
    };

    loadOrganizations();
  }, []);

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
    organizations,
    isLoadingOrganizations,
    selectedOrganization,
    setSelectedOrganization: (organization: Organization | null) => {
      setSelectedOrganizationState(organization);
      setAnalysisResult(null);
    },
    isDarkMode,
    toggleDarkMode,
    analysisResult,
    setAnalysisResult,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
