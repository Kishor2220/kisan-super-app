import React from 'react';
import { ArrowUp, ArrowDown, TrendingUp, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MandiPrice, AppLanguage } from '../types';

interface MandiProps {
  lang: AppLanguage;
}

const Mandi: React.FC<MandiProps> = ({ lang }) => {
  // Mock Data
  const prices: MandiPrice[] = [
    { id: '1', crop: 'Onion', variety: 'Red', market: 'Lasalgaon', price: 2400, change: 5.2, date: '2023-10-24' },
    { id: '2', crop: 'Soybean', variety: 'Yellow', market: 'Latur', price: 4800, change: -1.5, date: '2023-10-24' },
    { id: '3', crop: 'Cotton', variety: 'Medium Staple', market: 'Akola', price: 6900, change: 0.8, date: '2023-10-24' },
    { id: '4', crop: 'Wheat', variety: 'Lokwan', market: 'Indore', price: 2150, change: -0.5, date: '2023-10-24' },
  ];

  const chartData = prices.map(p => ({
    name: p.crop.substring(0, 3), // Short name for X-axis
    price: p.price,
    fullName: p.crop
  }));

  return (
    <div className="pb-20 pt-4 px-4 max-w-md mx-auto min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {lang === AppLanguage.HINDI ? 'मंडी भाव' : 'Mandi Prices'}
        </h1>
        <button className="p-2 bg-white rounded-lg shadow-sm text-gray-600 border border-gray-200">
          <Filter size={20} />
        </button>
      </div>

      {/* Market Trend Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2">
          <TrendingUp size={16} /> Market Overview (₹/Qtl)
        </h2>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis hide />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#15803d' : '#22c55e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Price List */}
      <div className="space-y-3">
        {prices.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-800 text-lg">{item.crop}</h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.variety}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">📍 {item.market}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-xl text-gray-800">₹{item.price}</p>
              <p className={`text-xs font-medium flex items-center justify-end ${item.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {item.change >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {Math.abs(item.change)}%
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800 text-center">
        Disclaimer: Prices are indicative. Confirm with local Mandi.
      </div>
    </div>
  );
};

export default Mandi;