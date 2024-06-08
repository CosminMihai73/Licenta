import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  MDBBtn,
  MDBCard,
  MDBContainer,
  MDBInput,
  MDBInputGroup,
  MDBCol,
  MDBRow,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
  MDBIcon,
  MDBCardBody,
  MDBFile,
  MDBListGroup,
  MDBListGroupItem,
} from "mdb-react-ui-kit";

const IntrebariHolland = () => {
  const [intrebari, setIntrebari] = useState([]);
  const [intrebareId, setIntrebareId] = useState("");
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updatedText, setUpdatedText] = useState("");
  const [updatedTimer, setUpdatedTimer] = useState(0);
  const [updatedCategorie, setUpdatedCategorie] = useState("");
  const [updatedVarianteRaspuns, setUpdatedVarianteRaspuns] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const inputRef = useRef();

  useEffect(() => {
    afiseazaIntrebari();
  }, []);

  const afiseazaIntrebari = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/citeste_intrebari/");
      setIntrebari(response.data);
    } catch (error) {
      console.error("Eroare la preluarea întrebărilor:", error);
    }
  };

  const cautaIntrebare = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/cauta_intrebare/${intrebareId}`);
      setIntrebari([response.data]);
    } catch (error) {
      console.error("Eroare la căutarea întrebării:", error);
      setIntrebari([]);
    }
  };

  const cautaIntrebariCategorie = async (categorie) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/cauta_intrebari/${categorie}`);
      setIntrebari(response.data);
    } catch (error) {
      console.error("Eroare la căutarea întrebărilor pe categorii:", error);
    }
  };

  const reseteazaInput = () => {
    setIntrebareId("");
    afiseazaIntrebari();
  };

  const stergeIntrebare = async (intrebareId) => {
    try {
      const confirmDelete = window.confirm("Ești sigur că vrei să ștergi această întrebare?");
      if (confirmDelete) {
        await axios.delete(`http://127.0.0.1:8000/sterge_intrebare/${intrebareId}`);
        afiseazaIntrebari();
      } else {
        console.log("Ștergere anulată.");
      }
    } catch (error) {
      console.error("Eroare la ștergerea întrebării:", error);
    }
  };

  const toggleUpdateForm = (intrebare) => {
    setShowUpdateForm(!showUpdateForm);
    setIntrebareId(intrebare.id);
    setUpdatedText(intrebare.text);
    setUpdatedTimer(intrebare.timer);
    setUpdatedCategorie(intrebare.categorie);
    setUpdatedVarianteRaspuns(intrebare.variante_raspuns);
  };

  const actualizeazaIntrebare = async (e) => {
    e.preventDefault();

    let textPoza = "";

    if (selectedFile) {
      textPoza = await uploadIntrebare(intrebareId, selectedFile);
      if (textPoza === null) {
        console.error("Eroare la încărcarea imaginii. Se anulează actualizarea.");
        return;
      }
    }

    for (const [variantKey, variant] of Object.entries(updatedVarianteRaspuns)) {
      if (variant.file) {
        const imagePath = await uploadResponseImage(intrebareId, variant.voturi, variant.file);
        if (imagePath !== null) {
          updatedVarianteRaspuns[variantKey].raspuns_poza = imagePath;
        } else {
          console.error(`Eroare la încărcarea imaginii pentru varianta ${variantKey}`);
        }
      }
    }

    const updatedIntrebare = {
      id: intrebareId,
      text: updatedText,
      text_poza: textPoza,
      timer: updatedTimer,
      categorie: updatedCategorie,
      variante_raspuns: updatedVarianteRaspuns,
    };

    try {
      const response = await axios.put(`http://127.0.0.1:8000/actualizeaza_intrebare/${intrebareId}`, updatedIntrebare);

      if (response.status === 200) {
        afiseazaIntrebari();
        setShowUpdateForm(false);
      } else {
        console.error("Actualizarea întrebării a eșuat:", response.data);
      }
    } catch (error) {
      console.error("Eroare la actualizarea întrebării:", error);
    }
  };

  const uploadIntrebare = async (questionId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`http://127.0.0.1:8000/uploadIntrebare/${questionId}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data && response.data.filename) {
        const imageUrl = `poze/${response.data.filename}`;
        return imageUrl;
      } else {
        console.error("Error: `filename` not found in the response.");
        return null;
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const stergeImagine = async (questionId) => {
    try {
      const response = await axios.delete(`http://127.0.0.1:8000/delete/image/${questionId}/`);

      if (response.data.message) {
        const actualizatIntrebari = intrebari.map((intrebare) => {
          if (intrebare.id === questionId) {
            intrebare.text_poza = "";
          }
          return intrebare;
        });
        setIntrebari(actualizatIntrebari);
      } else {
        console.error(response.data.error);
      }
    } catch (error) {
      console.error("Eroare la ștergerea imaginii:", error);
    }
  };

  const uploadResponseImage = async (questionId, voturi, file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/upload/${questionId}/varianta/${voturi}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data && response.data.filename) {
        const imageUrl = `poze/${response.data.filename}`;
        return imageUrl;
      } else {
        console.error("Eroare: `filename` nu a fost găsit în răspuns.");
        return null;
      }
    } catch (error) {
      console.error("Eroare la încărcarea imaginii:", error);
      return null;
    }
  };

  const deleteResponseImage = async (questionId, voturi) => {
    try {
      const response = await axios.delete(`http://127.0.0.1:8000/delete/image/${questionId}/variant/${voturi}/`);

      if (response.data.message) {
        console.log(response.data.message);
      } else {
        console.error(response.data.error);
      }
    } catch (error) {
      console.error("Eroare la ștergerea imaginii:", error);
    }
  };

  const adaugareVariantaRaspuns = () => {
    const key = Date.now().toString();
    setUpdatedVarianteRaspuns({
      ...updatedVarianteRaspuns,
      [key]: {
        raspuns_text: "",
        voturi: 0,
        raspuns_poza: "",
      },
    });
  };

  const stergereVariantaRaspuns = (key) => {
    const updatedVarianteRaspunsCopy = { ...updatedVarianteRaspuns };
    delete updatedVarianteRaspunsCopy[key];
    setUpdatedVarianteRaspuns(updatedVarianteRaspunsCopy);
  };

  const handleVariantKeyChange = (oldKey, newKey) => {
    if (newKey !== oldKey && !updatedVarianteRaspuns.hasOwnProperty(newKey)) {
      const updatedVarianteRaspunsCopy = { ...updatedVarianteRaspuns };
      updatedVarianteRaspunsCopy[newKey] = { ...updatedVarianteRaspunsCopy[oldKey] };
      delete updatedVarianteRaspunsCopy[oldKey];
      setUpdatedVarianteRaspuns(updatedVarianteRaspunsCopy);

      // Set a timeout to focus the input after updating the state
      setTimeout(() => {
        if (inputRef.current) {
          try {
            inputRef.current.focus();
          } catch (error) {
            console.error("Error focusing input:", error);
          }
        }
      }, 0);
    } else {
      console.warn("Cheia deja există sau nu a fost schimbată. Alege o cheie unică.");
    }
  };


  return (
    <MDBContainer className="pt-5">
      <MDBCard className="mb-4">
        <MDBCardBody className="d-flex justify-content-between align-items-center">
          <h1>Întrebările Chestionarului Holland</h1>
          <div>
            <MDBBtn className="mx-2" color="secondary" onClick={() => (window.location.href = "/")}>
              Homepage
            </MDBBtn>
            <MDBBtn className="mx-2" color="secondary" onClick={() => (window.location.href = "/Grafice")}>
              Înapoi
            </MDBBtn>
          </div>
        </MDBCardBody>
      </MDBCard>

      <MDBCard className="mb-4">
        <MDBCardBody>
          <MDBRow className="mb-3">
            <MDBCol>
              <MDBInputGroup>
                <MDBInput
                  label="Introdu ID-ul întrebării"
                  id="form1"
                  type="text"
                  value={intrebareId}
                  onChange={(e) => setIntrebareId(e.target.value)}
                />
                {intrebareId && (
                  <MDBBtn className="primary" onClick={reseteazaInput}>
                    x
                  </MDBBtn>
                )}
                <MDBBtn className="primary" onClick={cautaIntrebare} style={{ marginLeft: "5px" }}>
                  <MDBIcon fas icon="search" />
                </MDBBtn>
              </MDBInputGroup>
            </MDBCol>
            <MDBCol md="auto">
              <MDBBtn onClick={() => (window.location.href = "/AdaugaIntrebare")}>Adaugă întrebare nouă</MDBBtn>
            </MDBCol>
            <MDBCol md="auto">
              <MDBDropdown>
                <MDBDropdownToggle className="search-btn" onClick={afiseazaIntrebari}>
                  Întrebări
                </MDBDropdownToggle>
                <MDBDropdownMenu>
                  <MDBDropdownItem onClick={() => cautaIntrebariCategorie("artistic")}>Artistic</MDBDropdownItem>
                  <MDBDropdownItem onClick={() => cautaIntrebariCategorie("convențional")}>Conventional</MDBDropdownItem>
                  <MDBDropdownItem onClick={() => cautaIntrebariCategorie("întreprinzător")}>Întreprinzător</MDBDropdownItem>
                  <MDBDropdownItem onClick={() => cautaIntrebariCategorie("investigativ")}>Investigativ</MDBDropdownItem>
                  <MDBDropdownItem onClick={() => cautaIntrebariCategorie("realist")}>Realist</MDBDropdownItem>
                  <MDBDropdownItem onClick={() => cautaIntrebariCategorie("social")}>Social</MDBDropdownItem>
                </MDBDropdownMenu>
              </MDBDropdown>
            </MDBCol>
          </MDBRow>
        </MDBCardBody>
      </MDBCard>

      {intrebari.map((intrebare) => (
        <MDBCard className="mb-4" key={intrebare.id}>
          <MDBCardBody>
            <div className="d-flex justify-content-end mb-2">
              <MDBBtn color="danger" size="sm" onClick={() => stergeIntrebare(intrebare.id)}>
                Șterge întrebare
              </MDBBtn>
              <MDBBtn color="primary" size="sm" onClick={() => toggleUpdateForm(intrebare)} className="ms-2">
                {showUpdateForm && intrebareId === intrebare.id ? "Ascunde formularul de actualizare" : "Actualizează întrebare"}
              </MDBBtn>
            </div>

            {showUpdateForm && intrebareId === intrebare.id && (
              <div className="update-form">
                <MDBInput
                  label="Text întrebare"
                  type="text"
                  value={updatedText}
                  onChange={(e) => setUpdatedText(e.target.value)}
                  className="mb-3"
                />
                Timer în secunde
                <MDBInput
                  type="number"
                  value={updatedTimer}
                  onChange={(e) => setUpdatedTimer(parseInt(e.target.value))}
                  className="mb-3"
                />
                <label>Categorie</label>
                <select value={updatedCategorie} onChange={(e) => setUpdatedCategorie(e.target.value)}>
                  <option value="artistic">Artistic</option>
                  <option value="convențional">Conventional</option>
                  <option value="întreprinzător">Întreprinzător</option>
                  <option value="investigativ">Investigativ</option>
                  <option value="realist">Realist</option>
                  <option value="social">Social</option>
                </select>
                <br />

                {!intrebare.text_poza && (
                  <MDBFile
                    label="Încărcați o imagine"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="mb-3"
                  />
                )}

                {intrebare.text_poza && (
                  <div>
                    <p>Text Poză: {intrebare.text_poza}</p>
                    <MDBBtn color="danger" size="sm" onClick={() => stergeImagine(intrebare.id)}>
                      Șterge imagine
                    </MDBBtn>
                  </div>
                )}

                {Object.keys(updatedVarianteRaspuns).map((variantKey) => (
                  <div key={variantKey}>
                    <br />
                    <MDBInput
                      ref={inputRef}
                      label="Text variantă răspuns"
                      type="text"
                      value={variantKey}
                      onChange={(e) => handleVariantKeyChange(variantKey, e.target.value)}
                      className="mb-3"
                    />
                    <MDBInput
                      label="Voturi"
                      type="number"
                      value={updatedVarianteRaspuns[variantKey].voturi}
                      onChange={(e) =>
                        setUpdatedVarianteRaspuns({
                          ...updatedVarianteRaspuns,
                          [variantKey]: {
                            ...updatedVarianteRaspuns[variantKey],
                            voturi: parseInt(e.target.value),
                          },
                        })
                      }
                      className="mb-3"
                    />
                    {!updatedVarianteRaspuns[variantKey].raspuns_poza && (
                      <MDBFile
                        label="Încărcați o imagine pentru varianta de răspuns"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setUpdatedVarianteRaspuns({
                            ...updatedVarianteRaspuns,
                            [variantKey]: {
                              ...updatedVarianteRaspuns[variantKey],
                              file: file,
                            },
                          });
                        }}
                        className="mb-3"
                      />
                    )}
                    <MDBBtn color="danger" size="sm" onClick={() => stergereVariantaRaspuns(variantKey)} className="mb-2">
                      Șterge varianta de răspuns
                    </MDBBtn>
                    <br />

                    {updatedVarianteRaspuns[variantKey].raspuns_poza && (
                      <div>
                        <p>Poză: {updatedVarianteRaspuns[variantKey].raspuns_poza}</p>
                        <MDBBtn
                          color="danger"
                          size="sm"
                          onClick={() => deleteResponseImage(intrebareId, updatedVarianteRaspuns[variantKey].voturi)}
                          className="mb-3"
                        >
                          Șterge imagine
                        </MDBBtn>
                      </div>
                    )}
                  </div>
                ))}
                <MDBBtn color="primary" size="sm" onClick={adaugareVariantaRaspuns} className="mb-3">
                  Adaugă variantă răspuns
                </MDBBtn>
                <MDBBtn color="success" size="sm" onClick={actualizeazaIntrebare} className="mb-3">
                  Actualizează
                </MDBBtn>
              </div>
            )}

            {!showUpdateForm && (
              <>
                <p>ID: {intrebare.id}</p>
                <p>Text: {intrebare.text}</p>
                <p>Text Poză: {intrebare.text_poza}</p>
                <p>Timer: {intrebare.timer} secunde</p>
                <p>Categorie: {intrebare.categorie}</p>

                <MDBListGroup style={{ border: "none" }}>
                  {Object.keys(intrebare.variante_raspuns).map((variantKey) => (
                    <MDBListGroupItem key={variantKey} style={{ border: "none", textAlign: "left" }}>
                      <p>Variantă răspuns: {variantKey}</p>
                      <p>Voturi: {intrebare.variante_raspuns[variantKey].voturi}</p>
                      <p>Răspuns Poză: {intrebare.variante_raspuns[variantKey].raspuns_poza}</p>
                    </MDBListGroupItem>
                  ))}
                </MDBListGroup>
              </>
            )}
          </MDBCardBody>
        </MDBCard>
      ))}
    </MDBContainer>
  );
};

export default IntrebariHolland;
