import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './Pagini/HomePage';
import QuestionsPage from './Pagini/QuestionsPage';
import InterpretationPage from './Pagini/InterpretationPage';
import ErrorPage from './Pagini/ErrorPage';
import Grafice from "./Pagini/Grafice";
import CandidatiCuRaspunsuri from "./Pagini/CandidatiCuRaspunsuri";
import IntrebarileHolland from "./Pagini/IntrebarileHolland";
import PaginareHolland from './Pagini/PaginareHolland'
import AdaugaIntrebare from './Pagini/AdaugaIntrebare'
import EmailExists from './Pagini/email-exists'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/intrebari" element={<QuestionsPage />} />
          <Route path="/rezultat" element={<InterpretationPage />} />
          <Route path="*" element={<ErrorPage />} />
          <Route path="/grafice" element={<Grafice/>}/>
          <Route path="/CRaspunsuri" element={<CandidatiCuRaspunsuri/>}/>
          <Route path="/IntrebariHolland" element={<IntrebarileHolland/>}/>
          <Route path="/paginareH" element={<PaginareHolland/>}/>    
          <Route path="/AdaugaIntrebare" element={<AdaugaIntrebare/>}/>      
          <Route path="/Email-exists" element={<EmailExists/>}/>            
        </Routes>
      </div>
    </Router>
  );
}

export default App;