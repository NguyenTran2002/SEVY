import React, { useState, useEffect } from 'react';
import { useTranslations } from '../lib/i18n';
import SevyAI, { type Message } from './SevyAI';
import { BrainIcon } from './icons/BrainIcon';
import { XIcon } from './icons/XIcon';

interface ChatPopupProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isChatOpen: boolean;
  setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  randomStarters: string[];
  setPage: (page: string) => void;
  page: string;
  isMobileMenuOpen: boolean;
}

const ChatPopup: React.FC<ChatPopupProps> = ({ messages, setMessages, isChatOpen, setIsChatOpen, randomStarters, setPage, page, isMobileMenuOpen }) => {
  const { t } = useTranslations();
  const [isButtonVisible, setIsButtonVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsButtonVisible(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Hide the popup if the user navigates to the main AI page
    if (page === 'sevyAI' && isChatOpen) {
      setIsChatOpen(false);
    }
  }, [page, isChatOpen, setIsChatOpen]);

  const handleButtonClick = () => {
    if (window.innerWidth < 768) {
      setPage('sevyAI');
    } else {
      setIsChatOpen(true);
    }
  };
  
  const shouldBeVisible = isButtonVisible && !isChatOpen && page === 'home' && !isMobileMenuOpen;

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={handleButtonClick}
          className={`
            flex items-center justify-center gap-2 md:gap-3 rounded-full bg-sevy-blue font-semibold text-sevy-text shadow-xl transition-all duration-500 ease-in-out hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sevy-blue
            px-4 py-3 text-base md:px-6 md:py-4 md:text-xl
            ${shouldBeVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            ${isButtonVisible ? 'translate-y-0' : 'translate-y-4'}
            ${shouldBeVisible ? 'animate-heartbeat' : ''}
          `}
          aria-haspopup="true"
          aria-expanded={isChatOpen}
          aria-controls="chat-popup-window"
          aria-label={t('chatWithSevyAI')}
        >
          <BrainIcon className="h-6 w-6 md:h-7 md:w-7" />
          <span>{t('chatWithSevyAI')}</span>
        </button>
      </div>

      {/* Chat Window (Remains desktop-only) */}
      <div
        id="chat-popup-window"
        className={`fixed bottom-0 right-0 z-50 m-0 hidden h-full w-full max-w-md transform-gpu flex-col overflow-hidden rounded-none bg-white shadow-2xl ring-1 ring-black/10 transition-all duration-300 ease-in-out md:bottom-6 md:right-6 md:h-[75vh] md:max-h-[700px] md:rounded-2xl
          ${isChatOpen ? 'translate-y-0 opacity-100 md:flex' : 'translate-y-full opacity-0 pointer-events-none md:translate-y-8'}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-popup-title"
        aria-hidden={!isChatOpen}
      >
        {/* Header */}
        <header className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50/80 p-4 backdrop-blur-sm">
          <h2 id="chat-popup-title" className="flex items-center gap-2 text-xl font-bold text-sevy-text">
            <BrainIcon className="h-6 w-6 text-sevy-blue" />
            SEVY AI
          </h2>
          <button
            onClick={() => setIsChatOpen(false)}
            className="rounded-full p-2 text-sevy-text-secondary transition-colors hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sevy-blue"
            aria-label={t('close')}
          >
            <XIcon className="h-6 w-6" />
          </button>
        </header>

        {/* AI Component */}
        <div className="flex-grow overflow-hidden">
          <SevyAI
            messages={messages}
            setMessages={setMessages}
            isPopupMode
            randomStarters={randomStarters}
          />
        </div>
      </div>
    </>
  );
};

export default ChatPopup;