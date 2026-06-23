import React from 'react';

interface ProgressBarProps {
  current: number;
  max: number;
  label: string;
  colorTheme?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, max, label, colorTheme = 'blue' }) => {
  const percentage = Math.min((current / max) * 100, 100);

  const gradientClasses = {
    blue: 'bg-theme-primary',
    green: 'bg-theme-accent',
    purple: 'bg-theme-secondary',
    orange: 'bg-theme-secondary',
  };

  const gradientClass = gradientClasses[colorTheme as keyof typeof gradientClasses] || gradientClasses.blue;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-bold text-theme-muted uppercase tracking-wider">{label}
        </span>
        <span className="text-sm font-black text-theme-secondary bg-theme-input px-2 py-0.5 rounded-full border border-theme">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="relative w-full h-4 bg-theme-input rounded-full overflow-hidden border border-theme">
        <div
          className={`h-full ${gradientClass} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;