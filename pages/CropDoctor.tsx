import React, { useState, useRef } from 'react';
    import { Camera, Upload, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
    import { getGeminiResponse } from '../services/geminiService';
    import { AppLanguage } from '../types';
    
    interface CropDoctorProps {
      lang: AppLanguage;
    }
    
    const CropDoctor: React.FC<CropDoctorProps> = ({ lang }) => {
      const [image, setImage] = useState<string | null>(null);
      const [loading, setLoading] = useState(false);
      const [analysis, setAnalysis] = useState<string | null>(null);
      const fileInputRef = useRef<HTMLInputElement>(null);
    
      const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImage(reader.result as string);
            setAnalysis(null); // Reset previous analysis
          };
          reader.readAsDataURL(file);
        }
      };
    
      const analyzeCrop = async () => {
        if (!image) return;
    
        setLoading(true);
        // Extract base64 data without prefix
        const base64Data = image.split(',')[1];
        
        const response = await getGeminiResponse(
          "", 
          lang, 
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } }
        );
    
        setAnalysis(response);
        setLoading(false);
      };
    
      return (
        <div className="pb-20 pt-4 px-4 max-w-md mx-auto min-h-screen bg-gray-50">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {lang === AppLanguage.HINDI ? 'फसल डॉक्टर' : 'Crop Doctor'}
          </h1>
    
          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="bg-white border-2 border-dashed border-gray-300 rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition-colors"
            >
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <Camera size={32} className="text-green-600" />
              </div>
              <h3 className="font-bold text-gray-700">Take a photo of the crop</h3>
              <p className="text-sm text-gray-500 mt-2">or select from gallery</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden shadow-md">
                <img src={image} alt="Crop" className="w-full h-64 object-cover" />
                {!loading && !analysis && (
                  <button 
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full"
                  >
                    ✕
                  </button>
                )}
              </div>
    
              {!analysis && (
                <button
                  onClick={analyzeCrop}
                  disabled={loading}
                  className="w-full bg-green-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload size={20} /> Diagnose Now
                    </>
                  )}
                </button>
              )}
            </div>
          )}
    
          {analysis && (
            <div className="bg-white p-5 rounded-xl shadow-md border-t-4 border-green-600 mt-6 animate-fade-in">
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <CheckCircle className="text-green-600" /> Diagnosis Report
              </h2>
              <div className="prose prose-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {analysis}
              </div>
              <button 
                onClick={() => { setImage(null); setAnalysis(null); }}
                className="w-full mt-6 border border-gray-300 py-3 rounded-lg font-medium text-gray-600"
              >
                Check Another Crop
              </button>
            </div>
          )}
    
          <div className="mt-8 bg-blue-50 p-4 rounded-lg flex gap-3 items-start">
             <AlertTriangle className="text-blue-600 shrink-0" size={20} />
             <p className="text-xs text-blue-800">
               <strong>Tip:</strong> Take clear photos close to the affected area (leaf/stem) for better results.
             </p>
          </div>
        </div>
      );
    };
    
    export default CropDoctor;