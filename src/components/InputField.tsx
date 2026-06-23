import React, { useRef, useEffect, useState } from 'react';
import { GameMode } from '../types/game';
import { WORD_BANK } from '../utils/gameLogic';
import { audioEngine } from '../utils/audio';

interface InputFieldProps {
  maxDigits: number;
  onSubmit: (value: string) => void;
  value: string;
  onChange: (value: string) => void;
  mode: GameMode;
  correctAnswer: string;
  showKeypad?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  maxDigits,
  onSubmit,
  value,
  onChange,
  mode,
  correctAnswer,
  showKeypad = true,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [wordOptions, setWordOptions] = useState<string[]>([]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Generate word options for 'Words' mode
  useEffect(() => {
    if (mode === 'Words') {
      const correctWords = correctAnswer.split(' ').filter(Boolean);
      const distractors: string[] = [];
      while (distractors.length < 6) {
        const word = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
        if (!correctWords.includes(word) && !distractors.includes(word)) {
          distractors.push(word);
        }
      }
      const combined = [...correctWords, ...distractors];
      // Shuffle combined
      for (let i = combined.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [combined[i], combined[j]] = [combined[j], combined[i]];
      }
      setWordOptions(combined);
    }
  }, [mode, correctAnswer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newVal = e.target.value;
    if (mode === 'Numbers') {
      newVal = newVal.replace(/\D/g, '').slice(0, maxDigits);
    } else if (mode === 'Phone') {
      newVal = newVal.replace(/[^0-9()\- ]/g, '').slice(0, maxDigits + 5); // allow formatting characters
    } else if (mode === 'Alphanumeric') {
      newVal = newVal.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, maxDigits);
    }
    onChange(newVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      audioEngine.playClick();
      onSubmit(value);
    }
  };

  const handleKeyPress = (char: string) => {
    audioEngine.playClick();
    if (mode === 'Words') {
      const currentWords = value.trim().split(/\s+/).filter(Boolean);
      const targetWordCount = correctAnswer.split(' ').filter(Boolean).length;
      if (currentWords.length < targetWordCount) {
        currentWords.push(char);
        onChange(currentWords.join(' '));
      }
    } else {
      if (value.length < maxDigits) {
        onChange(value + char);
      }
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClear = () => {
    audioEngine.playClick();
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSubmit = () => {
    audioEngine.playClick();
    onSubmit(value);
  };

  const handleBackspace = () => {
    audioEngine.playClick();
    if (mode === 'Words') {
      const currentWords = value.trim().split(/\s+/).filter(Boolean);
      currentWords.pop();
      onChange(currentWords.join(' '));
    } else {
      onChange(value.slice(0, -1));
    }
  };

  // Rendering display elements
  const renderDisplay = () => {
    if (mode === 'Words') {
      const targetWords = correctAnswer.split(' ').filter(Boolean);
      const currentWords = value.split(' ').filter(Boolean);
      
      return (
        <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
          {targetWords.map((_, idx) => {
            const word = currentWords[idx] || '';
            return (
              <div
                key={idx}
                className={`px-6 py-3 border-2 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-300 min-w-[100px] h-14 ${
                  word
                    ? 'bg-theme-secondary border-theme-secondary text-white shadow-theme-glow scale-105'
                    : 'bg-theme-input border-theme text-theme-muted'
                }`}
              >
                {word || '...'}
              </div>
            );
          })}
        </div>
      );
    }

    if (mode === 'Phone') {
      // Show character boxes for numbers inside the phone string
      const rawDigits = value.replace(/\D/g, '');
      const expectedDigitsCount = correctAnswer.replace(/\D/g, '').length;
      
      const boxes = Array.from({ length: expectedDigitsCount }, (_, i) => rawDigits[i] || '');
      // Chunk in groups of 3 or 4: (prefix) middle - end -> e.g. 3, 4, 4
      const groups = [boxes.slice(0, 3), boxes.slice(3, 7), boxes.slice(7)];

      return (
        <div className="flex flex-wrap justify-center items-center space-x-3">
          {/* Prefix Group */}
          <div className="flex space-x-1.5 items-center">
            <span className="text-xl font-bold text-theme-muted">(</span>
            {groups[0].map((digit, idx) => (
              <div
                key={idx}
                className={`w-12 h-14 border-2 rounded-xl flex items-center justify-center text-xl font-black font-mono transition-all duration-200 ${
                  digit
                    ? 'bg-theme-primary border-theme-primary text-white shadow-theme-glow'
                    : 'bg-theme-input border-theme text-theme-muted'
                }`}
              >
                {digit}
              </div>
            ))}
            <span className="text-xl font-bold text-theme-muted">)</span>
          </div>

          <span className="text-theme-muted font-bold">-</span>

          {/* Middle Group */}
          <div className="flex space-x-1.5">
            {groups[1].map((digit, idx) => (
              <div
                key={idx}
                className={`w-12 h-14 border-2 rounded-xl flex items-center justify-center text-xl font-black font-mono transition-all duration-200 ${
                  digit
                    ? 'bg-theme-primary border-theme-primary text-white shadow-theme-glow'
                    : 'bg-theme-input border-theme text-theme-muted'
                }`}
              >
                {digit}
              </div>
            ))}
          </div>

          <span className="text-theme-muted font-bold">-</span>

          {/* End Group */}
          <div className="flex space-x-1.5">
            {groups[2].map((digit, idx) => (
              <div
                key={idx}
                className={`w-12 h-14 border-2 rounded-xl flex items-center justify-center text-xl font-black font-mono transition-all duration-200 ${
                  digit
                    ? 'bg-theme-primary border-theme-primary text-white shadow-theme-glow'
                    : 'bg-theme-input border-theme text-theme-muted'
                }`}
              >
                {digit}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Default: Numbers or Alphanumeric
    const digits = Array.from({ length: maxDigits }, (_, i) => value[i] || '');
    // Group in sets of 3 for styling layout
    const grouped: string[][] = [];
    for (let i = 0; i < digits.length; i += 3) {
      grouped.push(digits.slice(i, i + 3));
    }

    return (
      <div className="flex flex-wrap justify-center gap-4">
        {grouped.map((group, gIdx) => (
          <div key={gIdx} className="flex space-x-1.5">
            {group.map((digit, dIdx) => (
              <div
                key={dIdx}
                className={`w-12 h-14 md:w-14 md:h-16 border-2 rounded-xl flex items-center justify-center text-2xl font-black font-mono transition-all duration-200 ${
                  digit
                    ? 'bg-theme-primary border-theme-primary text-white shadow-theme-glow scale-105'
                    : 'bg-theme-input border-theme text-theme-muted'
                }`}
              >
                {digit}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Rendering custom virtual keypad
  const renderKeypad = () => {
    if (mode === 'Words') {
      return (
        <div className="bg-theme-card border border-theme p-4 rounded-3xl w-full max-w-xl shadow-theme-glow mt-4">
          <div className="text-[10px] font-bold text-theme-muted uppercase tracking-widest text-center mb-3">
            Select Words in Order
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {wordOptions.map((word) => (
              <button
                key={word}
                onClick={() => handleKeyPress(word)}
                className="px-4 py-2 text-sm font-bold bg-theme-input hover:bg-theme-card-hover border border-theme text-theme-main rounded-xl transition-all"
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (mode === 'Alphanumeric') {
      const keysRow1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
      const keysRow2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
      const keysRow3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];
      const nums = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

      return (
        <div className="bg-theme-card border border-theme p-4 rounded-3xl w-full max-w-2xl shadow-theme-glow mt-4 space-y-2">
          {/* Numbers row */}
          <div className="flex justify-center gap-1.5">
            {nums.map(n => (
              <button
                key={n}
                onClick={() => handleKeyPress(n)}
                className="w-10 h-10 font-bold bg-theme-input hover:bg-theme-card-hover border border-theme text-theme-main rounded-lg transition-all"
              >
                {n}
              </button>
            ))}
          </div>
          {/* Keyboard rows */}
          <div className="flex justify-center gap-1.5">
            {keysRow1.map(k => (
              <button
                key={k}
                onClick={() => handleKeyPress(k)}
                className="w-10 h-10 font-bold bg-theme-input hover:bg-theme-card-hover border border-theme text-theme-main rounded-lg transition-all"
              >
                {k}
              </button>
            ))}
          </div>
          <div className="flex justify-center gap-1.5">
            {keysRow2.map(k => (
              <button
                key={k}
                onClick={() => handleKeyPress(k)}
                className="w-10 h-10 font-bold bg-theme-input hover:bg-theme-card-hover border border-theme text-theme-main rounded-lg transition-all"
              >
                {k}
              </button>
            ))}
          </div>
          <div className="flex justify-center gap-1.5">
            <button
              onClick={handleBackspace}
              className="w-14 h-10 font-bold bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-lg transition-all text-xs"
            >
              ⌫
            </button>
            {keysRow3.map(k => (
              <button
                key={k}
                onClick={() => handleKeyPress(k)}
                className="w-10 h-10 font-bold bg-theme-input hover:bg-theme-card-hover border border-theme text-theme-main rounded-lg transition-all"
              >
                {k}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="w-14 h-10 font-bold bg-theme-input hover:bg-theme-card-hover border border-theme text-theme-muted rounded-lg transition-all text-xs"
            >
              Clear
            </button>
          </div>
        </div>
      );
    }

    // Classic Numpad for Numbers & Phone
    return (
      <div className="grid grid-cols-3 gap-3 w-64 mt-4 bg-theme-card border border-theme p-4 rounded-3xl shadow-theme-glow">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="w-16 h-14 bg-theme-input hover:bg-theme-card-hover border border-theme text-xl font-bold text-theme-main rounded-2xl flex items-center justify-center transition-all"
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleBackspace}
          className="w-16 h-14 bg-red-500/15 hover:bg-red-500/25 border border-red-500/25 text-lg font-bold text-red-500 rounded-2xl flex items-center justify-center transition-all"
        >
          ⌫
        </button>
        <button
          onClick={() => handleKeyPress('0')}
          className="w-16 h-14 bg-theme-input hover:bg-theme-card-hover border border-theme text-xl font-bold text-theme-main rounded-2xl flex items-center justify-center transition-all"
        >
          0
        </button>
        <button
          onClick={handleClear}
          className="w-16 h-14 bg-theme-input hover:bg-theme-card-hover border border-theme text-sm font-bold text-theme-muted rounded-2xl flex items-center justify-center transition-all"
        >
          Clear
        </button>
      </div>
    );
  };

  return (
    <div 
      className="flex flex-col items-center space-y-6 w-full cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Hidden input to handle key events */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="absolute opacity-0"
        inputMode={mode === 'Alphanumeric' ? 'text' : 'numeric'}
        maxLength={mode === 'Words' ? undefined : maxDigits + 5}
        autoFocus
      />

      {/* Structured boxes */}
      {renderDisplay()}

      {/* Keypad */}
      {showKeypad && renderKeypad()}

      {/* Actions */}
      <div className="flex space-x-4 pt-2">
        <button
          onClick={handleClear}
          className="px-6 py-3 bg-theme-input border border-theme text-theme-main rounded-xl font-bold hover:bg-theme-card-hover transition-colors"
        >
          Clear All
        </button>
        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-theme-primary text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-theme-glow"
        >
          Submit Response
        </button>
      </div>
    </div>
  );
};

export default InputField;