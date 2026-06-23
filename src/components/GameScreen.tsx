import React, { useState, useEffect, useRef } from 'react';
import { Level, GameResult, GameMode, PlayStyle, MnemonicTechnique } from '../types/game';
import { generateChallenge, checkAnswer, calculateScore } from '../utils/gameLogic';
import { audioEngine } from '../utils/audio';
import NumberDisplay from './NumberDisplay';
import InputField from './InputField';
import Timer from './Timer';

interface GameScreenProps {
  playStyle: PlayStyle;
  mode: GameMode;
  level: Level | null;
  difficulty: string;
  displayTime: number;
  recallTime: number;
  assistEnabled: boolean;
  keypadEnabled: boolean;
  timerEnabled?: boolean;
  timeAttackState?: {
    round: number;
    digits: number;
    lives: number;
  };
  onComplete: (result: GameResult) => void;
  onBack: () => void;
}

const FLASH_CARDS: Record<string, string> = {
  '0': '🥚',
  '1': '🕯️',
  '2': '🦢',
  '3': '🔱',
  '4': '⛵',
  '5': '🪝',
  '6': '🐘',
  '7': '🪓',
  '8': '⛄',
  '9': '🎈'
};

const PALACE_LOCATIONS = ['🚪 Door', '🛋️ Sofa', '🍽️ Table', '🪟 Window', '🪜 Stairs', '📚 Shelf', '📺 TV', '🛏️ Bed', '🛁 Tub'];

