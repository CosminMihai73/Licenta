import React, { useState, useEffect } from "react";
import axios from "axios";
import "./IntrebariHolland.css";

const IntrebariHolland = () => {
  const [intrebari, setIntrebari] = useState([]);
  const [intrebareId, setIntrebareId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showAdaugareIntrebare, setShowAdaugareIntrebare] = useState(false);
  const [nextVariantIndex, setNextVariantIndex] = useState(0);
  const [editData, setEditData] = useState({
    text: "",
    text_poza: "",
    timer: 0,
    categorie: "",
    variante_raspuns: {},
  });
  const [intrebareNoua, setIntrebareNoua] = useState({
    text: "",
    text_poza: "",
    timer: 0,
    categorie: "",
    variante_raspuns: {}
  
  });

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

  const handleEditClick = (id, data) => {
    setEditingId(id);
    setEditData(data);
  };

  const handleSaveClick = async (id) => {
    try {
      await axios.put(`http://127.0.0.1:8000/actualizeaza_intrebare/${id}`, editData);
      setEditingId(null);
      afiseazaIntrebari();
    } catch (error) {
      console.error("Eroare la salvarea întrebării:", error);
    }
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = { ...editData.variante_raspuns };
    updatedVariants[index][field] = value;
    setEditData({ ...editData, variante_raspuns: updatedVariants });
  };

  const handleVariantIndexChange = (oldIndex, newIndex) => {
    setEditData((prevEditData) => {
        const updatedVariants = { ...prevEditData.variante_raspuns };
        if (newIndex !== oldIndex && updatedVariants.hasOwnProperty(oldIndex)) {
            const variantData = updatedVariants[oldIndex];
            delete updatedVariants[oldIndex];
            updatedVariants[newIndex] = variantData;
        }
        return { ...prevEditData, variante_raspuns: updatedVariants };
    });
};

  const handleAddVariant = () => {
    const updatedVariants = { ...editData.variante_raspuns };
    const newIndex = `additionalProp${Object.keys(updatedVariants).length + 1}`;
    updatedVariants[newIndex] = { voturi: 0, raspuns_poza: "" };
    setEditData({ ...editData, variante_raspuns: updatedVariants });
  };

  const handleRemoveVariant = (index) => {
    const updatedVariants = { ...editData.variante_raspuns };
    delete updatedVariants[index];
    setEditData({ ...editData, variante_raspuns: updatedVariants });
  };
  const handleAddNewVariant = () => {
    const updatedVariants = { ...intrebareNoua.variante_raspuns };
    const newIndex = nextVariantIndex; // Utilizăm variabila nextVariantIndex ca și index
    updatedVariants[newIndex] = { voturi: 0, raspuns_poza: "" };
    setNextVariantIndex(nextVariantIndex + 1); // Incrementăm nextVariantIndex pentru următorul răspuns
    setIntrebareNoua({ ...intrebareNoua, variante_raspuns: updatedVariants });
  };
  
  
  const handleRemoveNewVariant = (index) => {
  const updatedVariants = { ...intrebareNoua.variante_raspuns };
  delete updatedVariants[index];
  setIntrebareNoua({ ...intrebareNoua, variante_raspuns: updatedVariants });
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

  const adaugaIntrebare = async () => {
    try {
      const requestBody = {
        id: intrebareNoua.id,
        text: intrebareNoua.text,
        text_poza: intrebareNoua.text_poza,
        timer: intrebareNoua.timer,
        categorie: intrebareNoua.categorie,
        variante_raspuns: intrebareNoua.variante_raspuns
      };
  
      await axios.post("http://127.0.0.1:8000/adauga_intrebare/", requestBody);
      afiseazaIntrebari();
      setShowAdaugareIntrebare(false); // Închide fereastra de adăugare întrebare
      alert("Intrebare adăugată cu succes!"); // Afișează un mesaj de succes
    } catch (error) {
      console.error("Eroare la adăugarea întrebării:", error);
    }
  };

  const toggleAdaugareIntrebare = () => {
    setShowAdaugareIntrebare(!showAdaugareIntrebare);
    setIntrebareNoua({
      id: 0,
      text: "",
      text_poza: "",
      timer: 0,
      categorie: "",
      variante_raspuns: {
        "": {
          "text": "",
          "voturi": 0,
          "raspuns_poza": ""
        }
      }
    });
  }

  useEffect(() => {
    afiseazaIntrebari();
  }, []);

  return (
    <div className="container">
      <button className="custom-button" onClick={() => window.location.href = '/'}>Homepage</button>
      <button className="custom-button" onClick={() => window.location.href = '/Grafice'}>Inapoi</button>
      <h1>Intrebari Holland</h1>
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
        <button className="add-btn" onClick={toggleAdaugareIntrebare}>Adaugă întrebare</button>
        <div className="dropdown">
          <button className="search-btn" onClick={afiseazaIntrebari}>Intrebari</button>
          <div className="dropdown-content">
            <button className="search-btn" onClick={() => cautaIntrebariCategorie("artistic")}>Artistic</button>
            <button className="search-btn" onClick={() => cautaIntrebariCategorie("conventional")}>Conventional</button>
            <button className="search-btn" onClick={() => cautaIntrebariCategorie("intreprinzator")}>Întreprinzătoare</button>
            <button className="search-btn" onClick={() => cautaIntrebariCategorie("investigativ")}>Investigative</button>
            <button className="search-btn" onClick={() => cautaIntrebariCategorie("realist")}>Realiste</button>
            <button className="search-btn" onClick={() => cautaIntrebariCategorie("social")}>Sociale</button>
          </div>
        </div>
      </div>
  
      {showAdaugareIntrebare && (
        <div className="add-container">
          <h2>Adăugare Întrebare</h2>
          <div className="input-container">
            <label>Text întrebare:</label>
            <input
              type="text"
              value={intrebareNoua.text}
              onChange={(e) => setIntrebareNoua({ ...intrebareNoua, text: e.target.value })}
            />
            <label>Text poză:</label>
            <input
              type="text"
              value={intrebareNoua.text_poza}
              onChange={(e) => setIntrebareNoua({ ...intrebareNoua, text_poza: e.target.value })}
            />
            <label>Timer (secunde):</label>
            <input
              type="number"
              value={intrebareNoua.timer}
              onChange={(e) => setIntrebareNoua({ ...intrebareNoua, timer: parseInt(e.target.value) || 0 })}
            />
            <label>Categorie:</label>
            <input
              type="text"
              value={intrebareNoua.categorie}
              onChange={(e) => setIntrebareNoua({ ...intrebareNoua, categorie: e.target.value })}
            />
            {Object.keys(intrebareNoua.variante_raspuns).map((index) => (
              <div key={index}>
                <label>Textul răspunsului:</label>
                <input
                  type="text"
                  value={intrebareNoua.variante_raspuns[index].text}
                  onChange={(e) => {
                  const newText = e.target.value;
                  setIntrebareNoua(prevState => {
                  const updatedVariants = { ...prevState.variante_raspuns };
                  updatedVariants[index] = { ...updatedVariants[index], text: newText };
                   return { ...prevState, variante_raspuns: updatedVariants };
                 });}} 
                /> 
                <label>Valoarea Răspunsului:</label>
                <input
                  type="number"
                  value={intrebareNoua.variante_raspuns[index].voturi}
                  onChange={(e) => setIntrebareNoua({ ...intrebareNoua, variante_raspuns: { ...intrebareNoua.variante_raspuns, [index]: { ...intrebareNoua.variante_raspuns[index], voturi: parseInt(e.target.value) || 0 } } })}
                />
                <label>Răspuns Poză:</label>
                <input
                  type="text"
                  value={intrebareNoua.variante_raspuns[index].raspuns_poza}
                  onChange={(e) => setIntrebareNoua({ ...intrebareNoua, variante_raspuns: { ...intrebareNoua.variante_raspuns, [index]: { ...intrebareNoua.variante_raspuns[index], raspuns_poza: e.target.value } } })}
                />
             <button className="adaugareinput-btn" onClick={() => handleRemoveNewVariant(index)}>-</button>
             </div>
           ))}
           <button className="adaugareinput-btn" onClick={handleAddNewVariant}>+</button>
            <button className="add-btn" onClick={adaugaIntrebare}>Adaugă întrebare</button>
          </div>
        </div>
      )}
      
      {intrebari.map((intrebare) => (
        <div className="intrebare-card" key={intrebare.id}>
          <div className="edit-buttons">
            {editingId === intrebare.id ? (
              <button className="save-btn" onClick={() => handleSaveClick(intrebare.id)}>Salvează</button>
            ) : (
              <>
              <button className="edit-btn" onClick={() => handleEditClick(intrebare.id, intrebare)}>Modifică</button>
              <button className="sterge-btn" onClick={() => stergeIntrebare(intrebare.id)}>Șterge întrebare</button>
            </>
            )}
          </div>
          {editingId === intrebare.id ? (
            <div className="edit-fields">
              <label>Id:</label>
              <input
                type="text"
                value={editData.id}
                onChange={(e) => setEditData({ ...editData, id: e.target.value })}
              />
              <label>Text Întrebare</label>
              <input
                type="text"
                value={editData.text}
                onChange={(e) => setEditData({ ...editData, text: e.target.value })}
              />
              <label>Text Poză:</label>
              <input
                type="text"
                value={editData.text_poza}
                onChange={(e) => setEditData({ ...editData, text_poza: e.target.value })}
              />
              <label>Timer(secunde):</label>
              <input
                type="number"
                value={editData.timer}
                onChange={(e) => setEditData({ ...editData, timer: parseInt(e.target.value) || 0 })}
              />
              <label>Categorie:</label>
              <input
                type="text"
                value={editData.categorie}
                onChange={(e) => setEditData({ ...editData, categorie: e.target.value })}
              />
              {Object.keys(editData.variante_raspuns).map((index) => (
                <div key={index}>
                  <label>Textul răspunsului:</label>
                  <input
                    type="text"
                    value={index || '  '} // Asigură-te că valoarea este definită sau un șir gol pentru a preveni avertismentul
                    onChange={(e) => handleVariantIndexChange(index, e.target.value)} 
                  />
                  <label>Valoarea Rasăpunsului:</label>
                  <input
                    type="text"
                    value={editData.variante_raspuns[index].voturi}
                    onChange={(e) => handleVariantChange(index, 'voturi', e.target.value)}
                  />
                  <label>Răspuns Poză:</label>
                  <input
                    type="text"
                    value={editData.variante_raspuns[index].raspuns_poza}
                    onChange={(e) => handleVariantChange(index, 'raspuns_poza', e.target.value)}
                  />
                  <button className="adaugareinput-btn" onClick={() => handleRemoveVariant(index)}>-</button>
                </div>
              ))}
              <button className="adaugareinput-btn" onClick={handleAddVariant}>+</button>
            </div>
          ) : (
            <React.Fragment>
              <p>ID: {intrebare.id}</p>
              <p>Text: {intrebare.text}</p>
              <p>Text Poza: {intrebare.text_poza}</p>
              <p>Timer: {intrebare.timer} secunde</p>
              <p>Categorie: {intrebare.categorie}</p>
              <ul>
                {Object.keys(intrebare.variante_raspuns).map((variantKey) => (
                  <li key={variantKey}>
                    <p>Varianta Raspuns: {variantKey}</p>
                    <p>Voturi: {intrebare.variante_raspuns[variantKey].voturi}</p>
                    <p>Raspuns Poza: {intrebare.variante_raspuns[variantKey].raspuns_poza}</p>
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
