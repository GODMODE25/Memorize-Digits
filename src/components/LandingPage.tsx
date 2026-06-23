import React, { useState, useEffect } from 'react';
import { Profile } from '../types/game';
import { loadProfiles, createProfile, deleteProfile, setActiveProfileName } from '../utils/storage';
import { audioEngine } from '../utils/audio';

interface LandingPageProps {
  onProfileSelect: (profile: Profile) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onProfileSelect }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'chunking' | 'palace' | 'story'>('chunking');

  useEffect(() => {
    setProfiles(loadProfiles());
  }, []);

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    audioEngine.playClick();
    const newProfile = createProfile(newUsername.trim());
    if (newProfile) {
      setProfiles(loadProfiles());
      setNewUsername('');
      setShowCreateForm(false);
      onProfileSelect(newProfile);
    } else {
      alert('Username already exists or is invalid.');
    }
  };

  const handleDeleteProfile = (e: React.MouseEvent, username: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete profile "${username}"? All score history will be lost.`)) {
      audioEngine.playWrong();
      deleteProfile(username);
      setProfiles(loadProfiles());
    }
  };

  const handleSelectProfile = (profile: Profile) => {
    audioEngine.playClick();
    setActiveProfileName(profile.username);
    onProfileSelect(profile);
  };

  return (
    <div className="w-full min-h-screen bg-theme-app flex flex-col justify-between p-6 text-theme-main">
      {/* Top Header */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <span className="text-4xl">🧠</span>
          <span className="text-2xl font-black tracking-wider text-theme-primary drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">
            MEMORYMASTER
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto items-stretch">
        
        {/* Left Column: Techniques Guide (7 cols) */}
        <div className="lg:col-span-7 bg-theme-card border border-theme rounded-3xl p-8 flex flex-col justify-between shadow-theme-glow">
          <div>
            <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 leading-tight">
              Train Your Brain with <span className="text-theme-secondary">Mnemonic Quests</span>
            </h2>
            <p className="text-theme-muted mb-8 max-w-lg">
              Unlock the secrets of memory champions. Practice chunking, map digits to spatial landmarks, and build connection chains.
            </p>

            {/* Tab buttons */}
            <div className="flex space-x-2 p-1 bg-theme-input rounded-xl border border-theme mb-6">
              <button
                onClick={() => { audioEngine.playClick(); setActiveTab('chunking'); }}
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                  activeTab === 'chunking'
                    ? 'bg-theme-primary text-white shadow-theme-glow'
                    : 'hover:bg-theme-card-hover text-theme-muted'
                }`}
              >
                Chunking
              </button>
              <button
                onClick={() => { audioEngine.playClick(); setActiveTab('palace'); }}
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                  activeTab === 'palace'
                    ? 'bg-theme-primary text-white shadow-theme-glow'
                    : 'hover:bg-theme-card-hover text-theme-muted'
                }`}
              >
                Memory Palace
              </button>
              <button
                onClick={() => { audioEngine.playClick(); setActiveTab('story'); }}
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                  activeTab === 'story'
                    ? 'bg-theme-primary text-white shadow-theme-glow'
                    : 'hover:bg-theme-card-hover text-theme-muted'
                }`}
              >
                Story Linking
              </button>
            </div>

            {/* Tab content */}
            <div className="p-6 bg-theme-input rounded-2xl border border-theme min-h-[160px]">
              {activeTab === 'chunking' && (
                <div>
                  <h3 className="text-lg font-bold text-theme-secondary mb-2">🧩 Number Chunking</h3>
                  <p className="text-theme-muted text-sm leading-relaxed mb-4">
                    The short-term memory can typically hold only 4-5 distinct items. Chunking combines random inputs into grouped units of 3, expanding your working capacity effortlessly.
                  </p>
                  <div className="font-mono text-xl tracking-wider text-theme-accent font-semibold bg-theme-card p-3 rounded-lg border border-theme inline-block">
                    843902148 &rarr; 843 · 902 · 148
                  </div>
                </div>
              )}
              {activeTab === 'palace' && (
                <div>
                  <h3 className="text-lg font-bold text-theme-secondary mb-2">🏛️ Method of Loci (Memory Palace)</h3>
                  <p className="text-theme-muted text-sm leading-relaxed mb-4">
                    Associate information with familiar visual landmarks (e.g. rooms in your house). To recall the sequence, mentally walk through the locations and retrieve the numbers.
                  </p>
                  <div className="text-sm text-theme-accent font-mono grid grid-cols-3 gap-2">
                    <span className="bg-theme-card px-2 py-1 rounded border border-theme">🚪 Door: 843</span>
                    <span className="bg-theme-card px-2 py-1 rounded border border-theme">🛋️ Sofa: 902</span>
                    <span className="bg-theme-card px-2 py-1 rounded border border-theme">🍽️ Table: 148</span>
                  </div>
                </div>
              )}
              {activeTab === 'story' && (
                <div>
                  <h3 className="text-lg font-bold text-theme-secondary mb-2">🔗 Story Linking / Association</h3>
                  <p className="text-theme-muted text-sm leading-relaxed mb-4">
                    Create dynamic, funny, or absurd mental connections between consecutive items or words. Weird, emotional, and sensory stories stick in your mind much longer than raw digits.
                  </p>
                  <div className="font-mono text-sm text-theme-accent bg-theme-card p-3 rounded-lg border border-theme">
                    "An <span className="underline">apple</span> rocketed into the <span className="underline">jungle</span> and hit a <span className="underline">yellow</span> zipper."
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-theme pt-6 flex items-center justify-between text-xs text-theme-muted">
            <span>⚡ Procedural Web Audio Synths</span>
            <span>🌈 Dynamic Theme Engine</span>
          </div>
        </div>

        {/* Right Column: Profiles (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="bg-theme-card border border-theme rounded-3xl p-8 shadow-theme-glow h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-theme-main">Select Profile</h3>
                {profiles.length > 0 && !showCreateForm && (
                  <button
                    onClick={() => { audioEngine.playClick(); setShowCreateForm(true); }}
                    className="text-xs font-bold text-theme-primary hover:underline bg-theme-input border border-theme px-3 py-1.5 rounded-full"
                  >
                    + New Profile
                  </button>
                )}
              </div>

              {/* Profile list or create form */}
              {profiles.length === 0 || showCreateForm ? (
                <form onSubmit={handleCreateProfile} className="space-y-4">
                  <div className="bg-theme-input p-6 rounded-2xl border border-theme space-y-4">
                    <label className="block text-sm font-bold text-theme-muted">
                      PLAYER USERNAME
                    </label>
                    <input
                      type="text"
                      maxLength={14}
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="e.g. Samuel"
                      required
                      className="w-full bg-theme-card border-2 border-theme rounded-xl px-4 py-3 text-lg font-bold text-theme-main focus:border-theme-primary transition-all uppercase placeholder-gray-500"
                    />
                    <p className="text-xs text-theme-muted">
                      Your scores, streaks, level progressions, and active themes will be saved locally.
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    {profiles.length > 0 && (
                      <button
                        type="button"
                        onClick={() => { audioEngine.playClick(); setShowCreateForm(false); }}
                        className="flex-1 py-3 font-bold bg-theme-input text-theme-main border border-theme rounded-xl hover:bg-theme-card-hover"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 py-3 font-bold bg-theme-primary text-white rounded-xl hover:opacity-90 shadow-theme-glow"
                    >
                      Create
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {profiles.map((profile) => (
                    <div
                      key={profile.username}
                      onClick={() => handleSelectProfile(profile)}
                      className="flex items-center justify-between p-4 bg-theme-input border border-theme rounded-2xl hover:border-theme-primary cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-theme-card border border-theme rounded-xl flex items-center justify-center text-2xl font-bold shadow-theme-glow">
                          {profile.emoji}
                        </div>
                        <div>
                          <div className="font-extrabold uppercase tracking-wide text-theme-main text-lg">
                            {profile.username}
                          </div>
                          <div className="text-xs font-semibold text-theme-muted flex items-center space-x-2">
                            <span>Level {profile.level}</span>
                            <span>•</span>
                            <span className="text-theme-secondary">{profile.totalXP} XP</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {profile.dailyStreak > 0 && (
                          <div className="flex items-center text-orange-500 text-sm font-bold bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
                            🔥 {profile.dailyStreak}
                          </div>
                        )}
                        <button
                          onClick={(e) => handleDeleteProfile(e, profile.username)}
                          className="p-2 hover:bg-red-500/10 hover:text-red-500 text-theme-muted rounded-xl transition-all"
                          title="Delete profile"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 text-center text-xs text-theme-muted">
              Select or create a profile to enter the game.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default LandingPage;
