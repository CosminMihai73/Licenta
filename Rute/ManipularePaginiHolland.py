from typing import List
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import json

router = APIRouter(tags=["Manipulare Pagini Holland"])


file_path = "Holland/Paginare.json"

def citire_json():
    try:
        with open(file_path, "r") as file:
            json_data = json.load(file)
        return json_data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Fișierul Paginare.json nu a fost găsit.")


def salvare_json(json_data):
    with open(file_path, "w") as file:
        json.dump(json_data, file, indent=4)

numar_intrebari = {}


@router.get("/afisare_pagini_holland")
async def afisare_pagini_holland():
    json_data = citire_json()
    return JSONResponse(content=json_data)



@router.post("/adauga_regula_pagina")
async def adauga_regula_pagina():
    json_data = citire_json()

 
    ultima_regula = max((int(key.split('_')[-1]) for key in json_data if key.startswith('reguli_pagina')), default=0)

    
    urmatorul_numar = ultima_regula + 1
    nume_regula = f"reguli_pagina_{urmatorul_numar}"

  
    if nume_regula in json_data:
        raise HTTPException(status_code=400, detail=f"Regula de pagină '{nume_regula}' deja există.")

    json_data[nume_regula] = {"intrebari_pe_pagina": []}
    salvare_json(json_data)
    return JSONResponse(content=json_data)

@router.put("/incarca_intrebari_pagina/{nume_regula}")
async def incarca_intrebari_pagina(nume_regula: str, numar_intrebare: int):
    json_data = citire_json()

    if nume_regula not in json_data:
        raise HTTPException(status_code=404, detail=f"Regula de pagină '{nume_regula}' nu există.")

    
    if "intrebari_pe_pagina" not in json_data[nume_regula]:
        json_data[nume_regula]["intrebari_pe_pagina"] = [numar_intrebare]
    else:
        json_data[nume_regula]["intrebari_pe_pagina"].append(numar_intrebare)


    salvare_json(json_data)

    return JSONResponse(content={"message": f"Intrebarea {numar_intrebare} pentru pagina '{nume_regula}' a fost adăugată cu succes în coadă."})


@router.delete("/sterge_regula_pagina/{nume_regula}")
async def sterge_regula_pagina(nume_regula: str):
    json_data = citire_json()
    if nume_regula not in json_data:
        raise HTTPException(status_code=404, detail=f"Regula de pagină '{nume_regula}' nu există.")

    del json_data[nume_regula]
    salvare_json(json_data)
    return JSONResponse(content=json_data)

@router.put("/modifica_intrebare_pagina/{nume_regula}/{numar_intrebare_vechi}/{numar_intrebare_nou}")
async def modifica_intrebare_pagina(nume_regula: str, numar_intrebare_vechi: int, numar_intrebare_nou: int):
    json_data = citire_json()


    if nume_regula not in json_data:
        raise HTTPException(status_code=404, detail=f"Regula de pagină '{nume_regula}' nu există.")


    if numar_intrebare_vechi not in json_data[nume_regula]["intrebari_pe_pagina"]:
        raise HTTPException(status_code=404, detail=f"Numărul de întrebare '{numar_intrebare_vechi}' nu există în lista pentru regula '{nume_regula}'.")

    index_vechi = json_data[nume_regula]["intrebari_pe_pagina"].index(numar_intrebare_vechi)
    json_data[nume_regula]["intrebari_pe_pagina"][index_vechi] = numar_intrebare_nou


    salvare_json(json_data)

    return JSONResponse(content={"message": f"Numărul de întrebare '{numar_intrebare_vechi}' a fost înlocuit cu '{numar_intrebare_nou}' în lista pentru regula '{nume_regula}'."})


@router.delete("/sterge_intrebare_pagina/{nume_regula}/{numar_intrebare}")
async def sterge_intrebare_pagina(nume_regula: str, numar_intrebare: int):
    json_data = citire_json()


    if nume_regula not in json_data:
        raise HTTPException(status_code=404, detail=f"Regula de pagină '{nume_regula}' nu există.")


    if numar_intrebare not in json_data[nume_regula]["intrebari_pe_pagina"]:
        raise HTTPException(status_code=404, detail=f"Numărul de întrebare '{numar_intrebare}' nu există în lista pentru regula '{nume_regula}'.")


    json_data[nume_regula]["intrebari_pe_pagina"].remove(numar_intrebare)

    salvare_json(json_data)

    return JSONResponse(content={"message": f"Numărul de întrebare '{numar_intrebare}' a fost șters din lista pentru regula '{nume_regula}'."})

