import React from 'react';
import { FileCheck, ShieldAlert, RefreshCw } from 'lucide-react';

export default function DiagnosisReport({ 
  formData, 
  onReset,
  // Nowe propsy przekazywane bezpośrednio z odpowiedzi z backendu:
  diabetesProbability = 0, 
  heartDiseaseProbability = 0 
}) {
  const age = parseInt(formData?.age, 10) || 30;
  const bmi = parseFloat(formData?.bmi) || 22;
  const glucose = parseInt(formData?.glucose, 10) || 90;
  const smoking = formData?.smoking === 'yes';

  // Dynamiczny procent pewności obliczany na podstawie wypełnienia formularza (zostawiamy na froncie)
  const filledFields = Object.values(formData || {}).filter(val => val !== '').length;
  const confidencePercent = Math.min(40 + (filledFields * 3.5), 99);

  let status = "STABLE";
  let statusColor = "text-green-700 border-green-700";
  let primaryFinding = "Overall health markers within normal range. No immediate concerns detected.";
  const recommendations = [
    "Schedule a routine follow-up in 6 months. Don't wait until something breaks.",
    "Hydration levels look sub-optimal. Maintain consistent fluid intake.",
    "Keep tracking biometrics through this terminal regularly."
  ];

  // Logika modyfikacji tekstów na podstawie danych (może zostać na froncie lub też docelowo lecieć z backendu)
  if (bmi > 30 || glucose > 125 || smoking) {
    status = "WARNING";
    statusColor = "text-amber-700 border-amber-700 bg-amber-50";
    primaryFinding = "Metabolic and cardiovascular markers indicate elevated systemic stress.";
    
    if (bmi > 30) recommendations.unshift("Initiate dietary restructuring to optimize current BMI metrics.");
    if (glucose > 125) recommendations.unshift("Fasting glucose exceeds nominal limits. Limit glycemic load immediately.");
    if (smoking) recommendations.unshift("Vascular parameters under duress. Cessation of nicotine exposure highly recommended.");
  }

  return (
    <div className="w-full max-w-3xl mx-auto border-2 border-[#2d4a43] bg-[#f4f1e3] p-5 shadow-[4px_4px_0px_0px_rgba(45,74,67,0.1)] font-mono text-[#2d4a43]">
      
      {/* nagłówek raportu */}
      <div className="flex items-center gap-2 bg-[#5b8276] text-[#f4f1e3] px-3 py-1.5 text-xs font-bold mb-5 border border-[#2d4a43]/30">
        <FileCheck className="w-4 h-4" />
        <span>Diagnosis report generated successfully</span>
      </div>

      {/* panel głównych parametrów (status + confidence) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
        {/* status */}
        <div className="sm:col-span-1 border border-[#2d4a43] p-3 flex flex-col justify-center items-center bg-white/50">
          <span className="text-[14px] font-bold opacity-70 mb-1">Status</span>
          <span className={`text-sm font-black border px-2 py-0.5 tracking-wider ${statusColor}`}>
            {status}
          </span>
        </div>

        {/* confidence */}
        <div className="sm:col-span-3 border border-[#2d4a43] p-3 bg-white/50 flex flex-col justify-center">
          <div className="flex justify-between text-[14px] font-bold mb-1 opacity-70">
            <span>Confidence Level</span>
            <span>{Math.round(confidencePercent)}%</span>
          </div>
          {/* pasek postępu */}
          <div className="w-full h-5 border border-[#2d4a43] bg-[#e2decb]/40 p-0.5">
            <div 
              className="h-full bg-[#5b8276] border-r border-[#2d4a43] transition-all duration-1000"
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ryzyko chorobowe */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="border border-[#2d4a43] p-3 bg-white/50 flex justify-between items-center">
          <span className="text-[14px] font-bold opacity-70">Diabetes type II:</span>
          <span className={`text-[14px] font-black tracking-wide ${diabetesProbability > 50 ? 'text-amber-700' : 'text-[#2d4a43]'}`}>
            {diabetesProbability}% positive
          </span>
        </div>
        <div className="border border-[#2d4a43] p-3 bg-white/50 flex justify-between items-center">
          <span className="text-[14px] font-bold opacity-70">Heart disease:</span>
          <span className={`text-[14px] font-black tracking-wide ${heartDiseaseProbability > 50 ? 'text-amber-700' : 'text-[#2d4a43]'}`}>
            {heartDiseaseProbability}% positive
          </span>
        </div>
      </div>

      {/* główne znalezisko */}
      <div className="border border-[#2d4a43] p-4 mb-4 bg-white/40">
        <div className="text-[14px] font-bold opacity-75 mb-1.5">&gt; Primary finding:</div>
        <p className="text-[12pxpx] leading-relaxed tracking-wide font-semibold bg-white p-2.5 border border-[#2d4a43]/30">
          {primaryFinding}
        </p>
      </div>

      {/* rekomendacje */}
      <div className="border border-[#2d4a43] p-4 mb-4 bg-white/40">
        <div className="text-[14px] font-bold opacity-75 mb-2">&gt; Recommendations:</div>
        <ul className="text-[12pxpx] space-y-2 tracking-wide bg-white p-3 border border-[#2d4a43]/30 list-none">
          {recommendations.map((rec, index) => (
            <li key={index} className="leading-relaxed flex items-start gap-1.5">
              <span className="font-bold opacity-60 shrink-0">[{index + 1}]</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* disclaimer */}
      <div className="border border-purple-800/40 bg-purple-50/30 p-2.5 text-[11px] leading-relaxed text-purple-900/80 mb-5 flex gap-2 items-center">
        <ShieldAlert className="w-4 h-4 text-purple-800 shrink-0" />
        <span><strong>Disclaimer:</strong> AI-generated analysis. Consult licensed medical professionals for actual medical advice.</span>
      </div>

      {/* run another analysis*/}
      <div className="flex justify-end">
        <button 
          onClick={onReset} 
          type="button"
          className="bg-[#5b8276] hover:bg-[#497063] text-[#f4f1e3] font-bold px-4 py-2 border-2 border-[#2d4a43] text-xs flex items-center gap-2 cursor-pointer transition-transform active:scale-95 shadow-[2px_2px_0px_0px_rgba(45,74,67,0.1)]"
        >
          <RefreshCw className="w-3.5 h-3.5" /> [ New analysis ]
        </button>
      </div>

    </div>
  );
}