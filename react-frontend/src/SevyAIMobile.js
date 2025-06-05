import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Helmet } from 'react-helmet';
import { LinearProgress } from '@mui/material';
import './SevyAIMobile.css';
import { useTranslation } from 'react-i18next';
import logo from './images/SEVY Logo.png';

function SevyAIMobile() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';
    const location = useLocation();

    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isDeveloperMode, setIsDeveloperMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isComposing, setIsComposing] = useState(false);

    const chatMessagesRef = useRef(null);
    const textAreaRef = useRef(null);

    useEffect(() => {
        document.title = "SEVY AI";

        const handleOrientationChange = (e) => {
            const currentPath = location.pathname;
            // If orientation is not portrait and we're on mobile route, go to desktop route
            if (!e.matches && currentPath.includes("/sevyai-mobile")) {
                navigate('/sevyai');
            }
        };

        const landscapeQuery = window.matchMedia("(orientation: landscape)");
        landscapeQuery.addListener(handleOrientationChange);

        // If already in landscape on mount, switch to the desktop page
        if (!window.matchMedia("(orientation: portrait)").matches && location.pathname.includes("/sevyai-mobile")) {
            navigate('/sevyai');
        }

        return () => {
            landscapeQuery.removeListener(handleOrientationChange);
        };
    }, [location.pathname, navigate]);

    // 2) Smoothly scroll down whenever messages change
    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTo({
                top: chatMessagesRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const sendMessage = async () => {
        if (input.trim() === '') return;

        const newMessage = { user: t('you'), text: input };
        setMessages([...messages, newMessage]);
        setInput('');

        // Reset textarea to default height
        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
        }


        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/chat`, {
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
                setMessages(prev => [
                    ...prev,
                    { user: t('SEVY_AI'), text: data.reply }
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sevyai-mobile-wrapper">
            <Helmet>
                <title>SEVY AI</title>
                <meta
                    name="description"
                    content="SEVY AI is a private and free chatbot that answers any sex-education-related question."
                />
                <meta property="og:title" content="SEVY - Sex Education for Vietnamese Youth" />
                <meta
                    property="og:description"
                    content="SEVY AI is a private and free chatbot that answers any sex-education-related question."
                />
                <meta
                    property="og:image"
                    content="https://sevyai.com/static/media/SEVY%20Logo.bf6ce28e.png"
                />
                <meta property="og:url" content="https://sevyai.com/sevyai" />
                <meta property="og:type" content="website" />
            </Helmet>

            <nav className="navbar">
                <div className="navbar-left">
                    <a
                        href="/"
                        onClick={(e) => {
                            e.preventDefault();
                            window.location.replace('/');
                        }}
                    >
                        <img src={logo} alt="SEVY Logo" className="navbar-logo" />
                    </a>
                    <div className="navbar-links">
                        <button onClick={() => navigate('/')}>{t('home')}</button>
                        <button onClick={() => navigate('/our-team')}>{t('our_team')}</button>
                    </div>
                </div>
                <div className="navbar-right">
                    <button
                        onClick={() => {
                            i18n.changeLanguage('en');
                            localStorage.setItem('preferredLanguage', 'en');
                        }}
                    >
                        English
                    </button>
                    <button
                        onClick={() => {
                            i18n.changeLanguage('vi');
                            localStorage.setItem('preferredLanguage', 'vi');
                        }}
                    >
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

                {loading && (
                    <LinearProgress
                        className="loading-bar"
                        sx={{
                            '& .MuiLinearProgress-bar': {
                                background: 'linear-gradient(90deg, #2196F3, #FF4081)',
                            },
                        }}
                    />
                )}

                {/* 3) Attach the ref to your .chat-messages container */}
                <div className="chat-messages" ref={chatMessagesRef}>
                    {messages.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.user}`}>
                            <strong>{msg.user}: </strong>
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                    ))}
                </div>

                <div className="chat-input">
                    <textarea
                        ref={textAreaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        placeholder={t('type_your_message')}
                        rows="1"
                        style={{ resize: 'none' }}
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