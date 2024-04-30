import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmailExistsPage = () => {
    const [interpretationResult, setInterpretationResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Funcția pentru a obține adresa de e-mail din URL
    const getEmailFromURL = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('email');
    };

    // Funcția pentru a face solicitarea HTTP și a obține datele
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

    if (loading) {
        return <div>Se încarcă rezultatele...</div>;
    }

    if (error) {
        return <div>O eroare a apărut: {error.message}</div>;
    }

    if (!interpretationResult) {
        return <div>Rezultatele nu sunt disponibile.</div>;
    }

    const data = interpretationResult;

    return (
        <div>
            {data ? (
                <div>
                    <h2>{data.tip_dominant}</h2>
                    <p>Descrierea categoriei: {data.descriere_dominanta}</p>
                    <p>Meserii recomandate: {data.meserii_dominante.join(', ')}</p>
                    <p>Facultăți recomandate:</p>
                    {data.facultati_dominante.map((facultate, index) => (
                        <div key={index}>
                            <a href={facultate.link}>{facultate.nume}</a>
                            <br />
                        </div>
                    ))}
                    
                    <h2>{data.tip_secundar_1}</h2>
                    <p>Descrierea categoriei: {data.descriere_secundar_1}</p>
                    <p>Meserii recomandate: {data.meserii_secundare_1.join(', ')}</p>
                    <p>Facultăți recomandate:</p>
                    {data.facultati_secundare_1.map((facultate, index) => (
                        <div key={index}>
                            <a href={facultate.link}>{facultate.nume}</a>
                            <br />
                        </div>
                    ))}
                    
                    <h2>{data.tip_secundar_2}</h2>
                    <p>Descrierea categoriei: {data.descriere_secundar_2}</p>
                    <p>Meserii recomandate: {data.meserii_secundare_2.join(', ')}</p>
                    <p>Facultăți recomandate:</p>
                    {data.facultati_secundare_2.map((facultate, index) => (
                        <div key={index}>
                            <a href={facultate.link}>{facultate.nume}</a>
                            <br />
                        </div>
                    ))}
                    <p>Pentru întrebări legate de chestionar, vă rugăm să ne contactați la adresa: <a href="mailto:consiliere@unitbv.ro">consiliere@unitbv.ro</a></p>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default EmailExistsPage;
