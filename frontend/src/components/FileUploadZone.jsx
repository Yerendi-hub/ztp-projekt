import React, { useRef } from 'react';
import { FileText, Trash2, Upload, FolderOpen } from 'lucide-react';

export default function FileUploadZone({ files, setFiles }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const chosenFiles = Array.from(e.target.files);
    if (chosenFiles.length === 0) return;
    
    const newFileNames = chosenFiles.map(file => file.name);
    // łączymy pliki unikając duplikatów
    setFiles(prevFiles => [...prevFiles, ...newFileNames.filter(name => !prevFiles.includes(name))]);
    e.target.value = '';
  };

  const triggerClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  return (
    <div className="h-full flex flex-col justify-between gap-4 flex-1">
      <div className="flex flex-col flex-1 h-full">
        {/* nagłówek sekcji */}
        <h2 className="bg-[#5b8276] text-[#f4f1e3] px-2 py-1 text-[14px] font-bold mb-4 tracking-wider shrink-0">
          &gt; Upload medical data
        </h2>
        
        {/* dropzone */}
        <div 
          onClick={triggerClick}
          className="border-2 border-dashed border-[#497063] p-6 bg-white/40 text-center flex flex-col justify-center items-center flex-1 h-full min-h-[250px] transition-all hover:bg-white/70 hover:border-[#2d4a43] cursor-pointer group rounded-sm"
        >
          {/* ukryty input akceptujący dokumenty i obrazy */}
          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".txt,.pdf,.doc,.docx,.dat,image/*,.img" 
            multiple={true} 
            onChange={handleFileChange} 
            className="hidden" 
          />

          <div className="bg-[#5b8276] p-4 rounded-sm border border-[#2d4a43]/40 mb-4 transition-transform group-hover:scale-105 shadow-[2px_2px_0px_0px_rgba(45,74,67,0.15)]">
            <FolderOpen className="w-12 h-12 text-white" />
          </div>

          <div className="flex flex-col gap-1.5 max-w-sm">
            <div className="text-[16px] font-black tracking-wide text-[#2d4a43]">
              Click to browse or drop your files here
            </div>
            <div className="text-[13px] opacity-70 leading-relaxed px-4">
              Supported formats include laboratory reports (.txt, .dat, .pdf) & diagnostic imaging (.img, png, jpg)
            </div>
          </div>
          
          <button 
            type="button"
            className="border-2 border-[#2d4a43] text-[13px] px-5 py-2 bg-[#f4f1e3] hover:bg-[#e2decb] font-bold cursor-pointer transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(45,74,67,0.15)] uppercase w-full max-w-[240px] shrink-0 mt-6"
          >
            <Upload className="w-4 h-4 text-[#497063] shrink-0" /> 
            <span>[ Upload files ]</span>
          </button>
        </div>
      </div>

      {/* lista wgranych plików */}
      {files.length > 0 && (
        <div className="border-2 border-[#2d4a43] p-3 bg-[#e2decb]/50 text-[13px] shrink-0 mt-2">
          <div className="font-bold mb-2 text-[#497063] tracking-wider">&gt; Loaded files: [{files.length}]</div>
          <div className="max-h-36 overflow-y-auto pr-1">
            {files.map((fileName, idx) => (
              <div key={idx} className="flex justify-between items-center bg-white/90 p-2 mb-1.5 border border-[#2d4a43]/30 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.05)]">
                <span className="truncate pr-2 flex items-center gap-2 font-semibold text-[#2d4a43]">
                  <FileText className="w-4 h-4 text-[#5b8276] shrink-0" /> {fileName}
                </span>
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setFiles(files.filter(f => f !== fileName));
                  }} 
                  className="text-red-700 hover:bg-red-50 p-1 rounded-sm cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}