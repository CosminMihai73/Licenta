import json
from fastapi import APIRouter
from Clase.Conectare import conectare_baza_date

router = APIRouter(tags=["Grafice Holland"])

@router.get("/sumapunctaje")
def calcul_suma_punctaje():
    try:
        # Conectați-vă la baza de date folosind funcția din Conectare.py
        conn = conectare_baza_date()
        cursor = conn.cursor()

        # Execută interogarea pentru a obține toate punctajele
        cursor.execute('SELECT Punctaje FROM Candidat')

        # Extrage toate punctajele din rezultatul interogării
        punctaje = [json.loads(row[0]) for row in cursor.fetchall()]

        # Inițializăm sumele pentru fiecare categorie
        sume = {
            "artistic": 0,
            "conventional": 0,
            "realist": 0,
            "intreprinzator": 0,
            "investigativ": 0,
            "social": 0
        }

        # Adunăm punctajele pentru fiecare categorie pentru fiecare candidat
        for punctaj in punctaje:
            for categorie, valoare in punctaj.items():
                sume[categorie] += valoare

        return {"suma_punctaje": sume}

    except Exception as e:
        return {"error": f"Eroare de server: {str(e)}"}

    finally:
        conn.close()

@router.get("/procente")
def calcul_procente():
    try:
        # Conectați-vă la baza de date folosind funcția din Conectare.py
        conn = conectare_baza_date()
        cursor = conn.cursor()

        # Execută interogarea pentru a obține toate punctajele
        cursor.execute('SELECT Punctaje FROM Candidat')

        # Extrage toate punctajele din rezultatul interogării
        punctaje = [json.loads(row[0]) for row in cursor.fetchall()]

        # Inițializăm sumele pentru fiecare categorie
        sume = {
            "artistic": 0,
            "conventional": 0,
            "realist": 0,
            "intreprinzator": 0,
            "investigativ": 0,
            "social": 0
        }

        # Adunăm punctajele pentru fiecare categorie pentru fiecare candidat
        for punctaj in punctaje:
            for categorie, valoare in punctaj.items():
                sume[categorie] += valoare

        # Calculăm suma totală a punctajelor
        suma_totala = sum(sume.values())

        # Convertim sumele în procente
        procente = {categorie: (valoare / suma_totala) * 100 for categorie, valoare in sume.items()}

        # Formatăm procentele pentru a avea două zecimale și a adăuga simbolul procent la final
        procente_formatate = {categorie: f"{valoare:.2f}%" for categorie, valoare in procente.items()}

        return {"procente": procente_formatate}

    except Exception as e:
        return {"error": f"Eroare de server: {str(e)}"}

    finally:
        conn.close()


@router.get("/ultimele_modificari")
async def ultimele_modificari():
    try:
        # Conectarea la baza de date
        conn = conectare_baza_date()
        cursor = conn.cursor()

        # Interogarea pentru a obține ultimele 3 modificări
        query = "SELECT TOP 3 * FROM Candidat ORDER BY Data_Modificarii DESC"
        cursor.execute(query)

        # Extrage rezultatele interogării
        modificari = []
        for row in cursor.fetchall():
            # Deserializare șir JSON pentru punctaje
            punctaje_json = json.loads(row[2])

            # Construirea unui șir pentru punctaje categorii
            punctaje_str = ", ".join([f"{categorie.capitalize()}: {valoare}" for categorie, valoare in punctaje_json.items()])

            # Construirea dicționarului pentru candidat
            modificare = {
                "Data": row[4],
                "IdCandidat": row[0],
                "Email": row[1],
                "Punctaje Categorii": punctaje_str
            }

            # Adăugarea modificării în lista de modificări
            modificari.append(modificare)

        # Închide conexiunea
        conn.close()

        return {"ultimele_modificari": modificari}

    except Exception as e:
        return {"error": f"Eroare de server: {str(e)}"}