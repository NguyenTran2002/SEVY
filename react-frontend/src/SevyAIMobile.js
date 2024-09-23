import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SevyAIMobile.css'; // This will be the mobile-specific CSS
import { useTranslation } from 'react-i18next';
import logo from './images/SEVY Logo.png';

function SevyAIMobile() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isDeveloperMode, setIsDeveloperMode] = useState(false);

    useEffect(() => {
        // Set the document title to "SEVY AI"
        document.title = "SEVY AI";

        const handleOrientationChange = (e) => {
            const currentPath = location.pathname;

            if (!e.matches && currentPath.includes("/sevyai-mobile")) {
                navigate('/sevyai');
            }
        };

        const landscapeQuery = window.matchMedia("(orientation: landscape)");

        // Attach listener for landscape mode
        landscapeQuery.addListener(handleOrientationChange);

        // Check initial orientation
        if (!window.matchMedia("(orientation: portrait)").matches && location.pathname.includes("/sevyai-mobile")) {
            navigate('/sevyai');
        }

        // Cleanup listeners on component unmount
        return () => {
            landscapeQuery.removeListener(handleOrientationChange);
        };
    }, [location.pathname, navigate]);

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
        <div className="sevyai-mobile-wrapper"> {/* Wrap everything inside the mobile wrapper */}
            <nav className="navbar">
                <div className="navbar-left">
                    <a href="/" onClick={(e) => { e.preventDefault(); window.location.replace('/'); }}>
                        <img src={logo} alt="SEVY Logo" className="navbar-logo" />
                    </a>
                    <div className="navbar-links">
                        <button onClick={() => navigate('/')}>{t('home')}</button>
                        <button onClick={() => navigate('/sevyai')}>{t('sevy_ai')}</button>
                        <button onClick={() => navigate('/our-team')}>{t('our_team')}</button>
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
                <div className="sevyai-banner">
                    <h1>SEVY AI</h1>
                </div>

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

export default SevyAIMobile;