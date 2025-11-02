import React, { useState, useRef, useEffect, useCallback } from 'react';
// Fix for API guidelines: use correct imports from @google/genai
import { GoogleGenAI, Chat } from '@google/genai';
import { useTranslations } from '../lib/i18n';
import { SendIcon } from './icons/SendIcon';
import { StopIcon } from './icons/StopIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { ThumbsDownIcon } from './icons/ThumbsDownIcon';
import ReactMarkdown from 'react-markdown';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { TrashIcon } from './icons/TrashIcon';

export type Message = {
  role: 'user' | 'model';
  content: string;
  id: string;
};

const SevyAI: React.FC<{
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setPage?: (page: string) => void;
  isPopupMode?: boolean;
  randomStarters: string[];
}> = ({ messages, setMessages, setPage, isPopupMode = false, randomStarters }) => {
  const { t } = useTranslations();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const stopStreamingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const initializeChat = useCallback(() => {
    // Fix for API guidelines: API key must be from process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    const systemInstruction = "You are SEVY AI, a compassionate and knowledgeable AI assistant from SEVY (Sex Education for Vietnamese Youth). Your purpose is to provide accurate, non-judgmental, and culturally sensitive information about sexual health. You are trained on SEVY's in-house curricula. Always be supportive and encouraging. Your conversations are private and secure.";

    // Fix for API guidelines: use gemini-2.5-flash for basic text tasks
    chatRef.current = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
      },
    });
  }, []);

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);
  
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;
    setInput('');
    setIsLoading(true);
    stopStreamingRef.current = false;

    const newUserMessage: Message = {
      role: 'user',
      content: messageContent,
      id: `user-${Date.now()}`,
    };
    
    const modelMessageId = `model-${Date.now()}`;
    const newModelMessage: Message = {
        role: 'model',
        content: '',
        id: modelMessageId
    };

    setMessages(prev => [...prev, newUserMessage, newModelMessage]);

    try {
      if (!chatRef.current) {
        throw new Error('Chat session not initialized.');
      }
      
      const stream = await chatRef.current.sendMessageStream({ message: messageContent });

      let accumulatedText = '';
      for await (const chunk of stream) {
        if (stopStreamingRef.current) {
            break;
        }
        // Fix for API guidelines: extract text from response chunk
        accumulatedText += chunk.text;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === modelMessageId ? { ...msg, content: accumulatedText + '▍' } : msg
          )
        );
      }
      setMessages(prev =>
          prev.map(msg =>
            msg.id === modelMessageId ? { ...msg, content: accumulatedText } : msg
          )
        );
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === modelMessageId ? { ...msg, content: t('aiPlaceholderResponse') } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, setMessages, t]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleStarterClick = (question: string) => {
    handleSendMessage(question);
  };

  const handleStopGenerating = () => {
    stopStreamingRef.current = true;
    setIsLoading(false);
  };
  
  const handleClearChat = () => {
    setMessages([]);
    initializeChat();
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };
  
  const capabilities = [
      t('capability1'),
      t('capability2'),
      t('capability3'),
  ];

  return (
    <div className={`relative flex flex-col ${isPopupMode ? 'h-full bg-white chat-background' : 'min-h-[calc(100vh-80px)] mt-20 max-w-4xl mx-auto'}`}>
      <div className={`flex flex-col flex-grow ${isPopupMode ? 'pt-6 pb-32 no-scrollbar overflow-y-auto px-4' : 'pt-16 pb-40 px-4 sm:px-6 lg:px-8'}`}>

        {messages.length === 0 ? (
          <>
            {!isPopupMode ? (
              <div className="text-center mb-12">
                  <h1 className="text-4xl sm:text-5xl font-bold text-sevy-text mb-6">SEVY AI</h1>
                  <div className="w-full max-w-3xl mx-auto text-left">
                      <div className="flex flex-col items-start gap-3">
                          {capabilities.map((cap, index) => (
                          <div key={index} className="flex items-center gap-2.5">
                              <SparklesIcon className="h-5 w-5 text-sevy-pink flex-shrink-0" />
                              <p className="text-lg font-semibold text-sevy-text-secondary">{cap}</p>
                          </div>
                          ))}
                      </div>
                  </div>
              </div>
            ) : (
              <div className="w-full text-left mb-6">
                <div className="flex flex-col items-start gap-2">
                    {capabilities.map((cap, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <SparklesIcon className="h-4 w-4 text-sevy-pink flex-shrink-0" />
                        <p className="text-sm font-medium text-sevy-text-secondary">{cap}</p>
                    </div>
                    ))}
                </div>
              </div>
            )}

            <div className="flex-grow" />
            <div className={`grid grid-cols-1 ${isPopupMode ? 'gap-3' : 'md:grid-cols-3 gap-4'} w-full max-w-3xl mx-auto mb-4`}>
              {randomStarters.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleStarterClick(q)}
                  className="group relative p-4 bg-white rounded-lg shadow-sm text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-105 opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${150 + i * 150}ms` }}
                >
                  <p className={`font-semibold text-sevy-text pr-6 ${isPopupMode ? 'text-sm' : ''}`}>{q}</p>
                  <div className="absolute bottom-4 right-4">
                    <ArrowRightIcon className="h-6 w-6 text-sevy-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex-grow" />
            <div className={`space-y-6 ${isPopupMode ? 'pb-4' : 'max-w-3xl mx-auto w-full'}`}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xl py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-sevy-blue text-white px-4'
                        : 'bg-sevy-pink-light text-sevy-text ai-bubble-gradient pr-4 pl-6'
                    }`}
                  >
                    {message.role === 'model' &&
                    message.content === '' &&
                    isLoading ? (
                      <div className="flex space-x-1.5 p-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full loading-dot"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full loading-dot"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full loading-dot"></div>
                      </div>
                    ) : (
                      <div className="prose prose-sm sm:prose-base max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className={`${isPopupMode ? 'absolute' : 'fixed'} bottom-0 left-0 right-0 ${isPopupMode ? 'bg-white/80' : 'bg-sevy-bg/80'} backdrop-blur-md`}>
        <div className={`pt-2 pb-4 ${isPopupMode ? 'px-4' : 'px-4 sm:px-6 lg:px-8'}`}>
            <div className="flex justify-center mb-2 h-9">
                {isLoading ? (
                <button onClick={handleStopGenerating} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full text-sevy-text text-sm font-semibold hover:bg-gray-50 transition-colors">
                    <StopIcon className="h-4 w-4" />
                    {t('stopGenerating')}
                </button>
                ) : (
                messages.length > 0 && (
                    <button onClick={handleClearChat} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full text-sevy-text text-sm font-semibold hover:bg-gray-50 transition-colors">
                    <TrashIcon className="h-4 w-4" />
                    {t('clearChat')}
                    </button>
                )
                )}
            </div>
            <form onSubmit={handleFormSubmit} className={`flex items-center gap-2 ${isPopupMode ? '' : 'max-w-3xl mx-auto'}`}>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('chatPlaceholder')}
                disabled={isLoading}
                className={`flex-grow px-4 text-sevy-text bg-white border-2 border-gray-200 rounded-full focus:ring-2 focus:ring-sevy-blue focus:outline-none transition-shadow ${isPopupMode ? 'py-2.5 text-base' : 'py-3 text-lg'}`}
            />
            <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`flex-shrink-0 flex items-center justify-center bg-sevy-blue text-white rounded-xl hover:brightness-95 disabled:bg-sevy-blue/60 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sevy-blue ${isPopupMode ? 'w-10 h-10' : 'w-12 h-12'}`}
                aria-label="Send message"
            >
                <SendIcon className="w-6 h-6" />
            </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default SevyAI;