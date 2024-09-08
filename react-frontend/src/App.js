
import React, { useEffect, useState } from 'react';
import './App.css';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import './LanguageSwitcher.css';

import logo from './images/SEVY Logo.png';

function App() {
  const { t, i18n } = useTranslation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);

  useEffect(() => {
    const preferredLanguage = localStorage.getItem('preferredLanguage') || 'en';
    i18n.changeLanguage(preferredLanguage);
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
          <LanguageSwitcher />
        </div>
      </nav>

      {/* Chat Box */}
      <div className="chat-box">
        <div className="header">SEVY AI</div>
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
    </div>
  );
}

export default App;
