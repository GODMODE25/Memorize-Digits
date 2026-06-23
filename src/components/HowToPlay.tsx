import React from 'react';

const HowToPlay: React.FC = () => {
  return (
    <div className="text-gray-800 space-y-6">
      {/* Step-by-Step Instructions */}
      <section>
        <h3 className="text-2xl font-bold text-blue-600 mb-4 flex items-center">
          <span className="mr-2">📋</span> How to Play
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-lg">
          <li className="flex items-start">
            <span className="mr-2 text-green-500">1.</span>
            <span>Select a level based on difficulty (from 3 to 15 digits).</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-blue-500">2.</span>
            <span>Memorize the number shown on screen within the time limit.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-purple-500">3.</span>
            <span>Enter the number from memory using the input field.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-orange-500">4.</span>
            <span>Get scored based on accuracy (correct digits) and speed (time taken).</span>
          </li>
        </ol>
      </section>

      {/* Difficulty Levels */}
      <section>
        <h3 className="text-2xl font-bold text-purple-600 mb-4 flex items-center">
          <span className="mr-2">🎯</span> Difficulty Levels
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-100 p-4 rounded-lg border-l-4 border-green-500">
            <h4 className="font-semibold text-green-700">Beginner (3-4 digits)</h4>
            <p className="text-sm text-green-600">Perfect for starting your memory journey!</p>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold text-blue-700">Easy (5-6 digits)</h4>
            <p className="text-sm text-blue-600">A gentle challenge to build confidence.</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg border-l-4 border-yellow-500">
            <h4 className="font-semibold text-yellow-700">Medium (7-9 digits)</h4>
            <p className="text-sm text-yellow-600">Test your growing memory skills.</p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg border-l-4 border-red-500">
            <h4 className="font-semibold text-red-700">Hard (10-11 digits)</h4>
            <p className="text-sm text-red-600">Push your limits with longer sequences.</p>
          </div>
          <div className="bg-indigo-100 p-4 rounded-lg border-l-4 border-indigo-500">
            <h4 className="font-semibold text-indigo-700">Expert (12-13 digits)</h4>
            <p className="text-sm text-indigo-600">For the dedicated memory enthusiasts.</p>
          </div>
          <div className="bg-pink-100 p-4 rounded-lg border-l-4 border-pink-500">
            <h4 className="font-semibold text-pink-700">Master (14-15 digits)</h4>
            <p className="text-sm text-pink-600">Achieve mastery with the ultimate challenge!</p>
          </div>
        </div>
      </section>

      {/* Tips for Better Memorization */}
      <section>
        <h3 className="text-2xl font-bold text-orange-600 mb-4 flex items-center">
          <span className="mr-2">💡</span> Memorization Tips
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start bg-orange-50 p-3 rounded-lg">
            <span className="mr-3 text-orange-500">🔢</span>
            <div>
              <strong className="text-orange-700">Chunking:</strong> Group digits into smaller sets (e.g., 123-456-7890) to make them easier to remember.
            </div>
          </li>
          <li className="flex items-start bg-orange-50 p-3 rounded-lg">
            <span className="mr-3 text-orange-500">🖼️</span>
            <div>
              <strong className="text-orange-700">Visualization:</strong> Associate numbers with familiar images, patterns, or stories in your mind.
            </div>
          </li>
          <li className="flex items-start bg-orange-50 p-3 rounded-lg">
            <span className="mr-3 text-orange-500">🔄</span>
            <div>
              <strong className="text-orange-700">Repetition:</strong> Practice regularly to improve your memory muscle over time.
            </div>
          </li>
        </ul>
      </section>

      {/* Scoring System */}
      <section>
        <h3 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
          <span className="mr-2">🏆</span> Scoring System
        </h3>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="mb-2">
            Your score is calculated based on two main factors:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li><strong>Accuracy:</strong> Percentage of correct digits (e.g., 8/10 = 80%)</li>
            <li><strong>Speed:</strong> Time taken to complete the level (faster = higher score)</li>
          </ul>
          <p className="text-sm text-red-600">
            Bonus points for perfect accuracy and beating your personal best time!
          </p>
        </div>
      </section>

      {/* Visual Example */}
      <section>
        <h3 className="text-2xl font-bold text-indigo-600 mb-4 flex items-center">
          <span className="mr-2">👀</span> Visual Example
        </h3>
        <div className="bg-indigo-50 p-4 rounded-lg text-center">
          <div className="text-4xl font-mono text-indigo-700 mb-2">1 2 3 4 5 6 7 8 9</div>
          <p className="text-sm text-indigo-600">Memorize this 9-digit number, then enter it from memory!</p>
          <div className="flex justify-center mt-4 space-x-2">
            <span className="text-2xl">⏱️</span>
            <span className="text-2xl">✏️</span>
            <span className="text-2xl">✅</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowToPlay;