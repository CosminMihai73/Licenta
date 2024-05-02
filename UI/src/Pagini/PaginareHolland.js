import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBInput,
  MDBListGroup,
  MDBListGroupItem,
  MDBIcon,
  MDBCol,
  MDBRow
} from 'mdb-react-ui-kit';

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
      updatedData[numeRegula].intrebari_pe_pagina = updatedData[numeRegula].intrebari_pe_pagina.filter(
        (intrebare) => intrebare !== numarIntrebare
      );
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
    <MDBContainer className="pagina-holland mt-4">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div>
          <h1 style={{ textAlign: 'center', margin: '0' }}>Paginarea chestionarului Holland</h1>
        </div>
        <div>
          <MDBBtn rounded className='mx-2' color='secondary' onClick={() => window.location.href = '/'}>
            Homepage
          </MDBBtn>
          <MDBBtn rounded className='mx-2' color='secondary' onClick={() => window.location.href = '/Grafice'}>
           Înapoi
          </MDBBtn>

        </div>
      </div>
      
      {/* Container pentru adăugarea unei reguli de pagină */}
      <MDBRow>
        <MDBCol md="6" className="mx-auto mb-4">
          <MDBCard>
            <MDBCardBody className="text-center">
              <h5>Adaugă Regulă Pagină</h5>
              <MDBBtn 
                color="primary" 
                onClick={adaugaRegulaPagina} 
                disabled={adaugareRegulaLoading} 
                style={{ marginTop: '10px', width: '100%' }}
              >
                <MDBIcon icon="plus" className="me-2" />
                Adaugă Regulă
              </MDBBtn>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>

      {error && <p className="text-danger text-center">{error}</p>}
      
      {paginiHolland && (
        <MDBRow>
          {Object.keys(paginiHolland).map((paginaKey, index) => (
            <MDBCol md="6" key={index}>
              <MDBCard className="mb-4">
                <MDBCardBody>
                  <MDBCardTitle>{numePersonalizatPagina(paginaKey)}</MDBCardTitle>
                  <MDBRow>
                    <MDBCol className="d-flex flex-wrap justify-content-center gap-2">
                      <MDBBtn color="success" onClick={() => setAdaugareIntrebareIndex(index)}>
                        Adaugă Întrebare
                      </MDBBtn>
                      <MDBBtn color="danger" onClick={() => stergeRegulaPagina(paginaKey)}>
                        Șterge Regulă
                      </MDBBtn>
                      <MDBBtn color="info" onClick={() => {
                        setModificareRegulaIndex(index);
                        setModificareIntrebariRegula(paginiHolland[paginaKey].intrebari_pe_pagina);
                      }}>
                        Modificare Întrebare
                      </MDBBtn>
                    </MDBCol>
                  </MDBRow>

                  <div className="intrebari-lista mt-3">
                    <p>Întrebările:</p>
                    <MDBListGroup>
                      {modificareRegulaIndex !== index && paginiHolland[paginaKey].intrebari_pe_pagina.map((intrebare, intrebareIndex) => (
                        <MDBListGroupItem key={intrebareIndex}>{intrebare}</MDBListGroupItem>
                      ))}
                    </MDBListGroup>
                  </div>
                  
                  {adaugareIntrebareIndex === index && (
                    <div className="adauga-intrebare mt-3">
                      <MDBInput
                        type="number"
                        value={intrebareNoua}
                        onChange={(e) => setIntrebareNoua(e.target.value)}
                        label="Întrebare Nouă"
                      />
                      <MDBRow>
                        <MDBCol>
                          <MDBBtn color="primary" onClick={() => adaugaIntrebarePagina(paginaKey)} disabled={adaugareIntrebareLoading}>
                            Adaugă
                          </MDBBtn>
                        </MDBCol>
                        <MDBCol>
                          <MDBBtn color="secondary" onClick={() => setAdaugareIntrebareIndex(null)}>
                            <MDBIcon icon="times" />
                          </MDBBtn>
                        </MDBCol>
                      </MDBRow>
                    </div>
                  )}

                  {modificareRegulaIndex === index && (
                    <div className="modifica-intrebare mt-3">
                      <MDBListGroup>
                        {modificareIntrebariRegula.map((intrebare, intrebareIndex) => (
                          <MDBListGroupItem key={intrebareIndex} className="d-flex align-items-center">
                            <MDBInput
                              type="number"
                              value={intrebare}
                              onChange={(e) => {
                                const updatedIntrebari = [...modificareIntrebariRegula];
                                updatedIntrebari[intrebareIndex] = e.target.value;
                                setModificareIntrebariRegula(updatedIntrebari);
                              }}
                              label={`Întrebare ${intrebareIndex + 1}`}
                            />
                            <MDBRow className="ms-auto">
                              <MDBCol>
                                <MDBBtn color="success" onClick={() => modificaIntrebarePagina(paginaKey, intrebareIndex, modificareIntrebariRegula[intrebareIndex])}>
                                  Salvează
                                </MDBBtn>
                              </MDBCol>
                              <MDBCol>
                                <MDBBtn color="secondary" onClick={() => setModificareRegulaIndex(null)}>
                                  <MDBIcon icon="times" />
                                </MDBBtn>
                              </MDBCol>
                              <MDBCol>
                                <MDBBtn color="danger" onClick={() => stergeIntrebarePagina(paginaKey, intrebare)}>
                                  Șterge Întrebare
                                </MDBBtn>
                              </MDBCol>
                            </MDBRow>
                          </MDBListGroupItem>
                        ))}
                      </MDBListGroup>
                    </div>
                  )}
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          ))}
        </MDBRow>
      )}
    </MDBContainer>
  );
};

export default PaginaHolland;