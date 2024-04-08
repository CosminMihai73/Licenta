import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './Pagini/HomePage';
import QuestionsPage from './Pagini/QuestionsPage';
import InterpretationPage from './Pagini/InterpretationPage';
import ErrorPage from './Pagini/ErrorPage';
import Informatii from "./Pagini/Informatii";
import IntrebariTest from "./Pagini/IntrebariTest";
import Grafice from "./Pagini/Grafice";
import CandidatiCuRaspunsuri from "./Pagini/CandidatiCuRaspunsuri";
import IntrebarileHolland from "./Pagini/IntrebarileHolland";
import Poze from './Pagini/Poze';
import PaginareHolland from './Pagini/PaginareHolland'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/IntrebariTest" element={<IntrebariTest />} />
          <Route path="/intrebari" element={<QuestionsPage />} />
          <Route path="/rezultat" element={<InterpretationPage />} />
          <Route path="/informatii" element={<Informatii />} />
          <Route path="*" element={<ErrorPage />} />
          <Route path="/grafice" element={<Grafice/>}/>
          <Route path="/CRaspunsuri" element={<CandidatiCuRaspunsuri/>}/>
          <Route path="/IntrebariHolland" element={<IntrebarileHolland/>}/>
          <Route path="/pozeHolland" element={<Poze/>}/>
          <Route path="/paginareH" element={<PaginareHolland/>}/>          
        </Routes>
      </div>
    </Router>
  );
}

export default App;