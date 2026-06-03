import React, { useState } from 'react';
import { Play, XCircle } from 'lucide-react';

export default function PatientForm({ onSubmit, onReset, isAnalyzing, uploadedFilesCount }) {
  const initialFormState = {
    age: '',
    sex: '',
    weight: '',
    height: '',
    smokingHistory: '',
    hbA1c: '',
    bloodGlucose: '',
    fastingSugar: '',
    cholesterol: '',
    chestPain: '',
    restingBloodPressure: '',
    restingEcg: '',
    maxHeartRate: '',
    exerciseAngina: '',
    stDepression: '',
    stSlope: '',
    majorVessels: '',
    thal: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormReset = () => {
    setFormData(initialFormState);
    onReset();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormEmpty = Object.values(formData).every(value => value === '');
  const isReadyToAnalyze = !isFormEmpty || uploadedFilesCount > 0;
  const isSubmitDisabled = isAnalyzing || !isReadyToAnalyze;

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col justify-between">
      <div className="space-y-4 overflow-y-auto pr-1 flex-1 max-h-[480px]">
        
        {/* basic info */}
        <div>
          <h3 className="text-[10px] font-bold text-[#5b8276] tracking-wider mb-2">&gt; BASIC BIOMETRICS</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block text-[10px] uppercase font-bold mb-1">Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} disabled={isAnalyzing} placeholder="Years" className="w-full text-xs p-1.5 border border-[#2d4a43] bg-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold mb-1">Biological Sex</label>
              <select name="sex" value={formData.sex} onChange={handleChange} disabled={isAnalyzing} className="w-full text-xs p-1.5 border border-[#2d4a43] bg-white focus:outline-none">
                <option value="">--</option>
                <option value="M">MALE</option>
                <option value="F">FEMALE</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold mb-1">Weight</label>
              <input type="number" name="weight" value={formData.weight} onChange={handleChange} disabled={isAnalyzing} placeholder="kg" className="w-full text-xs p-1.5 border border-[#2d4a43] bg-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold mb-1">Height</label>
              <input type="number" name="height" value={formData.height} onChange={handleChange} disabled={isAnalyzing} placeholder="cm" className="w-full text-xs p-1.5 border border-[#2d4a43] bg-white focus:outline-none" />
            </div>
          </div>
          <div className="mt-2">
            <label className="block text-[10px] uppercase font-bold mb-1">Tobacco Smoking History</label>
            <select name="smokingHistory" value={formData.smokingHistory} onChange={handleChange} disabled={isAnalyzing} className="w-full text-xs p-1.5 border border-[#2d4a43] bg-white focus:outline-none">
              <option value="">-- Select Status --</option>
              <option value="never">Never Smoked</option>
              <option value="former">Former Smoker (Quit)</option>
              <option value="current">Current Smoker</option>
              <option value="not_current">Not Current (Occasional)</option>
              <option value="ever">Ever Smoked (In History)</option>
              <option value="no_info">No Information Available</option>
            </select>
          </div>
        </div>

        {/* metabolic & blood*/}
        <div>
          <h3 className="text-[10px] font-bold text-[#5b8276] tracking-wider mb-2">&gt; METABOLIC & METRIC BLOOD WORK</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-[10px] uppercase font-bold mb-1">HbA1c Level (3-Month Avg)</label>
              <input type="number" step="0.1" name="hbA1c" value={formData.hbA1c} onChange={handleChange} disabled={isAnalyzing} placeholder="Percentage (%)" className="w-full text-xs p-1.5 border border-[#2d4a43] bg-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold mb-1">Blood Glucose Level</label>
              <input type="number" name="bloodGlucose" value={formData.bloodGlucose} onChange={handleChange} disabled={isAnalyzing} placeholder="Current Sugar (mg/dL)" className="w-full text-xs p-1.5 border border-[#2d4a43] bg-white focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] uppercase font-bold mb-1">Tested on Empty Stomach? (Fasting)</label>
              <select name="fastingSugar" value={formData.fastingSugar} onChange={handleChange} disabled={isAnalyzing} className="w-full text-xs p-1.5 border border-[#2d4a43] bg-white focus:outline-none">
                <option value="">-- Select State --</option>
                <option value="true">True (Fasting Glucose &gt; 120 mg/dL)</option>
                <option value="false">False (Normal / Under 120 mg/dL)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold mb-1">Total Cholesterol Measure</label>
              <input type="number" name="cholesterol" value={formData.cholesterol} onChange={handleChange} disabled={isAnalyzing} placeholder="Serum Cholesterol (mg/dL)" className="w-full text-xs p-1.5 border border-[#2d4a43] bg-white focus:outline-none" />
            </div>
          </div>
        </div>

        {/* cardiovascular */}
        <div>
          <h3 className="text-[10px] font-bold text-[#5b8276] tracking-wider mb-2">&gt; CARDIOVASCULAR BASELINE</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-[10px] uppercase font-bold mb-1">Chest Pain Specification</label>
              <select name="chestPain" value={formData.chestPain} onChange={handleChange} disabled={isAnalyzing} className="w-full text-xs p-1.5 border border-[#2d4a43] bg-white focus:outline-none">
                <option value="">-- Select Pain Type --</option>
                <option value="asymptomatic">Asymptomatic (No Pain)</option>
                <option value="typical">Typical Angina (Classic Heart Pain)</option>
                <option value="atypical">Atypical Angina</option>
                <option value="non-anginal">Non-Anginal Pain (Other Chest Pain)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold mb-1">Resting Blood Pressure</label>
              <input type="number" name="restingBloodPressure" value={formData.restingBloodPressure} onChange={handleChange} disabled={isAnalyzing} placeholder="Systolic Value (mmHg)" className="w-full text-xs p-1.5 border border-[#2d4a43] bg-white focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold mb-1">Resting ECG Condition</label>
            <select name="restingEcg" value={formData.restingEcg} onChange={handleChange} disabled={isAnalyzing} className="w-full text-xs p-1.5 border border-[#2d4a43] bg-white focus:outline-none">
              <option value="">-- Select Observation --</option>
              <option value="normal">Normal Baseline</option>
              <option value="st-t">ST-T Wave Abnormality</option>
              <option value="hypertrophy">Left Ventricular Hypertrophy (LVH)</option>
            </select>
          </div>
        </div>

        {/* stress */}
        <div>
          <h3 className="text-[10px] font-bold text-[#5b8276] tracking-wider mb-2">&gt; STRESS TEST & ADVANCED CLINICAL IMAGING</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-[10px] uppercase font-bold mb-1">Maximum Heart Rate Achieved</label>
              <input type="number" name="maxHeartRate" value={formData.maxHeartRate} onChange={handleChange} disabled={isAnalyzing} placeholder="Max HR during test (bpm)" className="w-full text-xs p-1.5 border border-[#2d4a43] bg-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold mb-1">Exercise Induced Angina</label>
              <select name="exerciseAngina" value={formData.exerciseAngina} onChange={handleChange} disabled={isAnalyzing} className="w-full text-xs p-1.5 border border-[#2d4a43] bg-white focus:outline-none">
                <option value="">-- Pain Triggered by Exercise? --</option>
                <option value="true">True (Yes, pain triggered)</option>
                <option value="false">False (No pain triggered)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-[10px] uppercase font-bold mb-1">ST Depression (Relative to Rest)</label>
              <input type="number" step="0.1" name="stDepression" value={formData.stDepression} onChange={handleChange} disabled={isAnalyzing} placeholder="Oldpeak Value" className="w-full text-xs p-1.5 border border-[#2d4a43] bg-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold mb-1">Peak Exercise ST Segment Slope</label>
              <select name="stSlope" value={formData.stSlope} onChange={handleChange} disabled={isAnalyzing} className="w-full text-xs p-1.5 border border-[#2d4a43] bg-white focus:outline-none">
                <option value="">-- Select Slope Profile --</option>
                <option value="upsloping">Upsloping (Normal / Stable)</option>
                <option value="flat">Flat Segment</option>
                <option value="downsloping">Downsloping (Ischemia Indicator)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] uppercase font-bold mb-1">Major Vessels (Fluoroscopy)</label>
              <select name="majorVessels" value={formData.majorVessels} onChange={handleChange} disabled={isAnalyzing} className="w-full text-xs p-1.5 border border-[#2d4a43] bg-white focus:outline-none">
                <option value="">-- Colored Vessels Count --</option>
                <option value="0">0 Vessels Highlighted</option>
                <option value="1">1 Vessel Highlighted</option>
                <option value="2">2 Vessels Highlighted</option>
                <option value="3">3 Vessels Highlighted</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold mb-1">Thal (Blood Flow Stress Map)</label>
              <select name="thal" value={formData.thal} onChange={handleChange} disabled={isAnalyzing} className="w-full text-xs p-1.5 border border-[#2d4a43] bg-white focus:outline-none">
                <option value="">-- Defect Mapping --</option>
                <option value="normal">Normal Blood Flow</option>
                <option value="fixed">Fixed Defect (No flow)</option>
                <option value="reversible">Reversible Defect (Partial flow)</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* clear all/run analysis */}
      <div className="flex gap-4 mt-6 shrink-0">
        <button
          type="button"
          onClick={handleFormReset}
          disabled={isAnalyzing}
          className="flex-1 bg-[#a63a3a] hover:bg-[#8c3030] disabled:opacity-50 text-[#f4f1e3] font-bold py-2.5 px-4 border-2 border-[#2d4a43] text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-[2px_2px_0px_0px_rgba(45,74,67,0.1)] font-mono"
        >
          <XCircle className="w-4 h-4" />
          <span>[ CLEAR ALL ]</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="flex-[2] bg-[#5b8276] hover:bg-[#497063] disabled:bg-[#2d4a43]/10 disabled:text-[#2d4a43]/40 disabled:border-[#2d4a43]/20 disabled:cursor-not-allowed disabled:scale-100 text-[#f4f1e3] font-bold py-2.5 px-4 border-2 border-[#2d4a43] text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-[2px_2px_0px_0px_rgba(45,74,67,0.1)] font-mono"
        >
          <Play className="w-4 h-4" />
          <span>{isAnalyzing ? '[ ANALYZING... ]' : '[ RUN ANALYSIS ]'}</span>
        </button>
      </div>

    </form>
  );
}