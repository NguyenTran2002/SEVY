import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from '../lib/i18n';
import { SendIcon } from './icons/SendIcon';
import { StopIcon } from './icons/StopIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { ThumbsDownIcon } from './icons/ThumbsDownIcon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { TrashIcon } from './icons/TrashIcon';

// API configuration - empty string uses relative URLs for local dev (proxied)
// In production, set VITE_BACKEND_URL to full backend URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
  id: string;
};

const SevyAI: React.FC<{
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setPage?: (page: string) => void;
  isPopupMode?: boolean;
  randomStarters: string[];
  storageKey?: string;
}> = ({ messages, setMessages, setPage, isPopupMode = false, randomStarters, storageKey = 'sevyai_chat_messages_dedicated' }) => {
  const { t } = useTranslations();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Load messages from sessionStorage on mount
  useEffect(() => {
    const savedMessages = sessionStorage.getItem(storageKey);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed);
      } catch (error) {
        console.error('Failed to parse saved messages:', error);
      }
    }
  }, [storageKey, setMessages]);

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);
  
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;
    setInput('');
    setIsLoading(true);

    const newUserMessage: Message = {
      role: 'user',
      content: messageContent,
      id: `user-${Date.now()}`,
    };

    const assistantMessageId = `assistant-${Date.now()}`;
    const newAssistantMessage: Message = {
        role: 'assistant',
        content: '',
        id: assistantMessageId
    };

    setMessages(prev => [...prev, newUserMessage, newAssistantMessage]);

    try {
      // Prepare conversation history with sliding window (max 10 messages)
      const updatedMessages = [...messages, newUserMessage];
      const conversationHistory = updatedMessages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationHistory,
          developerMode: false
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.reply || t('aiPlaceholderResponse');

      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId ? { ...msg, content: aiResponse } : msg
        )
      );
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request was cancelled
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId ? { ...msg, content: t('stopGenerating') || 'Stopped' } : msg
          )
        );
      } else {
        console.error('Error sending message:', error);
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId ? { ...msg, content: t('aiPlaceholderResponse') || 'Sorry, something went wrong. Please try again.' } : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [isLoading, messages, setMessages, t]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleStarterClick = (question: string) => {
    handleSendMessage(question);
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
  };

  const handleClearChat = () => {
    setMessages([]);
    sessionStorage.removeItem(storageKey);
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
                    {message.role === 'assistant' &&
                    message.content === '' &&
                    isLoading ? (
                      <div className="flex space-x-1.5 p-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full loading-dot"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full loading-dot"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full loading-dot"></div>
                      </div>
                    ) : (
                      <div className="prose prose-sm sm:prose-base max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Code blocks with syntax highlighting + copy button
                            code({ node, inline, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              const code = String(children).replace(/\n$/, '');
                              const codeId = `code-${message.id}-${Math.random()}`;

                              return !inline && match ? (
                                <div className="relative group my-4">
                                  <div className="absolute right-2 top-2 z-10">
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(code);
                                        setCopiedCode(codeId);
                                        setTimeout(() => setCopiedCode(null), 2000);
                                      }}
                                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      {copiedCode === codeId ? '✓ Copied' : '📋 Copy'}
                                    </button>
                                  </div>
                                  <SyntaxHighlighter
                                    style={oneDark}
                                    language={match[1]}
                                    PreTag="div"
                                    className="rounded-lg"
                                    {...props}
                                  >
                                    {code}
                                  </SyntaxHighlighter>
                                </div>
                              ) : (
                                <code className="px-1.5 py-0.5 bg-gray-100 text-pink-600 rounded text-sm font-mono" {...props}>
                                  {children}
                                </code>
                              );
                            },

                            // External links open in new tab
                            a({ href, children, ...props }: any) {
                              const isExternal = href?.startsWith('http');
                              return (
                                <a
                                  href={href}
                                  target={isExternal ? '_blank' : undefined}
                                  rel={isExternal ? 'noopener noreferrer' : undefined}
                                  className="text-blue-600 hover:text-blue-800 underline"
                                  {...props}
                                >
                                  {children}
                                </a>
                              );
                            },

                            // Tables with overflow handling
                            table({ children }: any) {
                              return (
                                <div className="overflow-x-auto my-4">
                                  <table className="min-w-full border-collapse border border-gray-300">
                                    {children}
                                  </table>
                                </div>
                              );
                            },

                            th({ children }: any) {
                              return (
                                <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left">
                                  {children}
                                </th>
                              );
                            },

                            td({ children }: any) {
                              return (
                                <td className="border border-gray-300 px-4 py-2">
                                  {children}
                                </td>
                              );
                            }
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
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