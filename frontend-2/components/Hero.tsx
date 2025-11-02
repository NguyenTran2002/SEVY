
import React from 'react';
import { useTranslations } from '../lib/i18n';

const Hero: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  const { t, language } = useTranslations();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, page: string) => {
    e.preventDefault();
    setPage(page);
  };

  const handleScrollClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href')?.substring(1);
    if (targetId) {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="relative px-6 pt-14 lg:px-8">
      <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
        <div className="text-center">
          <h1 id="hero-title" className={`text-4xl font-extrabold ${language === 'vi' ? 'tracking-tight' : ''} text-sevy-text sm:text-6xl xl:text-7xl`}>
            {t('heroTitle1')}{' '}
            <span className="bg-gradient-to-r from-sevy-pink to-sevy-blue bg-clip-text text-transparent">
              {t('heroTitle2')}
            </span>
          </h1>
          <p className="mt-6 text-xl sm:text-2xl xl:text-3xl leading-8 text-sevy-text-secondary">
            {t('heroParagraph')}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-8">
            <a
              href="#our-approach"
              onClick={handleScrollClick}
              className="rounded-md bg-sevy-blue px-5 py-3 text-lg sm:text-xl xl:text-2xl font-semibold text-sevy-text shadow-lg hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sevy-blue transition-all duration-300 transform hover:scale-105"
            >
              {t('learnMore')}
            </a>
            <a
              href="#"
              onClick={(e) => handleNavClick(e, 'gallery')}
              className="text-lg sm:text-xl xl:text-2xl font-semibold leading-6 text-sevy-text group"
            >
              {t('joinCommunity')} <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
            </a>
          </div>
        </div>
      </div>
      <div 
        aria-hidden="true" 
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
      >
        <div 
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-sevy-pink to-sevy-blue opacity-25 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" 
          style={{
            clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
          }}
        ></div>
      </div>
    </div>
  );
};

export default Hero;
