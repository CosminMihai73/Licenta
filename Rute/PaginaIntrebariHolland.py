from fastapi import APIRouter, HTTPException,Query
from starlette.responses import FileResponse
from typing import  Optional, Union, List, Dict
import os
from pydantic import BaseModel, EmailStr
import json
from Clase.Citeste import Citeste
from Clase.Conectare import adauga_in_baza_de_date, conectare_baza_date


router = APIRouter(tags=["Pagina Intrebari Holland"])

@router.get("/questions")
async def get_questions(page: int = Query(1, gt=0)):
    file_path_reguli = 'Holland/Paginare.json'
    file_path_intrebari = 'Holland/toate_intrebarile.json'

    cititor_reguli = Citeste()
    reguli_paginare = cititor_reguli.citeste_date(file_path_reguli)

    cititor_intrebari = Citeste()
    intrebari = cititor_intrebari.citeste_date(file_path_intrebari)

    total_pages = len(reguli_paginare)

    if page > total_pages:
        return {"error": "Pagina specificată nu există."}

    reguli_pagina_curenta = reguli_paginare.get(f"reguli_pagina_{page}")
    if not reguli_pagina_curenta:
        return {"error": f"Nu s-au găsit reguli pentru pagina {page}."}

    intrebari_pe_pagina = reguli_pagina_curenta["intrebari_pe_pagina"]

    questions_with_responses = []

    for id_intrebare in intrebari_pe_pagina:
        intrebare = next((i for i in intrebari if i['id'] == id_intrebare), None)
        if intrebare:
            formatted_question = {
                "id": intrebare["id"],
                "text": intrebare["text"],
                "timer": intrebare.get("timer", 0),
                "image_path": intrebare.get("text_poza", None),
                "image_url": None,
                "responses": []
            }

            if formatted_question["image_path"] and formatted_question["image_path"] != "":
                base_url = "http://localhost:8000"
                image_url = f"{base_url}/images/{os.path.basename(formatted_question['image_path'])}"
                formatted_question["image_url"] = image_url

            for raspuns, detalii in intrebare["variante_raspuns"].items():
                punctaj = detalii.get("voturi", 0) if isinstance(detalii, dict) else detalii

                formatted_response = {
                    "value": raspuns,
                    "score": punctaj
                }

                if isinstance(detalii, dict):
                    response_image_path = detalii.get("raspuns_poza", None)
                    if response_image_path and response_image_path != "":
                        response_image_url = f"{base_url}/images/{os.path.basename(response_image_path)}"
                        formatted_response["response_image_url"] = response_image_url

                formatted_question["responses"].append(formatted_response)

            questions_with_responses.append(formatted_question)

    return {"total_pages": total_pages, "questions": questions_with_responses}



@router.get("/images/{image_name}")
async def get_image(image_name: str, display_url: Optional[bool] = False):
    image_path = os.path.join("Holland/poze", image_name)
    if os.path.exists(image_path):
        if display_url:
            return {"image_url": f"http://localhost:8000/images/{image_name}", "image": FileResponse(image_path, media_type="image/jpeg")}
        else:
            return FileResponse(image_path, media_type="image/jpeg")
    else:
        return {"error": "Image not found"}


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
with open("Holland/toate_intrebarile.json", "r") as file:
    intrebari = json.load(file)

with open("Holland/punctaje.json", "r") as file:
    punctaje_initiale = json.load(file)

# Create a list of Pydantic models for validating answers
modele_intrebari = [RaspunsModel(id=intrebare["id"], categorie=intrebare["categorie"], raspuns="") for intrebare in intrebari]

@router.post("/actualizeaza_si_calculeaza_punctaje")
def actualizeaza_si_calculeaza_punctaje(raspunsuri: RaspundeLaIntrebari):
    try:
        global raspunsuri_stocate

        # Verificăm dacă există răspunsuri în lista de răspunsuri
        if not raspunsuri.raspunsuri:
            raise HTTPException(status_code=400, detail="Nu există răspunsuri salvate pentru a calcula punctajele.")

        # Încărcăm întrebările din fișierul JSON
        with open("Holland/toate_intrebarile.json", "r", encoding="utf-8") as file:
            intrebari = json.load(file)

        # Inițializăm un dicționar pentru a stoca punctajele
        punctaje = {
            'artistic': 0,
            'convențional': 0,
            'realist': 0,
            'întreprinzător': 0,
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
        with open("Holland/raspunsuri.json", "w", encoding="utf-8") as file:
            json.dump([raspuns.dict() for raspuns in raspunsuri.raspunsuri], file, ensure_ascii=False)

        # Salvăm punctajele în fișierul "punctaje.json"
        with open("Holland/punctaje.json", "w", encoding="utf-8") as file:
            json.dump(punctaje, file, ensure_ascii=False)

        email = raspunsuri.email
        punctaje_json = json.dumps(punctaje)

        # Deschide fișierul cu întrebări
        with open("Holland/toate_intrebarile.json", "r", encoding='utf-8') as file:
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


@router.get("/interpretare_si_atribuie_profesie")
async def interpretare_si_atribuie_profesie():
    tipuri_holland = {
        'artistic': 'Artistic',
        'convențional': 'Convențional',
        'realist': 'Realist',
        'întreprinzător': 'Întreprinzător',
        'investigativ': 'Investigativ',
        'social': 'Social'
    }
    punctaje = None
    profesii = None

    # Deschidem și citim fișierele punctaje.json și profesii.json
    with open("Holland/punctaje.json", "r", encoding='utf-8') as file:
        punctaje = json.load(file)

    with open("Holland/profesii.json", "r", encoding='utf-8') as file:
        profesii = json.load(file)['tipuri_personalitate']

    # Calculăm tipul dominant și tipurile secundare
    tip_dominant = max(punctaje, key=punctaje.get)
    tipuri_secundare = sorted(punctaje, key=punctaje.get, reverse=True)[1:3]

    # Obținem informațiile despre profesii pentru tipul dominant și tipurile secundare
    profesie_dominanta = None
    profesii_secundare = []

    for profesie in profesii:
        if profesie['tip'] == tip_dominant:
            profesie_dominanta = profesie
        elif profesie['tip'] in tipuri_secundare:
            profesii_secundare.append(profesie)

    # Procesăm informațiile despre facultăți pentru a le integra în rezultatul final
    facultati_dominante = profesie_dominanta['facultati']
    facultati_secundare_1 = profesii_secundare[0]['facultati']
    facultati_secundare_2 = profesii_secundare[1]['facultati']

    # Formatăm rezultatul în format JSON
    rezultat = {
        "tip_dominant": tipuri_holland[tip_dominant],
        "descriere_dominanta": profesie_dominanta['descriere'],
        "meserii_dominante": profesie_dominanta['meserii'],
        "facultati_dominante": facultati_dominante,
        "tip_secundar_1": tipuri_holland[tipuri_secundare[0]],
        "descriere_secundar_1": profesii_secundare[0]['descriere'],
        "meserii_secundare_1": profesii_secundare[0]['meserii'],
        "facultati_secundare_1": facultati_secundare_1,
        "tip_secundar_2": tipuri_holland[tipuri_secundare[1]],
        "descriere_secundar_2": profesii_secundare[1]['descriere'],
        "meserii_secundare_2": profesii_secundare[1]['meserii'],
        "facultati_secundare_2": facultati_secundare_2,
    }

    return {"rezultat_interpretare": rezultat}