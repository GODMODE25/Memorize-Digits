import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Level, Profile, GameMode } from '../types/game';
import { levels } from '../data/levels';
import { achievements } from '../data/achievements';
import LevelCard from './LevelCard';
import ProgressBar from './ProgressBar';
import ThemeSelector from './ThemeSelector';
import { audioEngine } from '../utils/audio';
import { PROFILE_EMOJIS } from '../utils/storage';

interface MainMenuProps {
  profile: Profile;
  onLevelSelect: (level: Level) => void;
  onContinueCampaign: () => void;
  onStartPractice: (mode: GameMode, difficulty: string, displayTime: number, recallTime: number, assist: boolean, timerEnabled: boolean) => void;
  onStartTimeAttack: (difficulty: string) => void;
  onProfileUpdate: (updated: Profile) => void;
  onLogout: () => void;
}

const TIER_FILTERS = ['All', 'Beginner', 'Easy', 'Medium', 'Hard', 'Expert', 'Master'] as const;
type TierFilter = typeof TIER_FILTERS[number];

const MainMenu: React.FC<MainMenuProps> = ({ profile, onLevelSelect, onContinueCampaign, onStartPractice, onStartTimeAttack, onProfileUpdate, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'play' | 'stats' | 'achievements' | 'settings' | 'about'>('play');
  const [tierFilter, setTierFilter] = useState<TierFilter>('All');
  const [practiceMode, setPracticeMode] = useState<GameMode>('Numbers');
  const [practiceDifficulty, setPracticeDifficulty] = useState('Medium');
  const [practiceDisplayTime, setPracticeDisplayTime] = useState(3.0);
  const [practiceRecallTime, setPracticeRecallTime] = useState(9.0);
  const [practiceAssist, setPracticeAssist] = useState(profile.assistEnabled);
  const [practiceTimerEnabled, setPracticeTimerEnabled] = useState(profile.practiceTimerEnabled);
  const [taDifficulty, setTaDifficulty] = useState('Medium');

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to first uncompleted level on mount
  useEffect(() => {
    if (activeTab === 'play' && scrollRef.current) {
      const firstLocked = levels.findIndex(l => l.id > 1 && !profile.completedLevels.includes(l.id - 1));
      if (firstLocked > 0) {
        const target = scrollRef.current.children[firstLocked] as HTMLElement;
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeTab]);

  const filteredLevels = useMemo(() => {
    if (tierFilter === 'All') return levels;
    return levels.filter(l => l.difficulty === tierFilter);
  }, [tierFilter]);

  const getIsLocked = (level: Level) => level.id === 1 ? false : !profile.completedLevels.includes(level.id - 1);
  const getHighScore = (levelId: number) => profile.highScores[levelId] as number | undefined;
  const xpProgress = profile.totalXP % 1000;

  const handleThemeChange = (t: string) => onProfileUpdate({ ...profile, theme: t });
  const handleVolumeChange = (v: number) => { audioEngine.setVolume(v); onProfileUpdate({ ...profile, soundVolume: v }); };
  const handleAssistToggle = (e: boolean) => { audioEngine.playClick(); setPracticeAssist(e); onProfileUpdate({ ...profile, assistEnabled: e }); };

  return (
    <div className="w-full min-h-screen bg-theme-app flex flex-col p-6 text-theme-main">
      {/* ── Top Navbar ── */}
      <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row items-center justify-between border-b border-theme pb-4 mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-theme-card border-2 border-theme-primary shadow-theme-glow rounded-2xl flex items-center justify-center text-3xl font-bold">{profile.emoji}</div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-xl tracking-wide uppercase">{profile.username}</span>
              <span className="text-xs bg-theme-secondary text-white font-black px-2 py-0.5 rounded-full border border-theme shadow-theme-glow">LV.{profile.level}</span>
              {profile.dailyStreak > 0 && <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">🔥 {profile.dailyStreak}d</span>}
            </div>
            <div className="flex items-center space-x-2 w-48 mt-1">
              <div className="w-full bg-theme-input h-1.5 rounded-full overflow-hidden border border-theme"><div className="bg-theme-secondary h-full" style={{ width: `${(xpProgress / 1000) * 100}%` }} /></div>
              <span className="text-[10px] font-bold text-theme-muted">{xpProgress}/1000</span>
            </div>
          </div>
        </div>
        <div className="flex bg-theme-input p-1 border border-theme rounded-2xl">
          {(['play', 'stats', 'achievements', 'settings', 'about'] as const).map(tab => (
            <button key={tab} onClick={() => { audioEngine.playClick(); setActiveTab(tab); }} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${activeTab === tab ? 'bg-theme-primary text-white shadow-theme-glow' : 'hover:bg-theme-card-hover text-theme-muted'}`}>{tab}</button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto flex-1">
        {/* ══════════════ PLAY TAB ══════════════ */}
        {activeTab === 'play' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Campaign Grid */}
            <div className="lg:col-span-8 bg-theme-card border border-theme rounded-3xl p-5 shadow-theme-glow flex flex-col" style={{ maxHeight: '78vh' }}>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wider">Campaign</h2>
                  <p className="text-[10px] text-theme-muted">100 levels · 3–14 digits · 6 difficulty tiers</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-36 hidden sm:block"><ProgressBar current={profile.completedLevels.length} max={100} label="Progress" colorTheme="purple" /></div>
                  <button 
                    onClick={() => { audioEngine.playClick(); onContinueCampaign(); }}
                    className="bg-theme-primary hover:opacity-90 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-xl shadow-theme-glow transition-all flex items-center"
                  >
                    {profile.completedLevels.length === 0 ? 'Start Campaign' : 'Continue Campaign'} <span className="ml-2 text-xs">▶</span>
                  </button>
                </div>
              </div>

              {/* Tier filter pills */}
              <div className="flex flex-wrap gap-1.5 mb-3 pb-3 border-b border-theme">
                {TIER_FILTERS.map(t => (
                  <button key={t} onClick={() => { audioEngine.playClick(); setTierFilter(t); }} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${tierFilter === t ? 'bg-theme-primary text-white border-theme-primary shadow-theme-glow' : 'bg-theme-input border-theme text-theme-muted hover:bg-theme-card-hover'}`}>
                    {t} {t !== 'All' && <span className="opacity-60">({levels.filter(l => l.difficulty === t).length})</span>}
                  </button>
                ))}
              </div>

              {/* Scrollable level grid */}
              <div ref={scrollRef} className="overflow-y-auto flex-1 pr-1" style={{ scrollBehavior: 'smooth' }}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredLevels.map(level => (
                    <LevelCard key={level.id} level={level} isLocked={getIsLocked(level)} highScore={getHighScore(level.id)} onSelect={onLevelSelect} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Practice & Time Attack */}
            <div className="lg:col-span-4 space-y-5">
              <div className="bg-theme-card border border-theme rounded-3xl p-5 shadow-theme-glow space-y-3">
                <h3 className="text-lg font-black uppercase tracking-wider">Practice Arena</h3>
                <p className="text-[10px] text-theme-muted">Custom sandbox with Auto Coach.</p>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-theme-muted uppercase tracking-wider">Mode</label>
                  <select value={practiceMode} onChange={e => { audioEngine.playClick(); setPracticeMode(e.target.value as GameMode); }} className="w-full bg-theme-input border border-theme rounded-xl px-3 py-2 text-xs font-bold text-theme-main focus:outline-none">
                    <option value="Numbers">Numbers</option><option value="Flash Cards">Flash Cards</option><option value="Phone">Phone</option><option value="Alphanumeric">Alphanumeric</option><option value="Words">Words</option>
                  </select>
                  <label className="text-[9px] font-bold text-theme-muted uppercase tracking-wider">Difficulty</label>
                  <select value={practiceDifficulty} onChange={e => { audioEngine.playClick(); const d = e.target.value; setPracticeDifficulty(d); if (d==='Easy'){setPracticeDisplayTime(4);setPracticeRecallTime(12);} else if(d==='Medium'){setPracticeDisplayTime(3);setPracticeRecallTime(9);} else if(d==='Hard'){setPracticeDisplayTime(2.4);setPracticeRecallTime(7);} else{setPracticeDisplayTime(1.8);setPracticeRecallTime(5.5);} }} className="w-full bg-theme-input border border-theme rounded-xl px-3 py-2 text-xs font-bold text-theme-main focus:outline-none">
                    <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option><option value="Insane">Insane</option>
                  </select>
                  <div className="flex justify-between text-[9px] font-bold text-theme-muted uppercase"><span>Display</span><span>{practiceDisplayTime.toFixed(1)}s</span></div>
                  <input type="range" min={0.5} max={15} step={0.1} value={practiceDisplayTime} onChange={e => setPracticeDisplayTime(parseFloat(e.target.value))} className="w-full accent-[var(--color-primary)] cursor-pointer" />
                  <div className="flex justify-between text-[9px] font-bold text-theme-muted uppercase"><span>Recall</span><span>{practiceRecallTime.toFixed(1)}s</span></div>
                  <input type="range" min={3} max={30} step={0.5} value={practiceRecallTime} onChange={e => setPracticeRecallTime(parseFloat(e.target.value))} className="w-full accent-[var(--color-primary)] cursor-pointer" />
                  <div className="flex items-center justify-between"><span className="text-[9px] font-bold text-theme-muted uppercase">Visual Assist</span><input type="checkbox" checked={practiceAssist} onChange={e => handleAssistToggle(e.target.checked)} className="w-4 h-4 accent-[var(--color-primary)] cursor-pointer" /></div>
                  <div className="flex items-center justify-between"><span className="text-[9px] font-bold text-theme-muted uppercase">Enable Timer</span><input type="checkbox" checked={practiceTimerEnabled} onChange={e => { const v = e.target.checked; setPracticeTimerEnabled(v); onProfileUpdate({ ...profile, practiceTimerEnabled: v }); }} className="w-4 h-4 accent-[var(--color-primary)] cursor-pointer" /></div>
                </div>
                <button onClick={() => { audioEngine.playClick(); onStartPractice(practiceMode, practiceDifficulty, practiceDisplayTime, practiceRecallTime, practiceAssist, practiceTimerEnabled); }} className="w-full bg-theme-primary hover:opacity-90 text-white font-bold py-2.5 rounded-xl shadow-theme-glow transition-all text-sm">Enter Practice</button>
              </div>

              <div className="bg-theme-card border border-theme rounded-3xl p-5 shadow-theme-glow space-y-3">
                <h3 className="text-lg font-black uppercase tracking-wider">Time Attack</h3>
                <p className="text-[10px] text-theme-muted">Infinite rounds, 3 lives.</p>
                <select value={taDifficulty} onChange={e => { audioEngine.playClick(); setTaDifficulty(e.target.value); }} className="w-full bg-theme-input border border-theme rounded-xl px-3 py-2 text-xs font-bold text-theme-main focus:outline-none">
                  <option value="Easy">Easy (3 digits)</option><option value="Medium">Medium (5 digits)</option><option value="Hard">Hard (7 digits)</option>
                </select>
                <button onClick={() => { audioEngine.playClick(); onStartTimeAttack(taDifficulty); }} className="w-full bg-theme-secondary hover:opacity-90 text-white font-bold py-2.5 rounded-xl shadow-theme-glow transition-all text-sm">Launch</button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ STATS TAB ══════════════ */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-theme-card border border-theme rounded-3xl p-6 shadow-theme-glow space-y-5">
              <h3 className="text-xl font-black uppercase tracking-wider">Profile Record</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'XP Level', value: profile.level, cls: 'text-theme-secondary' },
                  { label: 'Total XP', value: profile.totalXP, cls: 'text-theme-primary' },
                  { label: 'Games', value: profile.totalGamesPlayed, cls: 'text-theme-accent' },
                  { label: 'Streak', value: `🔥 ${profile.dailyStreak}`, cls: 'text-orange-500' },
                  { label: 'Cleared', value: `${profile.completedLevels.length}/100`, cls: 'text-theme-primary' },
                  { label: 'Trophies', value: `🏆 ${profile.achievements.length}`, cls: 'text-yellow-500' },
                ].map(s => (
                  <div key={s.label} className="bg-theme-input p-4 rounded-2xl border border-theme">
                    <span className="block text-[9px] font-bold text-theme-muted uppercase tracking-wider mb-1">{s.label}</span>
                    <span className={`text-xl font-extrabold ${s.cls}`}>{s.value}</span>
                  </div>
                ))}
              </div>
              <div className="bg-theme-input p-5 rounded-2xl border border-theme overflow-y-auto max-h-48">
                <h4 className="text-xs font-bold text-theme-main uppercase tracking-wider mb-3">High Scores</h4>
                <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                  {Object.entries(profile.highScores).map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-theme pb-1.5"><span className="text-theme-muted uppercase">Lvl {k}</span><span className="text-theme-main">{v}</span></div>
                  ))}
                  {Object.keys(profile.highScores).length === 0 && <div className="col-span-2 text-center text-theme-muted italic text-xs">No scores yet.</div>}
                </div>
              </div>
            </div>
            <div className="bg-theme-card border border-theme rounded-3xl p-6 shadow-theme-glow flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black uppercase tracking-wider mb-4">Daily Quest</h3>
                <div className="bg-theme-input p-5 rounded-2xl border border-theme space-y-3">
                  <div className="text-sm font-bold text-theme-main">{profile.dailyQuest.type === 'Campaign' ? 'Complete Campaign Levels' : profile.dailyQuest.type === 'Practice' ? 'Play Practice Rounds' : 'Earn Score Points'}</div>
                  <p className="text-[10px] text-theme-muted">Complete for <span className="font-bold text-theme-secondary">+300 XP</span>.</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-theme-muted"><span>Progress</span><span>{profile.dailyQuest.current}/{profile.dailyQuest.target}</span></div>
                    <div className="w-full bg-theme-card h-2.5 rounded-full overflow-hidden border border-theme"><div className={`h-full ${profile.dailyQuest.completed ? 'bg-green-500' : 'bg-theme-primary'} transition-all`} style={{ width: `${Math.min((profile.dailyQuest.current / profile.dailyQuest.target) * 100, 100)}%` }} /></div>
                  </div>
                  {profile.dailyQuest.completed && <div className="text-center font-bold text-[10px] text-green-500 bg-green-500/10 py-1.5 rounded-lg border border-green-500/20 uppercase tracking-widest">✓ Done!</div>}
                </div>
              </div>
              <div className="text-[10px] text-theme-muted italic text-center mt-4">Refreshes daily.</div>
            </div>
          </div>
        )}

        {/* ══════════════ ACHIEVEMENTS TAB ══════════════ */}
        {activeTab === 'achievements' && (
          <div className="bg-theme-card border border-theme rounded-3xl p-6 shadow-theme-glow">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-black uppercase tracking-wider">Achievements</h3>
              <span className="text-xs font-bold text-theme-muted bg-theme-input px-3 py-1 rounded-full border border-theme">{profile.achievements.length} / {achievements.length} unlocked</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-h-[65vh] overflow-y-auto pr-1">
              {achievements.map(ach => {
                const unlocked = profile.achievements.includes(ach.id);
                return (
                  <div key={ach.id} className={`flex items-start space-x-3 p-4 rounded-2xl border transition-all ${unlocked ? 'bg-theme-input border-theme-secondary shadow-theme-glow' : 'bg-theme-card border-theme opacity-50'}`}>
                    <div className="text-3xl flex-shrink-0">{unlocked ? ach.icon : '🔒'}</div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-theme-main text-sm truncate">{ach.name}</h4>
                      <p className="text-[10px] text-theme-muted mt-0.5 leading-relaxed">{ach.description}</p>
                      {unlocked && <span className="inline-block mt-1.5 text-[8px] font-bold text-theme-secondary bg-theme-secondary/10 px-1.5 py-0.5 rounded-full border border-theme-secondary/20 uppercase">UNLOCKED</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════ SETTINGS TAB ══════════════ */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-theme-card border border-theme rounded-3xl p-6 shadow-theme-glow"><ThemeSelector currentTheme={profile.theme} onThemeSelect={handleThemeChange} /></div>
            <div className="lg:col-span-4 bg-theme-card border border-theme rounded-3xl p-6 shadow-theme-glow space-y-5">
              <h3 className="text-lg font-black uppercase tracking-wider border-b border-theme pb-2">Controls</h3>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-theme-muted uppercase"><span>Volume</span><span>{Math.round(profile.soundVolume * 100)}%</span></div>
                <input type="range" min={0} max={1} step={0.05} value={profile.soundVolume} onChange={e => handleVolumeChange(parseFloat(e.target.value))} className="w-full accent-[var(--color-primary)] cursor-pointer" />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-b border-theme"><span className="text-[10px] font-bold text-theme-muted uppercase">Global Assist</span><input type="checkbox" checked={profile.assistEnabled} onChange={e => handleAssistToggle(e.target.checked)} className="w-4 h-4 accent-[var(--color-primary)] cursor-pointer" /></div>
              <div className="flex items-center justify-between py-2 border-b border-theme"><span className="text-[10px] font-bold text-theme-muted uppercase">On-Screen Keypad</span><input type="checkbox" checked={profile.keypadEnabled} onChange={e => { audioEngine.playClick(); onProfileUpdate({ ...profile, keypadEnabled: e.target.checked }); }} className="w-4 h-4 accent-[var(--color-primary)] cursor-pointer" /></div>
              
              <div className="pt-2">
                <span className="text-[10px] font-bold text-theme-muted uppercase block mb-2">Avatar Emoji</span>
                <div className="flex flex-wrap gap-2">
                  {PROFILE_EMOJIS.map(emoji => (
                    <button key={emoji} onClick={() => { audioEngine.playClick(); onProfileUpdate({ ...profile, emoji }); }} className={`w-10 h-10 flex items-center justify-center text-xl rounded-xl transition-all ${profile.emoji === emoji ? 'bg-theme-primary shadow-theme-glow border-2 border-theme-primary' : 'bg-theme-input hover:bg-theme-card-hover border border-theme'}`}>{emoji}</button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col space-y-2 pt-2 border-t border-theme">
                <button onClick={() => { audioEngine.playClick(); onLogout(); }} className="w-full bg-theme-input hover:bg-theme-card-hover border border-theme text-theme-main font-bold py-2.5 rounded-xl transition-all uppercase text-xs tracking-wider">👤 Switch Profile</button>
                <button onClick={() => { audioEngine.playClick(); onLogout(); }} className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-bold py-2.5 rounded-xl transition-all uppercase text-xs tracking-wider">Logout</button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ ABOUT TAB ══════════════ */}
        {activeTab === 'about' && (
          <div className="max-w-2xl mx-auto bg-theme-card border border-theme rounded-3xl p-8 shadow-theme-glow text-center space-y-6">
            <div className="flex justify-center mb-4">
              <span className="text-6xl drop-shadow-lg">🧠</span>
            </div>
            <h2 className="text-3xl font-black text-theme-main uppercase tracking-widest">
              MEMORYMASTER
            </h2>
            <div className="inline-block bg-theme-primary/10 border border-theme-primary/20 text-theme-primary font-bold px-4 py-1.5 rounded-full text-sm">
              v2.4.0 Stable
            </div>
            <p className="text-theme-muted text-sm leading-relaxed">
              A procedural web-audio enabled memory trainer. Master the art of Chunking, Memory Palaces, and Story Linking to dramatically increase your short-term numeric retention capacity.
            </p>
            <div className="bg-theme-input p-4 rounded-xl border border-theme text-xs font-semibold text-theme-main">
              Developed by <span className="text-theme-secondary">Samuel Musa</span> 
            </div>
            <p className="text-[10px] text-theme-muted uppercase tracking-wider">
              © 2026. All rights reserved.
            </p>
          </div>
        )}
      </div>

      <div className="max-w-7xl w-full mx-auto text-center text-[10px] text-theme-muted mt-6">Developed by Samuel Musa © 2026.</div>
    </div>
  );
};

export default MainMenu;