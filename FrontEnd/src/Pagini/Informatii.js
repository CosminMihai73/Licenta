import React from 'react';
import { Link } from 'react-router-dom';
import './Informatii.css';

const Informatii = () => {
  return (
    <div className="informatii-container">
      <div className="content">
        <h1>Regulile Chestionarului Holland</h1>
        <p>
          Chestionarul Holland este un instrument utilizat pentru evaluarea tipurilor de personalitate și identificarea potențialelor cariere potrivite pentru fiecare tip.
        </p>
        <h2>Reguli de utilizare:</h2>
        <ol>
          <li>
            Trebuie să introduci răspunsuri între 0 și 6. 0 însemnând deloc satisfăcător, iar 6 foarte satisfăcător.
          </li>
          <li>
            Completează chestionarul cu sinceritate. Răspunde în funcție de preferințele și experiențele tale reale.
          </li>
          <li>
            Nu există răspunsuri corecte sau greșite. Alege varianta care se potrivește cel mai bine cu ceea ce simți că te caracterizează.
          </li>
          <li>
            Evită să răspunzi în funcție de așteptările sau influențele altora. Gândește-te la tine însuți și la ceea ce te motivează cu adevărat.
          </li>
          <li>
            Dacă întâmpini dificultăți în alegerea unui răspuns, alege varianta care se potrivește cel mai bine comportamentului tău general.
          </li>
          <li>
            Fii deschis la schimbare și la explorarea diferitelor domenii și cariere. Chestionarul poate oferi perspective interesante și noi.
          </li>
        </ol>
      </div>
      <div className="button-container">
        <Link to="/" className="link-button">Înapoi la Pagina Principală</Link>
      </div>
    </div>
  );
};

export default Informatii;
