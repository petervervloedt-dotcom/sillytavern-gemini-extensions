
import React from 'react';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        {/* Avatar Placeholder */}
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-neutral-800 border border-neutral-700">
          <img 
            src={isUser ? "https://picsum.photos/seed/user/100/100" : "https://picsum.photos/seed/gemini/100/100"} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className="text-xs text-neutral-500 mb-1 px-1">
            {isUser ? 'You' : 'Gemini Agent'} • {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          
          <div className={`p-4 rounded-2xl shadow-sm leading-relaxed whitespace-pre-wrap ${
            isUser 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-tl-none'
          }`}>
            {message.type === 'image' && message.mediaUrl && (
              <img src={message.mediaUrl} alt="Uploaded content" className="max-w-full rounded-lg mb-3 border border-neutral-600" />
            )}
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
