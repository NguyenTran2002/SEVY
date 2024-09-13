import React, { useEffect, useState } from 'react';
import './MobileApp.css';
import { useTranslation } from 'react-i18next';
import logo from './images/SEVY Logo.png';
import cover from './images/SEVY Cover.jpg';

function MobileApp() {
    const { t, i18n } = useTranslation();

    const [sevyEducatorsNumber, setSevyEducatorsNumber] = useState(null);
    const [sevyAiAnswers, setSevyAiAnswers] = useState(null);
    const [studentsTaught, setStudentsTaught] = useState(null);

    useEffect(() => {
        // Fetch data for mobile site
        const fetchData = async () => {
            const sevyEducatorsResponse = await fetch('/get_sevy_educators_number', { method: 'POST' });
            const sevyEducatorsData = await sevyEducatorsResponse.json();
            setSevyEducatorsNumber(sevyEducatorsData.sevy_educators_number);

            const sevyAiAnswersResponse = await fetch('/get_sevy_ai_answers', { method: 'POST' });
            const sevyAiAnswersData = await sevyAiAnswersResponse.json();
            setSevyAiAnswers(sevyAiAnswersData.sevy_ai_answers);

            const studentsTaughtResponse = await fetch('/get_students_taught', { method: 'POST' });
            const studentsTaughtData = await studentsTaughtResponse.json();
            setStudentsTaught(studentsTaughtData.students_taught);
        };
        fetchData();
    }, []);

    return (
        <div className="mobile-wrapper"> {/* Add the wrapper here */}
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
                    <button onClick={() => i18n.changeLanguage('en')}>English</button>
                    <button onClick={() => i18n.changeLanguage('vi')}>Tiếng Việt</button>
                </div>
            </nav>

            <img src={cover} alt="SEVY Cover" className="introduction-image" />
            <div className="introduction-section">
                <p>{t('sevy_introduction_content_line_1')}</p>
                <p>{t('sevy_introduction_content_line_2')}</p>
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
        </div>
    );
}

export default MobileApp;