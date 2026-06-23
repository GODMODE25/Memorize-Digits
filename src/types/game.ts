export interface Level {
  id: number;
  name: string;
  digitCount: number;
  timeToMemorize: number;
  difficulty: string;
  colorTheme: string;
  icon: string;
}

export type GameState = 'landing' | 'menu' | 'game' | 'results';

export type GameMode = 'Numbers' | 'Phone' | 'Alphanumeric' | 'Words' | 'Flash Cards';

export type PlayStyle = 'Classic' | 'Practice' | 'Time Attack';

export type MnemonicTechnique = 'Auto Coach' | 'Chunking' | 'Story Link' | 'Memory Palace' | 'Sound/Rhythm';

export interface GameResult {
  success: boolean;
  score: number;
  timeElapsed: number;
  correctDigits: number;
  totalDigits: number;
  correctAnswer: string;
  userAnswer: string;
}

export interface DailyQuest {
  type: 'Campaign' | 'Practice' | 'Score' | 'Streak';
  target: number;
  current: number;
  completed: boolean;
  date: string;
}

export interface Profile {
  username: string;
  totalXP: number;
  level: number;
  completedLevels: number[]; // campaign levels completed
  highScores: Record<string, number>; // level id or mode name -> score
  totalGamesPlayed: number;
  achievements: string[]; // unlocked achievement IDs
  dailyStreak: number;
  lastPlayedDate: string;
  dailyQuest: DailyQuest;
  theme: string;
  soundVolume: number;
  assistEnabled: boolean;
  emoji: string;
  keypadEnabled: boolean;
  createdTime: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement?: string;
}