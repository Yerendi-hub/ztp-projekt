import React, { useState, useEffect, useMemo } from 'react';
import { Terminal } from 'lucide-react';

export default function Advertisement() {
  const ads = useMemo(() => [
    { brand: "IBM (1981)", text: "Introducing the IBM Personal Computer. Data processing you can actualy trust." },
    { brand: "APPLE (1997)", text: "Think Different. The misfits, the rebels, the ones who see things differently." },
    { brand: "NEXT COMPUTER (1988)", text: "We've built the computer for the next decade. Precision in every byte." },
    { brand: "MICROSOFT (1995)", text: "Where do you want to go today? Exploring new frontiers in telemetry." },
    { brand: "SGI (1993)", text: "Silicon Graphics. Computers that create realities out of raw numbers." },
    { 
      brand: "PROMO", 
      text: "Your ad could be here.", 
      email: "mail@gmail.com",
      isPromo: true 
    }
  ], []);

  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    const activeAd = ads[currentAdIndex];
    const delay = activeAd.isPromo ? 10000 : 5000;

    const timeout = setTimeout(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, delay);

    return () => clearTimeout(timeout);
  }, [currentAdIndex, ads]);

  const activeAd = ads[currentAdIndex];

  return (
    <div className={`hidden md:flex items-center gap-4 border-2 bg-white p-2 w-[420px] h-[68px] text-left font-mono select-none shadow-[2px_2px_0px_0px_rgba(45,74,67,0.1)] transition-colors duration-500 box-border ${activeAd.isPromo ? 'border-[#a63a3a] shadow-[2px_2px_0px_0px_rgba(166,58,58,0.15)]' : 'border-[#2d4a43]'}`}>
      <div className={`w-8 h-8 flex items-center justify-center border shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] transition-colors duration-500 ${activeAd.isPromo ? 'bg-[#a63a3a] border-[#a63a3a] animate-pulse' : 'bg-[#2d4a43] border-[#2d4a43]'}`}>
        <Terminal className="w-4 h-4 text-[#f4f1e3]" />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className={`flex justify-between items-center border-b pb-0.5 mb-1 transition-colors duration-500 ${activeAd.isPromo ? 'border-[#a63a3a]/30' : 'border-[#2d4a43]/20'}`}>
          <span className="text-[9px] uppercase tracking-wider font-black text-[#a63a3a]">
            {activeAd.isPromo ? "Partnership" : "Sponsored by"}
          </span>
          <span className={`text-[9px] font-bold transition-colors duration-500 ${activeAd.isPromo ? 'text-[#a63a3a] font-black' : 'opacity-60'}`}>
            {activeAd.brand}
          </span>
        </div>

        <div className="h-9 flex items-center text-[11px] leading-tight overflow-hidden">
          {activeAd.isPromo ? (
            <div className="text-[#a63a3a] font-bold w-full flex items-center gap-1.5 truncate">
              <span className="shrink-0">{activeAd.text}</span>
              <a 
                href={`mailto:${activeAd.email}`}
                className="bg-[#a63a3a] text-[#f4f1e3] px-1.5 py-0.5 text-[10px] font-mono tracking-wide rounded-sm select-all whitespace-nowrap hover:underline cursor-pointer flex items-center h-5"
              >
                Email us: {activeAd.email}
              </a>
            </div>
          ) : (
            <span className="font-medium text-[#2d4a43] italic line-clamp-2">
              "{activeAd.text}"
            </span>
          )}
        </div>
      </div>
    </div>
  );
}