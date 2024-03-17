import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './Pagini/HomePage';
import QuestionsPage from './Pagini/QuestionsPage';
import InterpretationPage from './Pagini/InterpretationPage';
import ErrorPage from './Pagini/ErrorPage';
import Informatii from "./Pagini/Informatii";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/intrebari" element={<QuestionsPage />} />
          <Route path="/rezultat" element={<InterpretationPage />} />
          <Route path="/informatii" element={<Informatii />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;