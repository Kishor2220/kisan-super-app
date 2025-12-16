import React, { useState, useEffect } from 'react';
import { CloudSun, Mic, ChevronRight, Activity, MapPin, RefreshCw, TrendingUp, ArrowRight, ShieldAlert, Sprout } from 'lucide-react';
import { DashboardInsight, AppLanguage } from '../types';
import { useNavigate } from 'react-router-dom';
import { getDashboardInsights } from '../services/geminiService';

interface HomeProps {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
}

// Data: Karnataka Districts and their Major Crops
const karnatakaData: Record<string, string[]> = {
  "Bagalkot": ["Sugarcane", "Maize", "Sunflower", "Sorghum"],
  "Bengaluru Rural": ["Ragi", "Maize", "Grapes", "Vegetables"],
  "Bengaluru Urban": ["Ragi", "Vegetables", "Flowers"],
  "Belagavi": ["Sugarcane", "Maize", "Vegetables", "Cotton"],
  "Bellary": ["Paddy", "Sunflower", "Maize", "Cotton"],
  "Bidar": ["Soybean", "Red Gram", "Sorghum", "Sugarcane"],
  "Chamarajanagar": ["Turmeric", "Maize", "Sorghum", "Sugarcane"],
  "Chikkaballapur": ["Maize", "Ragi", "Grapes", "Tomato"],
  "Chikkamagaluru": ["Coffee", "Arecanut", "Pepper", "Paddy"],
  "Chitradurga": ["Groundnut", "Maize", "Ragi", "Onion"],
  "Dakshina Kannada": ["Arecanut", "Paddy", "Coconut", "Cashew"],
  "Davanagere": ["Maize", "Paddy", "Arecanut", "Cotton"],
  "Dharwad": ["Cotton", "Maize", "Soybean", "Wheat"],
  "Gadag": ["Onion", "Cotton", "Groundnut", "Maize"],
  "Hassan": ["Potato", "Coffee", "Maize", "Ragi"],
  "Haveri": ["Maize", "Cotton", "Chilli", "Groundnut"],
  "Kalaburagi": ["Red Gram", "Sorghum", "Sunflower", "Soybean"],
  "Kodagu": ["Coffee", "Pepper", "Paddy", "Cardamom"],
  "Kolar": ["Tomato", "Mango", "Ragi", "Sericulture"],
  "Koppal": ["Paddy", "Maize", "Sunflower", "Sorghum"],
  "Mandya": ["Sugarcane", "Paddy", "Ragi", "Coconut"],
  "Mysuru": ["Paddy", "Cotton", "Tobacco", "Ragi"],
  "Raichur": ["Paddy", "Cotton", "Groundnut", "Sunflower"],
  "Ramanagara": ["Ragi", "Mango", "Coconut", "Sericulture"],
  "Shivamogga": ["Arecanut", "Paddy", "Maize", "Ginger"],
  "Tumakuru": ["Ragi", "Groundnut", "Coconut", "Arecanut"],
  "Udupi": ["Paddy", "Arecanut", "Coconut", "Cashew"],
  "Uttara Kannada": ["Arecanut", "Paddy", "Spices", "Coconut"],
  "Vijayapura": ["Grapes", "Sorghum", "Maize", "Sugarcane"],
  "Yadgir": ["Red Gram", "Cotton", "Paddy", "Sorghum"]
};

