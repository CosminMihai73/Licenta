import React, { useState, useEffect } from "react";
import axios from "axios";


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
    <div className="container">
      <button className="custom-button" onClick={() => window.location.href = '/'}>Homepage</button>
      <button className="custom-button" onClick={() => window.location.href = '/Grafice'}>Înapoi</button>
      <h1>Întrebări Holland</h1>
      <div className="input-container">
        <input
          type="text"
          placeholder="Introdu ID-ul întrebării"
          value={intrebareId}
          onChange={(e) => setIntrebareId(e.target.value)}
        />
        {intrebareId && (
          <button className="clear-btn" onClick={reseteazaInput}>x</button>
        )}
        <button className="search-btn" onClick={cautaIntrebare}>Caută întrebare după ID</button>
        <button className="custom-button" onClick={() => window.location.href = '/AdaugaIntrebare'}>Adaugă întrebare nouă</button>
        <div className="dropdown">
          <button className="search-btn" onClick={afiseazaIntrebari}>Întrebări</button>
          <div className="dropdown-content">
            <button className="search-btn" onClick={() => cautaIntrebariCategorie("artistic")}>Artistic</button>
            <button className="search-btn" onClick={() => cautaIntrebariCategorie("convențional")}>Conventional</button>
            <button className="search-btn" onClick={() => cautaIntrebariCategorie("întreprinzător")}>Întreprinzător</button>
            <button className="search-btn" onClick={() => cautaIntrebariCategorie("investigativ")}>Investigative</button>
            <button className="search-btn" onClick={() => cautaIntrebariCategorie("realist")}>Realist</button>
            <button className="search-btn" onClick={() => cautaIntrebariCategorie("social")}>Social</button>
          </div>
        </div>
      </div>

      {intrebari.map((intrebare) => (
        <div className="intrebare-card" key={intrebare.id}>
          <div className="edit-buttons">
            <button className="sterge-btn" onClick={() => stergeIntrebare(intrebare.id)}>Șterge întrebare</button>
            <button className="edit-btn" onClick={() => toggleUpdateForm(intrebare)}>
              {showUpdateForm && intrebareId === intrebare.id ? "Ascunde formularul de actualizare" : "Actualizează întrebare"}
            </button>
          </div>

          {showUpdateForm && intrebareId === intrebare.id && (
            <div className="update-form">
              <label>Text întrebare</label>
              <input
                type="text"
                placeholder="Text întrebare"
                value={updatedText}
                onChange={(e) => setUpdatedText(e.target.value)}
              />
              <label>Timer în secunde</label>
              <input
                type="number"
                placeholder="Timer (secunde)"
                value={updatedTimer}
                onChange={(e) => setUpdatedTimer(parseInt(e.target.value))}
              />
              <label>Categorie</label>
              <select
                value={updatedCategorie}
                onChange={(e) => setUpdatedCategorie(e.target.value)}
              >
                <option value="artistic">Artistic</option>
                <option value="convențional">Conventional</option>
                <option value="întreprinzător">Întreprinzător</option>
                <option value="investigativ">Investigative</option>
                <option value="realist">Realist</option>
                <option value="social">Social</option>
              </select>

              {/* Afișează input-ul de încărcare doar dacă nu există imagine asociată */}
              {!intrebare.text_poza && (
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      // Stochează fișierul selectat în stare
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />
              )}

              <p>Text Poză: {intrebare.text_poza}</p>

              {/* Afișează butonul de ștergere doar dacă există imagine asociată */}
              {intrebare.text_poza && (
                <button onClick={() => stergeImagine(intrebare.id)}>Șterge imagine</button>
              )}

              {Object.keys(updatedVarianteRaspuns).map((variantKey, index) => (
                <div key={variantKey}>
                  <label>Variantă răspuns</label>
                  <input
                    type="text"
                    ref={inputRef}
                    value={variantKey}
                    onChange={(e) => {
                      const newKey = e.target.value;

                      if (newKey !== variantKey) {
                        // Verifică dacă newKey există deja pentru a evita dublarea cheilor
                        if (!updatedVarianteRaspuns.hasOwnProperty(newKey)) {
                          // Obține datele elementului curent
                          const variantData = updatedVarianteRaspuns[variantKey];

                          // Creează o copie a stării actuale
                          const entries = Object.entries(updatedVarianteRaspuns);
                          entries[index] = [newKey, variantData]; // Înlocuiește cheia veche cu cea nouă la indexul curent

                          // Reconstruiește obiectul `updatedVarianteRaspuns` folosind `Object.fromEntries`
                          const newVarianteRaspuns = Object.fromEntries(entries);

                          // Actualizează starea `updatedVarianteRaspuns`
                          setUpdatedVarianteRaspuns(newVarianteRaspuns);

                          // Restabilește focusul pe input (opțional)
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
                  />

                  <label>Voturi</label>
                  <input
                    type="number"
                    value={updatedVarianteRaspuns[variantKey].voturi}
                    onChange={(e) => setUpdatedVarianteRaspuns({
                      ...updatedVarianteRaspuns,
                      [variantKey]: {
                        ...updatedVarianteRaspuns[variantKey],
                        voturi: parseInt(e.target.value),
                      }
                    })}
                  />
                  <button onClick={() => stergereVariantaRaspuns(variantKey)}>Șterge varianta de răspuns</button>
                  {/* Afișează input-ul pentru încărcarea unei imagini numai dacă nu există o imagine asociată */}
                  {!updatedVarianteRaspuns[variantKey].raspuns_poza && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        // Stochează fișierul selectat în stare
                        const file = e.target.files[0];
                        setUpdatedVarianteRaspuns({
                          ...updatedVarianteRaspuns,
                          [variantKey]: {
                            ...updatedVarianteRaspuns[variantKey],
                            file: file, // Adaugă fișierul selectat la varianta de răspuns
                          }
                        });
                      }}
                    />
                  )}

                  {/* Afișează butonul pentru ștergerea imaginii numai dacă există o imagine asociată */}
                  {updatedVarianteRaspuns[variantKey].raspuns_poza && (
                    <div>
                      <p>Poză: {updatedVarianteRaspuns[variantKey].raspuns_poza}</p>
                      <button onClick={() => deleteResponseImage(intrebareId, updatedVarianteRaspuns[variantKey].voturi)}>
                        Șterge imagine
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={adaugareVariantaRaspuns}>Adaugă variantă răspuns</button>
              <button className="update-btn" onClick={actualizeazaIntrebare}>Actualizează</button>
            </div>
          )}

          {!showUpdateForm && (
            <React.Fragment>
              <p>ID: {intrebare.id}</p>
              <p>Text: {intrebare.text}</p>
              <p>Text Poză: {intrebare.text_poza}</p>
              <p>Timer: {intrebare.timer} secunde</p>
              <p>Categorie: {intrebare.categorie}</p>
              <ul>
                {Object.keys(intrebare.variante_raspuns).map((variantKey) => (
                  <li key={variantKey}>
                    <p>Variantă răspuns: {variantKey}</p>
                    <p>Voturi: {intrebare.variante_raspuns[variantKey].voturi}</p>
                    <p>Răspuns Poză: {intrebare.variante_raspuns[variantKey].raspuns_poza}</p>
                  </li>
                ))}
              </ul>
            </React.Fragment>
          )}
        </div>
      ))}
    </div>
  );
}

export default IntrebariHolland;