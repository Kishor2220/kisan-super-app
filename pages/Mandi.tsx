import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, TrendingUp, ChevronLeft, AlertCircle, Calendar, Newspaper, MapPin, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MandiPrice, AppLanguage, HistoricalDataPoint, MarketPrediction } from '../types';
import { getMarketAdvisory, getMandiNews, getRealMandiPrices } from '../services/geminiService';

interface MandiProps {
  lang: AppLanguage;
}

const Mandi: React.FC<MandiProps> = ({ lang }) => {
  const [selectedCrop, setSelectedCrop] = useState<MandiPrice | null>(null);
  const [advisory, setAdvisory] = useState<string>('');
  const [loadingAdvisory, setLoadingAdvisory] = useState(false);
  const [historyPeriod, setHistoryPeriod] = useState<7 | 15 | 30>(7);
  const [news, setNews] = useState<string>('');
  const [loadingNews, setLoadingNews] = useState(false);
  
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [locationName, setLocationName] = useState('Karnataka');

  const getHistoricalData = (basePrice: number, days: number): HistoricalDataPoint[] => {
    const locale = lang === AppLanguage.HINDI ? 'hi-IN' : (lang === AppLanguage.KANNADA ? 'kn-IN' : 'en-IN');
    const data: HistoricalDataPoint[] = [];
    let current = basePrice;
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const volatility = (Math.random() - 0.5) * 0.06; 
      current = current * (1 + volatility);
      data.push({
        date: date.toLocaleDateString(locale, { day: 'numeric', month: 'short' }),
        price: Math.round(current)
      });
    }
    data[data.length - 1].price = basePrice;
    return data;
  };

  const getPrediction = (price: MandiPrice): MarketPrediction => {
    const volatility = 0.04; 
    const multiplier = price.trend === 'up' ? 1.02 : price.trend === 'down' ? 0.98 : 1.0;
    const base = price.price * multiplier;
    
    return {
      tomorrowMin: Math.floor(base * (1 - volatility / 2)),
      tomorrowMax: Math.ceil(base * (1 + volatility / 2)),
      confidence: price.arrivalVolume === 'high' ? 'high' : 'medium',
      trendDirection: price.trend,
      factors: price.trend === 'down' ? ['High Arrivals', 'Rain Forecast'] : ['Strong Demand']
    };
  };

  const fetchPrices = () => {
    setLoadingPrices(true);
    // Default to Karnataka if location not found
    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(
        (pos) => {
           getRealMandiPrices(`lat ${pos.coords.latitude} long ${pos.coords.longitude}`, lang).then(data => {
             if (data.length > 0) setPrices(data);
             else setPrices(getMockPrices()); 
             setLoadingPrices(false);
             setLocationName(lang === AppLanguage.HINDI ? 'आपके पास' : (lang === AppLanguage.KANNADA ? 'ನಿಮ್ಮ ಹತ್ತಿರ' : 'Nearby'));
           });
        },
        () => {
           getRealMandiPrices("Karnataka", lang).then(data => {
             if (data.length > 0) setPrices(data);
             else setPrices(getMockPrices());
             setLoadingPrices(false);
             setLocationName('Karnataka');
           });
        }
       );
    } else {
       setPrices(getMockPrices());
       setLoadingPrices(false);
    }
  };

  // Karnataka Focused Mock Data
  const getMockPrices = (): MandiPrice[] => [
    { id: '1', crop: 'Arecanut', variety: 'Rashi', market: 'Shivamogga', price: 46000, change: 1.2, date: 'Today', trend: 'up', arrivalVolume: 'medium' },
    { id: '2', crop: 'Ragi', variety: 'Local', market: 'Mandya', price: 2800, change: 0.5, date: 'Today', trend: 'stable', arrivalVolume: 'high' },
    { id: '3', crop: 'Cotton', variety: 'H-4', market: 'Raichur', price: 7200, change: -1.5, date: 'Today', trend: 'down', arrivalVolume: 'high' },
    { id: '4', crop: 'Onion', variety: 'Pune', market: 'Hubballi', price: 2100, change: 4.0, date: 'Today', trend: 'up', arrivalVolume: 'low' },
    { id: '5', crop: 'Tomato', variety: 'Hybrid', market: 'Kolar', price: 1800, change: -8.0, date: 'Today', trend: 'down', arrivalVolume: 'high' },
  ];

  useEffect(() => {
    fetchPrices();
    setLoadingNews(true);
    getMandiNews(lang).then(newsText => {
      setNews(newsText);
      setLoadingNews(false);
    });
  }, [lang]);

  useEffect(() => {
    if (selectedCrop) {
      setLoadingAdvisory(true);
      const weatherCtx = selectedCrop.trend === 'down' ? 'Heavy Rain Expected' : 'Clear Sky';
      getMarketAdvisory(selectedCrop.crop, selectedCrop.price, selectedCrop.trend, weatherCtx, lang).then(text => {
        setAdvisory(text);
        setLoadingAdvisory(false);
      });
    }
  }, [selectedCrop, lang]);

  const text = {
    mandiPrices: lang === AppLanguage.HINDI ? 'मंडी भाव (कर्नाटक)' : (lang === AppLanguage.KANNADA ? 'ಮಂಡಿ ದರಗಳು (ಕರ್ನಾಟಕ)' : 'Mandi Prices (Karnataka)'),
    mandiNews: lang === AppLanguage.HINDI ? 'मंडी समाचार' : (lang === AppLanguage.KANNADA ? 'ಮಂಡಿ ಸುದ್ದಿ' : 'Mandi News'),
    back: lang === AppLanguage.HINDI ? 'पीछे' : (lang === AppLanguage.KANNADA ? 'ಹಿಂದೆ' : 'Back'),
    advisorTitle: lang === AppLanguage.HINDI ? 'सलाह' : (lang === AppLanguage.KANNADA ? 'ಸಲಹೆ' : 'Advisory'),
  };

  const renderDetailView = () => {
    if (!selectedCrop) return null;
    const history = getHistoricalData(selectedCrop.price, historyPeriod);
    const prediction = getPrediction(selectedCrop);

    return (
      <div className="animate-fade-in">
        <button onClick={() => setSelectedCrop(null)} className="flex items-center text-gray-600 mb-4 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
          <ChevronLeft size={18} /> {text.back}
        </button>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{selectedCrop.crop}</h1>
            <p className="text-gray-500 text-sm">📍 {selectedCrop.market} • {selectedCrop.variety}</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-green-700">₹{selectedCrop.price}</h2>
            <p className="text-xs text-gray-500">per Quintal</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl p-5 text-white shadow-lg mb-6 relative overflow-hidden">
           <h3 className="text-indigo-200 text-sm font-semibold uppercase tracking-wider mb-2">Tomorrow Prediction</h3>
           <div className="flex items-end gap-3 mb-2">
             <span className="text-4xl font-bold">₹{prediction.tomorrowMin} - {prediction.tomorrowMax}</span>
           </div>
           <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="bg-white/20 px-2 py-1 rounded flex items-center gap-1">
                 {selectedCrop.trend === 'down' ? <ArrowDown size={14}/> : <ArrowUp size={14}/>}
                 <span>{selectedCrop.trend.toUpperCase()}</span>
              </div>
           </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-6">
          <h3 className="font-bold text-yellow-800 flex items-center gap-2 mb-2"><AlertCircle size={18} /> {text.advisorTitle}</h3>
          {loadingAdvisory ? <div className="animate-pulse h-4 bg-yellow-200 rounded w-3/4"></div> : <p className="text-gray-800 text-sm">{advisory}</p>}
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15803d" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#15803d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                <Tooltip />
                <Area type="monotone" dataKey="price" stroke="#15803d" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-20 pt-4 px-4 max-w-md mx-auto min-h-screen bg-gray-50">
      {selectedCrop ? renderDetailView() : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{text.mandiPrices}</h1>
              <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={12} /> {locationName}</p>
            </div>
            <button onClick={fetchPrices} className="p-2 bg-white rounded-lg shadow-sm text-gray-600 border border-gray-200">
              <RefreshCw size={20} className={loadingPrices ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="space-y-3">
            {loadingPrices ? [1,2,3].map(i => <div key={i} className="bg-white h-24 rounded-xl shadow-sm border border-gray-100 animate-pulse"></div>) : 
            prices.map((item) => (
                <div key={item.id} onClick={() => setSelectedCrop(item)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center cursor-pointer">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{item.crop}</h3>
                    <p className="text-sm text-gray-500 mt-1">📍 {item.market}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-gray-800">₹{item.price}</p>
                    <div className={`text-xs font-medium flex items-center justify-end gap-1 ${item.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {item.change >= 0 ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                      {item.change}%
                    </div>
                  </div>
                </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
             <h3 className="font-bold text-gray-700 mb-2 text-sm flex items-center gap-2"><Newspaper size={16} /> {text.mandiNews}</h3>
             <div className="text-xs text-gray-600 leading-relaxed mt-2 space-y-2 whitespace-pre-wrap">{news}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default Mandi;