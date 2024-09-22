import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SevyAI.css'; // Import the SevyAI-specific CSS
import { useTranslation } from 'react-i18next';
import logo from './images/SEVY Logo.png';

function SevyAI() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate(); // useNavigate for internal navigation
    // const location = useLocation(); // location to access the current path
    // if enable the above line of code, don't forget to import import { useNavigate, useLocation } from 'react-router-dom';

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
                language: i18n.language,
            }),
        });

        const data = await response.json();
        if (data.reply) {
            setMessages([...messages, newMessage, { user: t('SEVY_AI'), text: data.reply }]);
        }
    };

    return (
        <div className="sevy-ai-wrapper"> {/* Wrap the entire content */}
            <nav className="navbar">
                <div className="navbar-left">
                    <a href="/" onClick={(e) => { e.preventDefault(); window.location.replace('/'); }}>
                        <img src={logo} alt="SEVY Logo" className="navbar-logo" />
                    </a>
                    <div className="navbar-links">
                        {/* <button onClick={() => navigate('/')}>{t('about_sevy')}</button> */}
                        <button onClick={() => navigate('/sevyai')}>{t('sevy_ai')}</button> {/* Navigate to /sevyai */}
                        <button>{t('our_team')}</button>
                    </div>
                </div>
                <div className="navbar-right">
                    <button onClick={() => {
                        i18n.changeLanguage('en');
                        localStorage.setItem('preferredLanguage', 'en');
                    }}>
                        English
                    </button>
                    <button onClick={() => {
                        i18n.changeLanguage('vi');
                        localStorage.setItem('preferredLanguage', 'vi');
                    }}>
                        Tiếng Việt
                    </button>
                </div>
            </nav>

            <div className="sevyai-chat-box full-screen">
                {/* Mint Banner */}
                <div className="sevyai-banner">
                    <h1>SEVY AI</h1>
                </div>

                {/* Disclaimer Box */}
                <div className="sevyai-disclaimer">
                    <p>{t('SEVY_AI_disclaimer')}</p>
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
        </div>
    );
}

export default SevyAI;