import React, { useState, useEffect } from 'react';
import { Stethoscope, X } from 'lucide-react';

export default function DrHouseBot({ appState, uploadedFilesCount, formData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("Upload data files or insert biometric parameters. Everyone lies, but numbers don't.");

  // dynamiczne generowanie komentarzy na podstawie stanu i wpisanych danych pacjenta
  useEffect(() => {
    if (appState === 'closed') {
      // sprawdzamy stan danych wejściowych, aby podpowiedzieć użytkownikowi co ma zrobić
      const isFormFilled = formData && Object.values(formData).some(val => val !== '');
      const hasFiles = uploadedFilesCount > 0;

      if (!hasFiles && !isFormFilled) {
        setMessage("The terminal is idle. Feed me some telemetry data - either drop lab files on the left or type your metrics on the right.");
      } else if (hasFiles && !isFormFilled) {
        setMessage("Files staged. Good. You can run the engine now, or fill those 17 biometric fields if you want a truly precise post-mortem.");
      } else if (!hasFiles && isFormFilled) {
        setMessage("Biometrics logged. Ready to roll. Though a raw blood report upload would make my digital diagnosis slightly less of a guessing game.");
      } else {
        setMessage("Perfect. Telemetry locked. Run the sequence. Let's find out what's breaking inside you.");
      }
    } 
    
    else if (appState === 'analyzing') {
      setMessage("Crunching your files... Modern computing processing human design flaws. Sit tight and try not to panic.");
    } 
    
    else if (appState === 'diagnosis') {
      // analiza generowanego raportu na podstawie danych z formularza i wgranych plików, żeby wygenerować spersonalizowany komentarz Dr House'a
      const age = parseInt(formData?.age, 10);
      const bmi = parseFloat(formData?.bmi);
      const glucose = parseInt(formData?.glucose, 10);
      const smoking = formData?.smoking;

      let houseComment = "Analysis complete. It's not Lupus. It's never Lupus. Your systems are within boring operational tolerances. Change your diet and touch some grass.";

      if (bmi > 30 || glucose > 125) {
        houseComment = `Fascinating. With a BMI of ${bmi || 'that high'} and glucose looking like a stock market bubble, your pancreas is working overtime shifts. Cut the sugar before your body cuts you off.`;
      } else if (smoking === 'yes') {
        houseComment = "Primary findings suggest structural lung stress. Voluntarily inhaling toxic smoke in 2026? Bold strategy. Let's see how that plays out for your vascular system.";
      } else if (age > 65) {
        houseComment = `Patient age is ${age}. Mileage is showing on the schematics. No critical catastrophic failures detected yet, but keep monitoring the oil pressure.`;
      }

      setMessage(houseComment);
    }
  }, [appState, uploadedFilesCount, formData]);

  return (
    <div className="fixed bottom-4 right-4 z-50 font-mono">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          type="button"
          className="bg-[#a63a3a] hover:bg-[#8c3030] text-[#f4f1e3] px-4 py-2 border-2 border-[#2d4a43] text-xs font-bold shadow-[2px_2px_0px_0px_rgba(45,74,67,0.2)] cursor-pointer flex items-center gap-2 transition-colors active:translate-y-[1px] active:shadow-none"
        >
          <Stethoscope className="w-4 h-4 text-[#f4f1e3]" />
          <span>DrHouse.exe [ + ]</span>
        </button>
      ) : (
        <div className="w-80 bg-[#f4f1e3] border-2 border-[#2d4a43] shadow-[4px_4px_0px_0px_rgba(45,74,67,0.15)] p-2 relative text-[#2d4a43]">
          <div className="bg-[#a63a3a] text-[#f4f1e3] text-[11px] px-1.5 py-1 flex justify-between items-center font-bold mb-3 border border-[#2d4a43]/30">
            <div className="flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>DrHouse.exe</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              type="button"
              className="bg-[#f4f1e3] hover:bg-[#e2decb] text-[#a63a3a] border border-[#2d4a43] px-1 text-[9px] font-black cursor-pointer flex items-center justify-center h-4 w-4"
            >
              <X className="w-2.5 h-2.5 stroke-[3]" />
            </button>
          </div>
          
          <div className="flex gap-2.5 items-start">
            <div className="w-10 h-10 bg-[#2d4a43] flex items-center justify-center border border-[#2d4a43] shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.15)]">
              <Stethoscope className="w-6 h-6 text-[#f4f1e3]" />
            </div>
            
            <div className="flex-1 bg-white text-[11px] p-2 border border-[#2d4a43] rounded-sm leading-relaxed relative shadow-[1px_1px_0px_0px_rgba(0,0,0,0.05)]">
              <div className="absolute top-3 -left-[5px] w-2 h-2 bg-white border-l border-b border-[#2d4a43] rotate-45"></div>
              {message}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}