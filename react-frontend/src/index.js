import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import MobileApp from './MobileApp';
import SevyAI from './SevyAI';
import SevyAIMobile from './SevyAIMobile'; // Import the new SevyAIMobile component
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
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);