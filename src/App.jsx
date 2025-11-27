import React, { useState, useEffect } from 'react';
import ChatBubble from './components/ChatBubble';
import useSpeechRecognition from './hooks/useSpeechRecognition';
import { translateText } from './services/gemini';
import { textToSpeech } from './services/elevenlabs';

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm listening...",
      translation: "Xin chào! Tôi đang lắng nghe...",
      isUser: true,
      language: 'en'
    }
  ]);

  const [activeLang, setActiveLang] = useState('en'); // 'en' or 'vi'
  const { text, finalTranscript, setFinalTranscript, isListening, startListening, stopListening } = useSpeechRecognition();

  // Auto-start listening on mount or mode change
  useEffect(() => {
    if (activeLang) {
      startListening(activeLang === 'en' ? 'en-US' : 'vi-VN');
    }
    return () => stopListening();
  }, [activeLang]);

  // Handle finalized speech
  useEffect(() => {
    if (finalTranscript) {
      const handleTranslation = async () => {
        const currentText = finalTranscript.trim();
        setFinalTranscript(''); // Clear immediately to prevent double processing

        const targetLang = activeLang === 'en' ? 'vi' : 'en';

        // Optimistic UI update
        const tempId = Date.now();
        setMessages(prev => [...prev, {
          id: tempId,
          text: currentText,
          translation: "...",
          isUser: activeLang === 'en',
          language: activeLang
        }]);

        const translation = await translateText(currentText, targetLang);

        setMessages(prev => prev.map(msg =>
          msg.id === tempId ? { ...msg, translation: translation } : msg
        ));

        // Play audio for the translation (Partner's voice)
        if (translation) {
          const audioBlob = await textToSpeech(translation);
          if (audioBlob) {
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
          }
        }
      };

      handleTranslation();
    }
  }, [finalTranscript, activeLang]);

  const toggleLanguage = () => {
    const newLang = activeLang === 'en' ? 'vi' : 'en';
    setActiveLang(newLang);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-xl overflow-hidden">
      {/* Header */}
      <header className="bg-white p-4 shadow-sm z-10 sticky top-0">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">🎙️</span> VoicePal <span className="text-xs text-gray-400">Lite</span>
          </h1>
          <div className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${isListening ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
            <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
            {isListening ? 'Listening' : 'Paused'}
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-32 scroll-smooth">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            text={msg.text}
            translation={msg.translation}
            isUser={msg.isUser}
            language={msg.language}
          />
        ))}
        {/* Live Transcript Indicator */}
        {text && (
          <div className="text-gray-400 text-sm italic px-4 animate-pulse">
            "{text}..."
          </div>
        )}
      </main>

      {/* Controls */}
      <footer className="bg-white border-t border-gray-100 p-6 fixed bottom-0 w-full max-w-md">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveLang('en')}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${activeLang === 'en' ? 'bg-white shadow-md text-blue-600' : 'text-gray-500'
                }`}
            >
              🇺🇸 English Mode
            </button>
            <button
              onClick={() => setActiveLang('vi')}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${activeLang === 'vi' ? 'bg-white shadow-md text-red-600' : 'text-gray-500'
                }`}
            >
              🇻🇳 Vietnamese Mode
            </button>
          </div>

          <div className="text-center text-xs text-gray-400">
            Hands-Free • Auto-Detects Silence
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
