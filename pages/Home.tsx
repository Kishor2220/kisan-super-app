
import React, { useState, useEffect } from 'react';
import { 
  CloudSun, Mic, ChevronRight, Activity, MapPin, 
  RefreshCw, TrendingUp, ShieldAlert, Sprout, 
  AlertTriangle, CheckCircle, Info, Zap
} from 'lucide-react';
import { DashboardInsight, AppLanguage } from '../types';
import { useNavigate } from 'react-router-dom';
import { getDashboardInsights } from '../services/geminiService';

interface HomeProps {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
}

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
  
  const [selectedDistrict, setSelectedDistrict] = useState('Mandya');
  const [selectedCrop, setSelectedCrop] = useState('Sugarcane');
  const [availableCrops, setAvailableCrops] = useState<string[]>(karnatakaData['Mandya']);

  const [insight, setInsight] = useState<DashboardInsight>({
    decision: 'HOLD',
    decisionColor: 'yellow',
    mainReason: 'Checking markets...',
    priceOutlook: { yesterday: 0, today: 0, tomorrowLow: 0, tomorrowHigh: 0, trend: 'stable', confidence: 'low' },
    weatherImpact: 'Checking weather...',
    newsHeadline: ''
  });

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dist = e.target.value;
    setSelectedDistrict(dist);
    const crops = karnatakaData[dist] || [];
    setAvailableCrops(crops);
    if (crops.length > 0) setSelectedCrop(crops[0]);
  };

  const fetchInsights = () => {
    setLoading(true);
    getDashboardInsights(12.97, 77.59, selectedCrop, selectedDistrict, lang).then(data => {
      if (data) setInsight(data);
      setLoading(false);
    });
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
    if (lang === AppLanguage.ENGLISH) return 'ಕನ್ನಡ';
    if (lang === AppLanguage.HINDI) return 'English';
    return 'हिंदी';
  };

  const text = {
    greeting: lang === AppLanguage.HINDI ? 'नमस्कार, किसान' : (lang === AppLanguage.KANNADA ? 'ನಮಸ್ಕಾರ, ರೈತ ಮಿತ್ರ' : 'Namaskara, Farmer'),
    verdict: lang === AppLanguage.HINDI ? 'मुख्य सलाह' : (lang === AppLanguage.KANNADA ? 'ಮುಖ್ಯ ಸಲಹೆ' : 'The Verdict'),
    risks: lang === AppLanguage.HINDI ? 'जोखिम अलर्ट' : (lang === AppLanguage.KANNADA ? 'ಅಪಾಯದ ಎಚ್ಚರಿಕೆಗಳು' : 'Risk Radar'),
    priceFlow: lang === AppLanguage.HINDI ? 'कीमत का बहाव' : (lang === AppLanguage.KANNADA ? 'ಬೆಲೆ ಏರಿಳಿತ' : 'Price Flow'),
    askAi: lang === AppLanguage.HINDI ? 'AI से पूछें' : (lang === AppLanguage.KANNADA ? 'AI ಅನ್ನು ಕೇಳಿ' : 'Ask AI Voice'),
    confidence: lang === AppLanguage.HINDI ? 'भरोसा' : (lang === AppLanguage.KANNADA ? 'ಭರವಸೆ' : 'Confidence'),
  };

  const decisionColors = {
    green: { bg: 'bg-emerald-600', text: 'text-white', light: 'bg-emerald-50', border: 'border-emerald-200', accent: 'text-emerald-700' },
    red: { bg: 'bg-rose-600', text: 'text-white', light: 'bg-rose-50', border: 'border-rose-200', accent: 'text-rose-700' },
    yellow: { bg: 'bg-amber-500', text: 'text-white', light: 'bg-amber-50', border: 'border-amber-200', accent: 'text-amber-700' },
    blue: { bg: 'bg-sky-600', text: 'text-white', light: 'bg-sky-50', border: 'border-sky-200', accent: 'text-sky-700' }
  };

  const currentTheme = decisionColors[insight.decisionColor];

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      {/* 1. Dynamic Header (Context) */}
      <div className="bg-white px-4 pt-6 pb-4 border-b border-gray-100 shadow-sm sticky top-0 z-20">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
              <Sprout size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">{text.greeting}</h1>
          </div>
          <button 
            onClick={toggleLanguage}
            className="text-xs font-bold bg-gray-100 px-3 py-1.5 rounded-full text-gray-600 border border-gray-200"
          >
            {getLangLabel()}
          </button>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin size={14} className="absolute left-3 top-3 text-gray-400" />
            <select 
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 appearance-none font-medium"
              value={selectedDistrict}
              onChange={handleDistrictChange}
            >
              {Object.keys(karnatakaData).sort().map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="relative flex-1">
            <Activity size={14} className="absolute left-3 top-3 text-gray-400" />
            <select 
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 appearance-none font-medium"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
            >
              {availableCrops.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4 max-w-md mx-auto">
        
        {/* 2. THE VERDICT CARD (Decision First) */}
        <div className={`${currentTheme.bg} rounded-3xl p-6 text-white shadow-xl shadow-gray-200 relative overflow-hidden transition-all duration-700`}>
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="animate-spin opacity-40" size={40} />
              <p className="text-sm font-bold opacity-60">Synthesizing Market Data...</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 flex items-center gap-1">
                  <Zap size={10} fill="currentColor" /> {text.verdict}
                </span>
                <div className="flex items-center gap-1.5 bg-white/20 px-2 py-1 rounded-full text-[10px] font-bold">
                  {text.confidence}: {insight.priceOutlook.confidence.toUpperCase()}
                </div>
              </div>
              <h2 className="text-5xl font-black mb-3 tracking-tighter">
                {insight.decision}
              </h2>
              <p className="text-lg font-bold leading-tight mb-4 opacity-95">
                {insight.mainReason}
              </p>
              
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-white/20">
                <div className="bg-white/10 p-2 rounded-full">
                  <ShieldAlert size={18} />
                </div>
                <div className="text-xs leading-relaxed opacity-80 font-medium">
                  {insight.newsHeadline || "Markets stable across Karnataka mandis."}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 3. PRICE FLOW (Yesterday -> Today -> Tomorrow) */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={16} className="text-green-600" /> {text.priceFlow}
            </h3>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">₹ / QUINTAL</span>
          </div>

          <div className="relative flex items-center justify-between">
            {/* Line connecting points */}
            <div className="absolute left-0 right-0 h-0.5 bg-gray-100 top-1/2 -translate-y-1/2 z-0"></div>
            
            {/* Yesterday */}
            <div className="flex flex-col items-center z-10 bg-white px-2">
              <span className="text-[10px] font-bold text-gray-400 mb-2">YEST</span>
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              <span className="text-sm font-black text-gray-400 mt-2">₹{insight.priceOutlook.yesterday}</span>
            </div>

            {/* Today */}
            <div className="flex flex-col items-center z-10 bg-white px-2">
              <span className="text-[10px] font-bold text-gray-700 mb-2">TODAY</span>
              <div className="w-5 h-5 rounded-full bg-green-600 border-4 border-green-100 animate-pulse"></div>
              <span className="text-xl font-black text-gray-900 mt-2">₹{insight.priceOutlook.today}</span>
            </div>

            {/* Tomorrow */}
            <div className="flex flex-col items-center z-10 bg-white px-2">
              <span className="text-[10px] font-bold text-gray-700 mb-2">TOM</span>
              <div className={`w-3 h-3 rounded-full ${insight.priceOutlook.trend === 'rising' ? 'bg-emerald-500' : insight.priceOutlook.trend === 'falling' ? 'bg-rose-500' : 'bg-amber-400'}`}></div>
              <div className="flex flex-col items-center mt-2">
                <span className={`text-sm font-black ${insight.priceOutlook.trend === 'rising' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ₹{insight.priceOutlook.tomorrowLow}
                </span>
                <span className="text-[8px] font-bold text-gray-400">FORECAST</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. RISK RADAR (Weather & Pests) */}
        <div className="grid grid-cols-1 gap-3">
          <div className={`${currentTheme.light} border ${currentTheme.border} rounded-2xl p-4 flex gap-4 items-start`}>
             <div className={`${currentTheme.accent} mt-1`}>
               <CloudSun size={24} />
             </div>
             <div>
               <h4 className={`text-xs font-black uppercase tracking-widest ${currentTheme.accent} mb-1`}>Impact Forecast</h4>
               <p className="text-sm font-bold text-gray-800 leading-snug">
                 {insight.weatherImpact}
               </p>
             </div>
          </div>
          
          {/* Quick Action Cards */}
          <div className="grid grid-cols-2 gap-3">
             <button onClick={() => navigate('/doctor')} className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm text-left active:scale-95 transition-transform">
                <div className="text-rose-500 mb-2">
                   <Activity size={20} />
                </div>
                <span className="block text-xs font-black text-gray-400 uppercase">Diagnosis</span>
                <span className="block text-sm font-bold text-gray-900">Crop Doctor</span>
             </button>
             <button onClick={() => navigate('/schemes')} className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm text-left active:scale-95 transition-transform">
                <div className="text-emerald-600 mb-2">
                   <Info size={20} />
                </div>
                <span className="block text-xs font-black text-gray-400 uppercase">Benefits</span>
                <span className="block text-sm font-bold text-gray-900">KA Schemes</span>
             </button>
          </div>
        </div>

        {/* 5. ASK AI VOICE BUTTON (Floating feel) */}
        <div className="pt-2">
          <button 
            onClick={() => navigate('/chat')}
            className="w-full bg-gray-900 active:bg-black text-white p-5 rounded-3xl shadow-2xl flex items-center justify-between transition-all group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-active:scale-150 transition-transform"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="bg-green-500/20 p-2.5 rounded-2xl border border-green-500/30">
                <Mic size={24} className="text-green-400" />
              </div>
              <div className="text-left">
                <span className="block text-sm font-black tracking-tight">{text.askAi}</span>
                <span className="block text-xs text-gray-400 font-medium">"Price of Sugarcane in Mandya?"</span>
              </div>
            </div>
            <ChevronRight size={24} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default Home;
