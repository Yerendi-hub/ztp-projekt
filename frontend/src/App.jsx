import React, { useState } from 'react';
import bgImage from '/background.jpg';
import Advertisement from './components/Advertisement';
import FileUploadZone from './components/FileUploadZone';
import PatientForm from './components/PatientForm';
import DiagnosisReport from './components/DiagnosisReport';
import DrHouseBot from './components/DrHouseBot';
import ProgressBar from './components/ProgressBar';
import { RefreshCw, FileCheck, Users } from 'lucide-react';
import AnalysisError from './components/AnalysisError';

export default function App() {
  const [appState, setAppState] = useState('closed'); 
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [finalData, setFinalData] = useState(null);

  const handleRunAnalysis = (formData) => {
    setAppState('analyzing');
    setFinalData(formData);
    
    setTimeout(() => {
      // wyzwalacz błędu, tj. wiek > 130
      if (formData && parseInt(formData.age, 10) > 130) {
        setAppState('error');
      } else {
        setAppState('diagnosis');
      }
    }, 3000);
  };

  const handleReset = () => {
    setAppState('closed');
    setUploadedFiles([]);
    setFinalData(null);
  };

  return (
    <div className="min-h-screen p-3 md:p-6 font-mono text-[#2d4a43] flex flex-col justify-between select-none relative bg-[#e2decb]">
      
      {/* tło */}
      <div 
        className="absolute inset-0 bg-repeat opacity-60 pointer-events-none z-0"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* interfejs */}
      <div className="z-10 relative flex flex-col justify-between flex-1 gap-4 md:gap-6">
        
        <div>
          {/* nagłówek*/}
          <header className="bg-[#f4f1e3] border-2 border-[#2d4a43] p-3 md:p-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={handleReset}
                type="button"
                title="Return to main panel"
                className="bg-[#5b8276] hover:bg-[#497063] text-[#f4f1e3] w-9 h-9 md:w-10 md:h-10 font-bold text-lg md:text-xl border-2 border-[#2d4a43] flex items-center justify-center cursor-pointer transition-transform active:scale-95 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.15)]"
              >
                +
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-wider leading-none mb-1">Dr.Byte</h1>
                <p className="text-[10px] md:text-xs opacity-70">AI-Powered Medical Analysis Terminal</p>
              </div>
            </div>
            <Advertisement />
          </header>

          {/* panel główny */}
          <main className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 items-stretch mt-4 md:mt-6">
            
            {/* upload + formularz */}
            {(appState === 'closed' || appState === 'analyzing') && (
              <>
                {/* strefa uploadu */}
                <div className="border-2 border-[#497063] p-4 md:p-5 bg-[#f4f1e3] rounded-sm flex flex-col justify-between min-h-[320px] lg:min-h-[500px] shadow-[4px_4px_0px_0px_rgba(45,74,67,0.1)]">
                  <div className="flex-1 flex flex-col justify-between">
                    <FileUploadZone files={uploadedFiles} setFiles={setUploadedFiles} />
                  </div>
                  {appState === 'analyzing' && (
                    <div className="mt-4 shrink-0">
                      <ProgressBar />
                    </div>
                  )}
                </div>

                {/* formularz */}
                <div className="border-2 border-[#497063] p-4 md:p-5 bg-[#f4f1e3] rounded-sm flex flex-col justify-between lg:max-h-[650px] shadow-[4px_4px_0px_0px_rgba(45,74,67,0.1)]">
                  <PatientForm 
                    onSubmit={handleRunAnalysis} 
                    onReset={handleReset} 
                    isAnalyzing={appState === 'analyzing'} 
                    uploadedFilesCount={uploadedFiles.length} 
                  />
                </div>
              </>
            )}

            {/* ekran udanego wyniku */}
            {appState === 'diagnosis' && (
              <div className="lg:col-span-2 flex items-center justify-center w-full min-h-[320px] lg:min-h-[500px]">
                <DiagnosisReport formData={finalData} onReset={handleReset} />
              </div>
            )}

            {/* ekran błędu */}
            {appState === 'error' && (
              <div className="lg:col-span-2 flex items-center justify-center w-full min-h-[320px] lg:min-h-[500px]">
                <div className="w-full max-w-2xl h-full flex items-center justify-center">
                  <AnalysisError 
                    errorMessage="CRITICAL DEVIATION: Biological parameters entered violate system baseline configuration. Core execution halted." 
                    onReset={handleReset} 
                  />
                </div>
              </div>
            )}
            
          </main>
        </div>

        {/* stopka  */}
        <footer className="bg-[#f4f1e3] border-2 border-[#2d4a43] shadow-sm text-xs mt-auto shrink-0">
          <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-3 p-3 md:p-4 border-b border-[#2d4a43]/20">
            <div className="text-center md:text-left font-bold tracking-wide text-[11px] md:text-xs">
              Dr.Byte 2026 &copy; All rights reserved.
            </div>

            {/* devs */}
            <div className="flex items-center justify-center gap-2 text-[#5b8276] font-bold text-center">
              <Users className="w-4 h-4 shrink-0" />
              <span className="text-[#2d4a43]/60 text-[9px] uppercase tracking-wider hidden sm:inline">DEVS:</span>
              <span className="text-[#2d4a43] tracking-wide text-[11px] md:text-xs break-words">
                Zuzanna Brauer, Maja Chlipała, Konrad Kowalczyk
              </span>
            </div>

            <div className="w-full max-w-xs md:max-w-sm flex justify-center md:justify-end shrink-0 overflow-hidden">
              <DrHouseBot 
                appState={appState} 
                uploadedFilesCount={uploadedFiles.length} 
                formData={{}}
              />
            </div>

          </div>

          {/* niższa stopka */}
          <div className="bg-[#a63a3a]/5 text-[#a63a3a] text-[9px] md:text-[10px] font-bold tracking-wider md:tracking-widest text-center py-2 px-2 uppercase shrink-0">
            [ SYSTEM NOTICE: FOR EDUCATIONAL USE ONLY // NOT FOR REAL CLINICAL DIAGNOSIS ]
          </div>

        </footer>

      </div>
    </div>
  );
}