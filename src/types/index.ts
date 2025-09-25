export type SecurityObservations = Record<string, string[]>;

export interface Organization {
  id: string;
  name: string;
  pilots: number;
  flightHours: number;
  airships: number;
  securityObs: SecurityObservations;
  generalObs: string;
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
  organizations: Organization[];
  isLoadingOrganizations: boolean;
  selectedOrganization: Organization | null;
  setSelectedOrganization: (org: Organization | null) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (result: AnalysisResult | null) => void;
}