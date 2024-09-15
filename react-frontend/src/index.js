import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import MobileApp from './MobileApp'; // Import the mobile version
import './i18n';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} /> {/* Desktop version */}
        <Route path="/mobile" element={<MobileApp />} /> {/* Mobile version */}
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);