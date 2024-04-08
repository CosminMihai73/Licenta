import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InterpretationPage.css';
import {Link} from "react-router-dom";

const InterpretationPage = () => {
  const [interpretationResult, setInterpretationResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/interpretare_si_atribuie_profesie');
        setInterpretationResult(response.data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="interpretation-container">
      <div className="interpretation-content">
        <h1>Rezultat</h1>
        {interpretationResult && (
          <div className="result-info">
            <p>Tip Dominant: {interpretationResult.tip_dominant}</p>
            <p>Tip Secundar: {interpretationResult.tip_secundar}</p>
            <p>Combinatie Finala: {interpretationResult.combinatie_finala}</p>
            <p>Profesie Atribuita: {interpretationResult.profesie_attribuita}</p>
          </div>
        )}
        </div>
            <div className="button-container">
                <Link to="/" className="link-button">Înapoi la Pagina Principală</Link>
            </div>
    </div>
  );
};

export default InterpretationPage;
