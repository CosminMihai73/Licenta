import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Tooltip, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as BarTooltip, Rectangle } from 'recharts';
import { Link } from "react-router-dom";
import './Grafice.css';

const Grafice = () => {
    const [procente, setProcente] = useState([]);
    const [sumaPunctaje, setSumaPunctaje] = useState([]);
    const [modificari, setModificari] = useState([]);

    useEffect(() => {
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

    const getCategoryColor = categorie => {
        const colors = {
            "artistic": '#8884d8',
            "conventional": '#82ca9d',
            "realist": '#ffc658',
            "intreprinzator": '#ff7300',
            "investigativ": '#00C49F',
            "social": '#FFBB28'
        };
        return colors[categorie];
    };

    const capitalizeFirstLetter = (word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    };

    return (
        <div className="grafice-container">
            <div className="grafice-section">
                <h2>Categoriile exprimate în Procente</h2>
                <PieChart width={500} height={500}>
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
                        outerRadius={200}
                        label={({percent}) => `${(percent * 100).toFixed(2)}%`}
                        labelLine={false}
                    >
                        {Object.entries(procente).map(([categorie], index) => (
                            <Cell key={`cell-${index}`} fill={getCategoryColor(categorie)}/>
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`}/>
                </PieChart>
            </div>
            <div className="grafice-section">
                <h2>Suma Categoriilor</h2>
                <BarChart width={800} height={500} data={sumaPunctaje}>
                    <XAxis dataKey="categorie" interval={0} angle={-45} textAnchor="end" height={120}/>
                    <YAxis/>
                    <Bar dataKey="suma" fill={(data) => data.fill}>
                        {sumaPunctaje.map((entry, index) => (
                            <Rectangle key={`rectangle-${index}`} x={entry.categorie} y={0} width={50} height={400}
                                       fill="#fff" stroke="#8884d8" strokeWidth={1}/>
                        ))}
                    </Bar>
                    <BarTooltip/>
                </BarChart>
            </div>
            <div className="grafice-section table-container">
                <h2>Cele mai noi raspunsuri</h2>
                <table>
                    <thead>
                    <tr>
                        <th>Data</th>
                        <th>Id Candidat</th>
                        <th>Email</th>
                        <th>Punctaje Categorii</th>
                    </tr>
                    </thead>
                    <tbody>
                    {modificari.map((modificare, index) => (
                        <tr key={index}>
                            <td>{modificare.Data}</td>
                            <td>{modificare.IdCandidat}</td>
                            <td>{modificare.Email}</td>
                            <td>{modificare["Punctaje Categorii"]}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className="button-container">
                <Link to="/" className="link-button">Înapoi la Pagina Principală</Link>
            </div>
            <div className="button-container">
                <Link to="/CRaspunsuri" className="link-button">Raspunsuri Candidati</Link>
            </div>
            <div className="button-container">
                <Link to="/intrebariHolland" className="link-button">Intrebari</Link>
            </div>
        </div>
    );
};

export default Grafice;
