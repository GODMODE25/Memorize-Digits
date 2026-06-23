import React from 'react';

interface NumberDisplayProps {
  number: string;
  isVisible: boolean;
  animated: boolean;
}

const NumberDisplay: React.FC<NumberDisplayProps> = ({ number, isVisible, animated }) => {
  const formattedNumber = number.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return (
    <div className="flex justify-center items-center h-full">
      <div
        className={`font-mono text-6xl md:text-8xl lg:text-9xl bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent transition-all duration-500 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        } ${animated && isVisible ? 'animate-pulse' : ''}`}
      >
        {formattedNumber}
      </div>
    </div>
  );
};

export default NumberDisplay;