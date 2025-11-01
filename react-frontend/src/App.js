import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Helmet } from 'react-helmet';
import { LinearProgress } from '@mui/material';
import './App.css';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

import logo from './images/SEVY Logo.png';
import cover from './images/SEVY and Students Cropped 1.jpg';

function App() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => {
    // Load messages from sessionStorage on component mount
    const savedMessages = sessionStorage.getItem('sevyai_chat_messages_home');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(true);

  const [sevyEducatorsNumber, setSevyEducatorsNumber] = useState(null);
  const [sevyAiAnswers, setSevyAiAnswers] = useState(null);
  const [studentsTaught, setStudentsTaught] = useState(null);

  // Track IME composition (for languages like Vietnamese)
  const [isComposing, setIsComposing] = useState(false);

  // Ref for smooth-scrolling to the bottom of the chat
  const chatMessagesRef = useRef(null)

  const textAreaRef = useRef(null);

  useEffect(() => {
    document.title = "SEVY";
    return () => {
      document.title = "SEVY";
    };
  }, []);

  // Smooth scroll whenever 'messages' changes
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Save messages to sessionStorage whenever they change (for persistence across minimize/refresh)
  useEffect(() => {
    sessionStorage.setItem('sevyai_chat_messages_home', JSON.stringify(messages));
  }, [messages]);

  const fetchAllNumbers = async () => {
    try {
      const response = await fetch('/get_all_numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('All SEVY Numbers:', data);
      return data;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      return {
        sevy_educators_number: 'N/A',
        sevy_ai_answers: 'N/A',
        students_taught: 'N/A'
      };
    }
  };

  useEffect(() => {
    const handleOrientationChange = (e) => {
      const currentPath = location.pathname;
      if (e.matches) {
        if (!currentPath.includes("/mobile")) {
          navigate('/mobile');
        }
      } else {
        if (currentPath.includes("/mobile")) {
          navigate('/');
        }
      }
    };

    const portraitQuery = window.matchMedia("(orientation: portrait)");
    const landscapeQuery = window.matchMedia("(orientation: landscape)");

    portraitQuery.addListener(handleOrientationChange);
    landscapeQuery.addListener(handleOrientationChange);

    if (portraitQuery.matches && !location.pathname.includes("/mobile")) {
      navigate('/mobile');
    } else if (landscapeQuery.matches && location.pathname.includes("/mobile")) {
      navigate('/');
    }

    return () => {
      portraitQuery.removeListener(handleOrientationChange);
      landscapeQuery.removeListener(handleOrientationChange);
    };
  }, [location.pathname, navigate]);

  useEffect(() => {
    const fetchLocationAndSetLanguage = async () => {
      const storedLanguage = localStorage.getItem('preferredLanguage');
      if (storedLanguage) {
        i18n.changeLanguage(storedLanguage);
      } else {
        try {
          const response = await fetch(`https://ipinfo.io/json?token=${process.env.REACT_APP_IPINFO_TOKEN}`);
          const data = await response.json();
          const countryCode = data.country;
          if (countryCode === 'VN') {
            i18n.changeLanguage('vi');
            localStorage.setItem('preferredLanguage', 'vi');
          } else {
            i18n.changeLanguage('en');
            localStorage.setItem('preferredLanguage', 'en');
          }
        } catch (error) {
          console.error('Failed to detect location:', error);
          i18n.changeLanguage('en');
          localStorage.setItem('preferredLanguage', 'en');
        }
      }
    };

    fetchLocationAndSetLanguage();
  }, [i18n]);

  useEffect(() => {
    fetchAllNumbers().then((data) => {
      setSevyEducatorsNumber(data.sevy_educators_number);
      setSevyAiAnswers(data.sevy_ai_answers);
      setStudentsTaught(data.students_taught);
    });

    // Auto-open the chat box after 3 seconds
    const timer = setTimeout(() => {
      setIsChatMinimized(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const sendMessage = async () => {
    if (input.trim() === '') return;

    // Create new user message in display format
    const newUserMessage = { user: t('you'), text: input, role: 'user', content: input };
    const updatedMessages = [...messages, newUserMessage];

    setMessages(updatedMessages);
    setInput('');

    // Reset the textarea's height after clearing `input`
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
    }

    setLoading(true);

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
      setLoading(false);
    }
  };

  // Clear chat function for privacy
  const clearChat = () => {
    setMessages([]);
    sessionStorage.removeItem('sevyai_chat_messages_home');
  };

  return (
    <div className="App">
      {/* Helmet wrapper for site preview */}
      <Helmet>
        <title>SEVY - Sex Education for Vietnamese Youth</title>
        <meta
          name="description"
          content="SEVY is a nonprofit providing free sex education for Vietnamese youth."
        />
        <meta property="og:title" content="SEVY - Sex Education for Vietnamese Youth" />
        <meta
          property="og:description"
          content="SEVY is a nonprofit providing free sex education for Vietnamese youth."
        />
        <meta
          property="og:image"
          content="https://sevyai.com/static/media/SEVY%20Logo.bf6ce28e.png"
        />
        <meta property="og:url" content="https://sevyai.com" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Navigation Bar */}
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
            <button onClick={() => navigate('/sevyai')} className="sevy-ai-button">
              {t('sevy_ai')}
            </button>
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

      {/* SEVY Introduction Section */}
      <img src={cover} alt="SEVY Cover" className="introduction-image" />
      <div className="introduction-section">
        <h2>{t('sevy_introduction_content_line_1')}</h2>
        <p>{t('sevy_introduction_content_line_2')}</p>
        <p>{t('sevy_introduction_content_line_3')}</p>
      </div>

      {/* SEVY's Vision Section */}
      <div className="vision-section">
        <h2>{t('sevy_vision')}</h2>
        <p>{t('sevy_vision_content_line_1')}</p>
        <p>{t('sevy_vision_content_line_2')}</p>
      </div>

      {/* SEVY by The Numbers Section */}
      <div className="numbers-section">
        <h2>{t('sevy_numbers')}</h2>
      </div>
      <div className="all-number-cards">
        <div className="number-card">
          <h3>{t('sevy_educators')}</h3>
          <p>{sevyEducatorsNumber}</p>
        </div>
        <div className="number-card">
          <h3>{t('SEVY_AI_answers')}</h3>
          <p>{sevyAiAnswers}</p>
        </div>
        <div className="number-card">
          <h3>{t('students_taught')}</h3>
          <p>{studentsTaught}</p>
        </div>
      </div>

      {/* Chat Box */}
      {!isChatMinimized && (
        <div className="chat-box">
          <div className="header">
            SEVY AI
            <div>
              <button
                className="clear-chat-btn"
                onClick={clearChat}
                title={t('clear_chat') || 'Clear chat'}
                style={{ marginRight: '8px', fontSize: '12px' }}
              >
                🗑️
              </button>
              <button className="minimize-btn" onClick={() => setIsChatMinimized(true)}>
                &#x2212;
              </button>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="home-sevyai-disclaimer">
            <p>{t('SEVY_AI_disclaimer')}</p>
          </div>

          {/* Loading Bar */}
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
                // Only send on Enter if IME composition has ended
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
      )}

      {/* Minimized Button */}
      {isChatMinimized && (
        <button className="open-chat-btn" onClick={() => setIsChatMinimized(false)}>
          {t('open_chat')}
        </button>
      )}

      {/* Contact Us Section */}
      <div className="contact-section">
        <h2>{t('contact_us')}</h2>
        <p>
          Email: <a href="mailto:director@sevyai.com">director@sevyai.com</a>
        </p>
        <p>
          Facebook:{' '}
          <a
            href="https://facebook.com/sevynonprofit"
            target="_blank"
            rel="noopener noreferrer"
          >
            facebook.com/sevynonprofit
          </a>
        </p>
      </div>
    </div>
  );
}

export default App;