import React, { useState } from 'react';
import { ChevronRight, CheckCircle, Clock, Send, Loader2, MapPin } from 'lucide-react';
import { Scheme, AppLanguage } from '../types';
import { getSchemeRecommendations } from '../services/geminiService';

interface SchemesProps {
  lang: AppLanguage;
}

const Schemes: React.FC<SchemesProps> = ({ lang }) => {
  const [showModal, setShowModal] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recommendations, setRecommendations] = useState<string | null>(null);
  
  const [landSize, setLandSize] = useState('');
  const [district, setDistrict] = useState('');
  const [crop, setCrop] = useState('');

  // Karnataka Specific Schemes
  const schemes: Scheme[] = [
    {
      id: 'ka-1',
      title: 'Raitha Siri Scheme',
      category: 'subsidy',
      description: '₹10,000/hectare incentive for millet growers to promote Siri Dhanya.',
      eligibility: ['Millet Growers (Ragi, Jowar, etc.)', 'Karnataka Resident'],
      deadline: 'Kharif Season'
    },
    {
      id: 'ka-2',
      title: 'Krishi Bhagya Yojana',
      category: 'infrastructure',
      description: 'Subsidy for farm ponds (Krishi Honda) and rainwater harvesting to ensure water security.',
      eligibility: ['Dry land farmers', 'Rain-fed regions'],
    },
    {
      id: 'ka-3',
      title: 'Karnataka Raitha Suraksha (PMFBY)',
      category: 'insurance',
      description: 'State backed crop insurance for crop loss due to floods/drought.',
      eligibility: ['All farmers growing notified crops'],
      deadline: 'July 31 (Kharif)'
    },
    {
      id: 'ka-4',
      title: 'Yashasvini Health Insurance',
      category: 'insurance',
      description: 'Cashless surgery/treatment for farmers who are members of cooperatives.',
      eligibility: ['Co-operative Society Member'],
    },
    {
      id: 'ka-5',
      title: 'Bele Parihara (Crop Relief)',
      category: 'subsidy',
      description: 'Direct Benefit Transfer (DBT) for crop loss compensation due to drought.',
      eligibility: ['Verified crop loss by survey'],
    },
    {
      id: 'ka-6',
      title: 'APMC Revolving Fund',
      category: 'loan',
      description: 'Financial support to avoid distress sale of produce.',
      eligibility: ['Farmers trading in APMC'],
    },
    {
      id: 'ka-7',
      title: 'Farm Mechanization',
      category: 'infrastructure',
      description: 'Subsidy for tractors, rotavators, and tillers.',
      eligibility: ['Small/Marginal Farmers'],
    }
  ];

  const handleCheckEligibility = async () => {
    if (!landSize || !district) return;
    setLoadingRecs(true);
    const profile = `Land: ${landSize} acres, District: ${district}, Crop: ${crop}, State: Karnataka`;
    const result = await getSchemeRecommendations(profile, lang);
    setRecommendations(result);
    setLoadingRecs(false);
  };

  const text = {
    title: lang === AppLanguage.HINDI ? 'कर्नाटक योजनाएं' : (lang === AppLanguage.KANNADA ? 'ಕರ್ನಾಟಕ ಯೋಜನೆಗಳು' : 'Karnataka Schemes'),
    subtitle: lang === AppLanguage.HINDI ? 'आपके लिए राज्य लाभ' : (lang === AppLanguage.KANNADA ? 'ನಿಮಗಾಗಿ ರಾಜ್ಯ ಪ್ರಯೋಜನಗಳು' : 'State benefits for you'),
    checkBtn: lang === AppLanguage.HINDI ? 'पात्रता जांचें' : (lang === AppLanguage.KANNADA ? 'ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ' : 'Check Eligibility'),
  };

  return (
    <div className="pb-20 pt-4 px-4 max-w-md mx-auto min-h-screen bg-gray-50 relative">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        {text.title}
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        {text.subtitle}
      </p>

      {/* Check Eligibility Card */}
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-xl p-5 text-white shadow-md mb-6">
        <h2 className="font-bold text-lg mb-2">Am I Eligible?</h2>
        <p className="text-yellow-100 text-sm mb-4">Find schemes specifically for your district and land size.</p>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-white text-yellow-800 px-4 py-2 rounded-lg text-sm font-bold shadow-sm w-full"
        >
          {text.checkBtn}
        </button>
      </div>

      <div className="space-y-4">
        {schemes.map((scheme) => (
          <div key={scheme.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <span className="px-2 py-1 rounded text-xs font-bold uppercase tracking-wide bg-gray-100 text-gray-700">
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
            <div className="bg-gray-50 rounded-lg p-3">
              <ul className="space-y-1">
                {scheme.eligibility.map((e, idx) => (
                  <li key={idx} className="flex items-center text-xs text-gray-700">
                    <CheckCircle size={12} className="text-green-500 mr-2" /> {e}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold text-gray-800">Eligibility Check</h2>
               <button onClick={() => setShowModal(false)} className="text-gray-400 text-2xl">&times;</button>
            </div>

            {!recommendations ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <select 
                    value={district} 
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">Select District</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mandya">Mandya</option>
                    <option value="Mysuru">Mysuru</option>
                    <option value="Hassan">Hassan</option>
                    <option value="Shivamogga">Shivamogga</option>
                    <option value="Belagavi">Belagavi</option>
                    <option value="Raichur">Raichur</option>
                    <option value="Kalaburagi">Kalaburagi</option>
                    <option value="Dharwad">Dharwad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Land Size (Acres)</label>
                  <input type="number" value={landSize} onChange={(e) => setLandSize(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="e.g. 2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Main Crop</label>
                  <input type="text" value={crop} onChange={(e) => setCrop(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="e.g. Ragi, Arecanut" />
                </div>

                <button onClick={handleCheckEligibility} disabled={loadingRecs || !district} className="w-full bg-green-700 text-white py-3 rounded-xl font-bold mt-4 flex justify-center items-center gap-2">
                  {loadingRecs ? <Loader2 className="animate-spin" /> : <Send size={18} />} Check
                </button>
              </div>
            ) : (
              <div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-4 text-sm text-gray-700 whitespace-pre-wrap">{recommendations}</div>
                <button onClick={() => { setRecommendations(null); setShowModal(false); }} className="w-full border border-gray-300 py-2 rounded-lg font-bold text-gray-600">Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Schemes;