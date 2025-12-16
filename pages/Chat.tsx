import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, User, Bot, Volume2, VolumeX } from 'lucide-react';
import { getGeminiResponse } from '../services/geminiService';
import { AppLanguage, ChatMessage } from '../types';

interface ChatProps {
  lang: AppLanguage;
}

const Chat: React.FC<ChatProps> = ({ lang }) => {
  const getInitialMessage = () => {
    if (lang === AppLanguage.HINDI) {
      return "नमस्ते! मैं आपका कर्नाटक किसान साथी हूँ। आप मुझसे मंडी भाव, मौसम या योजनाओं (जैसे रैथा सिरी) के बारे में पूछ सकते हैं।";
    } else if (lang === AppLanguage.KANNADA) {
      return "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕರ್ನಾಟಕ ಕಿಸಾನ್ ಸಾಥಿ. ನೀವು ಮಂಡಿ ಬೆಲೆಗಳು, ಹವಾಮಾನ ಅಥವಾ ರೈತ ಸಿರಿ, ಕೃಷಿ ಭಾಗ್ಯ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಕೇಳಬಹುದು.";
    }
    return "Namaskara! I am your Karnataka KisanSathi. Ask me about Mandi prices (e.g. Shivamogga Arecanut), weather, or schemes like Raitha Siri.";
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'model',
        text: getInitialMessage(),
        timestamp: new Date()
      }]);
    }
  }, [lang]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };
    }
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      let langCode = 'en-IN';
      if (lang === AppLanguage.HINDI) langCode = 'hi-IN';
      if (lang === AppLanguage.KANNADA) langCode = 'kn-IN';
      recognitionRef.current.lang = langCode;
    }
  }, [lang]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      let langCode = 'en-IN';
      if (lang === AppLanguage.HINDI) langCode = 'hi-IN';
      if (lang === AppLanguage.KANNADA) langCode = 'kn-IN';
      utterance.lang = langCode;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await getGeminiResponse(input, lang);
    const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: new Date() };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
    speakText(responseText);
  };

  const toggleMic = () => {
    if (isListening) recognitionRef.current?.stop();
    else recognitionRef.current?.start();
  };

  const placeholderText = lang === AppLanguage.HINDI ? "यहाँ लिखें..." : (lang === AppLanguage.KANNADA ? "ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ..." : "Type here...");

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-green-700 p-4 text-white shadow-md flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold">Kisan Sahayak (Karnataka)</h1>
        {isSpeaking && (
          <button onClick={stopSpeaking} className="bg-white/20 p-2 rounded-full animate-pulse">
            <VolumeX size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm relative ${msg.role === 'user' ? 'bg-green-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}>
              <div className="flex items-center gap-2 mb-1 opacity-70 text-xs">
                 {msg.role === 'user' ? <User size={12}/> : <Bot size={12}/>}
                 <span>{msg.role === 'user' ? 'You' : 'KisanSathi'}</span>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              {msg.role === 'model' && (
                <button onClick={() => speakText(msg.text)} className="absolute -bottom-6 left-0 text-gray-400 p-1"><Volume2 size={16} /></button>
              )}
            </div>
          </div>
        ))}
        {isLoading && <div className="flex justify-start"><div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex space-x-2"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div></div></div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white p-3 border-t border-gray-200 z-50">
        <div className="flex items-center gap-2 max-w-md mx-auto">
          <button onClick={toggleMic} className={`p-3 rounded-full transition-colors ${isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-gray-100 text-gray-600'}`}><Mic size={24} /></button>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholderText} className="flex-1 bg-gray-100 border-none rounded-full px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none" onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
          <button onClick={handleSend} disabled={!input.trim() || isLoading} className="bg-green-700 text-white p-3 rounded-full disabled:opacity-50 shadow-md"><Send size={24} /></button>
        </div>
      </div>
    </div>
  );
};

export default Chat;