import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Mandi from './pages/Mandi';
import Schemes from './pages/Schemes';
import CropDoctor from './pages/CropDoctor';
import Chat from './pages/Chat';
import { AppLanguage } from './types';

const App: React.FC = () => {
  const [lang, setLang] = useState<AppLanguage>(AppLanguage.ENGLISH);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-16">
        <Routes>
          <Route path="/" element={<Home lang={lang} setLang={setLang} />} />
          <Route path="/mandi" element={<Mandi lang={lang} />} />
          <Route path="/schemes" element={<Schemes lang={lang} />} />
          <Route path="/doctor" element={<CropDoctor lang={lang} />} />
          <Route path="/chat" element={<Chat lang={lang} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <NavBar />
      </div>
    </Router>
  );
};

export default App;