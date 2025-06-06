import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './MobileApp.css';
import { useTranslation } from 'react-i18next';
import logo from './images/SEVY Logo.png';
import cover from './images/SEVY and Students Cropped 1.jpg';

function MobileApp() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';

    const [sevyEducatorsNumber, setSevyEducatorsNumber] = useState(null);
    const [sevyAiAnswers, setSevyAiAnswers] = useState(null);
    const [studentsTaught, setStudentsTaught] = useState(null);

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
        // Set the document title
        document.title = "SEVY";

        // Fetch data for mobile site
        const fetchData = async () => {
            try {
                const sevyEducatorsResponse = await fetch(`${API_BASE_URL}/get_sevy_educators_number`, { method: 'POST' });
                const sevyEducatorsData = await sevyEducatorsResponse.json();
                setSevyEducatorsNumber(sevyEducatorsData.sevy_educators_number);

                const sevyAiAnswersResponse = await fetch(`${API_BASE_URL}/get_sevy_ai_answers`, { method: 'POST' });
                const sevyAiAnswersData = await sevyAiAnswersResponse.json();
                setSevyAiAnswers(sevyAiAnswersData.sevy_ai_answers);

                const studentsTaughtResponse = await fetch(`${API_BASE_URL}/get_students_taught`, { method: 'POST' });
                const studentsTaughtData = await studentsTaughtResponse.json();
                setStudentsTaught(studentsTaughtData.students_taught);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        // Fetch data on component mount
        fetchData();
    }, [API_BASE_URL]);

    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('preferredLanguage', lang); // Store selected language in local storage
    };

    return (

        <div className="mobile-wrapper">

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
                <meta property="og:image" content="https://sevyai.com/static/media/SEVY%20Logo.bf6ce28e.png" />
                <meta property="og:url" content="https://sevyai.com" />
                <meta property="og:type" content="website" />
            </Helmet>

            <nav className="navbar">
                <div className="navbar-left">
                    <a href="/" onClick={(e) => { e.preventDefault(); window.location.replace('/'); }}>
                        <img src={logo} alt="SEVY Logo" className="navbar-logo" />
                    </a>
                    <div className="navbar-links">
                        <button onClick={() => navigate('/sevyai')} className="sevy-ai-button">{t('sevy_ai')}</button>
                        <button onClick={() => navigate('/our-team')}>{t('our_team')}</button>
                    </div>
                </div>
                <div className="navbar-right">
                    <button onClick={() => handleLanguageChange('en')}>English</button>
                    <button onClick={() => handleLanguageChange('vi')}>Tiếng Việt</button>
                </div>
            </nav>

            <button onClick={() => navigate('/sevyai-mobile')} className="chat-with-sevy-ai-mobile-button">{t('open_chat')}</button>

            <img src={cover} alt="SEVY Cover" className="introduction-image" />
            <div className="introduction-section">
                <h2>{t('sevy_introduction_content_line_1')}</h2>
                <p>{t('sevy_introduction_content_line_2')}</p>
                <p>{t('sevy_introduction_content_line_3')}</p>
            </div>

            <div className="vision-section">
                <h2>{t('sevy_vision')}</h2>
                <p>{t('sevy_vision_content_line_1')}</p>
                <p>{t('sevy_vision_content_line_2')}</p>
            </div>

            <div className="numbers-section">
                <h2>{t('sevy_numbers')}</h2>
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
            </div>

            {/* Contact Us Section */}
            <div className="contact-section">
                <h2>{t('contact_us')}</h2>
                <p>Email: <a href="mailto:director@sevyai.com">director@sevyai.com</a></p>
                <p>Facebook: <a href="https://facebook.com/sevynonprofit" target="_blank" rel="noopener noreferrer">facebook.com/sevynonprofit</a></p>
            </div>
        </div>
    );
}

export default MobileApp;