import React from 'react';
import { Search, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import { Scheme, AppLanguage } from '../types';

interface SchemesProps {
  lang: AppLanguage;
}

const Schemes: React.FC<SchemesProps> = ({ lang }) => {
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

  return (
    <div className="pb-20 pt-4 px-4 max-w-md mx-auto min-h-screen bg-gray-50">
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
        <button className="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm w-full">
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
    </div>
  );
};

export default Schemes;