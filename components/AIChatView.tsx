import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { createChat } from '../services/geminiService';
import { Loader } from './Loader';
import { IllbotIcon } from '../constants';
import { Mode } from '../types';

type Message = {
  role: 'user' | 'model';
  text: string;
};

interface AIChatViewProps {
  logActivity: (action: string, mode: Mode, wordCount?: number) => void;
}

export const AIChatView: React.FC<AIChatViewProps> = ({ logActivity }) => {
  const [chat, setChat] = useState<any>(null); // Type properly based on Gemini SDK
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChat(createChat());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || !chat || isLoading) return;

    const userMessage: Message = { role: 'user', text: currentMessage };
    setMessages(prev => [...prev, userMessage]);
    logActivity('Sent a message in AI Chat', Mode.AIChat);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const stream = await chat.sendMessageStream({ message: currentMessage });
      let modelResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '...' }]);

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'model', text: modelResponse };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { role: 'model', text: "Sorry, I encountered an error." };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto pr-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
            <IllbotIcon className="w-24 h-24 text-indigo-400/50 mb-4" />
            <h2 className="text-2xl font-bold text-slate-200">AI Chat</h2>
            <p>Ask me anything! Start a conversation below.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center">
                    <IllbotIcon className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-lg p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-slate-700 text-slate-200 rounded-br-none'
                      : 'bg-slate-800 text-slate-300 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length-1]?.role === 'user' && (
              <div className="flex gap-4">
                 <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center">
                    <IllbotIcon className="w-5 h-5 text-white" />
                  </div>
                   <div className="p-4 rounded-2xl bg-slate-800 rounded-bl-none">
                     <Loader />
                   </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <form onSubmit={handleSendMessage} className="mt-6">
        <div className="relative">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Type your message here..."
            className="w-full p-4 pr-16 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !currentMessage.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};