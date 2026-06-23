import React from 'react';
import { audioEngine } from '../utils/audio';

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeSelect: (theme: string) => void;
}

interface ThemeConfig {
  id: string;
  name: string;
  colors: string[];
  dark: boolean;
  desc: string;
}

const THEMES: ThemeConfig[] = [
  { id: 'midnight-glass',  name: 'Midnight Glass',  colors: ['bg-indigo-600', 'bg-fuchsia-500', 'bg-slate-900'],   dark: true,  desc: 'Deep indigo gradient with glass overlays' },
  { id: 'neon-cyberpunk',   name: 'Neon Cyberpunk',  colors: ['bg-pink-600', 'bg-cyan-400', 'bg-black'],           dark: true,  desc: 'Futuristic neon pink & cyan on black' },
  { id: 'arctic-aurora',    name: 'Arctic Aurora',   colors: ['bg-sky-400', 'bg-emerald-400', 'bg-slate-800'],     dark: true,  desc: 'Northern lights over frozen skies' },
  { id: 'golden-ember',     name: 'Golden Ember',    colors: ['bg-amber-500', 'bg-red-500', 'bg-amber-950'],       dark: true,  desc: 'Warm amber & crimson glowing embers' },
  { id: 'ocean-depths',     name: 'Ocean Depths',    colors: ['bg-sky-500', 'bg-teal-500', 'bg-blue-950'],         dark: true,  desc: 'Deep blue ocean with teal highlights' },
  { id: 'crimson-noir',     name: 'Crimson Noir',    colors: ['bg-red-500', 'bg-orange-500', 'bg-red-950'],        dark: true,  desc: 'Dramatic red & noir cinematic palette' },
  { id: 'cozy-forest',      name: 'Cozy Forest',     colors: ['bg-emerald-700', 'bg-amber-800', 'bg-stone-200'],   dark: false, desc: 'Forest green & timber on cream canvas' },
  { id: 'sakura-sunrise',   name: 'Sakura Sunrise',  colors: ['bg-rose-500', 'bg-orange-400', 'bg-rose-50'],       dark: false, desc: 'Cherry blossom pink with peach accents' },
  { id: 'lavender-mist',    name: 'Lavender Mist',   colors: ['bg-violet-600', 'bg-purple-400', 'bg-violet-50'],   dark: false, desc: 'Soft lavender purple on frosted white' },
  { id: 'mint-breeze',      name: 'Mint Breeze',     colors: ['bg-emerald-600', 'bg-teal-500', 'bg-emerald-50'],   dark: false, desc: 'Fresh mint & teal on bright green tones' },
];

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeSelect }) => {
  const handleSelect = (id: string) => {
    audioEngine.playClick();
    onThemeSelect(id);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-black text-theme-main uppercase tracking-wider">Select Color Palette</h3>
      <p className="text-xs text-theme-muted mb-4">
        Choose from 10 hand-crafted themes. Your selection is saved automatically.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {THEMES.map((theme) => {
          const isActive = theme.id === currentTheme;
          return (
            <button
              key={theme.id}
              onClick={() => handleSelect(theme.id)}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                isActive
                  ? 'border-theme-primary bg-theme-input shadow-theme-glow ring-2 ring-[var(--color-primary)]/30'
                  : 'border-theme bg-theme-card hover:bg-theme-card-hover'
              }`}
            >
              <div className="w-full flex items-center justify-between mb-1.5">
                <span className="font-extrabold text-theme-main text-sm">{theme.name}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  theme.dark
                    ? 'bg-slate-800 text-slate-300'
                    : 'bg-stone-300 text-stone-700'
                }`}>
                  {theme.dark ? 'DARK' : 'LIGHT'}
                </span>
              </div>

              <p className="text-[10px] text-theme-muted mb-2.5 leading-relaxed">{theme.desc}</p>

              <div className="flex items-center space-x-1.5">
                {theme.colors.map((colorClass, idx) => (
                  <div key={idx} className={`w-5 h-5 rounded-full border border-black/10 ${colorClass}`} />
                ))}
                {isActive && (
                  <span className="ml-auto text-[9px] font-black text-theme-primary uppercase tracking-widest">ACTIVE</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelector;
