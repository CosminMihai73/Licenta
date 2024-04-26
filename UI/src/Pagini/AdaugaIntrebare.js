import React, { useState} from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import "./AdaugaIntrebare.css";


const AdaugaIntrebare = () => {
    const [categorie, setCategorie] = useState("")
    const navigate = useNavigate();
    const inputRef = React.useRef();
    const [intrebareNoua, setIntrebareNoua] = useState({
        text: "",
        text_poza: "",
        timer: 0,
        categorie: "",
        variante_raspuns: {},
    });
    const [nextVariantIndex, setNextVariantIndex] = useState(0);

    const handleCategorieChange = (e) => {
        setCategorie(e.target.value);
    };

    const handleAddNewVariant = () => {
        const updatedVariants = { ...intrebareNoua.variante_raspuns };
        const newIndex = nextVariantIndex;
        updatedVariants[newIndex] = { voturi: 0, raspuns_poza: "" };
        setNextVariantIndex(nextVariantIndex + 1);
        setIntrebareNoua({ ...intrebareNoua, variante_raspuns: updatedVariants });
    };

    const handleRemoveNewVariant = (index) => {
        const updatedVariants = { ...intrebareNoua.variante_raspuns };
        delete updatedVariants[index];
        setIntrebareNoua({ ...intrebareNoua, variante_raspuns: updatedVariants });
    };

    const adaugaIntrebare = async () => {
        try {
            const requestBody = {
                id: 0,
                text: intrebareNoua.text,
                text_poza: "",
                timer: intrebareNoua.timer,
                categorie: categorie,
                variante_raspuns: intrebareNoua.variante_raspuns,
            };

            console.log("Date trimise:", requestBody);
            await axios.post("http://127.0.0.1:8000/adauga_intrebare/", requestBody);
            alert("Întrebare adăugată cu succes!");

            navigate('/intrebariHolland')

        } catch (error) {
            console.error("Eroare la adăugarea întrebării:", error);
        }
    };

    const handleRenameKey = (oldKey, newKey) => {
        // Asigură-te că cheia este diferită și că noua cheie nu este goală
        if (oldKey !== newKey && newKey.trim() !== "") {
            setIntrebareNoua((prevState) => {
                // Creează o copie a stării curente
                const updatedVariants = { ...prevState.variante_raspuns };
    
                // Copiază valoarea de la vechea cheie la noua cheie
                updatedVariants[newKey] = updatedVariants[oldKey];
                // Șterge vechea cheie
                delete updatedVariants[oldKey];
    
                // Returnează starea actualizată
                return {
                    ...prevState,
                    variante_raspuns: updatedVariants,
                };
            });
    
            // Setează focusul pe input după actualizarea stării
            setTimeout(() => {
                if (inputRef.current) {
                    try {
                        inputRef.current.focus();
                    } catch (error) {
                        console.error("Error focusing input:", error);
                    }
                }
            }, 0);
        }
    };
    

    return (
        <div className="add-container">
            <h2>Adăugare Întrebare</h2>
            <div className="input-container">
                <label>Text întrebare:</label>
                <input
                    type="text"
                    value={intrebareNoua.text}
                    onChange={(e) => setIntrebareNoua({ ...intrebareNoua, text: e.target.value })}
                />
                <label>Timer (secunde):</label>
                <input
                    type="number"
                    value={intrebareNoua.timer}
                    onChange={(e) => setIntrebareNoua({ ...intrebareNoua, timer: parseInt(e.target.value) || 0 })}
                />
                <label>Categorie</label>
                <select value={categorie} onChange={handleCategorieChange}>
                    <option value="artistic">Artistic</option>
                    <option value="convențional">Conventional</option>
                    <option value="întreprinzător">Întreprinzător</option>
                    <option value="investigativ">Investigative</option>
                    <option value="realist">Realist</option>
                    <option value="social">Social</option>
                </select>
                {Object.entries(intrebareNoua.variante_raspuns).map(([key, responseData]) => (
                    <div key={key}>
                        <label>Textul răspunsului:</label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={key}
                            onChange={(e) => {
                                const newKey = e.target.value;
                                handleRenameKey(key, newKey);
                            }}
                        />

                        <label>Valoarea răspunsului:</label>
                        <input
                            type="number"
                            value={responseData.voturi}
                            onChange={(e) => {
                                const newVotes = parseInt(e.target.value) || 0;

                                setIntrebareNoua((prevState) => ({
                                    ...prevState,
                                    variante_raspuns: {
                                        ...prevState.variante_raspuns,
                                        [key]: {
                                            ...responseData,
                                            voturi: newVotes,
                                        },
                                    },
                                }));
                            }}
                        />

                        <button
                            className="adaugareinput-btn"
                            onClick={() => handleRemoveNewVariant(key)}
                        >
                            Elimină
                        </button>
                    </div>
                ))}


                <button className="adaugareinput-btn" onClick={handleAddNewVariant}>Adaugă variantă de răspuns</button>
                <button className="add-btn" onClick={adaugaIntrebare}>Adaugă întrebare</button>
            </div>
        </div>
    );
};
export default AdaugaIntrebare;
