export type SomaticCategory = 
  | 'head'
  | 'chest'
  | 'stomach'
  | 'shoulders_neck'
  | 'jaw'
  | 'hands_feet'
  | 'whole_body';

export interface SomaticSensation {
  id: string;
  category: SomaticCategory;
  labelTh: string;
  labelEn: string;
  iconName?: string;
  valenceAffinity?: 'negative' | 'positive' | 'neutral';
}

export type TriggerCategory = 
  | 'work_study'
  | 'health_lifestyle'
  | 'environment'
  | 'relationships'
  | 'internal';

export interface TriggerItem {
  id: string;
  category: TriggerCategory;
  labelTh: string;
  labelEn: string;
  icon: string;
}

export interface MoodEntry {
  id: string;
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  valence: number; // -5 (Very Negative) to +5 (Very Positive)
  arousal: number; // -5 (Very Low Energy/Calm) to +5 (Very High Energy/Agitated)
  primaryEmotion: string;
  secondaryEmotion?: string;
  somaticSensations: string[];
  triggers: string[];
  energyLevel: number; // 1 to 10
  sleepHours: number; // e.g. 7.5
  note: string;
  aiDailyInsight?: string;
  syncedToGAS: boolean;
  syncedAt?: string;
}

export interface GASConfig {
  webAppUrl: string;
  sheetName: string;
  autoSync: boolean;
  lastSyncTime?: string;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
}

export interface WeeklyAnalysis {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  generatedAt: string;
  resilienceIndex: number; // 0 to 100
  dominantEmotions: string[];
  keyTriggers: {
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    frequency: number;
  }[];
  somaticCorrelations: string[];
  summaryTh: string;
  psychologicalAnalysisTh: string;
  cbtExperimentsTh: string[];
  recommendedActionsTh: string[];
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface SyncLogItem {
  id: string;
  timestamp: string;
  type: 'export_mood' | 'sync_batch' | 'weekly_report' | 'test_ping';
  status: 'success' | 'error';
  message: string;
  rowCount?: number;
}
