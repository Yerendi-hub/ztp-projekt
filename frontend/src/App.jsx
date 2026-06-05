import React, { useState } from 'react';
import bgImage from '/background.jpg';
import Advertisement from './components/Advertisement';
import FileUploadZone from './components/FileUploadZone';
import PatientForm from './components/PatientForm';
import DiagnosisReport from './components/DiagnosisReport';
import DrHouseBot from './components/DrHouseBot';
import ProgressBar from './components/ProgressBar';
import { Users } from 'lucide-react';
import AnalysisError from './components/AnalysisError';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5080';

export default function App() {
  const [appState, setAppState] = useState('closed');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [finalData, setFinalData] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [analysisError, setAnalysisError] = useState('');

  const handleRunAnalysis = async (formData) => {
    setAppState('analyzing');
    setFinalData(formData);
    setDiagnosis(null);
    setAnalysisError('');

    try {
      const uploadedFile = uploadedFiles[0];
      const response = uploadedFile
        ? await postPdfForPrediction(uploadedFile)
        : await postFormForPrediction(formData);

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.message || `Backend returned HTTP ${response.status}`);
      }

      const diagnosisResponse = await response.json();
      setDiagnosis(diagnosisResponse);
      setAppState('diagnosis');
    } catch (error) {
      setAnalysisError(error.message || 'Unable to connect diagnostic backend with prediction model.');
      setAppState('error');
    }
  };

  const postFormForPrediction = (formData) => fetch(`${API_BASE_URL}/api/diagnosis/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  });

  const postPdfForPrediction = (file) => {
    const payload = new FormData();
    payload.append('file', file);

    return fetch(`${API_BASE_URL}/api/diagnosis/predict/pdf`, {
      method: 'POST',
      body: payload
    });
  };

  const handleReset = () => {
    setAppState('closed');
    setUploadedFiles([]);
    setFinalData(null);
    setDiagnosis(null);
    setAnalysisError('');
  };

  return (
    <div className="min-h-screen p-3 md:p-6 font-mono text-[#2d4a43] flex flex-col justify-between select-none relative bg-[#e2decb]">
      <div
        className="absolute inset-0 bg-repeat opacity-60 pointer-events-none z-0"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      <div className="z-10 relative flex flex-col justify-between flex-1 gap-4 md:gap-6">
        <div>
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
                <p className="text-[10px] md:text-xs opacity-70">AI-powered medical analysis terminal</p>
              </div>
            </div>
            <Advertisement />
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 items-stretch mt-4 md:mt-6">
            {(appState === 'closed' || appState === 'analyzing') && (
              <>
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

            {appState === 'diagnosis' && (
              <div className="lg:col-span-2 flex items-center justify-center w-full min-h-[320px] lg:min-h-[500px]">
                <DiagnosisReport
                  formData={finalData}
                  onReset={handleReset}
                  diabetesProbability={diagnosis?.diabetesProbability ?? diagnosis?.diabetes?.probabilityPercent ?? 0}
                  heartDiseaseProbability={diagnosis?.heartDiseaseProbability ?? diagnosis?.heartDisease?.probabilityPercent ?? 0}
                  usedData={diagnosis?.usedData ?? []}
                />
              </div>
            )}

            {appState === 'error' && (
              <div className="lg:col-span-2 flex items-center justify-center w-full min-h-[320px] lg:min-h-[500px]">
                <div className="w-full max-w-2xl h-full flex items-center justify-center">
                  <AnalysisError
                    errorMessage={analysisError || 'CRITICAL DEVIATION: Biological parameters entered violate system baseline configuration. Core execution halted.'}
                    onReset={handleReset}
                  />
                </div>
              </div>
            )}
          </main>
        </div>

        <footer className="bg-[#f4f1e3] border-2 border-[#2d4a43] shadow-sm text-xs mt-auto shrink-0">
          <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-3 p-3 md:p-4 border-b border-[#2d4a43]/20">
            <div className="text-center md:text-left font-bold tracking-wide text-[11px] md:text-xs">
              Dr.Byte 2026 &copy; All rights reserved.
            </div>

            <div className="flex items-center justify-center gap-2 text-[#5b8276] font-bold text-center">
              <Users className="w-4 h-4 shrink-0" />
              <span className="text-[#2d4a43]/60 text-[13px] uppercase tracking-wider hidden sm:inline">DEVS:</span>
              <span className="text-[#2d4a43] tracking-wide text-[13px] break-words">
                Zuzanna Brauer, Maja Chlipala, Konrad Kowalczyk
              </span>
            </div>

            <div className="w-full max-w-xs md:max-w-sm flex justify-center md:justify-end shrink-0 overflow-hidden">
              <DrHouseBot
                appState={appState}
                uploadedFilesCount={uploadedFiles.length}
                formData={finalData || {}}
              />
            </div>
          </div>

          <div className="bg-[#a63a3a]/5 text-[#a63a3a] text-[10px] md:text-[10px] font-bold tracking-wider md:tracking-widest text-center py-2 px-2 shrink-0">
            [ System notice: for educational use only // not for clinical diagnosis ]
          </div>
        </footer>
      </div>
    </div>
  );
}
