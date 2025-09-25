export interface Organization {
  id: string;
  name: string;
  pilots: number;
  averageFlightHours: number;
  fleet: number;
  safetyStandards: string[];
  checklists: Record<string, string[]>;
  observations: string;
  prompt: string;
}

export interface ChecklistItem {
  [key: string]: boolean;
}

export interface Pattern {
  title: string;
  feedback: string;
  checklists: ChecklistItem[];
}

export interface FlightMetadata {
  company?: string;
  flightNumber?: string;
  aircraft?: string;
  pilot?: string;
  copilot?: string;
  flightDetails?: {
    route?: string;
    date?: string;
    duration?: string;
    weather?: string;
  };
}

export interface AnalysisResult {
  transcriptId: string;
  organizationId: string;
  pilotId: string;
  patterns: Pattern[];
  metadata?: FlightMetadata;
}

export interface AppContextType {
  selectedOrganization: Organization | null;
  setSelectedOrganization: (org: Organization) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (result: AnalysisResult | null) => void;
}