import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import SubmitPage from './pages/SubmitPage';
import TrendingPage from './pages/TrendingPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/trending" element={<TrendingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
