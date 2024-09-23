// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import MobileApp from './MobileApp';
import SevyAI from './SevyAI';
import SevyAIMobile from './SevyAIMobile';
import Team from './team';
import TeamMobile from './team-mobile'; // Import the mobile version of Team
import './i18n';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} /> {/* Desktop version */}
        <Route path="/mobile" element={<MobileApp />} /> {/* Mobile version */}
        <Route path="/sevyai" element={<SevyAI />} /> {/* SEVY AI full screen */}
        <Route path="/sevyai-mobile" element={<SevyAIMobile />} /> {/* SEVY AI mobile version */}
        <Route path="/our-team" element={<Team />} /> {/* Our Team page */}
        <Route path="/team-mobile" element={<TeamMobile />} /> {/* Mobile version of Our Team */}
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);