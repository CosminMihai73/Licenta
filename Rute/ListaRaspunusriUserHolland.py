import json
from fastapi import APIRouter, HTTPException
from Clase.Conectare import conectare_baza_date


router = APIRouter(tags=["UtilizatorI Holland"])

@router.get("/obitineCandidati/{partial_email}")
async def get_CandidatPartialEmail(partial_email: str):
    try:
        # Utilizăm context manager pentru a gestiona conexiunea și cursorul
        with conectare_baza_date() as conn:
            cursor = conn.cursor()

            # Interogare SQL cu placeholder pentru a preveni SQL injection
            query = "SELECT * FROM Candidat WHERE email LIKE ?"
            cursor.execute(query, (f"%{partial_email}%",))

            # Extragem rezultatele interogării
            rows = cursor.fetchall()

            if not rows:
                raise HTTPException(status_code=404, detail="Niciun candidat nu a fost găsit cu acea parte din email.")

            # Procesăm datele și corectăm formatul JSON
            candidati = []
            for row in rows:
                columns = [desc[0] for desc in cursor.description]
                candidat = dict(zip(columns, row))

                # Procesăm coloanele JSON și Python
                punctaje = json.loads(candidat['Punctaje'].replace("'", '"'))
                candidat['Punctaje'] = punctaje
                
                # Asigurați-vă că eval este sigur
                raspunsuri = eval(candidat['Raspunsuri'])
                candidat['Raspunsuri'] = raspunsuri
                
                # Reordonăm dicționarul
                candidat = {'Data_Modificarii': candidat['Data_Modificarii'], **candidat}
                candidati.append(candidat)

            return {"candidati": candidati}

    except Exception as e:
        # Returnați eroarea în format clar
        return {"error": str(e)}

@router.get("/obitineCandidati")
async def get_Candidat():
    try:
        # Utilizăm context manager pentru conexiunea la baza de date
        with conectare_baza_date() as conn:
            cursor = conn.cursor()

            # Executăm interogarea
            query = "SELECT * FROM Candidat"
            cursor.execute(query)

            # Extragem toate rândurile
            rows = cursor.fetchall()

            # Procesăm datele
            candidati = []
            columns = [desc[0] for desc in cursor.description]

            for row in rows:
                candidat = dict(zip(columns, row))

                # Procesăm coloanele JSON și Python
                punctaje = json.loads(candidat['Punctaje'].replace("'", '"'))
                candidat['Punctaje'] = punctaje
                
                # Evaluați cu grijă `Raspunsuri`
                raspunsuri = eval(candidat['Raspunsuri'])
                candidat['Raspunsuri'] = raspunsuri
                
                # Reordonăm dicționarul
                candidat = {'Data_Modificarii': candidat['Data_Modificarii'], **candidat}
                candidati.append(candidat)

            return {"candidati": candidati}

    except Exception as e:
        # Returnați eroarea într-un format clar
        return {"error": str(e)}



@router.delete("/stergeCandidat/{email}")
async def delete_Candidat(email: str):
    try:
        # Connect to the database
        conn = conectare_baza_date()
        cursor = conn.cursor()

        # Verificăm dacă candidatul există
        cursor.execute("SELECT COUNT(*) FROM Candidat WHERE email = ?", email)
        if cursor.fetchone()[0] == 0:
            raise HTTPException(status_code=404, detail="Candidatul nu a fost găsit.")

        # Ștergem candidatul
        delete_query = "DELETE FROM Candidat WHERE email = ?"
        cursor.execute(delete_query, email)
        conn.commit()

        # Close cursor and connection
        cursor.close()
        conn.close()

        return {"message": "Candidatul a fost șters cu succes."}

    except Exception as e:
        return {"error": str(e)}