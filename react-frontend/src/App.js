import React, { useEffect, useState } from 'react';
import './App.css';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

import logo from './images/SEVY Logo.png';
import cover from './images/SEVY Cover.jpg';

function App() {
  const { t, i18n } = useTranslation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(true); // Minimized by default

  useEffect(() => {
    const preferredLanguage = localStorage.getItem('preferredLanguage') || 'en';
    i18n.changeLanguage(preferredLanguage);

    // Automatically un-minimize chat box after 3 seconds
    const timer = setTimeout(() => {
      setIsChatMinimized(false);
    }, 3000);

    // Clear timer if component unmounts
    return () => clearTimeout(timer);
  }, [i18n]);

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const newMessage = { user: t('you'), text: input };
    setMessages([...messages, newMessage]);
    setInput('');

    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: input,
        developerMode: isDeveloperMode,
        language: i18n.language,
      }),
    });

    const data = await response.json();
    if (data.reply) {
      setMessages([...messages, newMessage, { user: t('SEVY_AI'), text: data.reply }]);
    }
  };

  return (
    <div className="App">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-left">
          <a href="/" onClick={(e) => { e.preventDefault(); window.location.replace('/'); }}>
            <img src={logo} alt="SEVY Logo" className="navbar-logo" />
          </a>
          <div className="navbar-links">
            <button>{t('about_sevy')}</button>
            <button>{t('sevy_ai')}</button>
            <button>{t('our_team')}</button>
          </div>
        </div>
        <div className="navbar-right">
          <button onClick={() => {
            i18n.changeLanguage('en');
            localStorage.setItem('preferredLanguage', 'en'); // Store the selected language
          }}>
            English
          </button>
          <button onClick={() => {
            i18n.changeLanguage('vi');
            localStorage.setItem('preferredLanguage', 'vi'); // Store the selected language
          }}>
            Tiếng Việt
          </button>
        </div>
      </nav>

      {/* SEVY Introduction Section */}
      <img src={cover} alt="SEVY Cover" className="introduction-image" />
      <div className="introduction-section">
        <p>{t('sevy_introduction_content_line_1')}</p>
        <p>{t('sevy_introduction_content_line_2')}</p>
      </div>

      <div className="vision-section">
        <h2>{t('sevy_vision')}</h2>
        <p>{t('sevy_vision_content_line_1')}</p>
        <p>{t('sevy_vision_content_line_2')}</p>
      </div>

      <div className="numbers-section">
        <h2>{t('sevy_numbers')}</h2>
      </div>

      {/* Chat Box */}
      {!isChatMinimized && (  // Show chat box only when it's not minimized
        <div className="chat-box">
          <div className="header">
            SEVY AI
            <button className="minimize-btn" onClick={() => setIsChatMinimized(true)}>
              &#x2212; {/* Unicode for minus sign representing minimize */}
            </button>
          </div>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.user}`}>
                <strong>{msg.user}: </strong>{msg.text}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={t('type_your_message')}
            />
            <button onClick={sendMessage}>{t('send_button')}</button>
          </div>
          <div className="developer-mode-toggle">
            <label>
              <input
                type="checkbox"
                checked={isDeveloperMode}
                onChange={() => setIsDeveloperMode(!isDeveloperMode)}
              />
              {t('developer_mode')}
            </label>
          </div>
        </div>
      )}

      {/* Minimized Button */}
      {isChatMinimized && (
        <button className="open-chat-btn" onClick={() => setIsChatMinimized(false)}>
          {t('open_chat')}
        </button>
      )}
    </div>
  );
}

export default App;