import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import axios from 'axios';

const HomePage = () => {
  const handleStartButtonClick = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/combina_fisiere_json');
      console.log('Combina Fisiere JSON:', response.data);
    } catch (error) {
      console.error('Error fetching combina_fisiere_json:', error);
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Chestionar Holland</h1>
        {/* Call handleStartButtonClick when the button is clicked */}
        <Link to="/intrebari" onClick={handleStartButtonClick}>
          <button className="start-button">Start</button>
        </Link>
        <div className="button-container">
          <Link to="/informatii">
            <button className="info-button">Informații</button>
          </Link>
           <Link to="/IntrebariTest">
            <button className="info-button">Teste</button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
