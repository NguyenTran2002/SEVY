import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import team from './images/SEVY Team.jpg';
import core_team from './images/Core Team.jpg';
import './team.css';
import logo from './images/SEVY Logo.png';

const Team = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Dynamically set the document title based on the language
        document.title = t('our_team');

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
    }, [location.pathname, navigate, t]);

    return (
        <div className="team-page">

            {/* Helmet wrapper for site preview */}
            <Helmet>
                <title>SEVY's Team</title>
                <meta
                    name="description"
                    content="SEVY's Team."
                />
                <meta property="og:title" content="SEVY's Team" />
                <meta
                    property="og:description"
                    content="SEVY's Team"
                />
                <meta property="og:image" content="https://sevyai.com/static/media/SEVY%20Logo.bf6ce28e.png" />
                <meta property="og:url" content="https://sevyai.com//our-team" />
                <meta property="og:type" content="website" />
            </Helmet>

            <nav className="navbar">
                <div className="navbar-left">
                    <a href="/" onClick={(e) => { e.preventDefault(); window.location.replace('/'); }}>
                        <img src={logo} alt="SEVY Logo" className="navbar-logo" />
                    </a>
                    <div className="navbar-links">
                        <button onClick={() => navigate('/')}>{t('home')}</button>
                        <button onClick={() => navigate('/sevyai')} className="sevy-ai-button">{t('sevy_ai')}</button>
                        {/* <button onClick={() => navigate('/our-team')}>{t('our_team')}</button> */}
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
                    <h2 className="caption">{t('team_photo_caption')}</h2>
                </div>
                <div className="team-section">
                    <img src={core_team} alt={t('core_team_photo_caption')} className="team-photo" />
                    <h2 className="caption">{t('core_team_photo_caption')}</h2>
                    <div className="team-captions">
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

export default Team;