import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, User, Bot, Volume2 } from 'lucide-react';
import { getGeminiResponse } from '../services/geminiService';
import { AppLanguage, ChatMessage } from '../types';

interface ChatProps {
  lang: AppLanguage;
}

const Chat: React.FC<ChatProps> = ({ lang }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: lang === AppLanguage.HINDI 
        ? "नमस्ते! मैं आपका किसान साथी हूँ। आप मुझसे खेती, मौसम, मंडी भाव या सरकारी योजनाओं के बारे में कुछ भी पूछ सकते हैं।"
        : "Namaste! I am KisanSathi. Ask me about farming, weather, prices, or schemes.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await getGeminiResponse(input, lang);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  const handleMicClick = () => {
    // Simulating voice input for demo purposes
    // In production, integrate Web Speech API
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setInput(lang === AppLanguage.HINDI ? "टमाटर की फसल में पत्तियां पीली पड़ रही हैं" : "Leaves are turning yellow in tomato crop");
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-green-700 p-4 text-white shadow-md flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold">Kisan Sahayak (AI)</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-green-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
              }`}
            >
              <div className="flex items-center gap-2 mb-1 opacity-70 text-xs">
                 {msg.role === 'user' ? <User size={12}/> : <Bot size={12}/>}
                 <span>{msg.role === 'user' ? 'You' : 'KisanSathi'}</span>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex justify-start">
             <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
               <div className="flex space-x-2">
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white p-3 border-t border-gray-200 z-50">
        <div className="flex items-center gap-2 max-w-md mx-auto">
          <button 
            onClick={handleMicClick}
            className={`p-3 rounded-full transition-colors ${
              isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Mic size={24} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={lang === AppLanguage.HINDI ? "यहाँ लिखें..." : "Type here..."}
            className="flex-1 bg-gray-100 border-none rounded-full px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-green-700 text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;