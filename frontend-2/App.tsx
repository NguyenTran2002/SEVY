import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Stats from './components/Stats';
import Contact from './components/Contact';
import OurTeam from './components/OurTeam';
import SchoolPartners from './components/SchoolPartners';
import SevyAI, { type Message } from './components/SevyAI';
import Donate from './components/Donate';
import Gallery from './components/Gallery';
import ChatPopup from './components/ChatPopup';
import GetInvolved from './components/GetInvolved';
import { useTranslations } from './lib/i18n';

const App: React.FC = () => {
  const [page, setPage] = useState('home');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [randomStarters, setRandomStarters] = useState<string[]>([]);
  const { t } = useTranslations();

  // Generate starter questions once and share them across components.
  // This ensures the main AI page and the popup show the same questions.
  useEffect(() => {
    const allStarterKeys = Array.from({ length: 20 }, (_, i) => `starterQ${i + 1}`);
    const shuffledKeys = allStarterKeys.sort(() => 0.5 - Math.random());
    const selectedKeys = shuffledKeys.slice(0, 3);
    setRandomStarters(selectedKeys.map(key => t(key as any)));
  }, [t]); // Regenerate if language changes.

  // Reset scroll position to the top when the page changes.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  // All pages now share a common layout with a header and main content area.
  return (
    <div className="bg-sevy-bg min-h-screen text-sevy-text overflow-x-hidden">
      <div className="relative isolate">
        <div 
          aria-hidden="true" 
          className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl"
        >
          <div 
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-sevy-pink to-sevy-blue opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" 
            style={{
              clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
            }}
          ></div>
        </div>

        <Header setPage={setPage} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        <main className={page !== 'home' && page !== 'sevyAI' ? 'pt-8' : ''}>
          {(page === 'home' || !page) && (
            <>
              <Hero setPage={setPage} />
              <Features />
              <Stats />
              <Contact />
            </>
          )}
          {page === 'gallery' && <Gallery />}
          {page === 'schoolPartners' && <SchoolPartners />}
          {page === 'ourTeam' && <OurTeam />}
          {page === 'getInvolved' && <GetInvolved />}
          {page === 'donate' && <Donate />}
          {page === 'sevyAI' && (
            <SevyAI 
              messages={chatMessages} 
              setMessages={setChatMessages}
              setPage={setPage}
              randomStarters={randomStarters}
            />
          )}
        </main>
      </div>
      <ChatPopup
        messages={chatMessages}
        setMessages={setChatMessages}
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
        randomStarters={randomStarters}
        setPage={setPage}
        page={page}
        isMobileMenuOpen={isMobileMenuOpen}
      />
    </div>
  );
};

export default App;