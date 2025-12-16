export enum AppLanguage {
  ENGLISH = 'en',
  HINDI = 'hi'
}

export interface MandiPrice {
  id: string;
  crop: string;
  variety: string;
  market: string;
  price: number;
  change: number; // Percentage change
  date: string;
  trend: 'up' | 'down' | 'stable';
  arrivalVolume: 'low' | 'medium' | 'high';
}

export interface HistoricalDataPoint {
  date: string;
  price: number;
}

export interface MarketPrediction {
  tomorrowMin: number;
  tomorrowMax: number;
  confidence: 'low' | 'medium' | 'high';
  trendDirection: 'up' | 'down' | 'stable';
  factors: string[]; // e.g., "High Arrivals", "Rain Forecast"
}

export interface Scheme {
  id: string;
  title: string;
  category: 'subsidy' | 'insurance' | 'loan' | 'pension';
  description: string;
  eligibility: string[];
  deadline?: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  advisory: string;
  rainChance?: number; // percentage
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isAudio?: boolean;
}