const GameScreen: React.FC<GameScreenProps> = ({
  playStyle,
  mode,
  level,
  difficulty,
  displayTime,
  recallTime,
  assistEnabled,
  keypadEnabled,
  timerEnabled = true,
  timeAttackState,
  onComplete,
  onBack,
}) => {
  const [phase, setPhase] = useState<'memorizing' | 'hidden' | 'inputting'>('memorizing');
  const [challenge, setChallenge] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [inputTime, setInputTime] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [hintMessage, setHintMessage] = useState<string>('');
  const [activeTechnique, setActiveTechnique] = useState<MnemonicTechnique>('Auto Coach');
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const inputTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize game parameters
  const getDigitCount = (): number => {
    if (playStyle === 'Classic' && level) return level.digitCount;
    if (playStyle === 'Time Attack' && timeAttackState) return timeAttackState.digits;
    
    // Practice mode counts
    if (difficulty === 'Easy') return 5;
    if (difficulty === 'Medium') return 7;
    if (difficulty === 'Hard') return 9;
    return 12; // Insane
  };

  const getDisplayDuration = (): number => {
    if (playStyle === 'Classic' && level) return level.timeToMemorize;
    return displayTime;
  };

  const getRecallDuration = (): number => {
    if (playStyle === 'Classic' && level) return level.timeToMemorize * 2.5;
    return recallTime;
  };

  const digitCount = getDigitCount();
  const actualDisplayTime = getDisplayDuration();

  // Reset challenge on mount or restart
  useEffect(() => {
    const generationMode = mode === 'Flash Cards' ? 'Numbers' : mode;
    const chall = generateChallenge(generationMode, digitCount);
    setChallenge(chall);
    setPhase('memorizing');
    setUserInput('');
    setInputTime(0);
    setHintsUsed(0);
    setHintMessage('');
    setIsPaused(false);
    
    if (inputTimeIntervalRef.current) {
      clearInterval(inputTimeIntervalRef.current);
      inputTimeIntervalRef.current = null;
    }
  }, [playStyle, mode, level, difficulty, timeAttackState]);

  // Track user input speed in recall phase
  useEffect(() => {
    if (phase === 'inputting' && !isPaused) {
      inputTimeIntervalRef.current = setInterval(() => {
        setInputTime(prev => prev + 0.1);
      }, 100);
    } else {
      if (inputTimeIntervalRef.current) {
        clearInterval(inputTimeIntervalRef.current);
        inputTimeIntervalRef.current = null;
      }
    }
    return () => {
      if (inputTimeIntervalRef.current) {
        clearInterval(inputTimeIntervalRef.current);
      }
    };
  }, [phase, isPaused]);

  const handleMemorizeComplete = () => {
    if (timerEnabled) {
      setPhase('hidden');
    } else {
      // Skip the hidden phase entirely when timer is disabled
      setPhase('inputting');
    }
  };

  const handleHiddenComplete = () => {
    setPhase('inputting');
  };

  const handleSubmit = (input: string) => {
    const checkMode = mode === 'Flash Cards' ? 'Numbers' : mode;
    const comp = checkAnswer(input, challenge, checkMode);
    const calculated = calculateScore(
      comp.correctDigits,
      comp.totalDigits,
      inputTime,
      actualDisplayTime,
      difficulty,
      hintsUsed
    );

    const gameResult: GameResult = {
      success: comp.success,
      score: calculated,
      timeElapsed: inputTime,
      correctDigits: comp.correctDigits,
      totalDigits: comp.totalDigits,
      correctAnswer: challenge,
      userAnswer: input,
    };
    
    if (comp.success) {
      audioEngine.playCorrect();
    } else {
      audioEngine.playWrong();
    }

    onComplete(gameResult);
  };

  // Hint Logic
  const handleUseHint = () => {
    audioEngine.playClick();
    setHintsUsed(prev => prev + 1);

    if (mode === 'Words') {
      const correctWords = challenge.split(' ');
      const userWords = userInput.trim().split(/\s+/).filter(Boolean);
      const nextWordIdx = userWords.length;
      if (nextWordIdx < correctWords.length) {
        const wordHint = correctWords[nextWordIdx];
        setHintMessage(`Next word: "${wordHint}"`);
        // Append automatically
        userWords.push(wordHint);
        setUserInput(userWords.join(' '));
      } else {
        setHintMessage(`All words entered!`);
      }
    } else {
      // Find index of first mismatch or next empty position
      const cleanChallenge = challenge.replace(/[^a-zA-Z0-9]/g, '');
      const cleanInput = userInput.replace(/[^a-zA-Z0-9]/g, '');
      const nextCharIdx = cleanInput.length;
      if (nextCharIdx < cleanChallenge.length) {
        const nextChar = cleanChallenge[nextCharIdx].toUpperCase();
        setHintMessage(`Next character: "${nextChar}"`);
        setUserInput(userInput + nextChar);
      } else {
        setHintMessage(`Already filled!`);
      }
    }
    
    // Auto clear hint message after 3 seconds
    setTimeout(() => {
      setHintMessage('');
    }, 3000);
  };

  // Generate dynamic Coach tips based on the current challenge
  const getCoachMnemonic = (): string => {
    let displayChallenge = phase === 'memorizing' 
      ? challenge 
      : challenge.replace(/[a-zA-Z0-9]/g, 'X'); // Mask digits/letters if not in memorize phase
      
    if (mode === 'Flash Cards' && phase === 'memorizing') {
      displayChallenge = challenge.split('').map(c => FLASH_CARDS[c] || c).join(' ');
    }
      
    if (mode === 'Words') {
      const wList = phase === 'memorizing' 
        ? challenge.split(' ') 
        : challenge.split(' ').map(() => '[Word]');

      if (activeTechnique === 'Chunking') {
        return `Pair the words into sub-phrases:\n` + 
               wList.map((w, idx) => idx % 2 === 0 ? `(${w}` : `${w})`).join(' ') + 
               `\nIt is easier to recall pairs than singular random items.`;
      }
      if (activeTechnique === 'Memory Palace') {
        return `Place each word in a room along your mental walkway:\n` + 
               wList.map((w, idx) => `${PALACE_LOCATIONS[idx % PALACE_LOCATIONS.length]}: ${w}`).join('\n');
      }
      if (activeTechnique === 'Story Link') {
        return `Imagine a funny connection: "A giant ${wList[0]} jumps onto a ${wList[1] || 'shelf'} and starts eating a ${wList[2] || 'banana'}." Make it vivid!`;
      }
      return `Say the words aloud in a steady, rhythmic cadence. Rhythmic beats anchor verbal sequences.`;
    }

    // Numbers & Alphanumeric
    const cleanChars = displayChallenge.replace(/[^a-zA-Z0-9X]/g, '');
    const chunks: string[] = [];
    for (let i = 0; i < cleanChars.length; i += 3) {
      chunks.push(cleanChars.slice(i, i + 3));
    }

    if (activeTechnique === 'Chunking') {
      return `Split the sequence into smaller groups of 3:\n` + 
             chunks.join(' · ') + 
             `\nStudy each block as a single unit instead of individual digits.`;
    }
    if (activeTechnique === 'Memory Palace') {
      return `Associate each chunk with a location in your Memory Palace:\n` + 
             chunks.map((chunk, idx) => `${PALACE_LOCATIONS[idx % PALACE_LOCATIONS.length]} &rarr; ${chunk}`).join('\n');
    }
    if (activeTechnique === 'Story Link') {
      return `Turn chunks into shapes or words (e.g. ${chunks[0]} = object, ${chunks[1] || '99'} = person) and link them in an absurd visual story.`;
    }
    return `Say the groups with pauses: "${chunks.join(', ')}". Repeat the auditory pattern in your mind.`;
  };

  // Get chunks array for Visual Assistance overlay
  const getAssistedChunks = () => {
    if (mode === 'Words') {
      return challenge.split(' ').map((w, idx) => ({ text: w, index: idx }));
    }
    const cleanStr = challenge.replace(/[^a-zA-Z0-9]/g, '');
    const chunksList: { text: string; index: number }[] = [];
    let chunkIdx = 0;
    for (let i = 0; i < cleanStr.length; i += 3) {
      chunksList.push({
        text: cleanStr.slice(i, i + 3),
        index: chunkIdx++
      });
    }
    return chunksList;
  };

  return (
    <div className="w-full min-h-screen bg-theme-app flex flex-col justify-between p-6 text-theme-main">
      {/* Header Info */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between border-b border-theme pb-4">
        <div>
          <span className="text-xs font-bold text-theme-primary uppercase tracking-widest bg-theme-primary/10 border border-theme-primary/20 px-3 py-1 rounded-full">
            {playStyle === 'Classic' ? `Campaign Level ${level?.id}` : playStyle}
          </span>
          <div className="flex items-center space-x-3 mt-1">
            <h2 className="text-2xl font-black text-theme-main uppercase tracking-wider">
              {playStyle === 'Classic' ? level?.name : `${mode} Arena`}
            </h2>
            <button
              onClick={() => { audioEngine.playClick(); setIsPaused(!isPaused); }}
              className="bg-theme-input border border-theme px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-theme-card-hover transition-colors"
            >
              {isPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button
              onClick={() => {
                audioEngine.playClick();
                const chall = generateChallenge(mode === 'Flash Cards' ? 'Numbers' : mode, digitCount);
                setChallenge(chall);
                setPhase('memorizing');
                setUserInput('');
                setInputTime(0);
                setHintsUsed(0);
                setHintMessage('');
                setIsPaused(false);
              }}
              className="bg-theme-input border border-theme px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-theme-card-hover transition-colors"
            >
              ↻ Restart
            </button>
          </div>
        </div>

        {/* Time Attack stats */}
        {playStyle === 'Time Attack' && timeAttackState && (
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <span className="block text-[10px] font-bold text-theme-muted uppercase">Round</span>
              <span className="text-lg font-black text-theme-secondary">{timeAttackState.round}</span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-bold text-theme-muted uppercase">Lives</span>
              <span className="text-lg font-black text-red-500">{'❤️'.repeat(timeAttackState.lives)}</span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-bold text-theme-muted uppercase">Length</span>
              <span className="text-lg font-black text-theme-accent">{timeAttackState.digits} chars</span>
            </div>
          </div>
        )}

        {/* General Practice Info */}
        {playStyle === 'Practice' && (
          <div className="flex space-x-4 text-xs font-bold">
            <div className="bg-theme-card border border-theme px-3 py-1.5 rounded-xl uppercase">
              Mode: <span className="text-theme-secondary">{mode}</span>
            </div>
            <div className="bg-theme-card border border-theme px-3 py-1.5 rounded-xl uppercase">
              Diff: <span className="text-theme-primary">{difficulty}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Gameplay on left, Coach on right */}
      <div className="max-w-5xl w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-6">
        
        {/* Left column: Gameplay components (7 cols or 8 cols depending on phase) */}
        <div className={`lg:col-span-8 flex flex-col items-center justify-center p-6 bg-theme-card border border-theme rounded-3xl shadow-theme-glow min-h-[400px]`}>
          
          {/* Phase timers */}
          <div className="mb-6">
            {phase === 'memorizing' && (
              timerEnabled ? (
                <Timer mode="countdown" duration={actualDisplayTime} isPaused={isPaused} onComplete={handleMemorizeComplete} />
              ) : (
                <div className="flex justify-center">
                  <button onClick={handleMemorizeComplete} className="bg-theme-secondary hover:opacity-90 text-white font-bold px-6 py-2 rounded-xl shadow-theme-glow transition-all uppercase tracking-wider text-sm">Ready to Recall</button>
                </div>
              )
            )}
            {phase === 'hidden' && (
              timerEnabled ? (
                <Timer mode="countdown" duration={1.5} isPaused={isPaused} onComplete={handleHiddenComplete} />
              ) : null
            )}
            {phase === 'inputting' && (
              <div className="flex items-center space-x-4 bg-theme-input px-4 py-2 border border-theme rounded-full">
                <span className="text-xs font-bold text-theme-muted">RECALL TIME</span>
                <span className="font-mono font-bold text-theme-primary">{inputTime.toFixed(1)}s</span>
              </div>
            )}
          </div>

          {/* Main Visuals based on game phase */}
          <div className="w-full flex-1 flex flex-col items-center justify-center py-6">
            
            {isPaused ? (
              <div className="text-center w-full bg-theme-input border border-theme p-8 rounded-3xl animate-pulse">
                <h3 className="text-4xl font-black text-theme-main mb-3 uppercase tracking-widest">Paused</h3>
                <p className="text-xs text-theme-muted font-bold tracking-wider uppercase">Screen hidden to prevent cheating</p>
                <button
                  onClick={() => { audioEngine.playClick(); setIsPaused(false); }}
                  className="mt-6 px-8 py-3 bg-theme-primary text-white font-bold rounded-xl shadow-theme-glow hover:opacity-90 transition-all uppercase"
                >
                  Resume Match
                </button>
              </div>
            ) : (
              <>
                {phase === 'memorizing' && (
                  <div className="text-center w-full">
                    {/* Standard display or assisted chunks */}
                    {assistEnabled ? (
                      <div className="flex flex-wrap justify-center gap-4 max-w-xl mx-auto">
                        {getAssistedChunks().map((chunk, idx) => (
                          <div key={idx} className="flex flex-col items-center p-4 bg-theme-input border border-theme rounded-2xl min-w-[100px] shadow-sm">
                            <span className="font-mono text-4xl font-extrabold text-theme-accent tracking-wide">
                              {mode === 'Flash Cards' ? chunk.text.split('').map(c => FLASH_CARDS[c] || c).join(' ') : chunk.text}
                            </span>
                            <span className="text-[10px] font-bold text-theme-muted uppercase mt-2">
                              {PALACE_LOCATIONS[chunk.index % PALACE_LOCATIONS.length]}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <NumberDisplay number={mode === 'Flash Cards' ? challenge.split('').map(c => FLASH_CARDS[c] || c).join(' ') : challenge} isVisible={true} animated={true} />
                    )}
                    <p className="text-xs text-theme-muted uppercase font-bold tracking-widest mt-6">Memorize the sequence</p>
                  </div>
                )}

                {phase === 'hidden' && (
                  <div className="text-center">
                    <h3 className="text-4xl font-black text-theme-main mb-3 animate-pulse">GET READY</h3>
                    <p className="text-sm text-theme-muted uppercase tracking-wider font-semibold">Prepare to input sequence from memory.</p>
                  </div>
                )}

                {phase === 'inputting' && (
                  <div className="w-full space-y-4">
                    <InputField
                      maxDigits={digitCount}
                      onSubmit={handleSubmit}
                      value={userInput}
                      onChange={setUserInput}
                      mode={mode}
                      correctAnswer={challenge}
                      showKeypad={keypadEnabled}
                    />
                    
                    {/* Hints and helper indicators */}
                    <div className="flex flex-col items-center justify-center space-y-2 mt-4">
                      {hintMessage && (
                        <div className="text-xs font-bold text-theme-secondary bg-theme-secondary/10 px-3 py-1.5 rounded-lg border border-theme-secondary/20">
                          💡 {hintMessage}
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs font-bold text-theme-muted">
                        <span>LENGTH: {digitCount}</span>
                        <span>•</span>
                        <span>ENTERED: {mode === 'Words' ? userInput.split(' ').filter(Boolean).length : userInput.length}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>

          {/* Input phase specific action buttons: Hint button */}
          {phase === 'inputting' && (
            <div className="mt-4 pt-4 border-t border-theme w-full flex justify-center">
              <button
                onClick={handleUseHint}
                className="flex items-center space-x-2 text-xs font-bold text-theme-secondary hover:underline bg-theme-input border border-theme px-4 py-2 rounded-xl"
              >
                <span>💡 Reveal Hint</span>
                <span className="text-[9px] bg-theme-card border border-theme px-1.5 py-0.5 rounded text-theme-muted uppercase">
                  Penalized
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Right column: Auto Coach Panel (4 cols) */}
        <div className="lg:col-span-4 bg-theme-card border border-theme rounded-3xl p-6 shadow-theme-glow h-full min-h-[400px] flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-theme pb-3 mb-4">
              <span className="text-xl">🤖</span>
              <h3 className="text-lg font-black text-theme-main uppercase tracking-wider">Auto Coach advisor</h3>
            </div>

            {/* Selector tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-theme-input border border-theme rounded-xl mb-4 text-xs font-bold">
              {(['Chunking', 'Memory Palace', 'Story Link', 'Sound/Rhythm'] as MnemonicTechnique[]).map((tech) => (
                <button
                  key={tech}
                  onClick={() => { audioEngine.playClick(); setActiveTechnique(tech); }}
                  className={`py-2 px-1 rounded-lg text-center transition-all ${
                    activeTechnique === tech
                      ? 'bg-theme-secondary text-white shadow-theme-glow'
                      : 'hover:bg-theme-card-hover text-theme-muted'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>

            {/* Coach instruction text */}
            <div className="bg-theme-input border border-theme p-4 rounded-2xl min-h-[180px] flex flex-col justify-between">
              <div className="text-xs text-theme-muted leading-relaxed whitespace-pre-line font-medium">
                {getCoachMnemonic()}
              </div>
              <div className="mt-4 text-[10px] font-bold text-theme-secondary bg-theme-card border border-theme p-2 rounded-lg text-center uppercase tracking-wider">
                Current Style: {activeTechnique}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-theme-muted italic text-center mt-6">
            Practice using different mnemonics to boost memory scores.
          </div>
        </div>

      </div>

      {/* Footer / Back button */}
      <div className="max-w-5xl w-full mx-auto flex justify-between items-center pt-4 border-t border-theme">
        <button
          onClick={() => { audioEngine.playClick(); onBack(); }}
          className="px-6 py-2.5 bg-theme-input hover:bg-theme-card-hover border border-theme text-theme-main font-bold rounded-xl text-xs uppercase tracking-wider"
        >
          &larr; Quit Match
        </button>
        <span className="text-xs text-theme-muted">
          Active Mode: <span className="font-bold text-theme-primary uppercase">{playStyle}</span>
        </span>
      </div>
    </div>
  );
};

export default GameScreen;