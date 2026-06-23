import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import MainMenu from './components/MainMenu';
import GameScreen from './components/GameScreen';
import ResultsScreen from './components/ResultsScreen';
import { Level, GameResult, Profile, GameMode, PlayStyle, Achievement } from './types/game';
import {
  loadActiveProfile,
  saveActiveProfile,
  setActiveProfileName,
  updateStreakAndDate,
  updateXPAndLevel,
  progressQuest,
} from './utils/storage';
import { levels } from './data/levels';
import { achievements } from './data/achievements';
import { audioEngine } from './utils/audio';

const App: React.FC = () => {
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'menu' | 'game' | 'results'>('landing');
  const [playStyle, setPlayStyle] = useState<PlayStyle>('Classic');
  const [gameMode, setGameMode] = useState<GameMode>('Numbers');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [difficulty, setDifficulty] = useState('Medium');
  const [displayTime, setDisplayTime] = useState(3.0);
  const [recallTime, setRecallTime] = useState(9.0);
  const [assistEnabled, setAssistEnabled] = useState(true);
  const [practiceTimerEnabled, setPracticeTimerEnabled] = useState(true);
  const [taState, setTaState] = useState<{ round: number; digits: number; lives: number; score: number } | null>(null);
  const [lastResult, setLastResult] = useState<(GameResult & { isHighScore: boolean; unlockedAchievements: Achievement[]; canGoNext: boolean }) | null>(null);

  useEffect(() => {
    const prof = loadActiveProfile();
    if (prof) {
      setActiveProfile(prof);
      audioEngine.setVolume(prof.soundVolume);
      setAssistEnabled(prof.assistEnabled);
      setCurrentScreen('menu');
    } else {
      setCurrentScreen('landing');
    }
  }, []);

  const handleProfileSelect = (profile: Profile) => {
    const updated = updateStreakAndDate(profile);
    saveActiveProfile(updated);
    setActiveProfile(updated);
    audioEngine.setVolume(updated.soundVolume);
    setAssistEnabled(updated.assistEnabled);
    setCurrentScreen('menu');
  };

  const handleLogout = () => { setActiveProfileName(null); setActiveProfile(null); setCurrentScreen('landing'); };
  const handleProfileUpdate = (updated: Profile) => { saveActiveProfile(updated); setActiveProfile(updated); setAssistEnabled(updated.assistEnabled); };

  const handleContinueCampaign = () => {
    if (!activeProfile) return;
    const lastCompletedId = activeProfile.completedLevels.length > 0 
      ? Math.max(...activeProfile.completedLevels) 
      : 0;
    const nextLevel = levels.find(l => l.id === lastCompletedId + 1) || levels[0];
    handleLevelSelect(nextLevel);
  };

  const handleLevelSelect = (level: Level) => {
    setPlayStyle('Classic'); setGameMode('Numbers'); setSelectedLevel(level);
    setAssistEnabled(activeProfile?.assistEnabled ?? true); setCurrentScreen('game');
  };

  const handleStartPractice = (mode: GameMode, diff: string, dispT: number, recT: number, assist: boolean, timerEnabled: boolean) => {
    setPlayStyle('Practice'); setGameMode(mode); setSelectedLevel(null);
    setDifficulty(diff); setDisplayTime(dispT); setRecallTime(recT); setAssistEnabled(assist); setPracticeTimerEnabled(timerEnabled); setCurrentScreen('game');
  };

  const handleStartTimeAttack = (diff: string) => {
    setPlayStyle('Time Attack'); setGameMode('Numbers'); setSelectedLevel(null); setDifficulty(diff);
    let startDigits = 3;
    if (diff === 'Medium') startDigits = 5;
    else if (diff === 'Hard') startDigits = 7;
    setTaState({ round: 1, digits: startDigits, lives: 3, score: 0 });
    setAssistEnabled(activeProfile?.assistEnabled ?? true); setCurrentScreen('game');
  };

  // ── Achievement Checker (20 achievements) ──
  const checkAchievements = (result: GameResult, prof: Profile): Achievement[] => {
    const unlocked: Achievement[] = [];
    const perfectCount = parseInt(localStorage.getItem(`perfectCount_${prof.username}`) || '0');
    let newPerfectCount = perfectCount;
    if (result.success && result.correctDigits === result.totalDigits) {
      newPerfectCount++;
      localStorage.setItem(`perfectCount_${prof.username}`, newPerfectCount.toString());
    }

    achievements.forEach(ach => {
      if (prof.achievements.includes(ach.id)) return;
      let met = false;

      switch (ach.id) {
        // Progression
        case 'first-steps':      met = result.success && prof.completedLevels.length >= 1; break;
        case 'memory-novice':    met = prof.completedLevels.length >= 5; break;
        case 'apprentice':       met = prof.completedLevels.length >= 15; break;
        case 'journeyman':       met = prof.completedLevels.length >= 30; break;
        case 'veteran':          met = prof.completedLevels.length >= 50; break;
        case 'master-memorizer': met = prof.completedLevels.length >= 100; break;
        // Speed
        case 'speed-demon':      met = result.success && result.timeElapsed < 5; break;
        case 'lightning-fast':   met = result.success && result.totalDigits >= 10 && result.timeElapsed < 10; break;
        case 'time-warp':        met = result.success && result.totalDigits >= 12 && result.timeElapsed < 15; break;
        // Accuracy
        case 'perfect-memory':   met = newPerfectCount >= 3; break;
        case 'flawless-streak':  met = newPerfectCount >= 10; break;
        // Persistence
        case 'persistent':       met = prof.totalGamesPlayed >= 50; break;
        case 'dedicated':        met = prof.totalGamesPlayed >= 150; break;
        case 'marathon-runner':  met = prof.totalGamesPlayed >= 500; break;
        // Streaks
        case 'on-fire':          met = prof.dailyStreak >= 3; break;
        case 'week-warrior':     met = prof.dailyStreak >= 7; break;
        // Mode Mastery
        case 'phone-whiz':       met = (prof.highScores['practice_Phone'] || 0) >= 800; break;
        case 'code-cracker':     met = (prof.highScores['practice_Alphanumeric'] || 0) >= 800; break;
        case 'wordsmith':        met = (prof.highScores['practice_Words'] || 0) >= 800; break;
        // Score
        case 'high-roller':      met = result.score >= 1500; break;
      }

      if (met) unlocked.push(ach);
    });

    return unlocked;
  };

  const handleGameComplete = (result: GameResult) => {
    if (!activeProfile) return;
    let prof = { ...activeProfile };
    prof.totalGamesPlayed += 1;

    let isHighScore = false;
    let scoreEarned = result.score;
    let showNext = false;

    if (playStyle === 'Classic') prof = progressQuest(prof, 'Campaign', 1);
    else if (playStyle === 'Practice') prof = progressQuest(prof, 'Practice', 1);
    prof = progressQuest(prof, 'Score', scoreEarned);

    const { profile: xpProf, leveledUp } = updateXPAndLevel(prof, scoreEarned);
    prof = xpProf;
    if (leveledUp) setTimeout(() => audioEngine.playLevelUp(), 1500);

    if (playStyle === 'Classic' && selectedLevel) {
      const cur = prof.highScores[selectedLevel.id] || 0;
      if (scoreEarned > cur) { prof.highScores[selectedLevel.id] = scoreEarned; isHighScore = true; }
      if (result.success) {
        if (!prof.completedLevels.includes(selectedLevel.id)) prof.completedLevels.push(selectedLevel.id);
        showNext = selectedLevel.id < levels.length;
      }
    } else if (playStyle === 'Practice') {
      const key = `practice_${gameMode}`;
      const cur = prof.highScores[key] || 0;
      if (scoreEarned > cur) { prof.highScores[key] = scoreEarned; isHighScore = true; }
    } else if (playStyle === 'Time Attack' && taState) {
      if (result.success) {
        const ns = taState.score + scoreEarned;
        setTaState({ round: taState.round + 1, digits: taState.digits + 1, lives: taState.lives, score: ns });
        showNext = true; scoreEarned = ns;
      } else {
        const nl = taState.lives - 1;
        if (nl > 0) {
          setTaState({ round: taState.round + 1, digits: taState.digits, lives: nl, score: taState.score });
          showNext = true; scoreEarned = taState.score;
        } else {
          const key = 'time_attack';
          const cur = prof.highScores[key] || 0;
          if (taState.score > cur) { prof.highScores[key] = taState.score; isHighScore = true; }
          scoreEarned = taState.score; setTaState(null);
        }
      }
    }

    const newAch = checkAchievements(result, prof);
    if (newAch.length > 0) {
      setTimeout(() => audioEngine.playAchievement(), 800);
      newAch.forEach(a => prof.achievements.push(a.id));
    }

    saveActiveProfile(prof);
    setActiveProfile(prof);
    setLastResult({ ...result, score: scoreEarned, isHighScore, unlockedAchievements: newAch, canGoNext: showNext });
    setCurrentScreen('results');
  };

  const handleRetry = () => { if (playStyle === 'Time Attack') handleStartTimeAttack(difficulty); else setCurrentScreen('game'); };
  const handleNextLevel = () => {
    if (playStyle === 'Classic' && selectedLevel) {
      const next = levels.find(l => l.id === selectedLevel.id + 1);
      if (next) { setSelectedLevel(next); setCurrentScreen('game'); } else setCurrentScreen('menu');
    } else if (playStyle === 'Time Attack') setCurrentScreen('game');
  };
  const handleBackToMenu = () => { setTaState(null); setCurrentScreen('menu'); };

  return (
    <div className={`theme-${activeProfile?.theme || 'midnight-glass'} bg-theme-app min-h-screen transition-all duration-300 w-full`}>
      {currentScreen === 'landing' && <LandingPage onProfileSelect={handleProfileSelect} />}
      {currentScreen === 'menu' && activeProfile && <MainMenu profile={activeProfile} onLevelSelect={handleLevelSelect} onContinueCampaign={handleContinueCampaign} onStartPractice={handleStartPractice} onStartTimeAttack={handleStartTimeAttack} onProfileUpdate={handleProfileUpdate} onLogout={handleLogout} />}
      {currentScreen === 'game' && activeProfile && <GameScreen playStyle={playStyle} mode={gameMode} level={selectedLevel} difficulty={difficulty} displayTime={displayTime} recallTime={recallTime} assistEnabled={assistEnabled} keypadEnabled={activeProfile.keypadEnabled} timerEnabled={playStyle === 'Practice' ? practiceTimerEnabled : true} timeAttackState={taState ? { round: taState.round, digits: taState.digits, lives: taState.lives } : undefined} onComplete={handleGameComplete} onBack={handleBackToMenu} />}
      {currentScreen === 'results' && lastResult && activeProfile && <ResultsScreen result={lastResult} level={selectedLevel} onRetry={handleRetry} onNextLevel={handleNextLevel} onMenu={handleBackToMenu} />}
    </div>
  );
};

export default App;