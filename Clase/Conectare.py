import json

import pyodbc

def conectare_baza_date():
    # Definește parametrii conexiunii la baza de date
    server = 'localhost'
    database = 'Admitere2007'
    username = 'Cosmin'
    password = 'Ariana'

    # Realizează conexiunea
    conn_str = f'DRIVER={{SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password}'
    conn = pyodbc.connect(conn_str)
    return conn


def adauga_in_baza_de_date(email, punctaje_json, raspunsuri_json):
    try:
        conn = conectare_baza_date()
        cursor = conn.cursor()

        # Verificați dacă există deja un candidat cu adresa de email dată
        cursor.execute('SELECT Punctaje FROM Candidat WHERE email = ?', (email,))
        existing_candidate = cursor.fetchone()

        if existing_candidate:
            # Dacă există, actualizați înregistrarea existentă
            cursor.execute(
                'UPDATE Candidat SET Punctaje = ?, Raspunsuri = ? WHERE email = ?',
                (punctaje_json, str(raspunsuri_json), email)
            )
            print("Datele au fost actualizate cu succes în baza de date!")
        else:
            # Dacă nu există, inserați o înregistrare nouă
            cursor.execute(
                'INSERT INTO Candidat (email, Punctaje, Raspunsuri) VALUES (?, ?, ?)',
                (email, punctaje_json, str(raspunsuri_json))
            )
            print("Datele au fost adăugate cu succes în baza de date!")

        # Confirmă operațiunea
        conn.commit()

    except Exception as e:
        print(f"O eroare a apărut: {e}")

    finally:
        conn.close()
