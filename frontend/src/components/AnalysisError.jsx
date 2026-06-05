import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function AnalysisError({ errorMessage, onReset }) {
  return (
    <div className="w-full max-w-xl border-4 border-[#a63a3a] bg-[#f4f1e3] p-6 text-left font-mono shadow-[6px_6px_0px_0px_rgba(166,58,58,0.15)] animate-pulse-subtle">
      
      {/* nagłówek błędu */}
      <div className="flex items-center gap-3 border-b-2 border-[#a63a3a] pb-3 mb-4">
        <div className="bg-[#a63a3a] p-2 text-[#f4f1e3]">
          <AlertTriangle className="w-6 h-6 text-[#f4f1e3]" />
        </div>
        <div>
          <h2 className="text-base font-black tracking-widest text-[#a63a3a] ">
            [ Critical failure // error 503 ]
          </h2>
          <p className="text-[10px] opacity-70">Core diagnostic engine interrupted</p>
        </div>
      </div>

      {/* opis problemu */}
      <div className="bg-[#a63a3a]/5 border border-[#a63a3a]/30 p-3 mb-6 text-xs text-[#2d4a43] space-y-2 leading-relaxed">
        <div className="font-bold text-[#a63a3a]">&gt; Status: data stream corrupted</div>
        <p>
          {errorMessage || "The uploaded bio-telemetry payload contains unreadable vectors or the internal mock execution stack exploded. Unable to reach consensus on clinical metrics."}
        </p>
      </div>

      {/* lista techniczna dla efektu */}
      <div className="text-[10px] opacity-60 space-y-1 mb-6 border-l-2 border-[#2d4a43]/20 pl-3">
        <div>// dump_log: 0x000F3A21</div>
        <div>// subsystem: dr-byte</div>
        <div>// recommendation: check if files are plain text/valid images and metrics are numeric.</div>
      </div>

      {/* przycisk powrotu */}
      <button
        type="button"
        onClick={onReset}
        className="w-full bg-[#a63a3a] hover:bg-[#8c3030] text-[#f4f1e3] font-bold py-2.5 px-4 border-2 border-[#2d4a43] text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-[2px_2px_0px_0px_rgba(45,74,67,0.1)]"
      >
        <RefreshCw className="w-4 h-4" />
        <span>[ Reboot terminal & re-evaluate ]</span>
      </button>

    </div>
  );
}
