import { Level, GameMode } from '../types/game';

export const WORD_BANK = [
  'apple', 'badge', 'cable', 'delta', 'ember', 'focus', 'globe', 'harbor',
  'island', 'jungle', 'kernel', 'lantern', 'matrix', 'nectar', 'orbit',
  'puzzle', 'quartz', 'rocket', 'silver', 'timber', 'velvet', 'wander',
  'yellow', 'zipper', 'anchor', 'binary', 'cobalt', 'dragon', 'energy',
  'fabric', 'garden', 'horizon', 'magnet', 'signal', 'voyage', 'beacon',
  'crater', 'domain', 'fossil', 'geyser', 'legend', 'meteor', 'phantom',
  'safari', 'theory', 'vector', 'zenith', 'canyon', 'glacier', 'nebula'
];

export function generateChallenge(mode: GameMode, length: number): string {
  if (mode === 'Numbers') {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10).toString();
    }
    return result;
  }
  
  if (mode === 'Phone') {
    const prefixes = ['070', '080', '081', '090', '091'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    let middle = '';
    let end = '';
    for (let i = 0; i < 4; i++) {
      middle += Math.floor(Math.random() * 10).toString();
      end += Math.floor(Math.random() * 10).toString();
    }
    // Return standard formatted phone string
    return `(${prefix}) ${middle}-${end}`;
  }
  
  if (mode === 'Alphanumeric') {
    const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += pool.charAt(Math.floor(Math.random() * pool.length));
    }
    return result;
  }
  
  if (mode === 'Words') {
    // Generate a list of words, length determines how many words to include
    // E.g., for level 1 (3 digits) -> 2 words; level 13 (15 digits) -> 6 words
    const count = Math.max(2, Math.min(7, Math.floor(length / 2.5) + 1));
    const selected: string[] = [];
    const usedIndices = new Set<number>();
    
    while (selected.length < count) {
      const idx = Math.floor(Math.random() * WORD_BANK.length);
      if (!usedIndices.has(idx)) {
        usedIndices.add(idx);
        selected.push(WORD_BANK[idx]);
      }
    }
    return selected.join(' ');
  }
  
  return '';
}

export function normalizeStringForCompare(str: string, mode: GameMode): string {
  if (mode === 'Words') {
    // Keep words, strip extra spaces/punctuation, lowercase
    return str.toLowerCase().trim().replace(/\s+/g, ' ');
  }
  // Strip all non-alphanumeric chars and lowercase
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function checkAnswer(
  userInput: string, 
  correctAnswer: string, 
  mode: GameMode
): { success: boolean; correctDigits: number; totalDigits: number; details: { position: number; correct: boolean }[] } {
  
  if (mode === 'Words') {
    const userWords = userInput.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const correctWords = correctAnswer.toLowerCase().trim().split(/\s+/).filter(Boolean);
    
    const totalDigits = correctWords.length;
    let correctDigits = 0;
    const details: { position: number; correct: boolean }[] = [];
    
    for (let i = 0; i < totalDigits; i++) {
      const userW = userWords[i] || '';
      const correctW = correctWords[i];
      const isCorrect = userW === correctW;
      if (isCorrect) correctDigits++;
      details.push({ position: i, correct: isCorrect });
    }
    
    return {
      success: correctDigits === totalDigits && userWords.length === totalDigits,
      correctDigits,
      totalDigits,
      details
    };
  }
  
  // Clean strings for character-by-character comparison
  const userClean = normalizeStringForCompare(userInput, mode);
  const correctClean = normalizeStringForCompare(correctAnswer, mode);
  const totalDigits = correctClean.length;
  
  let correctDigits = 0;
  const details: { position: number; correct: boolean }[] = [];
  
  for (let i = 0; i < totalDigits; i++) {
    const userC = userClean[i] || '';
    const correctC = correctClean[i];
    const isCorrect = userC === correctC;
    if (isCorrect) correctDigits++;
    details.push({ position: i, correct: isCorrect });
  }
  
  return {
    success: userClean === correctClean,
    correctDigits,
    totalDigits,
    details
  };
}

export function calculateScore(
  correctDigits: number, 
  totalDigits: number, 
  timeElapsed: number, 
  timeToMemorize: number, 
  difficulty: string,
  hintsUsed: number
): number {
  const accuracy = correctDigits / totalDigits;
  
  let difficultyMult = 1.0;
  if (difficulty === 'Easy') difficultyMult = 1.0;
  else if (difficulty === 'Medium') difficultyMult = 1.35;
  else if (difficulty === 'Hard') difficultyMult = 1.8;
  else if (difficulty === 'Master' || difficulty === 'Expert') difficultyMult = 2.5;

  const baseScore = Math.floor(accuracy * 1000 * difficultyMult);
  const maxRecallTime = timeToMemorize * 2; // Allow double time for inputting
  const speedBonus = accuracy === 1.0 ? Math.max(0, Math.floor((maxRecallTime - timeElapsed) * 15 * difficultyMult)) : 0;
  
  const penalty = hintsUsed * 100;
  return Math.max(10, baseScore + speedBonus - penalty);
}