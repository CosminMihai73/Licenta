import React, { useState, useEffect } from 'react';
import axios from 'axios';


const InterpretareProfesie = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/interpretare_si_atribuie_profesie');
        setData(response.data.rezultat_interpretare);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {data ? (
        <div>
          <h2>{data.tip_dominant}</h2>
          <p>Descrierea categoriei: {data.descriere_dominanta}</p>
          <p>Meserii recomandate: {data.meserii_dominante.join(', ')}</p>
          <p>
            Facultați recomandate:<br />
            {data.facultati_dominante.map((facultate, index) => (
              <div key={index}>
                <a href={facultate.link}>{facultate.nume}</a>
                <br />
              </div>
            ))}
          </p>
          <h2>{data.tip_secundar_1}</h2>
          <p>Descrierea categoriei: {data.descriere_secundar_1}</p>
          <p>Meserii recomandate: {data.meserii_secundare_1.join(', ')}</p>
          <p>
            Facultați recomandate:<br />
            {data.facultati_secundare_1.map((facultate, index) => (
              <div key={index}>
                <a href={facultate.link}>{facultate.nume}</a>
                <br />
              </div>
            ))}
          </p>
          <h2>{data.tip_secundar_2}</h2>
          <p>Descrierea categoriei: {data.descriere_secundar_2}</p>
          <p>Meserii recomandate: {data.meserii_secundare_2.join(', ')}</p>
          <p>
            Facultați recomandate: <br />
            {data.facultati_secundare_2.map((facultate, index) => (
              <div key={index}>
                <a href={facultate.link}>{facultate.nume}</a>
                <br />
              </div>
            ))}
          </p>
          <p>Pentru întrebări legate de chestionar, vă rugăm să ne contactați la adresa: <a href="mailto:consiliere@unitbv.ro">consiliere@unitbv.ro</a></p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default InterpretareProfesie;
