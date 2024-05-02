import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    MDBContainer,
    MDBRow,
    MDBCol,
    MDBCard,
    MDBCardBody,
    MDBCardTitle,
    MDBCardText,
    MDBTypography,
    MDBSpinner,
    MDBBtn
} from 'mdb-react-ui-kit';

const InterpretareProfesie = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/interpretare_si_atribuie_profesie');
                setData(response.data.rezultat_interpretare);
            } catch (error) {
                setError(error);
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <MDBContainer>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                    <h1 style={{ textAlign: 'center', margin: '0' }}>Rezultatul chestionarului Holland</h1>
                </div>
                <div>
                    <MDBBtn rounded className='mx-2' color='secondary' onClick={() => window.location.href = '/'}>
                        Homepage
                    </MDBBtn>

                </div>
            </div>
            {loading && (
                <MDBRow className="mt-5">
                    <MDBCol>
                        <MDBSpinner role="status" color="primary" />
                    </MDBCol>
                </MDBRow>
            )}
            {error && (
                <MDBRow className="mt-5">
                    <MDBCol>
                        <MDBTypography tag="div" className="text-danger">
                            O eroare a apărut: {error.message}
                        </MDBTypography>
                    </MDBCol>
                </MDBRow>
            )}
            {data && (
                <MDBRow className="mt-5">
                    <MDBCol>
                        <MDBCard className="mb-4">
                            <MDBCardBody>
                                <MDBCardTitle>{data.tip_dominant}</MDBCardTitle>
                                <MDBCardText>Descrierea categoriei: {data.descriere_dominanta}</MDBCardText>
                                <MDBCardText>Meserii recomandate: {data.meserii_dominante.join(', ')}</MDBCardText>
                                <MDBCardText>
                                    Facultăți recomandate:<br />
                                    {data.facultati_dominante.map((facultate, index) => (
                                        <MDBTypography key={index} tag="div">
                                            <a href={facultate.link}>{facultate.nume}</a>
                                            <br />
                                        </MDBTypography>
                                    ))}
                                </MDBCardText>
                            </MDBCardBody>
                        </MDBCard>

                        <MDBCard className="mb-4">
                            <MDBCardBody>
                                <MDBCardTitle>{data.tip_secundar_1}</MDBCardTitle>
                                <MDBCardText>Descrierea categoriei: {data.descriere_secundar_1}</MDBCardText>
                                <MDBCardText>Meserii recomandate: {data.meserii_secundare_1.join(', ')}</MDBCardText>
                                <MDBCardText>
                                    Facultăți recomandate:<br />
                                    {data.facultati_secundare_1.map((facultate, index) => (
                                        <MDBTypography key={index} tag="div">
                                            <a href={facultate.link}>{facultate.nume}</a>
                                            <br />
                                        </MDBTypography>
                                    ))}
                                </MDBCardText>
                            </MDBCardBody>
                        </MDBCard>

                        <MDBCard className="mb-4">
                            <MDBCardBody>
                                <MDBCardTitle>{data.tip_secundar_2}</MDBCardTitle>
                                <MDBCardText>Descrierea categoriei: {data.descriere_secundar_2}</MDBCardText>
                                <MDBCardText>Meserii recomandate: {data.meserii_secundare_2.join(', ')}</MDBCardText>
                                <MDBCardText>
                                    Facultăți recomandate:<br />
                                    {data.facultati_secundare_2.map((facultate, index) => (
                                        <MDBTypography key={index} tag="div">
                                            <a href={facultate.link}>{facultate.nume}</a>
                                            <br />
                                        </MDBTypography>
                                    ))}
                                </MDBCardText>
                            </MDBCardBody>
                        </MDBCard>

                        <MDBTypography tag="div" className="mt-4">
                            Pentru întrebări legate de chestionar, vă rugăm să ne contactați la adresa: <a href="mailto:consiliere@unitbv.ro">consiliere@unitbv.ro</a>
                        </MDBTypography>
                    </MDBCol>
                </MDBRow>
            )}
        </MDBContainer>
    );
};

export default InterpretareProfesie;
