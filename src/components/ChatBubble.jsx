import React from 'react';

const ChatBubble = ({ text, translation, isUser, language }) => {
    return (
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-4`}>
            <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${isUser
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
            >
                <p className="text-lg font-medium">{text}</p>
                {translation && (
                    <p className={`text-sm mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                        {translation}
                    </p>
                )}
            </div>
            <span className="text-xs text-gray-400 mt-1 px-1">
                {language === 'en' ? 'English' : 'Vietnamese'}
            </span>
        </div>
    );
};

export default ChatBubble;