const Home: React.FC<HomeProps> = ({ lang, setLang }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // State for location and selection
  const [selectedDistrict, setSelectedDistrict] = useState('Bengaluru Urban');
  const [selectedCrop, setSelectedCrop] = useState('Ragi');
  const [availableCrops, setAvailableCrops] = useState<string[]>(karnatakaData['Bengaluru Urban']);

  const [insight, setInsight] = useState<DashboardInsight>({
    decision: 'HOLD',
    decisionColor: 'yellow',
    mainReason: 'Loading Karnataka market data...',
    priceOutlook: { yesterday: 0, today: 0, tomorrowLow: 0, tomorrowHigh: 0, trend: 'stable', confidence: 'low' },
    weatherImpact: 'Checking weather...',
    newsHeadline: ''
  });

  // Handle District Change
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dist = e.target.value;
    setSelectedDistrict(dist);
    const crops = karnatakaData[dist] || [];
    setAvailableCrops(crops);
    if (crops.length > 0) setSelectedCrop(crops[0]); // Auto-select first crop
  };

  const fetchInsights = () => {
    setLoading(true);
    // Use geolocation to find lat/lon, but rely on selected District for context
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          getDashboardInsights(pos.coords.latitude, pos.coords.longitude, selectedCrop, selectedDistrict, lang).then(data => {
            if (data) setInsight(data);
            setLoading(false);
          });
        },
        () => {
          // Fallback coords (Bengaluru)
          getDashboardInsights(12.97, 77.59, selectedCrop, selectedDistrict, lang).then(data => {
             if (data) setInsight(data);
             setLoading(false);
          });
        }
      );
    } else {
       getDashboardInsights(12.97, 77.59, selectedCrop, selectedDistrict, lang).then(data => {
          if (data) setInsight(data);
          setLoading(false);
       });
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [lang, selectedCrop, selectedDistrict]);

  const toggleLanguage = () => {
    if (lang === AppLanguage.ENGLISH) setLang(AppLanguage.HINDI);
    else if (lang === AppLanguage.HINDI) setLang(AppLanguage.KANNADA);
    else setLang(AppLanguage.ENGLISH);
  };

  const getLangLabel = () => {
    if (lang === AppLanguage.ENGLISH) return 'En';
    if (lang === AppLanguage.HINDI) return 'Hi';
    return 'Kn';
  };

  // Translations
  const text = {
    greeting: lang === AppLanguage.HINDI ? 'नमस्ते, रैथा!' : (lang === AppLanguage.KANNADA ? 'ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ!' : 'Namaskara, Raitha!'),
    decisionTitle: lang === AppLanguage.HINDI ? 'आज का फैसला' : (lang === AppLanguage.KANNADA ? 'ಇಂದಿನ ನಿರ್ಧಾರ' : 'Action for Today'),
    priceTitle: lang === AppLanguage.HINDI ? 'भाव का रुझान' : (lang === AppLanguage.KANNADA ? 'ಬೆಲೆ ಪ್ರವೃತ್ತಿ' : 'Price Trend'),
    weatherTitle: lang === AppLanguage.HINDI ? 'मौसम' : (lang === AppLanguage.KANNADA ? 'ಹವಾಮಾನ' : 'Weather'),
    yest: lang === AppLanguage.HINDI ? 'कल' : (lang === AppLanguage.KANNADA ? 'ನಿನ್ನೆ' : 'Yest'),
    today: lang === AppLanguage.HINDI ? 'आज' : (lang === AppLanguage.KANNADA ? 'ಇಂದು' : 'Today'),
    tom: lang === AppLanguage.HINDI ? 'कल' : (lang === AppLanguage.KANNADA ? 'ನಾಳೆ' : 'Tom'),
    askAi: lang === AppLanguage.HINDI ? 'पूछें (AI)' : (lang === AppLanguage.KANNADA ? 'ಕೇಳಿ (AI)' : 'Ask (AI)'),
  };

  // Color mapping
  const bgColors = {
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-600'
  };

  return (
    <div className="pb-24 pt-4 px-4 space-y-4 max-w-md mx-auto">
      {/* 1. Header with District & Crop Selector */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1 w-full mr-2">
          <h1 className="text-lg font-bold text-gray-900 leading-tight">{text.greeting}</h1>
          <div className="flex gap-2">
            {/* District Selector */}
            <div className="relative flex-1">
               <MapPin size={12} className="absolute left-2 top-2.5 text-gray-500" />
               <select 
                 className="w-full pl-6 pr-2 py-1.5 text-xs bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 outline-none appearance-none"
                 value={selectedDistrict}
                 onChange={handleDistrictChange}
               >
                 {Object.keys(karnatakaData).sort().map(d => (
                   <option key={d} value={d}>{d}</option>
                 ))}
               </select>
            </div>
            {/* Crop Selector (Dependent) */}
            <div className="relative flex-1">
               <Sprout size={12} className="absolute left-2 top-2.5 text-gray-500" />
               <select 
                 className="w-full pl-6 pr-2 py-1.5 text-xs bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 outline-none appearance-none"
                 value={selectedCrop}
                 onChange={(e) => setSelectedCrop(e.target.value)}
               >
                 {availableCrops.map(c => (
                   <option key={c} value={c}>{c}</option>
                 ))}
               </select>
            </div>
          </div>
        </div>
        <button 
          onClick={toggleLanguage}
          className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-xs font-bold shadow-sm h-full"
        >
          {getLangLabel()}
        </button>
      </div>

      {/* 2. The VERDICT Card */}
      <div className={`${bgColors[insight.decisionColor]} rounded-xl p-5 text-white shadow-lg relative overflow-hidden transition-all duration-500`}>
        {loading ? (
           <div className="flex flex-col items-center justify-center py-6">
             <RefreshCw className="animate-spin mb-2 opacity-80" size={32} />
             <p className="text-sm font-medium opacity-90">Scanning Karnataka Markets...</p>
           </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">{text.decisionTitle}</span>
              {insight.decisionColor === 'red' && <ShieldAlert size={20} className="text-white animate-pulse"/>}
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-2">{insight.decision}</h2>
            <p className="text-lg font-medium leading-snug opacity-95">
              {insight.mainReason}
            </p>
            {insight.newsHeadline && (
              <div className="mt-4 pt-3 border-t border-white/20 text-xs font-medium opacity-80 flex items-center gap-2">
                <span className="bg-white/20 px-1.5 rounded text-[10px] font-bold">NEWS</span>
                <span className="truncate">{insight.newsHeadline}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* 3. Price Trajectory */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp size={18} className="text-gray-500"/> {text.priceTitle}
          </h3>
          {!loading && (
             <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
               insight.priceOutlook.trend === 'rising' ? 'bg-green-100 text-green-700' :
               insight.priceOutlook.trend === 'falling' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
             }`}>
               {insight.priceOutlook.trend.toUpperCase()}
             </span>
          )}
        </div>

        {loading ? (
          <div className="h-16 bg-gray-50 animate-pulse rounded-lg"></div>
        ) : (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center">
               <span className="text-xs text-gray-400 font-medium mb-1">{text.yest}</span>
               <span className="text-lg font-bold text-gray-400">₹{insight.priceOutlook.yesterday}</span>
            </div>
            <div className="flex flex-col items-center relative">
               <span className="text-xs text-gray-500 font-bold mb-1">{text.today}</span>
               <span className="text-xl font-bold text-gray-800">₹{insight.priceOutlook.today}</span>
               <div className="absolute -bottom-1 w-8 h-1 bg-blue-500 rounded-full"></div>
            </div>
            <div className="flex flex-col items-center">
               <span className="text-xs text-gray-500 font-medium mb-1">{text.tom}</span>
               <div className="flex flex-col items-center">
                 <span className={`text-lg font-bold ${
                   insight.priceOutlook.trend === 'rising' ? 'text-green-600' : 
                   insight.priceOutlook.trend === 'falling' ? 'text-red-600' : 'text-gray-600'
                 }`}>
                   ₹{Math.round((insight.priceOutlook.tomorrowLow + insight.priceOutlook.tomorrowHigh)/2)}
                 </span>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Weather Context */}
      <div className={`rounded-xl p-4 shadow-sm border ${loading ? 'bg-gray-50' : 'bg-blue-50 border-blue-100'}`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${loading ? 'bg-gray-200' : 'bg-white text-blue-600'}`}>
            <CloudSun size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm mb-1">{text.weatherTitle}</h3>
            {loading ? (
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                {insight.weatherImpact}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 5. Voice Action Button */}
      <button 
        onClick={() => navigate('/chat')}
        className="w-full bg-gray-900 active:bg-black text-white p-4 rounded-xl shadow-lg flex items-center justify-between transition-transform active:scale-98"
      >
        <div className="flex items-center gap-3">
          <div className="bg-gray-800 p-2 rounded-full">
             <Mic size={20} className="text-green-400" />
          </div>
          <div className="text-left">
            <span className="block text-sm font-bold text-gray-200">{text.askAi}</span>
            <span className="block text-xs text-gray-400">"Kolar Tomato price?"</span>
          </div>
        </div>
        <ChevronRight size={20} className="text-gray-500"/>
      </button>

      {/* 6. Links */}
      <div className="grid grid-cols-2 gap-3 pt-2">
         <button onClick={() => navigate('/doctor')} className="bg-white border border-gray-200 p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-gray-700 shadow-sm active:bg-gray-50">
           <Activity size={18} className="text-red-500" /> Crop Doctor
         </button>
         <button onClick={() => navigate('/schemes')} className="bg-white border border-gray-200 p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-gray-700 shadow-sm active:bg-gray-50">
           <Sprout size={18} className="text-green-500" /> KA Schemes
         </button>
      </div>
    </div>
  );
};

export default Home;