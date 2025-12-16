import React, { useState, useEffect } from 'react';
import { CloudSun, Wind, Droplets, AlertTriangle, Mic, ChevronRight, Activity, MapPin, RefreshCw } from 'lucide-react';
import { WeatherData, AppLanguage } from '../types';
import { useNavigate } from 'react-router-dom';
import { getLocalWeather } from '../services/geminiService';

interface HomeProps {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
}

const Home: React.FC<HomeProps> = ({ lang, setLang }) => {
  const navigate = useNavigate();
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [locationName, setLocationName] = useState(lang === AppLanguage.HINDI ? 'स्थान खोज रहे हैं...' : 'Locating...');
  
  const [weather, setWeather] = useState<WeatherData>({
    temp: 32,
    condition: lang === AppLanguage.HINDI ? 'आंशिक बादल' : 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    advisory: lang === AppLanguage.HINDI 
      ? 'अगले 2 दिनों में हल्की बारिश की संभावना है। अभी सिंचाई रोक दें।' 
      : 'Chance of light rain in next 2 days. Hold irrigation.'
  });

  const fetchRealWeather = () => {
    if (navigator.geolocation) {
      setLoadingWeather(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocationName(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
          
          getLocalWeather(latitude, longitude, lang).then(data => {
            if (data) {
              setWeather(data);
            }
            setLoadingWeather(false);
          });
        },
        (err) => {
          console.error(err);
          setLoadingWeather(false);
          setLocationName(lang === AppLanguage.HINDI ? 'स्थान अनुपलब्ध' : 'Location Unavailable');
        }
      );
    }
  };

  useEffect(() => {
    fetchRealWeather();
  }, [lang]);

  const text = {
    greeting: lang === AppLanguage.HINDI ? 'राम राम, किसान भाई!' : 'Ram Ram, Farmer!',
    weatherTitle: lang === AppLanguage.HINDI ? 'आज का मौसम' : "Today's Weather",
    askAi: lang === AppLanguage.HINDI ? 'किसान साथी से पूछें' : 'Ask Kisan Sathi',
    alerts: lang === AppLanguage.HINDI ? 'चेतावनी' : 'Alerts',
    pestAlert: lang === AppLanguage.HINDI ? 'कपास में बॉलवर्म का खतरा' : 'Bollworm risk in Cotton',
  };

  return (
    <div className="pb-20 pt-4 px-4 space-y-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{text.greeting}</h1>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <MapPin size={14} className="text-green-600" /> {locationName}
          </p>
        </div>
        <button 
          onClick={() => setLang(lang === AppLanguage.ENGLISH ? AppLanguage.HINDI : AppLanguage.ENGLISH)}
          className="bg-white border border-green-600 text-green-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm"
        >
          {lang === AppLanguage.ENGLISH ? 'हिंदी' : 'English'}
        </button>
      </div>

      {/* Weather Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden min-h-[180px]">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-white opacity-10 w-24 h-24 rounded-full"></div>
        
        {loadingWeather ? (
          <div className="flex flex-col items-center justify-center h-full pt-8">
            <RefreshCw className="animate-spin mb-2" size={32} />
            <p className="text-sm text-blue-100">Updating Weather...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 font-medium">{text.weatherTitle}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-5xl font-bold">{weather.temp}°</span>
                  <CloudSun size={40} className="text-yellow-300" />
                </div>
                <p className="text-lg font-medium mt-1">{weather.condition}</p>
              </div>
              <div className="space-y-2 text-sm text-blue-100">
                <div className="flex items-center gap-2">
                  <Droplets size={16} /> <span>{weather.humidity}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind size={16} /> <span>{weather.windSpeed} km/h</span>
                </div>
              </div>
            </div>
            <div className="mt-4 bg-white/20 p-3 rounded-lg backdrop-blur-sm text-sm flex items-start gap-2">
              <span className="text-lg">📢</span> 
              <span>{weather.advisory}</span>
            </div>
          </>
        )}
      </div>

      {/* AI Voice Assistant Trigger */}
      <div 
        onClick={() => navigate('/chat')}
        className="bg-green-700 active:bg-green-800 transition-colors rounded-2xl p-5 text-white shadow-lg flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full animate-pulse">
            <Mic size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold">{text.askAi}</h3>
            <p className="text-green-100 text-sm opacity-90">
              {lang === AppLanguage.HINDI ? 'बोलकर सवाल पूछें' : 'Tap to ask via voice'}
            </p>
          </div>
        </div>
        <ChevronRight size={24} />
      </div>

      {/* Alerts Section */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <AlertTriangle className="text-orange-500" size={20} />
          {text.alerts}
        </h2>
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl shadow-sm">
          <div className="flex justify-between">
            <span className="font-bold text-orange-800 text-sm">PEST ALERT</span>
            <span className="text-xs text-orange-600">Now</span>
          </div>
          <p className="text-gray-800 mt-1">{text.pestAlert}</p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div onClick={() => navigate('/mandi')} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:bg-gray-50">
          <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3">
            <span className="text-xl font-bold">₹</span>
          </div>
          <h3 className="font-bold text-gray-800">Mandi Rates</h3>
          <p className="text-xs text-gray-500">Live prices</p>
        </div>
        <div onClick={() => navigate('/doctor')} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:bg-gray-50">
           <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-3">
            <Activity size={20} />
          </div>
          <h3 className="font-bold text-gray-800">Crop Doctor</h3>
          <p className="text-xs text-gray-500">Check disease</p>
        </div>
      </div>
    </div>
  );
};

export default Home;