import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, TrendingUp, Filter, ChevronLeft, CloudRain, AlertCircle, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MandiPrice, AppLanguage, HistoricalDataPoint, MarketPrediction } from '../types';
import { getMarketAdvisory } from '../services/geminiService';

interface MandiProps {
  lang: AppLanguage;
}

const Mandi: React.FC<MandiProps> = ({ lang }) => {
  const [selectedCrop, setSelectedCrop] = useState<MandiPrice | null>(null);
  const [advisory, setAdvisory] = useState<string>('');
  const [loadingAdvisory, setLoadingAdvisory] = useState(false);
  const [historyPeriod, setHistoryPeriod] = useState<7 | 15 | 30>(7);

  // Mock Data: Current Prices
  const prices: MandiPrice[] = [
    { id: '1', crop: 'Onion', variety: 'Red', market: 'Lasalgaon', price: 2400, change: 5.2, date: '2023-10-24', trend: 'up', arrivalVolume: 'low' },
    { id: '2', crop: 'Soybean', variety: 'Yellow', market: 'Latur', price: 4800, change: -1.5, date: '2023-10-24', trend: 'down', arrivalVolume: 'high' },
    { id: '3', crop: 'Cotton', variety: 'Medium', market: 'Akola', price: 6900, change: 0.8, date: '2023-10-24', trend: 'stable', arrivalVolume: 'medium' },
    { id: '4', crop: 'Tomato', variety: 'Hybrid', market: 'Nashik', price: 1200, change: -12.0, date: '2023-10-24', trend: 'down', arrivalVolume: 'high' },
  ];

  // Helper to generate mock historical data based on trend
  const getHistoricalData = (basePrice: number, days: number): HistoricalDataPoint[] => {
    const data: HistoricalDataPoint[] = [];
    let current = basePrice;
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      // Random fluctuation +/- 3%
      const volatility = (Math.random() - 0.5) * 0.06; 
      current = current * (1 + volatility);
      data.push({
        date: date.toLocaleDateString(lang === AppLanguage.HINDI ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' }),
        price: Math.round(current)
      });
    }
    // Ensure last point matches current price approx
    data[data.length - 1].price = basePrice;
    return data;
  };

  // Helper to generate mock prediction
  const getPrediction = (price: MandiPrice): MarketPrediction => {
    const volatility = 0.04; // 4% daily swing
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

  useEffect(() => {
    if (selectedCrop) {
      setLoadingAdvisory(true);
      // Mock weather context
      const weatherCtx = selectedCrop.trend === 'down' ? 'Heavy Rain Expected' : 'Clear Sky';
      
      getMarketAdvisory(
        selectedCrop.crop, 
        selectedCrop.price, 
        selectedCrop.trend, 
        weatherCtx,
        lang
      ).then(text => {
        setAdvisory(text);
        setLoadingAdvisory(false);
      });
    }
  }, [selectedCrop, lang]);

  const renderDetailView = () => {
    if (!selectedCrop) return null;
    const history = getHistoricalData(selectedCrop.price, historyPeriod);
    const prediction = getPrediction(selectedCrop);
    const isHindi = lang === AppLanguage.HINDI;

    return (
      <div className="animate-fade-in">
        {/* Nav Back */}
        <button 
          onClick={() => setSelectedCrop(null)}
          className="flex items-center text-gray-600 mb-4 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200"
        >
          <ChevronLeft size={18} /> {isHindi ? 'पीछे जाएं' : 'Back'}
        </button>

        {/* Header */}
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

        {/* Prediction Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl p-5 text-white shadow-lg mb-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-20">
             <Calendar size={64} />
           </div>
           <h3 className="text-indigo-200 text-sm font-semibold uppercase tracking-wider mb-2">
             {isHindi ? 'कल का अनुमान (भाव)' : 'Tomorrow\'s Prediction'}
           </h3>
           <div className="flex items-end gap-3 mb-2">
             <span className="text-4xl font-bold">₹{prediction.tomorrowMin} - {prediction.tomorrowMax}</span>
           </div>
           
           <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="bg-white/20 px-2 py-1 rounded flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${prediction.confidence === 'high' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <span>{isHindi ? 'भरोसा: मध्यम' : 'Confidence: Medium'}</span>
              </div>
              <div className="bg-white/20 px-2 py-1 rounded flex items-center gap-1">
                 {selectedCrop.trend === 'down' ? <ArrowDown size={14} className="text-red-300"/> : <ArrowUp size={14} className="text-green-300"/>}
                 <span>{isHindi ? 'रुझान' : 'Trend'}</span>
              </div>
           </div>
           <p className="text-xs text-indigo-300 mt-3 italic border-t border-indigo-500/50 pt-2">
             * {isHindi ? 'यह केवल एक अनुमान है। पक्का भाव मंडी में ही पता चलेगा।' : 'This is an estimate based on trends. Actual prices may vary.'}
           </p>
        </div>

        {/* Advisory / AI Insight */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-6">
          <h3 className="font-bold text-yellow-800 flex items-center gap-2 mb-2">
            <AlertCircle size={18} /> {isHindi ? 'किसान साथी सलाह' : 'KisanSathi Advisor'}
          </h3>
          {loadingAdvisory ? (
            <div className="animate-pulse h-4 bg-yellow-200 rounded w-3/4"></div>
          ) : (
            <p className="text-gray-800 text-sm leading-relaxed">
              "{advisory}"
            </p>
          )}
        </div>

        {/* Chart Section */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700">{isHindi ? 'पिछले दाम' : 'Price History'}</h3>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[7, 15, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setHistoryPeriod(d as any)}
                  className={`px-3 py-1 text-xs rounded-md transition-all ${historyPeriod === d ? 'bg-white shadow text-green-700 font-bold' : 'text-gray-500'}`}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>
          
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
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => [`₹${value}`, 'Price']}
                />
                <Area type="monotone" dataKey="price" stroke="#15803d" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weather Impact */}
        <div className="mt-6 flex gap-4">
            <div className="flex-1 bg-blue-50 p-4 rounded-xl border border-blue-100">
               <div className="flex items-center gap-2 mb-2 text-blue-800 font-bold">
                 <CloudRain size={18} /> {isHindi ? 'मौसम' : 'Weather'}
               </div>
               <p className="text-xs text-blue-700">
                 {selectedCrop.trend === 'down' 
                   ? (isHindi ? 'बारिश की संभावना, कटाई रोकें।' : 'Rain likely. Delay harvest to avoid moisture.') 
                   : (isHindi ? 'मौसम साफ है।' : 'Clear weather expected.')}
               </p>
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
            <h1 className="text-2xl font-bold text-gray-800">
              {lang === AppLanguage.HINDI ? 'मंडी भाव' : 'Mandi Prices'}
            </h1>
            <button className="p-2 bg-white rounded-lg shadow-sm text-gray-600 border border-gray-200">
              <Filter size={20} />
            </button>
          </div>

          <div className="space-y-3">
            {prices.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedCrop(item)}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center cursor-pointer hover:border-green-300 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800 text-lg">{item.crop}</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.variety}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">📍 {item.market}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-gray-800">₹{item.price}</p>
                  <div className={`text-xs font-medium flex items-center justify-end gap-1 ${item.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {item.change >= 0 ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                    {item.change >= 0 ? '+' : ''}{item.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
             <h3 className="font-bold text-gray-700 mb-2 text-sm">{lang === AppLanguage.HINDI ? 'मंडी समाचार' : 'Mandi News'}</h3>
             <p className="text-xs text-gray-500 leading-relaxed">
               {lang === AppLanguage.HINDI 
                 ? 'नासिक मंडी में प्याज की आवक बढ़ी है। अगले 2 दिनों में भाव थोड़े कम हो सकते हैं।' 
                 : 'Onion arrivals in Nashik have increased. Prices may dip slightly in next 2 days.'}
             </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Mandi;