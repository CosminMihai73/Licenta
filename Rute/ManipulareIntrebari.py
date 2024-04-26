import os
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
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

# Directorul în care se află fișierul JSON
JSON_DIR = "Holland"

@router.post("/uploadIntrebare/{question_id}/")
async def upload_image_and_json(question_id: int, file: UploadFile = File(...)):
    # Verificăm dacă fișierul este o imagine
    if not file.content_type.startswith("image"):
        return {"error": "Fișierul nu este o imagine."}
    
    # Salvăm imaginea într-un fișier
    image_path = os.path.join(JSON_DIR, "poze", file.filename)
    with open(image_path, "wb") as buffer:
        buffer.write(await file.read())
    
    # Construim un dicționar cu informațiile despre fișier
    image_info = {
        "text_poza": os.path.join("poze", file.filename)
    }
    
    # Încarcăm JSON-ul existent
    json_path = os.path.join(JSON_DIR, "toate_intrebarile.json")
    try:
        with open(json_path, "r") as json_file:
            data = json.load(json_file)
    except FileNotFoundError:
        return {"error": "Fișierul JSON nu există."}
    
    # Găsim întrebarea cu id-ul specificat
    question = next((q for q in data if q.get("id") == question_id), None)
    if question:
        # Adăugăm informațiile despre imagine în câmpul corespunzător
        if "text_poza" in question:
            question["text_poza"] = image_info["text_poza"]
        else:
            for raspuns in question["variante_raspuns"].values():
                if raspuns["raspuns_poza"] == "":
                    raspuns["raspuns_poza"] = image_info["text_poza"]
                    break
    else:
        return {"error": f"Nu s-a găsit întrebarea cu id-ul {question_id}."}
    
    # Salvăm JSON-ul actualizat
    with open(json_path, "w") as json_file:
        json.dump(data, json_file, indent=4,ensure_ascii=False)
    
    return {"filename": file.filename, "question_id": question_id}



@router.post("/upload/{question_id}/varianta/{voturi}/")
async def upload_response_image(question_id: int, voturi: int, file: UploadFile):
    # Verificăm dacă fișierul este o imagine
    if not file.content_type.startswith("image"):
        return {"error": "Fișierul nu este o imagine."}
    
    # Salvăm imaginea într-un fișier
    image_path = os.path.join(JSON_DIR, "poze", file.filename)
    with open(image_path, "wb") as buffer:
        buffer.write(await file.read())
    
    # Construim un dicționar cu informațiile despre fișier
    image_info = {
        "raspuns_poza": os.path.join("poze", file.filename)
    }
    
    # Încarcăm JSON-ul existent
    json_path = os.path.join(JSON_DIR, "toate_intrebarile.json")
    try:
        with open(json_path, "r") as json_file:
            data = json.load(json_file)
    except FileNotFoundError:
        return {"error": "Fișierul JSON nu există."}
    
    # Găsim întrebarea cu id-ul specificat
    question = next((q for q in data if q.get("id") == question_id), None)
    if question:
        # Găsim varianta de răspuns cu numărul specificat de voturi
        target_variant = next((v for v in question["variante_raspuns"].values() if v.get("voturi") == voturi), None)
        if target_variant:
            # Actualizăm poza pentru varianta de răspuns identificată
            target_variant["raspuns_poza"] = image_info["raspuns_poza"]
            # Salvăm JSON-ul actualizat
            with open(json_path, "w") as json_file:
                json.dump(data, json_file, indent=4, ensure_ascii=False)
        else:
            return {"error": f"Nu există o variantă de răspuns cu {voturi} voturi pentru întrebarea cu id-ul {question_id}."}
    else:
        return {"error": f"Nu s-a găsit întrebarea cu id-ul {question_id}."}
    
    return {"filename": file.filename, "question_id": question_id, "voturi": voturi}

@router.delete("/delete/image/{question_id}/")
async def delete_question_image(question_id: int):
    # Încarcăm JSON-ul existent
    json_path = os.path.join(JSON_DIR, "toate_intrebarile.json")
    try:
        with open(json_path, "r") as json_file:
            data = json.load(json_file)
    except FileNotFoundError:
        return {"error": "Fișierul JSON nu există."}
    
    # Găsim întrebarea cu id-ul specificat
    question = next((q for q in data if q.get("id") == question_id), None)
    if question and "text_poza" in question:
        # Ștergem referința către imagine din câmpul text_poza al întrebării
        image_path = os.path.join(JSON_DIR, question["text_poza"])
        if os.path.exists(image_path):
            os.remove(image_path)
        else:
            return {"error": "Imaginea asociată întrebării nu a fost găsită."}
        
        question["text_poza"] = ""
        
        # Salvăm JSON-ul actualizat
        with open(json_path, "w") as json_file:
            json.dump(data, json_file, indent=4, ensure_ascii=False)
        
        return {"message": "Imaginea asociată întrebării și referința către aceasta au fost șterse cu succes."}
    else:
        return {"error": f"Nu s-a găsit întrebarea cu id-ul {question_id} sau nu are o imagine asociată."}


@router.delete("/delete/image/{question_id}/variant/{voturi}/")
async def delete_response_image(question_id: int, voturi: int):
    # Încarcăm JSON-ul existent
    json_path = os.path.join(JSON_DIR, "toate_intrebarile.json")
    try:
        with open(json_path, "r") as json_file:
            data = json.load(json_file)
    except FileNotFoundError:
        return {"error": "Fișierul JSON nu există."}
    
    # Găsim întrebarea cu id-ul specificat
    question = next((q for q in data if q.get("id") == question_id), None)
    if question:
        # Găsim varianta de răspuns cu numărul specificat de voturi
        target_variant = next((v for v in question["variante_raspuns"].values() if v.get("voturi") == voturi), None)
        if target_variant and "raspuns_poza" in target_variant:
            # Ștergem referința către imagine din câmpul raspuns_poza al variantei de răspuns
            image_path = os.path.join(JSON_DIR, target_variant["raspuns_poza"])
            if os.path.exists(image_path):
                os.remove(image_path)
            else:
                return {"error": "Imaginea asociată variantei de răspuns nu a fost găsită."}
            
            # Actualizăm calea imaginii în câmpul raspuns_poza al variantei de răspuns
            target_variant["raspuns_poza"] = ""
            
            # Salvăm JSON-ul actualizat
            with open(json_path, "w") as json_file:
                json.dump(data, json_file, indent=4, ensure_ascii=False)
            
            return {"message": "Imaginea asociată variantei de răspuns și referința către aceasta au fost șterse cu succes."}
        else:
            return {"error": f"Nu există o variantă de răspuns cu {voturi} voturi pentru întrebarea cu id-ul {question_id} sau nu are o imagine asociată."}
    else:
        return {"error": f"Nu s-a găsit întrebarea cu id-ul {question_id}."}
