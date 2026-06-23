import { Profile, DailyQuest } from '../types/game';

const PROFILES_KEY = 'digitMemoryTrainer_profiles';
const ACTIVE_PROFILE_KEY = 'digitMemoryTrainer_activeProfile';

export const PROFILE_EMOJIS = ['🦊', '🐯', '🐸', '🐼', '🤖', '👻', '👾', '👽', '💀', '🦄', '🧙', '🥷', '🐙', '🦖', '🦉', '🦁', '🐱', '🐶'];

export const generateDailyQuest = (): DailyQuest => {
  const types: ('Campaign' | 'Practice' | 'Score')[] = ['Campaign', 'Practice', 'Score'];
  const type = types[Math.floor(Math.random() * types.length)];
  const date = new Date().toDateString();
  let target = 3;
  if (type === 'Score') {
    target = 2000;
  }
  return {
    type,
    target,
    current: 0,
    completed: false,
    date,
  };
};

export const createDefaultProfile = (username: string): Profile => {
  return {
    username,
    totalXP: 0,
    level: 1,
    completedLevels: [],
    highScores: {},
    totalGamesPlayed: 0,
    achievements: [],
    dailyStreak: 0,
    lastPlayedDate: '',
    dailyQuest: generateDailyQuest(),
    theme: 'midnight-glass',
    soundVolume: 0.5,
    assistEnabled: true,
    emoji: PROFILE_EMOJIS[Math.floor(Math.random() * PROFILE_EMOJIS.length)],
    keypadEnabled: true,
    practiceTimerEnabled: true,
    createdTime: Date.now(),
  };
};

export function loadProfiles(): Profile[] {
  try {
    const stored = localStorage.getItem(PROFILES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Profile[];
      // Migrate or normalize loaded profiles if necessary
      return parsed.map(p => {
        const quest = p.dailyQuest && p.dailyQuest.date === new Date().toDateString() 
          ? p.dailyQuest 
          : generateDailyQuest();
        return {
          ...createDefaultProfile(p.username),
          ...p,
          emoji: p.emoji || PROFILE_EMOJIS[Math.floor(Math.random() * PROFILE_EMOJIS.length)],
          keypadEnabled: p.keypadEnabled !== undefined ? p.keypadEnabled : true,
          practiceTimerEnabled: p.practiceTimerEnabled !== undefined ? p.practiceTimerEnabled : true,
          dailyQuest: quest,
        };
      });
    }
  } catch (error) {
    console.error('Failed to load profiles:', error);
  }
  return [];
}

export function saveProfiles(profiles: Profile[]): void {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error('Failed to save profiles:', error);
  }
}

export function getActiveProfileName(): string | null {
  return localStorage.getItem(ACTIVE_PROFILE_KEY);
}

export function setActiveProfileName(username: string | null): void {
  if (username) {
    localStorage.setItem(ACTIVE_PROFILE_KEY, username);
  } else {
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
  }
}

export function loadActiveProfile(): Profile | null {
  const name = getActiveProfileName();
  const profiles = loadProfiles();
  if (name) {
    const profile = profiles.find(p => p.username.toLowerCase() === name.toLowerCase());
    if (profile) return profile;
  }
  if (profiles.length > 0) {
    setActiveProfileName(profiles[0].username);
    return profiles[0];
  }
  return null;
}

export function saveActiveProfile(profile: Profile): void {
  const profiles = loadProfiles();
  const index = profiles.findIndex(p => p.username.toLowerCase() === profile.username.toLowerCase());
  if (index !== -1) {
    profiles[index] = profile;
  } else {
    profiles.push(profile);
  }
  saveProfiles(profiles);
}

export function createProfile(username: string): Profile | null {
  const profiles = loadProfiles();
  const exists = profiles.some(p => p.username.toLowerCase() === username.trim().toLowerCase());
  if (exists || !username.trim()) return null;

  const newProfile = createDefaultProfile(username.trim());
  profiles.push(newProfile);
  saveProfiles(profiles);
  setActiveProfileName(newProfile.username);
  return newProfile;
}

export function deleteProfile(username: string): void {
  let profiles = loadProfiles();
  profiles = profiles.filter(p => p.username.toLowerCase() !== username.toLowerCase());
  saveProfiles(profiles);
  const activeName = getActiveProfileName();
  if (activeName && activeName.toLowerCase() === username.toLowerCase()) {
    if (profiles.length > 0) {
      setActiveProfileName(profiles[0].username);
    } else {
      setActiveProfileName(null);
    }
  }
}

export function updateStreakAndDate(profile: Profile): Profile {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

  if (profile.lastPlayedDate === today) {
    // Already played today, streak remains same
    return profile;
  }

  let newStreak = profile.dailyStreak;
  if (profile.lastPlayedDate === yesterday) {
    newStreak += 1;
  } else if (profile.lastPlayedDate === '') {
    newStreak = 1;
  } else {
    // Reset streak if missed a day
    newStreak = 1;
  }

  const updated: Profile = {
    ...profile,
    dailyStreak: newStreak,
    lastPlayedDate: today,
  };
  return updated;
}

export function updateXPAndLevel(profile: Profile, xpGained: number): { profile: Profile; leveledUp: boolean } {
  const newXP = profile.totalXP + xpGained;
  const newLevel = Math.floor(newXP / 1000) + 1; // 1000 XP per level
  const leveledUp = newLevel > profile.level;

  const updated: Profile = {
    ...profile,
    totalXP: newXP,
    level: newLevel,
  };

  return { profile: updated, leveledUp };
}

export function progressQuest(profile: Profile, type: 'Campaign' | 'Practice' | 'Score', amount: number): Profile {
  const quest = { ...profile.dailyQuest };
  if (quest.completed || quest.type !== type) return profile;

  quest.current = Math.min(quest.target, quest.current + amount);
  if (quest.current >= quest.target) {
    quest.completed = true;
  }

  const updated: Profile = {
    ...profile,
    dailyQuest: quest,
  };

  // Give a small bonus XP when daily quest finishes
  if (quest.completed) {
    const { profile: xpUpdated } = updateXPAndLevel(updated, 300); // 300 XP bonus
    return xpUpdated;
  }

  return updated;
}