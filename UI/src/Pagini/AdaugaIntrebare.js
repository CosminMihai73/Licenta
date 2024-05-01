import React, { useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { MDBInput, MDBBtn, MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody } from 'mdb-react-ui-kit';
import axios from "axios";

const AdaugaIntrebare = () => {
    const navigate = useNavigate();
    const inputRef = useRef();
    const [intrebareNoua, setIntrebareNoua] = useState({
        text: "",
        text_poza: "",
        timer: 0,
        categorie: "",
        variante_raspuns: {},
    });
    const [nextVariantIndex, setNextVariantIndex] = useState(0);

    const handleCategorieChange = (e) => {
        setIntrebareNoua({ ...intrebareNoua, categorie: e.target.value });
    };

    const handleAddNewVariant = () => {
        const updatedVariants = { ...intrebareNoua.variante_raspuns };
        updatedVariants[nextVariantIndex] = { voturi: 0, raspuns_poza: "" };
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
                categorie: intrebareNoua.categorie,
                variante_raspuns: intrebareNoua.variante_raspuns,
            };

            console.log("Date trimise:", requestBody);
            await axios.post("http://127.0.0.1:8000/adauga_intrebare/", requestBody);
            alert("Întrebare adăugată cu succes!");
            navigate('/intrebariHolland');
        } catch (error) {
            console.error("Eroare la adăugarea întrebării:", error);
        }
    };

    const handleRenameKey = (oldKey, newKey) => {
        if (oldKey !== newKey && newKey.trim() !== "") {
            setIntrebareNoua((prevState) => {
                const updatedVariants = { ...prevState.variante_raspuns };
                updatedVariants[newKey] = updatedVariants[oldKey];
                delete updatedVariants[oldKey];
                return { ...prevState, variante_raspuns: updatedVariants };
            });

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
        <MDBContainer className="mt-5">
            <MDBCard>
                <MDBCardBody>
                    <h2 className="mb-4 text-center">Adăugare Întrebare</h2>
                    <MDBRow>
                        <MDBCol md="6" className="mb-4">
                            <MDBInput
                                label="Text întrebare:"
                                id="typeText"
                                type="text"
                                value={intrebareNoua.text}
                                onChange={(e) => setIntrebareNoua({ ...intrebareNoua, text: e.target.value })}
                            />
                            <label>Timer (secunde):</label>
                            <MDBInput
                                id="typeNumber"
                                type="number"
                                className="mb-4"
                                value={intrebareNoua.timer}
                                onChange={(e) => setIntrebareNoua({ ...intrebareNoua, timer: parseInt(e.target.value) || 0 })}
                            />

                            <div className="mb-3">
                                <label htmlFor="categorie" className="form-label">Categorie</label>
                                <select
                                    id="categorie"
                                    className="form-select mb-4"
                                    value={intrebareNoua.categorie}
                                    onChange={handleCategorieChange}
                                >
                                    <option value="" disabled>Selectează categorie</option>
                                    <option value="artistic">Artistic</option>
                                    <option value="convențional">Convențional</option>
                                    <option value="întreprinzător">Întreprinzător</option>
                                    <option value="investigativ">Investigativ</option>
                                    <option value="realist">Realist</option>
                                    <option value="social">Social</option>
                                </select>
                            </div>
                        </MDBCol>
                        <MDBCol md="6" className="mb-4">
                            {Object.entries(intrebareNoua.variante_raspuns).map(([key, responseData]) => (
                                <div key={key} className="mb-3">
                                    <label>Textul răspunsului</label>
                                    <MDBInput
                                        ref={inputRef}
                                        type="text"
                                        value={key}
                                        onChange={(e) => {
                                            const newKey = e.target.value;
                                            handleRenameKey(key, newKey);
                                        }}
                                        
                                        className="mb-2"
                                    />
                                    <label>Valoarea răspunsului</label>
                                    <MDBInput
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
                                        className="mb-2"
                                    />

                                    <MDBBtn rounded color="danger" onClick={() => handleRemoveNewVariant(key)} className="mt-2">
                                        Elimină
                                    </MDBBtn>
                                </div>
                            ))}

                            <MDBBtn rounded color="success" onClick={handleAddNewVariant} className="mt-3">
                                Adaugă variantă de răspuns
                            </MDBBtn>
                        </MDBCol>
                    </MDBRow>

                    <div className="d-flex justify-content-center mt-4">
                        <MDBBtn rounded color="primary" onClick={adaugaIntrebare}>
                            Adaugă întrebare
                        </MDBBtn>
                    </div>
                </MDBCardBody>
            </MDBCard>
        </MDBContainer>
    );
};

export default AdaugaIntrebare;
