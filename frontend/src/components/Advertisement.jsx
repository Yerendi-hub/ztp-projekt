import React, { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';

export default function Advertisement() {
  // prawdziwe, kultowe i głębokie hasła z kampanii reklamowych gigantów IT z lat 80/90
  const ads = [
    { brand: "IBM (1981)", text: "Introducing the IBM Personal Computer. Data processing you can actualy trust." },
    { brand: "APPLE (1997)", text: "Think Different. The misfits, the rebels, the ones who see things differently." },
    { brand: "NEXT COMPUTER (1988)", text: "We've built the computer for the next decade. Precision in every byte." },
    { brand: "MICROSOFT (1995)", text: "Where do you want to go today? Exploring new frontiers in telemetry." },
    { brand: "SGI (1993)", text: "Silicon Graphics. Computers that create realities out of raw numbers." }
  ];

  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [ads.length]);

  const activeAd = ads[currentAdIndex];

  return (
    <div className="hidden md:flex items-center gap-4 border-2 border-[#2d4a43] bg-white p-2 max-w-md text-left font-mono select-none shadow-[2px_2px_0px_0px_rgba(45,74,67,0.1)]">
      <div className="bg-[#2d4a43] p-2 border border-[#2d4a43] shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)]">
        <Terminal className="w-4 h-4 text-[#f4f1e3]" />
      </div>
      <div className="flex flex-col min-w-[240px]">
        <div className="flex justify-between items-center border-b border-[#2d4a43]/20 pb-0.5 mb-1">
          <span className="text-[9px] uppercase tracking-wider font-black text-[#a63a3a]">
            SYS.ADV // TRANSMISSION
          </span>
          <span className="text-[9px] font-bold opacity-60">
            {activeAd.brand}
          </span>
        </div>
        <span className="text-[10px] leading-tight font-medium text-[#2d4a43] italic">
          "{activeAd.text}"
        </span>
      </div>
    </div>
  );
}