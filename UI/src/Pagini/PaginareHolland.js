import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./PaginareHolland.css"

const PaginaHolland = () => {
  const [paginiHolland, setPaginiHolland] = useState(null);
  const [error, setError] = useState(null);
  const [adaugareIntrebareIndex, setAdaugareIntrebareIndex] = useState(null);
  const [intrebareNoua, setIntrebareNoua] = useState('');
  const [adaugareIntrebareLoading, setAdaugareIntrebareLoading] = useState(false);
  const [adaugareRegulaLoading, setAdaugareRegulaLoading] = useState(false);
  const [modificareRegulaIndex, setModificareRegulaIndex] = useState(null); 
  const [modificareIntrebariRegula, setModificareIntrebariRegula] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/afisare_pagini_holland');
        setPaginiHolland(response.data);
      } catch (error) {
        setError('Nu s-a putut obține datele.');
      }
    };

    fetchData();
  }, []);

  const adaugaRegulaPagina = async () => {
    try {
      setAdaugareRegulaLoading(true);
      const response = await axios.post('http://127.0.0.1:8000/adauga_regula_pagina');
      setPaginiHolland(response.data);
    } catch (error) {
      setError('Nu s-a putut adăuga regula de pagină.');
    } finally {
      setAdaugareRegulaLoading(false);
    }
  };

  const adaugaIntrebarePagina = async (numeRegula) => {
    try {
      setAdaugareIntrebareLoading(true);
      await axios.put(`http://127.0.0.1:8000/incarca_intrebari_pagina/${numeRegula}?numar_intrebare=${intrebareNoua}`);
      const response = await axios.get('http://127.0.0.1:8000/afisare_pagini_holland');
      setPaginiHolland(response.data);
      setAdaugareIntrebareIndex(null);
      setIntrebareNoua('');
    } catch (error) {
      setError('Nu s-a putut adăuga întrebarea pentru pagină.');
    } finally {
      setAdaugareIntrebareLoading(false);
    }
  };

  const stergeRegulaPagina = async (numeRegula) => {
    const confirmDelete = window.confirm('Ești sigur că vrei să ștergi această regulă de pagină?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://127.0.0.1:8000/sterge_regula_pagina/${numeRegula}`);
        const updatedData = { ...paginiHolland };
        delete updatedData[numeRegula];
        setPaginiHolland(updatedData);
      } catch (error) {
        setError('Nu s-a putut șterge regula de pagină.');
      }
    }
  };

  const modificaIntrebarePagina = async (numeRegula, intrebareIndex, nouaValoareIntrebare) => {
    try {
      await axios.put(`http://127.0.0.1:8000/modifica_intrebare_pagina/${numeRegula}/${paginiHolland[numeRegula].intrebari_pe_pagina[intrebareIndex]}/${nouaValoareIntrebare}`);
      const updatedData = { ...paginiHolland };
      updatedData[numeRegula].intrebari_pe_pagina[intrebareIndex] = parseInt(nouaValoareIntrebare);
      setPaginiHolland(updatedData);
    } catch (error) {
      setError(' ');
    } finally {
      setModificareRegulaIndex(null); 
    }
  };

  const stergeIntrebarePagina = async (numeRegula, numarIntrebare) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/sterge_intrebare_pagina/${numeRegula}/${numarIntrebare}`);
      const updatedData = { ...paginiHolland };
      updatedData[numeRegula].intrebari_pe_pagina = updatedData[numeRegula].intrebari_pe_pagina.filter(intrebare => intrebare !== numarIntrebare);
      setPaginiHolland(updatedData);
    } catch (error) {
      setError('Nu s-a putut șterge întrebarea de pe pagină.');
    } finally {
      setModificareRegulaIndex(null);
    }
  };

  const numePersonalizatPagina = (cheie) => {
    return cheie.replace('reguli_pagina_', 'Pagina ');
  };

  return (
    <div className="pagina-holland">
      <button className="custom-button" onClick={() => window.location.href = '/'}>Homepage</button>
      <button className="custom-button" onClick={() => window.location.href = '/Grafice'}>Inapoi</button>
      <h1>Pagini Holland</h1>
      <button className="btn-adauga-regula" onClick={adaugaRegulaPagina} disabled={adaugareRegulaLoading}>Adaugă Regulă Pagină</button>
      {error && <p className="error-message">{error}</p>}
      {paginiHolland && (
        <ul className="lista-pagini">
          {Object.keys(paginiHolland).map((paginaKey, index) => (
            <li key={index} className="pagina-item">
              <h2>{numePersonalizatPagina(paginaKey)}</h2>
              <button className="btn-adauga-intrebare" onClick={() => setAdaugareIntrebareIndex(index)}>Adaugă Întrebare</button>
              <button className="btn-sterge-regula" onClick={() => stergeRegulaPagina(paginaKey)}>Șterge Regulă</button>
              <button className="btn-modifica-intrebare" onClick={() => {
                setModificareRegulaIndex(index);
                setModificareIntrebariRegula(paginiHolland[paginaKey].intrebari_pe_pagina);
              }}>Modificare întrebare</button>
              <div className="intrebari-lista">
                Intrebarile:
                <ul className="lista-intrebari">
                  {modificareRegulaIndex !== index && paginiHolland[paginaKey].intrebari_pe_pagina.map((intrebare, intrebareIndex) => (
                    <li key={intrebareIndex} className="intrebare-item">{intrebare}</li>
                  ))}
                </ul>
              </div>
              {adaugareIntrebareIndex === index && (
                <div className="adauga-intrebare">
                  <input type="number" value={intrebareNoua} onChange={e => setIntrebareNoua(e.target.value)} />
                  <button className="btn-adauga" onClick={() => adaugaIntrebarePagina(paginaKey)} disabled={adaugareIntrebareLoading}>Adaugă</button>
                  <button className="btn-close" onClick={() => setAdaugareIntrebareIndex(null)}>X</button>
                </div>
              )}
              {modificareRegulaIndex === index && (
                <div className="modifica-intrebare">
                  <ul className="lista-intrebari">
                    {modificareIntrebariRegula.map((intrebare, intrebareIndex) => (
                      <li key={intrebareIndex} className="intrebare-item">
                        <div className="intrebare-container">
                          <input type="number" value={intrebare} onChange={e => {
                            const updatedIntrebari = [...modificareIntrebariRegula];
                            updatedIntrebari[intrebareIndex] = e.target.value;
                            setModificareIntrebariRegula(updatedIntrebari);
                          }} />
                          <button className="btn-save" onClick={() => modificaIntrebarePagina(paginaKey, intrebareIndex, modificareIntrebariRegula[intrebareIndex])}>Salvează</button>
                          <button className="btn-close" onClick={() => setModificareRegulaIndex(null)}>X</button>
                        </div>
                        <button className="btn-sterge-intrebare" onClick={() => stergeIntrebarePagina(paginaKey, intrebare)}>Șterge Întrebare</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
export default PaginaHolland;
