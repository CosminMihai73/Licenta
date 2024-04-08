from typing import List
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import json

router = APIRouter(tags=["Manipulare Pagini Holland"])

# Calea către fișierul JSON
file_path = "Holland/Paginare.json"

# Funcție pentru citirea datelor din fișierul JSON
def citire_json():
    try:
        with open(file_path, "r") as file:
            json_data = json.load(file)
        return json_data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Fișierul Paginare.json nu a fost găsit.")

# Funcție pentru salvarea datelor în fișierul JSON
def salvare_json(json_data):
    with open(file_path, "w") as file:
        json.dump(json_data, file, indent=4)

numar_intrebari = {}

# Endpoint pentru afișarea paginilor Holland
@router.get("/afisare_pagini_holland")
async def afisare_pagini_holland():
    json_data = citire_json()
    return JSONResponse(content=json_data)

@router.post("/adauga_regula_pagina")
async def adauga_regula_pagina():
    json_data = citire_json()

    # Determinăm ultimul nume al regulii de pagină
    ultima_regula = max((int(key.split('_')[-1]) for key in json_data if key.startswith('reguli_pagina')), default=0)

    # Incrementăm numărul pentru a obține următorul nume
    urmatorul_numar = ultima_regula + 1
    nume_regula = f"reguli_pagina_{urmatorul_numar}"

    # Verificăm dacă regula deja există
    if nume_regula in json_data:
        raise HTTPException(status_code=400, detail=f"Regula de pagină '{nume_regula}' deja există.")

    json_data[nume_regula] = {"intrebari_pe_pagina": []}
    salvare_json(json_data)
    return JSONResponse(content=json_data)

@router.put("/incarca_intrebari_pagina/{nume_regula}")
async def incarca_intrebari_pagina(nume_regula: str, numere_intrebari: List[int]):
    json_data = citire_json()

    # Verificăm dacă regula există
    if nume_regula not in json_data:
        raise HTTPException(status_code=404, detail=f"Regula de pagină '{nume_regula}' nu există.")

    # Actualizăm câmpul "intrebari_pe_pagina" cu numerele dorite
    json_data[nume_regula]["intrebari_pe_pagina"] = numere_intrebari

    # Salvăm modificările în fișierul JSON
    salvare_json(json_data)

    return JSONResponse(content={"message": f"Intrebarile pentru pagina '{nume_regula}' au fost actualizate cu succes."})

# Endpoint pentru ștergerea unei reguli de pagină
@router.delete("/sterge_regula_pagina/{nume_regula}")
async def sterge_regula_pagina(nume_regula: str):
    json_data = citire_json()
    if nume_regula not in json_data:
        raise HTTPException(status_code=404, detail=f"Regula de pagină '{nume_regula}' nu există.")

    del json_data[nume_regula]
    salvare_json(json_data)
    return JSONResponse(content=json_data)


