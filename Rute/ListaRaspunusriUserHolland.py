import json
from fastapi import APIRouter, HTTPException
from Clase.Conectare import conectare_baza_date


router = APIRouter(tags=["UtilizatorI Holland"])

@router.get("/obitineCandidati/{partial_email}")
async def get_CandidatPartialEmail(partial_email: str):
    try:
        # Connect to the database
        conn = conectare_baza_date()
        cursor = conn.cursor()

        # Execute query
        query = "SELECT * FROM Candidat WHERE email LIKE ?"
        # Utilizează '%' pentru a căuta orice potrivire în interiorul adresei de email
        cursor.execute(query, f"%{partial_email}%")

        # Fetch the rows
        rows = cursor.fetchall()

        if not rows:
            # If no candidate found with the given partial email, raise HTTPException with status code 404
            raise HTTPException(status_code=404, detail="Niciun candidat nu a fost găsit cu acea parte din email.")

        # Convert rows to list of dictionaries
        candidati = []
        for row in rows:
            columns = [desc[0] for desc in cursor.description]
            candidat = dict(zip(columns, row))
            # Reorder dictionary to have 'Data_Modificari' first
            candidat = {'Data_Modificarii': candidat['Data_Modificarii'], **candidat}
            # Parse 'Punctaje' column
            punctaje = json.loads(candidat['Punctaje'])
            candidat['Punctaje'] = punctaje
            # Parse 'Raspunsuri' column
            raspunsuri = eval(candidat['Raspunsuri'])
            candidat['Raspunsuri'] = raspunsuri
            candidati.append(candidat)

        # Close cursor and connection
        cursor.close()
        conn.close()

        return {"candidati": candidati}

    except Exception as e:
        return {"error": str(e)}

@router.get("/obitineCandidati")
async def get_Candidat():
    try:
        # Connect to the database
        conn = conectare_baza_date()
        cursor = conn.cursor()

        # Execute query
        query = "SELECT * FROM Candidat"
        cursor.execute(query)

        # Fetch all rows
        rows = cursor.fetchall()

        # Get column names
        columns = [desc[0] for desc in cursor.description]

        # Convert rows to dictionaries
        candidati = []
        for row in rows:
            candidat = dict(zip(columns, row))
            # Reorder dictionary to have 'Data_Modificari' first
            candidat = {'Data_Modificarii': candidat['Data_Modificarii'], **candidat}
            # Parse 'Punctaje' column
            punctaje = json.loads(candidat['Punctaje'])
            candidat['Punctaje'] = punctaje
            # Parse 'Raspunsuri' column
            raspunsuri = eval(candidat['Raspunsuri'])
            candidat['Raspunsuri'] = raspunsuri
            candidati.append(candidat)

        # Close cursor and connection
        cursor.close()
        conn.close()

        return {"candidati": candidati}

    except Exception as e:
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