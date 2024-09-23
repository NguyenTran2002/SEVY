// team.js
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Correct import for i18n
import team from './images/SEVY Team.jpg';
import core_team from './images/Core Team.jpg';
import './team.css';
import logo from './images/SEVY Logo.png';

const Team = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleOrientationChange = (e) => {
            const currentPath = location.pathname;

            if (e.matches) {
                // If in portrait mode and not already on /team-mobile, redirect to /team-mobile
                if (!currentPath.includes("/team-mobile")) {
                    navigate('/team-mobile');
                }
            } else {
                // If in landscape mode and on /team-mobile, redirect back to /team
                if (currentPath.includes("/team-mobile")) {
                    navigate('/team');
                }
            }
        };

        const portraitQuery = window.matchMedia("(orientation: portrait)");
        const landscapeQuery = window.matchMedia("(orientation: landscape)");

        // Attach listeners for both portrait and landscape modes
        portraitQuery.addListener(handleOrientationChange);
        landscapeQuery.addListener(handleOrientationChange);

        // Check initial orientation
        if (portraitQuery.matches && !location.pathname.includes("/team-mobile")) {
            navigate('/team-mobile');
        } else if (landscapeQuery.matches && location.pathname.includes("/team-mobile")) {
            navigate('/team');
        }

        // Cleanup listeners on component unmount
        return () => {
            portraitQuery.removeListener(handleOrientationChange);
            landscapeQuery.removeListener(handleOrientationChange);
        };
    }, [location.pathname, navigate]);

    return (
        <div className="team-page">
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
                    <p className="caption">{t('core_team_photo_caption')}</p>
                </div>
            </div>
        </div>
    );
};

export default Team;