
import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Mic, MicOff, X, Settings, Terminal } from 'lucide-react';
import { Message } from '../types';
import { sendChatMessage, analyzeImage } from '../services/geminiService';
import ChatBubble from './ChatBubble';

interface ExtensionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExtensionDrawer: React.FC<ExtensionDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      content: "Hello! I am your Gemini Agent extension. How can I assist your roleplay today?",
      timestamp: Date.now(),
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleVoice = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => setIsRecording(true);
    recognitionRef.current.onend = () => setIsRecording(false);
    
    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };

    recognitionRef.current.start();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(
        [...messages, userMessage],
        "You are a helpful AI assistant for roleplayers. You help with world-building, character lore, and brainstorming within SillyTavern."
      );

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response,
        timestamp: Date.now(),
        type: 'text'
      }]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      const previewUrl = event.target?.result as string;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: "Analyzed an image.",
        mediaUrl: previewUrl,
        timestamp: Date.now(),
        type: 'image'
      };

      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const description = await analyzeImage(base64, file.type, "Please describe this image in the context of a roleplaying game character or setting.");
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: description,
          timestamp: Date.now(),
          type: 'text'
        }]);
      } catch (error) {
        console.error("Analysis failed", error);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-[#1a1a1a] shadow-2xl flex flex-col z-50 border-l border-neutral-800 transition-all duration-300">
      <div className="p-4 bg-neutral-900 flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Terminal size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-neutral-200">Gemini Agent</h2>
            <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">Extension v1.1.0</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-2 text-neutral-400 hover:bg-neutral-800 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#121212]">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-neutral-800 p-3 rounded-xl border border-neutral-700 animate-pulse">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-neutral-600 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-neutral-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-neutral-600 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-neutral-900 border-t border-neutral-800">
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRecording ? "Listening..." : "Talk to Gemini Agent..."}
            className={`w-full bg-neutral-800 border ${isRecording ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-neutral-700'} text-neutral-200 rounded-xl py-3 pl-4 pr-32 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent resize-none min-h-[50px] max-h-[150px]`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-neutral-400 hover:text-indigo-400 hover:bg-neutral-700 rounded-lg transition-all"
              title="Upload Image"
            >
              <ImageIcon size={18} />
            </button>
            <button 
              onClick={toggleVoice}
              className={`p-2 transition-all rounded-lg ${
                isRecording ? 'text-indigo-400 bg-indigo-600/20' : 'text-neutral-400 hover:text-indigo-400 hover:bg-neutral-700'
              }`}
              title={isRecording ? "Stop Recording" : "Voice Input"}
            >
              {isRecording ? <MicOff size={18} className="animate-pulse" /> : <Mic size={18} />}
            </button>
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={`p-2 rounded-lg transition-all ${
                input.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'text-neutral-500 cursor-not-allowed'
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default ExtensionDrawer;
