import { Level } from '../types/game';

interface TierDef {
  range: [number, number];
  difficulty: string;
  configs: { digits: number; startTime: number; endTime: number }[];
  icon: string;
  colorTheme: string;
}

const TIERS: TierDef[] = [
  { 
    range: [1, 10],   
    difficulty: 'Beginner', 
    configs: [
      { digits: 3, startTime: 5.0, endTime: 2.0 }, // Levels 1-5
      { digits: 4, startTime: 6.0, endTime: 3.0 }  // Levels 6-10
    ], 
    icon: '🌟', colorTheme: 'blue'   
  },
  { 
    range: [11, 25],  
    difficulty: 'Easy',     
    configs: [
      { digits: 5, startTime: 7.0, endTime: 3.5 }, // Levels 11-18
      { digits: 6, startTime: 8.0, endTime: 4.0 }  // Levels 19-25
    ], 
    icon: '📈', colorTheme: 'green'  
  },
  { 
    range: [26, 45],  
    difficulty: 'Medium',   
    configs: [
      { digits: 7, startTime: 10.0, endTime: 5.0 }, // Levels 26-35
      { digits: 8, startTime: 11.5, endTime: 6.0 }  // Levels 36-45
    ], 
    icon: '⚡', colorTheme: 'yellow' 
  },
  { 
    range: [46, 65],  
    difficulty: 'Hard',     
    configs: [
      { digits: 9, startTime: 13.0, endTime: 7.0 },  // Levels 46-55
      { digits: 10, startTime: 14.5, endTime: 8.0 }  // Levels 56-65
    ], 
    icon: '🔥', colorTheme: 'orange' 
  },
  { 
    range: [66, 85],  
    difficulty: 'Expert',   
    configs: [
      { digits: 11, startTime: 16.0, endTime: 9.0 },  // Levels 66-75
      { digits: 12, startTime: 18.0, endTime: 10.5 }  // Levels 76-85
    ], 
    icon: '👑', colorTheme: 'red'    
  },
  { 
    range: [86, 100], 
    difficulty: 'Master',   
    configs: [
      { digits: 13, startTime: 20.0, endTime: 12.0 }, // Levels 86-93
      { digits: 14, startTime: 22.0, endTime: 13.5 }  // Levels 94-100
    ], 
    icon: '🏆', colorTheme: 'purple' 
  },
];

const LEVEL_NAMES: Record<string, string[]> = {
  Beginner: ['Warm Up', 'First Glance', 'Quick Peek', 'Baby Steps', 'Tiny Recall', 'Short Burst', 'Blink Test', 'Snap Shot', 'Flash Card', 'Mini Match'],
  Easy:     ['Rising Star', 'Getting Sharper', 'Clear View', 'Steady Pace', 'Smooth Recall', 'In the Zone', 'Quick Draw', 'Sharp Eyes', 'Mind Spark', 'Brain Stretch', 'Focus Ring', 'Memory Lane', 'Double Take', 'Alert Mind', 'Growing Edge'],
  Medium:   ['Pressure Test', 'Mental Lift', 'Core Training', 'Deep Focus', 'Iron Will', 'Synapse Fire', 'Rhythm Lock', 'Pulse Check', 'Grid Scan', 'Nerve Center', 'Pattern Surge', 'Mind Forge', 'Echo Chamber', 'Signal Boost', 'Data Stream', 'Cipher Run', 'Matrix Read', 'Code Breaker', 'Sequence Storm', 'Neural Path'],
  Hard:     ['Gauntlet Run', 'Steel Trap', 'Hyper Focus', 'Overdrive', 'Memory Vault', 'Titan Recall', 'Storm Chaser', 'Night Vision', 'Power Grid', 'Quantum Leap', 'Dark Matter', 'Warp Speed', 'Photon Burst', 'Laser Focus', 'Plasma Core', 'Gravity Well', 'Cosmic Drift', 'Nova Flare', 'Void Walker', 'Event Horizon'],
  Expert:   ['Apex Trial', 'Grand Master', 'Elite Scan', 'Omega Wave', 'Crimson Edge', 'Phantom Lock', 'Ultra Recall', 'Supreme Test', 'Diamond Mind', 'Platinum Rush', 'Obsidian Core', 'Dragon Pulse', 'Thunder Dome', 'Crystal Palace', 'Shadow Grid', 'Nebula Burst', 'Prism Array', 'Zenith Point', 'Aurora Flow', 'Infinity Loop'],
  Master:   ['Legendary I', 'Legendary II', 'Legendary III', 'Ascension I', 'Ascension II', 'Ascension III', 'Transcendence I', 'Transcendence II', 'Transcendence III', 'Transcendence IV', 'Pinnacle I', 'Pinnacle II', 'Pinnacle III', 'Pinnacle IV', 'Pinnacle V'],
};

function generateLevels(): (Level & { colorTheme: string; icon: string })[] {
  const result: (Level & { colorTheme: string; icon: string })[] = [];

  for (const tier of TIERS) {
    const [start, end] = tier.range;
    const tierCount = end - start + 1;
    const names = LEVEL_NAMES[tier.difficulty];
    
    // We split the tier into two halves for the two configs
    const conf1Count = Math.ceil(tierCount / 2);
    
    for (let i = 0; i < tierCount; i++) {
      const id = start + i;
      const name = names[i % names.length];
      
      const confIndex = i < conf1Count ? 0 : 1;
      const config = tier.configs[confIndex];
      
      // Calculate progress within this config block (0 to 1)
      const blockCount = confIndex === 0 ? conf1Count : (tierCount - conf1Count);
      const blockIndex = confIndex === 0 ? i : (i - conf1Count);
      
      // Interpolate time from startTime to endTime
      const progress = blockCount > 1 ? blockIndex / (blockCount - 1) : 0;
      const timeToMemorize = Math.round((config.startTime - (config.startTime - config.endTime) * progress) * 10) / 10;

      result.push({
        id,
        name,
        digitCount: config.digits,
        timeToMemorize,
        difficulty: tier.difficulty,
        colorTheme: tier.colorTheme,
        icon: tier.icon,
      });
    }
  }

  return result;
}

export const levels = generateLevels();