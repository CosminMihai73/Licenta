from fastapi import APIRouter, HTTPException
from typing import List, Dict
from pydantic import BaseModel
import json

router = APIRouter(tags=["Intrebari Holland Page"])

class Raspuns(BaseModel):
    voturi: int
    raspuns_poza: str = ""

# Model pentru întrebare
class Intrebare(BaseModel):
    id: int
    text: str
    text_poza: str
    timer: int
    categorie: str
    variante_raspuns: Dict[str, Raspuns]

# Încărcare întrebări din fișier JSON
def incarca_intrebari():
    with open("Holland/toate_intrebarile.json", "r", encoding="utf-8") as file:
        return json.load(file)

# Salvare întrebări în fișier JSON
def salveaza_intrebari(intrebari):
    with open("Holland/toate_intrebarile.json", "w", encoding="utf-8") as file:
        json.dump(intrebari, file, indent=4, ensure_ascii=False)


@router.get("/cauta_intrebari/{categorie}")
async def cauta_intrebari_categorie(categorie: str):
    intrebari = incarca_intrebari()
    intrebari_gasite = []

    for intrebare in intrebari:
        intrebare_obj = Intrebare(**intrebare)  # Convertim dict-ul intr-un obiect de tip Intrebare
        if intrebare_obj.categorie == categorie:
            intrebari_gasite.append(intrebare_obj)

    if not intrebari_gasite:
        raise HTTPException(status_code=404, detail="Nu s-au găsit întrebări pentru categoria specificată")

    return intrebari_gasite

@router.get("/cauta_intrebare/{intrebare_id}")
async def cauta_intrebare_id(intrebare_id: int):
    intrebari = incarca_intrebari()

    for intrebare in intrebari:
        if intrebare["id"] == intrebare_id:
            return intrebare

    raise HTTPException(status_code=404, detail="Intrebarea nu a fost găsită")



@router.get("/citeste_intrebari/")
async def citeste_intrebari():
    intrebari = incarca_intrebari()
    return intrebari

# Endpoint pentru adăugarea unei întrebări noi
@router.post("/adauga_intrebare/")
async def adauga_intrebare(intrebare: Intrebare):
    intrebari = incarca_intrebari()

    # Identificăm ultimul ID utilizat pentru întrebări
    ultimul_id = max([intrebare['id'] for intrebare in intrebari], default=0)

    # Incrementăm ID-ul pentru a genera un nou ID pentru întrebarea curentă
    nou_id = ultimul_id + 1

    # Actualizăm ID-ul întrebării curente
    intrebare.id = nou_id

    # Adăugăm întrebarea nouă cu noul ID la lista întrebărilor
    intrebari.append(intrebare.dict())

    # Salvăm lista actualizată de întrebări în fișierul JSON
    # Salvăm lista actualizată de întrebări în fișierul JSON
    salveaza_intrebari(intrebari)

    return {"message": "Intrebarea a fost adăugată cu succes"}

# Endpoint pentru actualizarea unei întrebări bazate pe ID
@router.put("/actualizeaza_intrebare/{intrebare_id}")
async def actualizeaza_intrebare(intrebare_id: int, intrebare: Intrebare):
    intrebari = incarca_intrebari()

    for index, item in enumerate(intrebari):
        if item["id"] == intrebare_id:
            intrebari[index] = intrebare.dict()
            salveaza_intrebari(intrebari)
            return {"message": "Intrebarea a fost actualizată cu succes"}

    raise HTTPException(status_code=404, detail="Intrebarea nu a fost găsită")

@router.delete("/sterge_intrebare/{intrebare_id}")
async def sterge_intrebare(intrebare_id: int):
    intrebari = incarca_intrebari()

    for index, intrebare in enumerate(intrebari):
        if intrebare["id"] == intrebare_id:
            del intrebari[index]
            salveaza_intrebari(intrebari)
            return {"message": "Intrebarea a fost ștearsă cu succes"}

    raise HTTPException(status_code=404, detail="Intrebarea nu a fost găsită")
