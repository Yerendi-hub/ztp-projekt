import React, { useRef } from 'react';
import { Activity, ScanFace, FileText, FolderOpen, Trash2, Upload } from 'lucide-react';

export default function FileUploadZone({ files, setFiles }) {
  const fileTypes = [
    { id: 'blood', title: 'BloodTest.dat', desc: 'Lab results & blood work', icon: <Activity className="w-10 h-10 text-white" />, accept: '.dat', multiple: false },
    { id: 'scan', title: 'BodyScan.img', desc: 'X-ray, MRI, CT scans', icon: <ScanFace className="w-10 h-10 text-white" />, accept: 'image/*,.img', multiple: false },
    { id: 'record', title: 'MedRecord.txt', desc: 'Medical docs & scripts', icon: <FileText className="w-10 h-10 text-white" />, accept: '.txt,.pdf,.doc,.docx', multiple: false },
    { id: 'other', title: 'Other files', desc: 'Any kind of file extension', icon: <FolderOpen className="w-10 h-10 text-white" />, accept: '*', multiple: true },
  ];

  const fileInputRefs = { blood: useRef(null), scan: useRef(null), record: useRef(null), other: useRef(null) };

  const handleFileChange = (e) => {
    const chosenFiles = Array.from(e.target.files);
    if (chosenFiles.length === 0) return;
    const newFileNames = chosenFiles.map(file => file.name);
    setFiles(prevFiles => [...prevFiles, ...newFileNames.filter(name => !prevFiles.includes(name))]);
    e.target.value = '';
  };

  const triggerKeyClick = (id) => {
    if (fileInputRefs[id]?.current) fileInputRefs[id].current.click();
  };

  return (
    <div className="h-full flex flex-col justify-between gap-4 flex-1">
      <div className="flex flex-col flex-1 h-full">
        <h2 className="bg-[#5b8276] text-[#f4f1e3] px-2 py-1 text-xs font-bold mb-4 tracking-wider shrink-0">
          &gt; UPLOAD MEDICAL DATA
        </h2>
        <div className="grid grid-cols-2 gap-4 flex-1 h-full">
          {fileTypes.map((type) => (
            <div key={type.id} className="border border-[#2d4a43] p-4 bg-white/50 text-center flex flex-col justify-between items-center h-full transition-all hover:bg-white/80">
              <input type="file" ref={fileInputRefs[type.id]} accept={type.accept} multiple={type.multiple} onChange={handleFileChange} className="hidden" />

              <div className="bg-[#5b8276] p-3 rounded-sm border border-[#2d4a43]/40 mt-2 shrink-0">
                {type.icon}
              </div>

              <div className="flex flex-col gap-1 my-2">
                <div className="text-sm font-bold tracking-wide">{type.title}</div>
                <div className="text-[11px] opacity-70 leading-tight px-2">{type.desc}</div>
              </div>
              
              <button 
                type="button"
                onClick={() => triggerKeyClick(type.id)}
                className="mb-2 border border-[#2d4a43] text-xs px-4 py-1.5 bg-[#f4f1e3] hover:bg-[#e2decb] font-bold cursor-pointer active:scale-95 transition-transform flex items-center gap-2 shrink-0"
              >
                <Upload className="w-3.5 h-3.5" /> [ UPLOAD ]
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* lista wgranych plików */}
      {files.length > 0 && (
        <div className="border border-[#2d4a43] p-2 bg-[#e2decb]/50 text-xs shrink-0">
          <div className="font-bold mb-1 text-[#497063]">&gt; LOADED FILES: [{files.length}]</div>
          <div className="max-h-24 overflow-y-auto">
            {files.map((fileName, idx) => (
              <div key={idx} className="flex justify-between items-center bg-white/80 p-1.5 mb-1 border border-[#2d4a43]/30">
                <span className="truncate pr-2 flex items-center gap-2 font-semibold">
                  <FileText className="w-3.5 h-3.5 text-[#5b8276]" /> {fileName}
                </span>
                <button type="button" onClick={() => setFiles(files.filter(f => f !== fileName))} className="text-red-700 hover:bg-red-100 p-1 rounded-sm cursor-pointer">
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