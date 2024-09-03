import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css'; // Create this file for custom styling

function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (language) => {
        i18n.changeLanguage(language);
    };

    return (
        <div className="language-switcher">
            <button onClick={() => changeLanguage('en')} className="language-button">
                EN
            </button>
            <button onClick={() => changeLanguage('vi')} className="language-button">
                VI
            </button>
        </div>
    );
}

export default LanguageSwitcher;