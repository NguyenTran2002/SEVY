import React, { useState, useEffect } from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { XIcon } from './icons/XIcon';
import { Logo } from './icons/Logo';
import { useTranslations } from '../lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import { BrainIcon } from './icons/BrainIcon';
import { DoveIcon } from './icons/DoveIcon';

interface HeaderProps {
  setPage: (page: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setPage, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const [isMenuRendered, setIsMenuRendered] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { t } = useTranslations();

  useEffect(() => {
    let visibilityTimer: number;
    let renderTimer: number;

    if (isMobileMenuOpen) {
      setIsMenuRendered(true);
      // Short delay to allow the component to render before starting the animation
      visibilityTimer = window.setTimeout(() => {
        setIsMenuVisible(true);
      }, 20);
    } else {
      setIsMenuVisible(false);
      // Delay unmounting until after the animation has finished
      renderTimer = window.setTimeout(() => {
        setIsMenuRendered(false);
      }, 300); // This duration must match the transition duration in the CSS
    }

    return () => {
      clearTimeout(visibilityTimer);
      clearTimeout(renderTimer);
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { key: 'home', page: 'home', label: t('home') },
    { key: 'sevyAI', page: 'sevyAI', label: t('sevyAI') },
    { key: 'gallery', page: 'gallery', label: t('gallery') },
    { key: 'schoolPartners', page: 'schoolPartners', label: t('schoolPartners') },
    { key: 'ourTeam', page: 'ourTeam', label: t('ourTeam') },
    { key: 'getInvolved', page: 'getInvolved', label: t('getInvolved') },
    { key: 'donate', page: 'donate', label: t('donate') },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, page: string) => {
    e.preventDefault();
    setPage(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 bg-sevy-bg/90 backdrop-blur-md shadow-sm">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="#" onClick={(e) => handleNavClick(e, 'home')} className="-m-1.5 p-1.5">
              <Logo className="h-10 w-auto" />
            </a>
          </div>
          <div className="flex items-center gap-x-4 lg:hidden">
            <LanguageSwitcher />
            <button
              type="button"
              className="inline-flex items-center justify-center gap-x-2 rounded-lg border-2 border-sevy-pink-dark bg-transparent px-3 py-2 text-sevy-pink-dark shadow-sm transition-colors hover:bg-sevy-pink-dark/10"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">Open main menu</span>
              <span className="text-xl font-semibold">Menu</span>
              <MenuIcon className="h-8 w-8" strokeWidth="2.5" />
            </button>
          </div>
          <div className="hidden lg:flex lg:items-center lg:gap-x-16">
            {navLinks.map((link) => {
              const isDonate = link.key === 'donate';
              const isSevyAI = link.key === 'sevyAI';
              const isGetInvolved = link.key === 'getInvolved';
              return (
                <a
                  key={link.key}
                  href="#"
                  onClick={(e) => handleNavClick(e, link.page)}
                  className={`text-lg font-semibold leading-6 transition-all duration-300 ${
                    isDonate
                      ? 'font-bold bg-gradient-to-r from-sevy-pink to-sevy-blue bg-clip-text text-transparent hover:opacity-80 nav-link-underline'
                      : 'text-sevy-text hover:text-sevy-pink nav-link-underline'
                  } ${isSevyAI || isGetInvolved ? 'flex items-center gap-x-1.5' : ''}`}
                >
                  {isSevyAI && <BrainIcon className="h-5 w-5" />}
                  {isGetInvolved && <DoveIcon className="h-5 w-5" />}
                  {link.label}
                </a>
              );
            })}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <LanguageSwitcher />
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      {isMenuRendered && (
        <div className="lg:hidden" role="dialog" aria-modal="true" id="mobile-menu" aria-hidden={!isMobileMenuOpen}>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-50 bg-black/30 transition-opacity duration-300 ease-in-out ${
              isMenuVisible ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Panel */}
          <div
            className={`fixed inset-y-0 right-0 z-50 flex w-full flex-col overflow-y-auto bg-sevy-bg px-6 py-6 transition-transform duration-300 ease-in-out sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 ${
              isMenuVisible ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between">
              <a href="#" onClick={(e) => handleNavClick(e, 'home')} className="-m-1.5 p-1.5">
                <Logo className="h-10 w-auto" />
              </a>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-sevy-text-secondary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navLinks.map((link) => {
                    const isDonate = link.key === 'donate';
                    const isSevyAI = link.key === 'sevyAI';
                    const isGetInvolved = link.key === 'getInvolved';
                    return (
                      <a
                        key={link.key}
                        href="#"
                        onClick={(e) => handleNavClick(e, link.page)}
                        className={`-mx-3 group flex items-center gap-x-3 rounded-lg px-3 py-2 text-lg font-semibold leading-7 transition-all duration-300 ${
                          isDonate ? 'font-bold hover:bg-pink-50 hover:scale-105' : 'text-sevy-text hover:bg-pink-50'
                        }`}
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                          {isSevyAI && <BrainIcon className="h-5 w-5" />}
                          {isGetInvolved && <DoveIcon className="h-5 w-5" />}
                        </span>
                        {isDonate ? (
                          <span className="bg-gradient-to-r from-sevy-pink to-sevy-blue bg-clip-text text-transparent transition-opacity group-hover:opacity-80">
                            {link.label}
                          </span>
                        ) : (
                          <span>{link.label}</span>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
