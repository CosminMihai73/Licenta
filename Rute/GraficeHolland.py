import json
from fastapi import APIRouter
from Clase.Conectare import conectare_baza_date

router = APIRouter(tags=["Grafice Holland"])

@router.get("/sumapunctaje")
def calcul_suma_punctaje():
    try:
       
        conn = conectare_baza_date()
        cursor = conn.cursor()

       
        cursor.execute('SELECT Punctaje FROM Candidat')
        
     
        punctaje = [json.loads(row[0].replace("'", '"')) for row in cursor.fetchall()]

      
        sume = {
            "artistic": 0,
            "convențional": 0,
            "realist": 0,
            "întreprinzător": 0,
            "investigativ": 0,
            "social": 0
        }

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
      
        conn = conectare_baza_date()
        cursor = conn.cursor()

     
        cursor.execute('SELECT Punctaje FROM Candidat')

      
        punctaje = [json.loads(row[0].replace("'", '"')) for row in cursor.fetchall()]

    
        sume = {
            "artistic": 0,
            "convențional": 0,
            "realist": 0,
            "întreprinzător": 0,
            "investigativ": 0,
            "social": 0
        }

       
        for punctaj in punctaje:
            for categorie, valoare in punctaj.items():
                sume[categorie] += valoare

       
        suma_totala = sum(sume.values())

        
        procente = {categorie: (valoare / suma_totala) * 100 for categorie, valoare in sume.items()}

        
        procente_formatate = {categorie: f"{valoare:.2f}%" for categorie, valoare in procente.items()}

        return {"procente": procente_formatate}

    except Exception as e:
        return {"error": f"Eroare de server: {str(e)}"}

    finally:
        conn.close()


@router.get("/ultimele_modificari")
async def ultimele_modificari():
    try:
       
        conn = conectare_baza_date()
        cursor = conn.cursor()

        
        query = "SELECT TOP 3 * FROM Candidat ORDER BY Data_Modificarii DESC"
        cursor.execute(query)

        
        modificari = []
        for row in cursor.fetchall():
           
            punctaje_json = json.loads(row[2].replace("'", '"'))

           
            punctaje_str = ", ".join([f"{categorie.capitalize()}: {valoare}" for categorie, valoare in punctaje_json.items()])

            modificare = {
                "Data": row[4],
                "IdCandidat": row[0],
                "Email": row[1],
                "Punctaje Categorii": punctaje_str
            }

            
            modificari.append(modificare)

       
        cursor.close()
        conn.close()

        return {"ultimele_modificari": modificari}

    except Exception as e:
        
        return {"error": f"Eroare de server: {str(e)}"}
