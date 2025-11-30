import React from 'react';

const ChatBubble = ({ text, translation, isUser, language }) => {
    return (
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} slide-in`}>
            <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm transition-all duration-200 hover:shadow-md ${isUser
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-none'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                    }`}
            >
                <p className={`text-[15px] leading-relaxed ${isUser ? 'text-blue-50' : 'text-gray-600'}`}>
                    {text}
                </p>
                {translation && (
                    <div className={`mt-2 pt-2 border-t ${isUser ? 'border-white/20' : 'border-gray-100'}`}>
                        <p className={`text-lg font-medium ${isUser ? 'text-white' : 'text-gray-900'}`}>
                            {translation}
                        </p>
                    </div>
                )}
            </div>
            <span className="text-[10px] text-gray-400 mt-1.5 px-1 font-medium tracking-wide uppercase">
                {language === 'en' ? 'English' : 'Vietnamese'}
            </span>
        </div>
    );
};

export default ChatBubble;
