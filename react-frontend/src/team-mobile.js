import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import team from './images/SEVY Team.jpg';
import core_team from './images/Core Team.jpg';
import './team-mobile.css'; // Import mobile CSS
import logo from './images/SEVY Logo.png';

const TeamMobile = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="mobile-wrapper">
            <nav className="navbar">
                <div className="navbar-left">
                    <a href="/" onClick={(e) => { e.preventDefault(); window.location.replace('/'); }}>
                        <img src={logo} alt="SEVY Logo" className="navbar-logo" />
                    </a>
                    <div className="navbar-links">
                        <button onClick={() => navigate('/')}>{t('home')}</button>
                        <button onClick={() => navigate('/sevyai')}>{t('sevy_ai')}</button>
                        <button>{t('our_team')}</button> {/* Already on Our Team page */}
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

            <div className="content">
                <h1>{t('our_team')}</h1>
                <div className="team-section">
                    <img src={team} alt={t('team_photo_caption')} className="team-photo" />
                    <p className="caption">{t('team_photo_caption')}</p>
                </div>
                <div className="team-section">
                    <img src={core_team} alt={t('core_team_photo_caption')} className="team-photo" />
                    <h2 className="caption">{t('core_team_photo_caption')}</h2>
                    <div className="team-mobile-captions">
                        <p>{t('core_team_member_1')}</p>
                        <p>{t('core_team_member_2')}</p>
                        <p>{t('core_team_member_3')}</p>
                        <p>{t('core_team_member_4')}</p>
                        <p>{t('core_team_member_5')}</p>
                        <p>{t('core_team_member_6')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamMobile;
