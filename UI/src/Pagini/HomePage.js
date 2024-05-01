import React from 'react';
import { Link } from 'react-router-dom';


const HomePage = () => {


  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Chestionar Holland</h1>
        {/* Call handleStartButtonClick when the button is clicked */}
        <Link to="/intrebari" >
          <button className="start-button">Start</button>
        </Link>
        <div className="button-container">
          <Link to="/informatii">
            <button className="info-button">Informații</button>
          </Link>
           <Link to="/IntrebariTest">
            <button className="info-button">Teste</button>
          </Link>
          <Link to="/Grafice">
            <button className="info-button">Rapoarte</button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
