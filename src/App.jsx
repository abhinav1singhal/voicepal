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

    const messagesEndRef = React.useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, text]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden border-x border-gray-100">
            {/* Header */}
            <header className="glass p-4 z-20 sticky top-0">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2 tracking-tight">
                        <span className="text-2xl">🎙️</span> VoicePal <span className="text-xs font-medium text-blue-50 bg-blue-50 px-2 py-0.5 rounded-full">Lite</span>
                    </h1>
                    <div className={`text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-2 transition-all duration-300 ${isListening ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-100 text-gray-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-wave' : 'bg-gray-400'}`}></div>
                        {isListening ? 'Listening...' : 'Paused'}
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 scroll-smooth bg-gradient-to-b from-gray-50 to-white">
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
                    <div className="flex justify-end">
                        <div className="bg-blue-50 text-blue-600 text-sm px-4 py-3 rounded-2xl rounded-tr-none shadow-sm animate-pulse max-w-[85%]">
                            <p className="font-medium">Listening...</p>
                            <p className="text-blue-400 mt-1">"{text}"</p>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Controls */}
            <footer className="glass-footer p-6 fixed bottom-0 w-full max-w-md z-20">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between bg-gray-100/50 p-1.5 rounded-2xl backdrop-blur-sm">
                        <button
                            onClick={() => setActiveLang('en')}
                            className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${activeLang === 'en' ? 'bg-white shadow-md text-blue-600 scale-[1.02]' : 'text-gray-500 hover:bg-gray-200/50'
                                }`}
                        >
                            🇺🇸 English Mode
                        </button>
                        <button
                            onClick={() => setActiveLang('vi')}
                            className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${activeLang === 'vi' ? 'bg-white shadow-md text-red-600 scale-[1.02]' : 'text-gray-500 hover:bg-gray-200/50'
                                }`}
                        >
                            🇻🇳 Vietnamese Mode
                        </button>
                    </div>

                    <div className="text-center text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                        Hands-Free • Auto-Detects Silence
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;
