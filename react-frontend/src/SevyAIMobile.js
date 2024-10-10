import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LinearProgress } from '@mui/material'; // Import LinearProgress from JoyUI
import './SevyAIMobile.css';
import { useTranslation } from 'react-i18next';
import logo from './images/SEVY Logo.png';

function SevyAIMobile() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isDeveloperMode, setIsDeveloperMode] = useState(false);
    const [loading, setLoading] = useState(false); // State for controlling loading bar visibility

    useEffect(() => {
        document.title = "SEVY AI";

        const handleOrientationChange = (e) => {
            const currentPath = location.pathname;

            if (!e.matches && currentPath.includes("/sevyai-mobile")) {
                navigate('/sevyai');
            }
        };

        const landscapeQuery = window.matchMedia("(orientation: landscape)");

        landscapeQuery.addListener(handleOrientationChange);

        if (!window.matchMedia("(orientation: portrait)").matches && location.pathname.includes("/sevyai-mobile")) {
            navigate('/sevyai');
        }

        return () => {
            landscapeQuery.removeListener(handleOrientationChange);
        };
    }, [location.pathname, navigate]);

    const sendMessage = async () => {
        if (input.trim() === '') return;

        const newMessage = { user: t('you'), text: input };
        setMessages([...messages, newMessage]);
        setInput('');
        setLoading(true); // Show progress bar when message is sent

        try {
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
        } finally {
            setLoading(false); // Hide progress bar when response is received
        }
    };

    return (
        <div className="sevyai-mobile-wrapper">
            <nav className="navbar">
                <div className="navbar-left">
                    <a href="/" onClick={(e) => { e.preventDefault(); window.location.replace('/'); }}>
                        <img src={logo} alt="SEVY Logo" className="navbar-logo" />
                    </a>
                    <div className="navbar-links">
                        <button onClick={() => navigate('/')}>{t('home')}</button>
                        {/* <button onClick={() => navigate('/sevyai')} className="sevy-ai-button">{t('sevy_ai')}</button> */}
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

                {/* Linear Progress Bar with Gradient */}
                {loading && (
                    <LinearProgress
                        className="loading-bar"
                        sx={{
                            '& .MuiLinearProgress-bar': {
                                background: 'linear-gradient(90deg, #2196F3, #FF4081)', // Vivid blue to pink
                            }
                        }}
                    />
                )}

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

                {window.location.hostname === 'localhost' && (
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
                )}
            </div>
        </div>
    );
}

export default SevyAIMobile;