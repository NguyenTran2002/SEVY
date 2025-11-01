import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Helmet } from 'react-helmet';
import { LinearProgress } from '@mui/material';
import './SevyAI.css';
import { useTranslation } from 'react-i18next';
import logo from './images/SEVY Logo.png';

function SevyAI() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const [input, setInput] = useState('');
    const [messages, setMessages] = useState(() => {
        // Load messages from sessionStorage on component mount
        const savedMessages = sessionStorage.getItem('sevyai_chat_messages_dedicated');
        return savedMessages ? JSON.parse(savedMessages) : [];
    });
    const [isDeveloperMode, setIsDeveloperMode] = useState(false);
    const [loading, setLoading] = useState(false);

    const [isComposing, setIsComposing] = useState(false);
    const chatMessagesRef = useRef(null);
    const textAreaRef = useRef(null);

    useEffect(() => {
        document.title = "SEVY AI";
        return () => {
            document.title = "SEVY";
        };
    }, []);

    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTo({
                top: chatMessagesRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages]);

    // Save messages to sessionStorage whenever they change
    useEffect(() => {
        sessionStorage.setItem('sevyai_chat_messages_dedicated', JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        const handleOrientationChange = (e) => {
            const currentPath = location.pathname;
            if (e.matches) {
                if (!currentPath.includes("/mobile")) {
                    navigate('/sevyai-mobile');
                }
            } else {
                if (currentPath.includes("/mobile")) {
                    navigate('/sevyai');
                }
            }
        };
        const portraitQuery = window.matchMedia("(orientation: portrait)");
        const landscapeQuery = window.matchMedia("(orientation: landscape)");
        portraitQuery.addListener(handleOrientationChange);
        landscapeQuery.addListener(handleOrientationChange);
        if (portraitQuery.matches && !location.pathname.includes("/mobile")) {
            navigate('/sevyai-mobile');
        } else if (landscapeQuery.matches && location.pathname.includes("/mobile")) {
            navigate('/sevyai');
        }
        return () => {
            portraitQuery.removeListener(handleOrientationChange);
            landscapeQuery.removeListener(handleOrientationChange);
        };
    }, [location.pathname, navigate]);

    const sendMessage = async () => {
        if (input.trim() === '') return;

        // Create new user message in display format
        const newUserMessage = { user: t('you'), text: input, role: 'user', content: input };
        const updatedMessages = [...messages, newUserMessage];

        setMessages(updatedMessages);
        setInput('');

        // Reset textarea to default height
        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
        }

        setLoading(true);  // Show the progress bar

        try {
            // Convert messages to OpenAI format (role/content) for API
            // Implement sliding window: keep only last 5 message pairs (10 messages)
            const conversationHistory = updatedMessages.map(msg => ({
                role: msg.role || (msg.user === t('you') ? 'user' : 'assistant'),
                content: msg.content || msg.text
            }));

            // Apply sliding window: keep only last 10 messages (5 pairs)
            const MAX_MESSAGES = 10;
            const trimmedHistory = conversationHistory.length > MAX_MESSAGES
                ? conversationHistory.slice(-MAX_MESSAGES)
                : conversationHistory;

            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: trimmedHistory,
                    developerMode: isDeveloperMode,
                    language: i18n.language,
                }),
            });

            const data = await response.json();
            if (data.reply) {
                // Create AI response message in display format
                const aiMessage = {
                    user: t('SEVY_AI'),
                    text: data.reply,
                    role: 'assistant',
                    content: data.reply
                };
                setMessages([...updatedMessages, aiMessage]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                user: t('SEVY_AI'),
                text: 'Sorry, I encountered an error. Please try again.',
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            };
            setMessages([...updatedMessages, errorMessage]);
        } finally {
            setLoading(false);  // Hide the progress bar when done
        }
    };

    // Clear chat function for privacy
    const clearChat = () => {
        setMessages([]);
        sessionStorage.removeItem('sevyai_chat_messages_dedicated');
    };

    return (
        <div className="sevy-ai-wrapper">

            {/* Helmet wrapper for site preview */}
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
                <meta property="og:image" content="https://sevyai.com/static/media/SEVY%20Logo.bf6ce28e.png" />
                <meta property="og:url" content="https://sevyai.com/sevyai" />
                <meta property="og:type" content="website" />
            </Helmet>

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
                    }}>English</button>
                    <button onClick={() => {
                        i18n.changeLanguage('vi');
                        localStorage.setItem('preferredLanguage', 'vi');
                    }}>Tiếng Việt</button>
                </div>
            </nav>

            <div className="sevyai-chat-box full-screen">
                <div className="sevyai-banner">
                    <h1>SEVY AI</h1>
                    <button
                        className="clear-chat-btn"
                        onClick={clearChat}
                        title={t('clear_chat') || 'Clear chat'}
                        style={{
                            position: 'absolute',
                            right: '20px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        🗑️ {t('clear_chat') || 'Clear'}
                    </button>
                </div>

                <div className="sevyai-disclaimer">
                    <p>{t('SEVY_AI_disclaimer')}</p>
                </div>

                {loading && (
                    <LinearProgress
                        className="loading-bar"
                        sx={{
                            '& .MuiLinearProgress-bar': {
                                background: 'linear-gradient(90deg, #2196F3, #FF4081)', // Vivid blue and pink
                            }
                        }}
                    />
                )}

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
                            // If Enter is pressed, no shift key is held, and we're NOT composing text
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

export default SevyAI;