import React, { useEffect, useState } from 'react';
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
  const [messages, setMessages] = useState([]);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(true);
  const [sevyEducatorsNumber, setSevyEducatorsNumber] = useState(null);
  const [sevyAiAnswers, setSevyAiAnswers] = useState(null);
  const [studentsTaught, setStudentsTaught] = useState(null);

  useEffect(() => {
    // Set the document title
    document.title = "SEVY";

    // Cleanup function to reset title on unmount if needed
    return () => {
      document.title = "SEVY";
    };
  }, []);

  const fetchSevyEducatorsNumber = async () => {
    try {
      const response = await fetch('/get_sevy_educators_number', {
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
      console.log('Sevy Educators Number:', data.sevy_educators_number);
      return data.sevy_educators_number;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const fetchSevyAiAnswers = async () => {
    try {
      const response = await fetch('/get_sevy_ai_answers', {
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
      console.log('Sevy AI Answers:', data.sevy_ai_answers);
      return data.sevy_ai_answers;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const fetchStudentsTaught = async () => {
    try {
      const response = await fetch('/get_students_taught', {
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
      console.log('Students Taught Number:', data.students_taught);
      return data.students_taught;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
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

    fetchSevyEducatorsNumber().then((number) => {
      setSevyEducatorsNumber(number);
    });

    fetchSevyAiAnswers().then((number) => {
      setSevyAiAnswers(number);
    });

    fetchStudentsTaught().then((number) => {
      setStudentsTaught(number);
    });

    const timer = setTimeout(() => {
      setIsChatMinimized(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const newMessage = { user: t('you'), text: input };
    setMessages([...messages, newMessage]);
    setInput('');
    setLoading(true); // Set loading to true when message is sent

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
      setLoading(false); // Set loading to false when response is received
    }
  };

  return (
    <div className="App">

      {/* Helmet wwrapper for site preview */}
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
        <meta property="og:image" content="https://sevyai.com/static/media/SEVY%20Logo.bf6ce28e.png" />
        <meta property="og:url" content="https://sevyai.com" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-left">
          <a href="/" onClick={(e) => { e.preventDefault(); window.location.replace('/'); }}>
            <img src={logo} alt="SEVY Logo" className="navbar-logo" />
          </a>
          <div className="navbar-links">
            <button onClick={() => navigate('/')}>{t('home')}</button>
            <button onClick={() => navigate('/sevyai')} className="sevy-ai-button">{t('sevy_ai')}</button>
            <button onClick={() => navigate('/our-team')}>{t('our_team')}</button>
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
      {!isChatMinimized && (  // Show chat box only when it's not minimized
        <div className="chat-box">
          <div className="header">
            SEVY AI
            <button className="minimize-btn" onClick={() => setIsChatMinimized(true)}>
              &#x2212; {/* Unicode for minus sign representing minimize */}
            </button>
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
                  background: 'linear-gradient(90deg, #2196F3, #FF4081)', // Vivid blue and pink gradient
                }
              }}
            />
          )}

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.user}`}>
                <strong>{msg.user}: </strong>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ))}
          </div>

          <div className="chat-input">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onInput={(e) => {
                e.target.style.height = 'auto';  // Reset height
                e.target.style.height = e.target.scrollHeight + 'px';  // Set new height based on scroll height
              }}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={t('type_your_message')}
              rows="1"  // Start with 1 row
              style={{ resize: 'none' }}  // Disable manual resizing
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
        <p>Email: <a href="mailto:director@sevyai.com">director@sevyai.com</a></p>
        <p>Facebook: <a href="https://facebook.com/sevynonprofit" target="_blank" rel="noopener noreferrer">facebook.com/sevynonprofit</a></p>
      </div>
    </div>
  );
}

export default App;