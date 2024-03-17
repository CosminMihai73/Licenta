import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from starlette.responses import JSONResponse, FileResponse
from typing import List, Dict, Optional, Union
import json
from Clase.Citeste import Citeste
from Clase.Combinare import Combinare
from Clase.InterpretareRezultat import InterpretareHolland, InterpretareProfesii
from Clase.Conectare import adauga_in_baza_de_date

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/combina_fisiere_json")
def combina_fisiere_json():
    fisiere_intrare = ['json/artistic.json', 'json/conventional.json', 'json/intreprinzator.json',
                       'json/investigativ.json', 'json/realist.json', 'json/social.json']
    fisier_iesire = 'json/toate_intrebarile.json'

    comb = Combinare()
    comb.combina_fisiere_json(fisiere_intrare, fisier_iesire)

    with open(fisier_iesire, 'r') as file:
        content = json.load(file)

    return JSONResponse(content={"message": "Fisierele au fost combinate cu succes!", "file_content": content})




@app.get("/questions")
async def get_questions(page: int = Query(1, gt=0)):
    file_path_variante = 'json/toate_intrebarile.json'
    cititor = Citeste()
    intrebari = cititor.citeste_date(file_path_variante)

    # Calculăm indexul de start și de sfârșit pentru întrebările din pagina curentă
    items_per_page = 20
    start_index = (page - 1) * items_per_page
    end_index = min(start_index + items_per_page, len(intrebari))

    questions_with_responses = []
    total_time = 0  # Initializează timpul total cu 0

    for intrebare in intrebari[start_index:end_index]:
        formatted_question = {
            "id": intrebare["id"],
            "text": intrebare["text"],
            "image_path": intrebare.get("text_poza", None),  # Calea către fișierul imagine
            "responses": []
        }

        # Calculăm timpul total al întrebărilor
        total_time += intrebare.get("timer", 0)  # Adaugă timpul întrebării curente la timpul total

        # Verificăm tipul variantelor de răspuns
        for raspuns, detalii in intrebare["variante_raspuns"].items():
            if isinstance(detalii, dict):
                punctaj = detalii.get("voturi", 0)
            else:
                punctaj = detalii

            formatted_response = {
                "value": raspuns,
                "score": punctaj
            }

            if isinstance(detalii, dict):
                formatted_response["response_image"] = detalii.get("raspuns_poza", None)

            formatted_question["responses"].append(formatted_response)

        # Verifică dacă calea către imagine există și este validă
        if formatted_question["image_path"] is not None and os.path.exists(formatted_question["image_path"]):
            # Returnează fișierul imagine
            formatted_question["image_response"] = FileResponse(formatted_question["image_path"],
                                                                media_type="image/jpeg")

        questions_with_responses.append(formatted_question)

    # Calculăm numărul total de pagini
    total_pages = (len(intrebari) + items_per_page - 1) // items_per_page

    return {"total_time": total_time, "total_pages": total_pages, "questions": questions_with_responses}




class RaspunsModel(BaseModel):
    id: int
    categorie: str
    raspuns: str


class IntrebareModel(BaseModel):
    id: int
    text: str
    categorie: str
    variante_raspuns: Dict[str, Union[int, str]]


class RaspundeLaIntrebari(BaseModel):
    raspunsuri: List[RaspunsModel]
    email: EmailStr

raspunsuri_stocate = []

# Load questions and initial scores from JSON files
with open("json/toate_intrebarile.json", "r") as file:
    intrebari = json.load(file)

with open("json/punctaje.json", "r") as file:
    punctaje_initiale = json.load(file)

# Create a list of Pydantic models for validating answers
modele_intrebari = [RaspunsModel(id=intrebare["id"], categorie=intrebare["categorie"], raspuns="") for intrebare in intrebari]

class RaspunsModel(BaseModel):
    id: int
    categorie: str
    raspuns: str


class IntrebareModel(BaseModel):
    id: int
    text: str
    categorie: str
    variante_raspuns: Dict[str, Union[int, str]]


class RaspundeLaIntrebari(BaseModel):
    raspunsuri: List[RaspunsModel]
    email: EmailStr

raspunsuri_stocate = []

# Load questions and initial scores from JSON files
with open("json/toate_intrebarile.json", "r") as file:
    intrebari = json.load(file)

with open("json/punctaje.json", "r") as file:
    punctaje_initiale = json.load(file)

# Create a list of Pydantic models for validating answers
modele_intrebari = [RaspunsModel(id=intrebare["id"], categorie=intrebare["categorie"], raspuns="") for intrebare in intrebari]

