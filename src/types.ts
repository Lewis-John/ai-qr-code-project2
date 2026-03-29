export interface UserHealthData {
  age: number | string;
  gender: 'male' | 'female' | '';
  height: number | string;
  weight: number | string;
}

export interface AIReport {
  summary: string;
  benefits: string[];
  suggestion: string;
  pairing: {
    name: string;
    reason: string;
    image?: string;
  };
}

export interface OneApiConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export type AppStep = 'welcome' | 'form' | 'loading' | 'report';

