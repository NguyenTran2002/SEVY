import React, { useState } from 'react';
import './App.css';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import './LanguageSwitcher.css';

function App() {
  const { t, i18n } = useTranslation(); // Extract i18n to access the current language
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);

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
        language: i18n.language, // Add the current language to the request body
      }),
    });

    const data = await response.json();
    if (data.reply) {
      setMessages([...messages, newMessage, { user: t('SEVY_AI'), text: data.reply }]);
    }
  };

  const formatMessage = (text) => {
    return text.split('\n').map((str, index) => (
      <p key={index}>{str}</p>
    ));
  };

  return (
    <div className="App">
      <div className="chat-container">
        <LanguageSwitcher /> {/* Add the LanguageSwitcher component here */}
        <div className="header">SEVY AI</div>
        <div className="chat-window">
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.user}`}>
                <strong>{msg.user}: </strong>{formatMessage(msg.text)}
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