@app.post("/actualizeaza_si_calculeaza_punctaje")
def actualizeaza_si_calculeaza_punctaje(raspunsuri: RaspundeLaIntrebari):
    try:
        global raspunsuri_stocate

        # Verificăm dacă există răspunsuri în lista de răspunsuri
        if not raspunsuri.raspunsuri:
            raise HTTPException(status_code=400, detail="Nu există răspunsuri salvate pentru a calcula punctajele.")

        # Încărcăm întrebările din fișierul JSON
        with open("json/toate_intrebarile.json", "r", encoding="utf-8") as file:
            intrebari = json.load(file)

        # Inițializăm un dicționar pentru a stoca punctajele
        punctaje = {
            'artistic': 0,
            'conventional': 0,
            'realist': 0,
            'intreprinzator': 0,
            'investigativ': 0,
            'social': 0
        }

        # Parcurgem fiecare răspuns și actualizăm punctajele
        for raspuns in raspunsuri.raspunsuri:
            for intrebare in intrebari:
                if intrebare["id"] == raspuns.id:
                    variante_raspuns = intrebare["variante_raspuns"]
                    punctaj = variante_raspuns.get(raspuns.raspuns)
                    if punctaj is not None:
                        # Verificăm dacă punctajul este un număr întreg și îl adăugăm la totalul corespunzător
                        if isinstance(punctaj, dict) and "voturi" in punctaj:
                            raspuns.categorie = intrebare["categorie"]
                            raspuns.raspuns = str(punctaj["voturi"])
                            punctaje[intrebare["categorie"].lower()] += punctaj["voturi"]
                        else:
                            raise HTTPException(status_code=400, detail=f"Răspunsul '{raspuns.raspuns}' pentru întrebarea '{intrebare['text']}' nu este valid.")
                    else:
                        raise HTTPException(status_code=400, detail=f"Răspunsul '{raspuns.raspuns}' pentru întrebarea '{intrebare['text']}' nu este valid.")

        # Adăugăm răspunsurile la lista de răspunsuri stocate
        raspunsuri_stocate.extend(raspunsuri.raspunsuri)

        # Salvăm răspunsurile în fișierul "raspunsuri.json"
        with open("json/raspunsuri.json", "w", encoding="utf-8") as file:
            json.dump([raspuns.dict() for raspuns in raspunsuri.raspunsuri], file, ensure_ascii=False)

        # Salvăm punctajele în fișierul "punctaje.json"
        with open("json/punctaje.json", "w") as file:
            json.dump(punctaje, file)

        email = raspunsuri.email
        punctaje_json = json.dumps(punctaje)

        # Deschide fișierul cu întrebări
        with open("json/toate_intrebarile.json", "r", encoding='utf-8') as file:
            intrebari = json.load(file)

        # Apoi, poți folosi aceste întrebări în cadrul buclei tale pentru a obține textul întrebării
        raspunsuri_json = []
        for raspuns in raspunsuri.raspunsuri:
            for intrebare in intrebari:
                if intrebare["id"] == raspuns.id:
                    raspunsuri_json.append({
                        "id": raspuns.id,
                        "intrebare": intrebare["text"],
                        "raspuns": raspuns.raspuns
                    })
                    break

        adauga_in_baza_de_date(email, punctaje_json, raspunsuri_json)

        # Returnăm un răspuns HTTP cu informațiile necesare
        return {
            "message": "Răspunsuri actualizate și punctaje calculate cu succes.",
            "raspunsuri": [raspuns.dict() for raspuns in raspunsuri.raspunsuri],
            "email": raspunsuri.email
        }
    except HTTPException as http_exception:
        # Dacă primim o excepție HTTP, o retransmitem
        raise http_exception
    except Exception as e:
        # Dacă apare o altă excepție, returnăm un răspuns HTTP cu codul de eroare 500 și detalii despre acea excepție
        raise HTTPException(status_code=500, detail=str(e))


class InterpretareResult(BaseModel):
    tip_dominant: str
    tip_secundar: str
    combinatie_finala: str
    profesie_attribuita: str

@app.get("/interpretare_si_atribuie_profesie", response_model=InterpretareResult)
def interpretare_si_atribuie_profesie(fisier_punctaje: str = 'json/punctaje.json'):
    try:
        # Interpretation logic
        interpretare = InterpretareHolland(fisier_punctaje)
        rezultat_interpretat = interpretare.interpreteaza()
        combinatie_finala = interpretare.combinatie_finala

        with open('json/profesii.json', 'r', encoding='utf-8') as file:
            profesii_data = json.load(file)["profesii"]

        interpretare_profesii = InterpretareProfesii(combinatie_finala, profesii_data)
        profesie_attribuita = interpretare_profesii.atribuie_profesie()

        # Return the interpreted results
        result = InterpretareResult(
            tip_dominant=interpretare.tip_dominant,
            tip_secundar=interpretare.tip_secundar,
            combinatie_finala=combinatie_finala,
            profesie_attribuita=profesie_attribuita
        )
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")




if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)