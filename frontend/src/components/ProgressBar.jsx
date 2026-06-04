import React, { useState, useEffect } from 'react';

export default function ProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) return 100;
        return old + 10;
      });
    }, 250);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-4 border border-[#2d4a43] p-2 bg-white/40">
      <div className="text-[10px] uppercase font-bold mb-1 animate-pulse">&gt; Processing medical data...</div>
      <div className="w-full bg-gray-200 h-4 border border-[#2d4a43]">
        <div 
          className="bg-[#5b8276] h-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}