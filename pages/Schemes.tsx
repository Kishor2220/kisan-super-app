import React, { useState } from 'react';
import { Search, ChevronRight, CheckCircle, Clock, Send, Loader2 } from 'lucide-react';
import { Scheme, AppLanguage } from '../types';
import { getSchemeRecommendations } from '../services/geminiService';

interface SchemesProps {
  lang: AppLanguage;
}

const Schemes: React.FC<SchemesProps> = ({ lang }) => {
  const [showModal, setShowModal] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recommendations, setRecommendations] = useState<string | null>(null);
  
  // Form State
  const [landSize, setLandSize] = useState('');
  const [stateName, setStateName] = useState('');
  const [crop, setCrop] = useState('');

  const schemes: Scheme[] = [
    {
      id: '1',
      title: 'PM-KISAN Samman Nidhi',
      category: 'subsidy',
      description: '₹6000 per year income support for farmers.',
      eligibility: ['Landholding farmer', 'Bank account linked to Aadhaar'],
      deadline: 'Always Open'
    },
    {
      id: '2',
      title: 'Pradhan Mantri Fasal Bima Yojana',
      category: 'insurance',
      description: 'Crop insurance against non-preventable natural risks.',
      eligibility: ['Sharecroppers', 'Tenant farmers'],
      deadline: '31st July'
    },
    {
      id: '3',
      title: 'Kisan Credit Card (KCC)',
      category: 'loan',
      description: 'Low interest loans (4%) for farming needs.',
      eligibility: ['Age 18-75', 'Owner cultivator'],
    }
  ];

  const handleCheckEligibility = async () => {
    if (!landSize || !stateName) return;
    
    setLoadingRecs(true);
    const profile = `Land Size: ${landSize} acres, State: ${stateName}, Main Crop: ${crop}`;
    
    const result = await getSchemeRecommendations(profile, lang);
    setRecommendations(result);
    setLoadingRecs(false);
  };

  return (
    <div className="pb-20 pt-4 px-4 max-w-md mx-auto min-h-screen bg-gray-50 relative">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        {lang === AppLanguage.HINDI ? 'सरकारी योजनाएं' : 'Government Schemes'}
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        {lang === AppLanguage.HINDI ? 'अपने लिए सही योजना खोजें' : 'Find benefits you are eligible for'}
      </p>

      {/* Check Eligibility Card */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-5 text-white shadow-md mb-6">
        <h2 className="font-bold text-lg mb-2">Am I Eligible?</h2>
        <p className="text-green-100 text-sm mb-4">Answer 3 questions to find schemes meant for you.</p>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm w-full active:scale-95 transition-transform"
        >
          Check Now
        </button>
      </div>

      <div className="space-y-4">
        {schemes.map((scheme) => (
          <div key={scheme.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide
                ${scheme.category === 'subsidy' ? 'bg-blue-100 text-blue-700' : 
                  scheme.category === 'insurance' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}`}>
                {scheme.category}
              </span>
              {scheme.deadline && (
                <span className="flex items-center text-xs text-red-500 font-medium">
                  <Clock size={12} className="mr-1" /> {scheme.deadline}
                </span>
              )}
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">{scheme.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{scheme.description}</p>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">ELIGIBILITY:</p>
              <ul className="space-y-1">
                {scheme.eligibility.map((e, idx) => (
                  <li key={idx} className="flex items-center text-xs text-gray-700">
                    <CheckCircle size={12} className="text-green-500 mr-2" /> {e}
                  </li>
                ))}
              </ul>
            </div>

            <button className="w-full border border-green-600 text-green-600 py-2 rounded-lg text-sm font-bold flex items-center justify-center hover:bg-green-50">
              How to Apply <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        ))}
      </div>

      {/* Interactive Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-fade-in max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold text-gray-800">Eligibility Check</h2>
               <button onClick={() => setShowModal(false)} className="text-gray-400 text-2xl">&times;</button>
            </div>

            {!recommendations ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Land Size (Acres)</label>
                  <input 
                    type="number" 
                    value={landSize} 
                    onChange={(e) => setLandSize(e.target.value)} 
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" 
                    placeholder="e.g. 2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select 
                    value={stateName} 
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                  >
                    <option value="">Select State</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Karnataka">Karnataka</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Main Crop</label>
                  <input 
                    type="text" 
                    value={crop} 
                    onChange={(e) => setCrop(e.target.value)} 
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" 
                    placeholder="e.g. Wheat, Cotton"
                  />
                </div>

                <button 
                  onClick={handleCheckEligibility}
                  disabled={loadingRecs || !landSize || !stateName}
                  className="w-full bg-green-700 text-white py-3 rounded-xl font-bold mt-4 flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {loadingRecs ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                  Find My Schemes
                </button>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-4">
                  <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                    <CheckCircle size={18} /> Recommended for You
                  </h3>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {recommendations}
                  </div>
                </div>
                <button 
                  onClick={() => { setRecommendations(null); setShowModal(false); }}
                  className="w-full border border-gray-300 py-2 rounded-lg font-bold text-gray-600"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Schemes;