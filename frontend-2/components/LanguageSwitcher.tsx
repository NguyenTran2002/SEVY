import React from 'react';
import { useTranslations } from '../lib/i18n';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslations();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en');
  };

  const buttonText = language === 'en' ? 'Tiếng Việt' : 'English';
  const ariaLabelText = language === 'en' ? 'Vietnamese' : 'English';

  // Apply the font for the language being displayed, not the current page language.
  const buttonFontStyle = {
    fontFamily: language === 'en' 
      ? "'Helvetica', 'Poppins', 'sans-serif'" // Use Vietnamese font for "Tiếng Việt"
      : "'ibrand', 'Poppins', 'sans-serif'",    // Use English font for "English"
  };

  return (
    <button
      onClick={toggleLanguage}
      className="rounded-md px-3 py-2 text-base lg:text-lg font-semibold text-sevy-text-secondary hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sevy-blue transition-colors duration-300"
      aria-label={`Switch language to ${ariaLabelText}`}
    >
      <span className="font-bold language-switcher-button-text" style={buttonFontStyle}>
        {buttonText}
      </span>
    </button>
  );
};

export default LanguageSwitcher;