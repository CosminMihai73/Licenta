import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardHeader, MDBTable, MDBTableHead, MDBTableBody, MDBBtn } from 'mdb-react-ui-kit';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, Rectangle } from 'recharts';
import { Link } from 'react-router-dom';

const Grafice = () => {
    // Variabile de stare pentru datele grafice și tabel
    const [procente, setProcente] = useState([]);
    const [sumaPunctaje, setSumaPunctaje] = useState([]);
    const [modificari, setModificari] = useState([]);

    // Efect pentru a prelua datele necesare de la API-uri
    useEffect(() => {
        // Obținere date pentru grafice și tabel
        axios.get('http://127.0.0.1:8000/procente')
            .then(response => {
                setProcente(response.data.procente);
            })
            .catch(error => {
                console.error('Eroare la preluarea procentelor:', error);
            });

        axios.get('http://127.0.0.1:8000/sumapunctaje')
            .then(response => {
                const data = response.data.suma_punctaje;
                const formattedData = Object.keys(data).map(categorie => ({
                    categorie: capitalizeFirstLetter(categorie),
                    suma: data[categorie],
                    fill: getCategoryColor(categorie)
                }));
                setSumaPunctaje(formattedData);
            })
            .catch(error => {
                console.error('Error fetching suma punctaje:', error);
            });

        axios.get('http://127.0.0.1:8000/ultimele_modificari')
            .then(response => {
                setModificari(response.data.ultimele_modificari);
            })
            .catch(error => {
                console.error('Error fetching modificari:', error);
            });
    }, []);

    // Funcții auxiliare
    const getCategoryColor = (categorie) => {
        const colors = {
            "artistic": '#8884d8',
            "convențional": '#82ca9d',
            "realist": '#ffc658',
            "întreprinzător": '#ff7300',
            "investigativ": '#00C49F',
            "social": '#FFBB28'
        };
        return colors[categorie];
    };

    const capitalizeFirstLetter = (word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    };

    // Structura componentelor grafice
    return (
        <MDBContainer className="mt-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                    <h1 style={{ textAlign: 'center', margin: '0' }}>Panoul de control al chestionarului Holland</h1>
                </div>
                <div>
                    <MDBBtn rounded className='mx-2' color='secondary' onClick={() => window.location.href = '/'}>
                        Homepage
                    </MDBBtn>


                </div>
            </div>
            {/* Secțiune de grafice */}
            <MDBRow>
                <MDBCol md="5">
                    {/* Card pentru graficul pie */}
                    <MDBCard>
                        <MDBCardHeader>Categoriile exprimate în Procente</MDBCardHeader>
                        <MDBCardBody>
                            <PieChart width={500} height={400}>
                                <Pie
                                    data={Object.entries(procente).map(([categorie, valoare]) => ({
                                        name: capitalizeFirstLetter(categorie),
                                        value: parseFloat(valoare),
                                        fill: getCategoryColor(categorie)
                                    }))}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={150}
                                    label={({ percent }) => `${(percent * 100).toFixed(2)}%`}
                                    labelLine={false}
                                >
                                    {Object.entries(procente).map(([categorie], index) => (
                                        <Cell key={`cell-${index}`} fill={getCategoryColor(categorie)} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value}%`} />
                            </PieChart>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
                <MDBCol md="7">
                    {/* Card pentru graficul bar */}
                    <MDBCard>
                        <MDBCardHeader>Suma Categoriilor</MDBCardHeader>
                        <MDBCardBody>
                            <BarChart width={635} height={400} data={sumaPunctaje}>
                                <XAxis dataKey="categorie" />
                                <YAxis />
                                <Bar dataKey="suma" fill={(data) => data.fill}>
                                    {sumaPunctaje.map((entry, index) => (
                                        <Rectangle key={`rectangle-${index}`} x={entry.categorie} y={0} width={50} height={400}
                                            fill="#fff" stroke="#8884d8" strokeWidth={1} />
                                    ))}
                                </Bar>
                                <Tooltip />
                            </BarChart>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>

            {/* Secțiune pentru tabel */}
            <MDBRow className="mt-4">
                <MDBCol>
                    <MDBCard>
                        <MDBCardHeader>Cele mai noi răspunsuri</MDBCardHeader>
                        <MDBCardBody>
                            <MDBTable>
                                <MDBTableHead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Id Candidat</th>
                                        <th>Email</th>
                                        <th>Punctaje Categorii</th>
                                    </tr>
                                </MDBTableHead>
                                <MDBTableBody>
                                    {modificari.map((modificare, index) => (
                                        <tr key={index}>
                                            <td>{modificare.Data}</td>
                                            <td>{modificare.IdCandidat}</td>
                                            <td>{modificare.Email}</td>
                                            <td>{modificare["Punctaje Categorii"]}</td>
                                        </tr>
                                    ))}
                                </MDBTableBody>
                            </MDBTable>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>

            {/* Butoane pentru navigare */}
            <MDBRow className="mt-4">
                <MDBCol>
                    <Link to="/CRaspunsuri" class="btn btn-primary btn-rounded">Răspunsuri Candidați</Link>
                    <Link to="/intrebariHolland" class="btn btn-primary btn-rounded">Întrebări chestionar Holland</Link>
                    <Link to="/paginareH" class="btn btn-primary btn-rounded">Paginare chestionar Holland</Link>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    );
};

export default Grafice;
