import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  MDBBtn,
  MDBCard,
  MDBContainer,
  MDBInput,
  MDBInputGroup,
  MDBCol,
  MDBRow, MDBDropdown, MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem, MDBIcon, MDBCardBody, MDBFile, MDBListGroup, MDBListGroupItem
} from 'mdb-react-ui-kit';


const IntrebariHolland = () => {
  const [intrebari, setIntrebari] = useState([]);
  const [intrebareId, setIntrebareId] = useState("");
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updatedText, setUpdatedText] = useState("");
  const [updatedTimer, setUpdatedTimer] = useState(0);
  const [updatedCategorie, setUpdatedCategorie] = useState("");
  const [updatedVarianteRaspuns, setUpdatedVarianteRaspuns] = useState({});
  const [selectedFile, setSelectedFile] = useState(null); // Stare pentru a stoca fișierul selectat
  const inputRef = React.useRef();

  useEffect(() => {
    afiseazaIntrebari();
  }, []);

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

  const afiseazaIntrebari = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/citeste_intrebari/");
      setIntrebari(response.data);
    } catch (error) {
      console.error("Eroare la preluarea întrebărilor:", error);
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
    // Setăm valorile inițiale ale formularului cu valorile curente ale întrebării
    setUpdatedText(intrebare.text);
    setUpdatedTimer(intrebare.timer);
    setUpdatedCategorie(intrebare.categorie);
    setUpdatedVarianteRaspuns(intrebare.variante_raspuns);
  };

  const actualizeazaIntrebare = async (e) => {
    e.preventDefault();

    let textPoza = "";

    // Verifică dacă există un fișier selectat pentru încărcare
    if (selectedFile) {
      // Încarcă imaginea și obține calea acesteia
      textPoza = await uploadIntrebare(intrebareId, selectedFile);
      if (textPoza === null) {
        console.error("Eroare la încărcarea imaginii. Se anulează actualizarea.");
        return;
      }
    }

    // Parcurgeți fiecare variantă de răspuns din `updatedVarianteRaspuns`
    for (const [variantKey, variant] of Object.entries(updatedVarianteRaspuns)) {
      if (variant.file) {
        // Încărcați imaginea pentru varianta de răspuns
        const imagePath = await uploadResponseImage(intrebareId, variant.voturi, variant.file);
        if (imagePath !== null) {
          // Actualizează proprietatea `raspuns_poza` a variantei de răspuns
          updatedVarianteRaspuns[variantKey].raspuns_poza = imagePath;
        } else {
          console.error(`Eroare la încărcarea imaginii pentru varianta ${variantKey}`);
        }
      }
    }

    // Construiește obiectul întrebării actualizate
    const updatedIntrebare = {
      id: intrebareId,
      text: updatedText,
      text_poza: textPoza, // Include calea imaginii dacă este disponibilă
      timer: updatedTimer,
      categorie: updatedCategorie,
      variante_raspuns: updatedVarianteRaspuns,
    };

    try {
      // Trimite cererea PUT pentru a actualiza întrebarea
      const response = await axios.put(`http://127.0.0.1:8000/actualizeaza_intrebare/${intrebareId}`, updatedIntrebare);

      // Dacă actualizarea a avut succes, reîncarcă întrebările și ascunde formularul de actualizare
      if (response.status === 200) {
        afiseazaIntrebari(); // Reîncarcă lista de întrebări
        setShowUpdateForm(false); // Ascunde formularul de actualizare
      } else {
        console.error("Actualizarea întrebării a eșuat:", response.data);
      }
    } catch (error) {
      console.error("Eroare la actualizarea întrebării:", error);
    }
  };


  const uploadIntrebare = async (questionId, file) => {
    // Creează un obiect FormData și atașează fișierul
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Trimite o cerere POST pentru a încărca imaginea
      const response = await axios.post(`http://127.0.0.1:8000/uploadIntrebare/${questionId}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Verifică dacă `filename` este prezent în răspuns
      if (response.data && response.data.filename) {
        // Dacă backend-ul folosește un director prestabilit pentru imagini, creează calea completă
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
      // Trimite cererea HTTP DELETE la endpoint-ul serverului
      const response = await axios.delete(`http://127.0.0.1:8000/delete/image/${questionId}/`);

      if (response.data.message) {
        // Dacă ștergerea este reușită, actualizează starea întrebărilor
        const actualizatIntrebari = intrebari.map((intrebare) => {
          if (intrebare.id === questionId) {
            // Șterge referința imaginii
            intrebare.text_poza = "";
          }
          window.location.reload();

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
    // Creează un obiect FormData și atașează fișierul
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Trimite o cerere POST pentru a încărca imaginea pentru varianta de răspuns
      const response = await axios.post(
        `http://127.0.0.1:8000/upload/${questionId}/varianta/${voturi}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Verifică dacă `filename` este prezent în răspuns
      if (response.data && response.data.filename) {
        // Returnează calea completă a imaginii
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
      // Trimite cererea DELETE la endpoint-ul serverului
      const response = await axios.delete(`http://127.0.0.1:8000/delete/image/${questionId}/variant/${voturi}/`);

      if (response.data.message) {
        // Imaginea a fost ștearsă cu succes, actualizați starea sau afișați un mesaj de succes
        console.log(response.data.message);


        window.location.reload();

      } else {
        // Eroare în răspunsul serverului
        console.error(response.data.error);
      }
    } catch (error) {
      console.error("Eroare la ștergerea imaginii:", error);
    }
  };

  const adaugareVariantaRaspuns = () => {
    const key = Date.now().toString(); // Creează o cheie unică pentru varianta nouă
    // Adaugă noua variantă de răspuns în starea `updatedVarianteRaspuns`
    setUpdatedVarianteRaspuns({
      ...updatedVarianteRaspuns,
      [key]: {
        raspuns_text: '',
        voturi: 0,
        raspuns_poza: ''
      },
    });
  };

  // Funcția pentru a șterge o variantă de răspuns
  const stergereVariantaRaspuns = (key) => {
    // Creează o copie a stării `updatedVarianteRaspuns` fără varianta specificată
    const updatedVarianteRaspunsCopy = { ...updatedVarianteRaspuns };
    delete updatedVarianteRaspunsCopy[key]; // Șterge varianta de răspuns
    setUpdatedVarianteRaspuns(updatedVarianteRaspunsCopy);
  };



  return (
    <MDBContainer className="pt-5">
      <MDBCard className="mb-4">
        <MDBCardBody className="d-flex justify-content-between align-items-center">
          <h1>Întrebările Chestionarului Holland</h1>
          <div>
            <MDBBtn
              className="mx-2"
              color="secondary"
              onClick={() => (window.location.href = "/")}
            >
              Homepage
            </MDBBtn>
            <MDBBtn
              className="mx-2"
              color="secondary"
              onClick={() => (window.location.href = "/Grafice")}
            >
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
                <MDBBtn
                  className="primary"
                  onClick={cautaIntrebare}
                  style={{ marginLeft: "5px" }}
                >
                  <MDBIcon fas icon="search" />
                </MDBBtn>
              </MDBInputGroup>
            </MDBCol>
            <MDBCol md="auto">
              <MDBBtn onClick={() => (window.location.href = "/AdaugaIntrebare")}>
                Adaugă întrebare nouă
              </MDBBtn>
            </MDBCol>
            <MDBCol md="auto">
              <MDBDropdown>
                <MDBDropdownToggle className="search-btn" onClick={afiseazaIntrebari}>
                  Întrebări
                </MDBDropdownToggle>
                <MDBDropdownMenu>
                  <MDBDropdownItem onClick={() => cautaIntrebariCategorie("artistic")}>
                    Artistic
                  </MDBDropdownItem>
                  <MDBDropdownItem onClick={() => cautaIntrebariCategorie("convențional")}>
                    Conventional
                  </MDBDropdownItem>
                  <MDBDropdownItem onClick={() => cautaIntrebariCategorie("întreprinzător")}>
                    Întreprinzător
                  </MDBDropdownItem>
                  <MDBDropdownItem onClick={() => cautaIntrebariCategorie("investigativ")}>
                    Investigativ
                  </MDBDropdownItem>
                  <MDBDropdownItem onClick={() => cautaIntrebariCategorie("realist")}>
                    Realist
                  </MDBDropdownItem>
                  <MDBDropdownItem onClick={() => cautaIntrebariCategorie("social")}>
                    Social
                  </MDBDropdownItem>
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
              <MDBBtn
                color="primary"
                size="sm"
                onClick={() => toggleUpdateForm(intrebare)}
                className="ms-2"
              >
                {showUpdateForm && intrebareId === intrebare.id
                  ? "Ascunde formularul de actualizare"
                  : "Actualizează întrebare"}
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
                <select
                  value={updatedCategorie}
                  onChange={(e) => setUpdatedCategorie(e.target.value)}
                >
                  <option value="artistic">Artistic</option>
                  <option value="convențional">Conventional</option>
                  <option value="întreprinzător">Întreprinzător</option>
                  <option value="investigativ">Investigativ</option>
                  <option value="realist">Realist</option>
                  <option value="social">Social</option>
                </select>
                <br></br>

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
                    <MDBBtn
                      color="danger"
                      size="sm"
                      onClick={() => stergeImagine(intrebare.id)}
                    >
                      Șterge imagine
                    </MDBBtn>
                  </div>
                )}

                {Object.keys(updatedVarianteRaspuns).map((variantKey) => (
                  <div key={variantKey}>
                    <br></br>
                    <MDBInput
                      label="Variantă răspuns"
                      type="text"
                      ref={inputRef}
                      value={variantKey}
                      onChange={(e) => {
                        const newKey = e.target.value;

                        if (newKey !== variantKey) {
                          if (!updatedVarianteRaspuns.hasOwnProperty(newKey)) {
                            const variantData = updatedVarianteRaspuns[variantKey];
                            const entries = Object.entries(updatedVarianteRaspuns);
                            entries[variantKey] = [newKey, variantData];
                            const newVarianteRaspuns = Object.fromEntries(entries);
                            setUpdatedVarianteRaspuns(newVarianteRaspuns);

                            setTimeout(() => {
                              if (inputRef.current) {
                                inputRef.current.focus();
                              }
                            }, 0);
                          } else {
                            console.warn("Cheia deja există. Alege o cheie unică.");
                          }
                        }
                      }}
                      className="mb-3"
                    />
                    Voturi
                    <MDBInput

                      type="number"
                      value={updatedVarianteRaspuns[variantKey].voturi}
                      onChange={(e) => setUpdatedVarianteRaspuns({
                        ...updatedVarianteRaspuns,
                        [variantKey]: {
                          ...updatedVarianteRaspuns[variantKey],
                          voturi: parseInt(e.target.value),
                        }
                      })}
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
                    <MDBBtn
                      color="danger"
                      size="sm"
                      onClick={() => stergereVariantaRaspuns(variantKey)}
                      className="mb-2"
                    >
                      Șterge varianta de răspuns
                    </MDBBtn>
                    <br></br>
                  

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
                <MDBBtn
                  color="primary"
                  size="sm"
                  onClick={adaugareVariantaRaspuns}
                  className="mb-3"
                >
                  Adaugă variantă răspuns
                </MDBBtn>
                <MDBBtn
                  color="success"
                  size="sm"
                  onClick={actualizeazaIntrebare}
                  className="mb-3"
                >
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