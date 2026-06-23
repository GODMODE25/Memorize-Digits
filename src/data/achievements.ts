import { Achievement } from '../types/game';

export const achievements: Achievement[] = [
  // ── Progression Milestones ──
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your very first campaign level.',
    icon: '👶',
  },
  {
    id: 'memory-novice',
    name: 'Memory Novice',
    description: 'Complete 5 campaign levels.',
    icon: '🧠',
  },
  {
    id: 'apprentice',
    name: 'Apprentice',
    description: 'Complete 15 campaign levels.',
    icon: '📖',
  },
  {
    id: 'journeyman',
    name: 'Journeyman',
    description: 'Complete 30 campaign levels.',
    icon: '🗺️',
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Complete 50 campaign levels.',
    icon: '🎖️',
  },
  {
    id: 'master-memorizer',
    name: 'Master Memorizer',
    description: 'Complete all 100 campaign levels.',
    icon: '🏆',
  },

  // ── Speed Achievements ──
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Recall a sequence in under 5 seconds.',
    icon: '⚡',
  },
  {
    id: 'lightning-fast',
    name: 'Lightning Fast',
    description: 'Recall 10+ digits in under 10 seconds.',
    icon: '🚀',
  },
  {
    id: 'time-warp',
    name: 'Time Warp',
    description: 'Recall 12+ digits in under 15 seconds.',
    icon: '⏱️',
  },

  // ── Accuracy Achievements ──
  {
    id: 'perfect-memory',
    name: 'Perfect Memory',
    description: 'Get 100% accuracy 3 times.',
    icon: '🎯',
  },
  {
    id: 'flawless-streak',
    name: 'Flawless Streak',
    description: 'Get 100% accuracy 10 times.',
    icon: '💎',
  },

  // ── Persistence Achievements ──
  {
    id: 'persistent',
    name: 'Persistent',
    description: 'Play 50 total games.',
    icon: '💪',
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Play 150 total games.',
    icon: '🔥',
  },
  {
    id: 'marathon-runner',
    name: 'Marathon Runner',
    description: 'Play 500 total games.',
    icon: '🏃',
  },

  // ── Streak Achievements ──
  {
    id: 'on-fire',
    name: 'On Fire',
    description: 'Maintain a 3-day play streak.',
    icon: '🔥',
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day play streak.',
    icon: '📅',
  },

  // ── Mode Mastery ──
  {
    id: 'phone-whiz',
    name: 'Phone Whiz',
    description: 'Score 800+ in Phone Number mode.',
    icon: '📱',
  },
  {
    id: 'code-cracker',
    name: 'Code Cracker',
    description: 'Score 800+ in Alphanumeric mode.',
    icon: '🔐',
  },
  {
    id: 'wordsmith',
    name: 'Wordsmith',
    description: 'Score 800+ in Words mode.',
    icon: '📝',
  },

  // ── Score Milestones ──
  {
    id: 'high-roller',
    name: 'High Roller',
    description: 'Earn a single-round score of 1500 or more.',
    icon: '💰',
  },
];