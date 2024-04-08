import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HollandPage = () => {
  const [data, setData] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('http://127.0.0.1:8000/afisare_pagini_holland');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, []);

  const handleAdaugaRegula = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/adauga_regula_pagina');
      setData(response.data);
    } catch (error) {
      console.error('Error adding rule:', error);
    }
  };

  const handleIncarcaIntrebari = async (numeRegula, intrebariInput) => {
    try {
      const intrebari = intrebariInput.split(',').map(item => parseInt(item.trim()));
      const response = await axios.put(`http://127.0.0.1:8000/incarca_intrebari_pagina/${numeRegula}`, { numere_intrebari: intrebari });
      setData(response.data);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const handleStergeRegula = async (numeRegula) => {
    try {
      const response = await axios.delete(`http://127.0.0.1:8000/sterge_regula_pagina/${numeRegula}`);
      setData(response.data);
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  return (
    <div>
      <h1>Page for Holland</h1>
      {Object.keys(data).map((pagina, index) => (
        <div key={index}>
          <h2>{pagina}</h2>
          <ul>
            {data[pagina].intrebari_pe_pagina.map((intrebare, i) => (
              <li key={i}>{intrebare}</li>
            ))}
          </ul>
          <InputRegulaPagina numeRegula={pagina} handleIncarcaIntrebari={handleIncarcaIntrebari} />
          <button onClick={() => handleStergeRegula(pagina)}>Șterge regula pentru {pagina}</button>
        </div>
      ))}
      <button onClick={handleAdaugaRegula}>Adaugă regulă de pagină</button>
    </div>
  );
};

const InputRegulaPagina = ({ numeRegula, handleIncarcaIntrebari }) => {
  const [intrebariInput, setIntrebariInput] = useState('');

  const handleIncarcaClick = () => {
    handleIncarcaIntrebari(numeRegula, intrebariInput);
    setIntrebariInput('');
  };

  return (
    <div>
      <input
        type="text"
        value={intrebariInput}
        onChange={(e) => setIntrebariInput(e.target.value)}
        placeholder="Introdu întrebările separate prin virgulă"
      />
      <button onClick={handleIncarcaClick}>Încarcă întrebările pentru {numeRegula}</button>
    </div>
  );
};

export default HollandPage;
