import json
from fastapi import APIRouter, HTTPException
from Clase.Conectare import conectare_baza_date


router = APIRouter(tags=["UtilizatorI Holland"])

@router.get("/obitineCandidati/{partial_email}")
async def get_CandidatPartialEmail(partial_email: str):
    try:
        
        with conectare_baza_date() as conn:
            cursor = conn.cursor()

       
            query = "SELECT * FROM Candidat WHERE email LIKE ?"
            cursor.execute(query, (f"%{partial_email}%",))

            rows = cursor.fetchall()

            if not rows:
                raise HTTPException(status_code=404, detail="Niciun candidat nu a fost găsit cu acea parte din email.")

            
            candidati = []
            for row in rows:
                columns = [desc[0] for desc in cursor.description]
                candidat = dict(zip(columns, row))

                
                punctaje = json.loads(candidat['Punctaje'].replace("'", '"'))
                candidat['Punctaje'] = punctaje
                
               
                raspunsuri = eval(candidat['Raspunsuri'])
                candidat['Raspunsuri'] = raspunsuri
                
               
                candidat = {'Data_Modificarii': candidat['Data_Modificarii'], **candidat}
                candidati.append(candidat)

            return {"candidati": candidati}

    except Exception as e:
       
        return {"error": str(e)}

@router.get("/obitineCandidati")
async def get_Candidat():
    try:
        
        with conectare_baza_date() as conn:
            cursor = conn.cursor()

            
            query = "SELECT * FROM Candidat"
            cursor.execute(query)

            
            rows = cursor.fetchall()

            candidati = []
            columns = [desc[0] for desc in cursor.description]

            for row in rows:
                candidat = dict(zip(columns, row))

              
                punctaje = json.loads(candidat['Punctaje'].replace("'", '"'))
                candidat['Punctaje'] = punctaje
                
                
                raspunsuri = eval(candidat['Raspunsuri'])
                candidat['Raspunsuri'] = raspunsuri
                
               
                candidat = {'Data_Modificarii': candidat['Data_Modificarii'], **candidat}
                candidati.append(candidat)

            return {"candidati": candidati}

    except Exception as e:
     
        return {"error": str(e)}



@router.delete("/stergeCandidat/{email}")
async def delete_Candidat(email: str):
    try:
    
        conn = conectare_baza_date()
        cursor = conn.cursor()

        
        cursor.execute("SELECT COUNT(*) FROM Candidat WHERE email = ?", email)
        if cursor.fetchone()[0] == 0:
            raise HTTPException(status_code=404, detail="Candidatul nu a fost găsit.")

 
        delete_query = "DELETE FROM Candidat WHERE email = ?"
        cursor.execute(delete_query, email)
        conn.commit()


        cursor.close()
        conn.close()

        return {"message": "Candidatul a fost șters cu succes."}

    except Exception as e:
        return {"error": str(e)}