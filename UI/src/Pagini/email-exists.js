import React, { useState, useEffect } from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBSpinner, MDBTypography, MDBBtn, MDBCard, MDBCardBody, MDBCardTitle, MDBCardText } from 'mdb-react-ui-kit';
import axios from 'axios';


const EmailExistsPage = () => {
    const [interpretationResult, setInterpretationResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

 
    const getEmailFromURL = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('email');
    };


    const fetchInterpretation = async (email) => {
        try {
            const response = await axios.get(`http://localhost:8000/interpretare_si_atribuie_profesie_BD?email=${email}`);
            setInterpretationResult(response.data.rezultat_interpretare);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const email = getEmailFromURL();
        if (email) {
            fetchInterpretation(email);
        } else {
            setError(new Error('Emailul nu a fost găsit în URL.'));
            setLoading(false);
        }
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
            {loading && <MDBSpinner className="mt-5" />}
            {error && (
                <MDBRow className="mt-5">
                    <MDBCol>
                        <MDBTypography tag="div" className="text-danger">
                            O eroare a apărut: {error.message}
                        </MDBTypography>
                    </MDBCol>
                </MDBRow>
            )}
            {interpretationResult && (
                <MDBRow className="mt-5">
                    <MDBCol>
                        <MDBCard className="mb-4">
                            <MDBCardBody>
                                <MDBCardTitle>{interpretationResult.tip_dominant}</MDBCardTitle>
                                <MDBCardText>Descrierea categoriei: {interpretationResult.descriere_dominanta}</MDBCardText>
                                <MDBCardText>Meserii recomandate: {interpretationResult.meserii_dominante.join(', ')}</MDBCardText>
                                <MDBCardText>Facultăți recomandate:</MDBCardText>
                                {interpretationResult.facultati_dominante.map((facultate, index) => (
                                    <MDBTypography key={index} tag="div">
                                        <a href={facultate.link}>{facultate.nume}</a>
                                    </MDBTypography>
                                ))}
                            </MDBCardBody>
                        </MDBCard>
                     
                        <MDBCard className="mb-4">
                            <MDBCardBody>
                                <MDBCardTitle>{interpretationResult.tip_secundar_1}</MDBCardTitle>
                                <MDBCardText>Descrierea categoriei: {interpretationResult.descriere_secundar_1}</MDBCardText>
                                <MDBCardText>Meserii recomandate: {interpretationResult.meserii_secundare_1.join(', ')}</MDBCardText>
                                <MDBCardText>Facultăți recomandate:</MDBCardText>
                                {interpretationResult.facultati_secundare_1.map((facultate, index) => (
                                    <MDBTypography key={index} tag="div">
                                        <a href={facultate.link}>{facultate.nume}</a>
                                    </MDBTypography>
                                ))}
                            </MDBCardBody>
                        </MDBCard>
                        <MDBCard className="mb-4">
                            <MDBCardBody>
                                <MDBCardTitle>{interpretationResult.tip_secundar_2}</MDBCardTitle>
                                <MDBCardText>Descrierea categoriei: {interpretationResult.descriere_secundar_2}</MDBCardText>
                                <MDBCardText>Meserii recomandate: {interpretationResult.meserii_secundare_2.join(', ')}</MDBCardText>
                                <MDBCardText>Facultăți recomandate:</MDBCardText>
                                {interpretationResult.facultati_secundare_2.map((facultate, index) => (
                                    <MDBTypography key={index} tag="div">
                                        <a href={facultate.link}>{facultate.nume}</a>
                                    </MDBTypography>
                                ))}
                            </MDBCardBody>
                        </MDBCard>
                        <MDBTypography tag="div">
                            Pentru întrebări legate de chestionar, vă rugăm să ne contactați la adresa: <a href="mailto:consiliere@unitbv.ro">consiliere@unitbv.ro</a>
                        </MDBTypography>
                    </MDBCol>
                </MDBRow>
            )}
        </MDBContainer>
    );
};

export default EmailExistsPage;
