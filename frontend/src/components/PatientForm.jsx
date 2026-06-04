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
    
    // walidacja T/F na podstawie thresholdu dla cukru na czczo (> 120 mg/dL)
    const processedFastingSugar = formData.fastingSugar !== '' 
      ? (Number(formData.fastingSugar) > 120 ? 'true' : 'false')
      : '';

    onSubmit({
      ...formData,
      fastingSugar: processedFastingSugar
    });
  };

  // przycisk jest aktywny TYLKO gdy uzupełniono wiek oraz płeć biologiczna
  const hasRequiredFields = formData.age !== '' && formData.sex !== '';
  const isSubmitDisabled = isAnalyzing || !hasRequiredFields;

  const fieldClasses = "w-full h-8 text-[12px] px-1.5 border border-[#2d4a43] bg-white focus:outline-none box-border";

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col justify-between">
      <div className="space-y-4 overflow-y-auto pr-1 flex-1 max-h-[480px]">
        
        {/* basic info */}
        <div>
          <h3 className="text-[14px] font-bold text-[#5b8276] tracking-wider mb-2">&gt; Basic biometrics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block text-[12px]  font-bold mb-1">Age *</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} disabled={isAnalyzing} placeholder="Years" className={fieldClasses} />
            </div>
            <div>
              <label className="block text-[12px]  font-bold mb-1">Biological sex *</label>
              <select name="sex" value={formData.sex} onChange={handleChange} disabled={isAnalyzing} className={fieldClasses}>
                <option value="">--</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px]  font-bold mb-1">Weight</label>
              <input type="number" name="weight" value={formData.weight} onChange={handleChange} disabled={isAnalyzing} placeholder="kg" className={fieldClasses} />
            </div>
            <div>
              <label className="block text-[12px]  font-bold mb-1">Height</label>
              <input type="number" name="height" value={formData.height} onChange={handleChange} disabled={isAnalyzing} placeholder="cm" className={fieldClasses} />
            </div>
          </div>
          <div className="mt-2">
            <label className="block text-[12px]  font-bold mb-1">Tobacco smoking history</label>
            <select name="smokingHistory" value={formData.smokingHistory} onChange={handleChange} disabled={isAnalyzing} className={fieldClasses}>
              <option value="">Select status</option>
              <option value="never">Never smoked</option>
              <option value="former">Former smoker (quit)</option>
              <option value="current">Current smoker</option>
              <option value="not_current">Not current (occasional)</option>
              <option value="ever">Ever smoked (in history)</option>
              <option value="no_info">No information available</option>
            </select>
          </div>
        </div>

        {/* metabolic & blood*/}
        <div>
          <h3 className="text-[14px] font-bold text-[#5b8276] tracking-wider mb-2">&gt; Metabolic & metric blood work</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-[12px]  font-bold mb-1">HbA1c level (3-month avg)</label>
              <input type="number" step="0.1" name="hbA1c" value={formData.hbA1c} onChange={handleChange} disabled={isAnalyzing} placeholder="Percentage (%)" className={fieldClasses} />
            </div>
            <div>
              <label className="block text-[12px]  font-bold mb-1">Blood glucose level</label>
              <input type="number" name="bloodGlucose" value={formData.bloodGlucose} onChange={handleChange} disabled={isAnalyzing} placeholder="Sugar (mg/dL)" className={fieldClasses} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[12px]  font-bold mb-1">Fasting blood sugar level</label>
              <input type="number" name="fastingSugar" value={formData.fastingSugar} onChange={handleChange} disabled={isAnalyzing} placeholder="Fasting Sugar (mg/dL)" className={fieldClasses} />
            </div>
            <div>
              <label className="block text-[12px]  font-bold mb-1">Total cholesterol</label>
              <input type="number" name="cholesterol" value={formData.cholesterol} onChange={handleChange} disabled={isAnalyzing} placeholder="Serum Cholesterol (mg/dL)" className={fieldClasses} />
            </div>
          </div>
        </div>

        {/* cardiovascular */}
        <div>
          <h3 className="text-[14px] font-bold text-[#5b8276] tracking-wider mb-2">&gt; Cardiovascular baseline</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-[12px]  font-bold mb-1">Chest pain specification</label>
              <select name="chestPain" value={formData.chestPain} onChange={handleChange} disabled={isAnalyzing} className={fieldClasses}>
                <option value="">Select pain type</option>
                <option value="asymptomatic">Asymptomatic (no pain)</option>
                <option value="typical">Typical angina (classic heart pain)</option>
                <option value="atypical">Atypical angina</option>
                <option value="non-anginal">Non-Anginal pain (other chest pain)</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px]  font-bold mb-1">Resting blood ppressure</label>
              <input type="number" name="restingBloodPressure" value={formData.restingBloodPressure} onChange={handleChange} disabled={isAnalyzing} placeholder="Systolic pressure (mmHg)" className={fieldClasses} />
            </div>
          </div>
          <div>
            <label className="block text-[12px]  font-bold mb-1">Resting ECD</label>
            <select name="restingEcg" value={formData.restingEcg} onChange={handleChange} disabled={isAnalyzing} className={fieldClasses}>
              <option value="">Select observation</option>
              <option value="normal">Normal baseline</option>
              <option value="st-t">ST-T Wave abnormality</option>
              <option value="hypertrophy">Left Ventricular Hypertrophy (LVH)</option>
            </select>
          </div>
        </div>

        {/* stress */}
        <div>
          <h3 className="text-[14px] font-bold text-[#5b8276] tracking-wider mb-2">&gt; Stress test & advanced clinical imaging</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-[12px]  font-bold mb-1">Maximum heart rate</label>
              <input type="number" name="maxHeartRate" value={formData.maxHeartRate} onChange={handleChange} disabled={isAnalyzing} placeholder="Max HR (bpm)" className={fieldClasses} />
            </div>
            <div>
              <label className="block text-[12px]  font-bold mb-1">Exercise induced angina</label>
              <select name="exerciseAngina" value={formData.exerciseAngina} onChange={handleChange} disabled={isAnalyzing} className={fieldClasses}>
                <option value="">Select pain level triggered by exercise</option>
                <option value="true">True (Yes, pain triggered)</option>
                <option value="false">False (No pain triggered)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-[12px]  font-bold mb-1">ST Depression (relative to rest)</label>
              <input type="number" step="0.1" name="stDepression" value={formData.stDepression} onChange={handleChange} disabled={isAnalyzing} placeholder="Oldpeak Value" className={fieldClasses} />
            </div>
            <div>
              <label className="block text-[12px]  font-bold mb-1">Peak Exercise ST Segment Slope</label>
              <select name="stSlope" value={formData.stSlope} onChange={handleChange} disabled={isAnalyzing} className={fieldClasses}>
                <option value="">Select slope profile</option>
                <option value="upsloping">Upsloping (normal / stable)</option>
                <option value="flat">Flat segment</option>
                <option value="downsloping">Downsloping (ischemia indicator)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[12px]  font-bold mb-1">Major vessels (Fluoroscopy)</label>
              <select name="majorVessels" value={formData.majorVessels} onChange={handleChange} disabled={isAnalyzing} className={fieldClasses}>
                <option value="">Select colored vessels count</option>
                <option value="0">0 Vessels highlighted</option>
                <option value="1">1 Vessel highlighted</option>
                <option value="2">2 Vessels highlighted</option>
                <option value="3">3 Vessels highlighted</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px]  font-bold mb-1">Thalassemia</label>
              <select name="thal" value={formData.thal} onChange={handleChange} disabled={isAnalyzing} className={fieldClasses}>
                <option value="">Select defect mapping</option>
                <option value="normal">Normal blood flow</option>
                <option value="fixed">Fixed defect (no flow)</option>
                <option value="reversible">Reversible defect (partial flow)</option>
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
          <span>[ Clear all ]</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="flex-[2] bg-[#5b8276] hover:bg-[#497063] disabled:bg-[#2d4a43]/10 disabled:text-[#2d4a43]/40 disabled:border-[#2d4a43]/20 disabled:cursor-not-allowed disabled:scale-100 text-[#f4f1e3] font-bold py-2.5 px-4 border-2 border-[#2d4a43] text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-[2px_2px_0px_0px_rgba(45,74,67,0.1)] font-mono"
        >
          <Play className="w-4 h-4" />
          <span>{isAnalyzing ? '[ Analyzing... ]' : '[ Run analysis ]'}</span>
        </button>
      </div>

    </form>
  );
}