# Motor de Recomandare pentru Alegerea Specializării

## Descriere
Această aplicație este dezvoltată pentru a ajuta studenții să aleagă specializarea academică potrivită, utilizând un motor de recomandare bazat pe teoria Holland și modelul RIASEC. Aplicația colectează date printr-un chestionar și oferă recomandări personalizate bazate pe răspunsurile utilizatorilor.

## Tehnologii utilizate
- **Backend**: Python, FastAPI, PyODBC
- **Baza de date**: Microsoft SQL Server
- **Frontend**: React, Axios, MDB - Material Design for Bootstrap, Leaflet

## Structura proiectului
- **backend/**: Conține codul sursă pentru partea de server a aplicației.
- **frontend/**: Conține codul sursă pentru partea de client a aplicației.
- **database/**: Scripturi pentru configurarea și gestionarea bazei de date.

## Configurare și Instalare
### Cerințe preliminare
- Python 3.x
- Node.js
- Microsoft SQL Server

### Pași de instalare

1. **Clonează repository-ul:**
    ```bash
    git clone https://github.com/CosminMihai73/Licenta.git
    cd Licenta
    ```

2. **Instalarea pachetelor backend:**
    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # Pentru Windows: venv\Scripts\activate
    pip install -r requirements.txt
    ```

3. **Configurarea bazei de date:**
    - Crează o bază de date nouă în Microsoft SQL Server.
    - Rulează scripturile SQL din folderul `database/` pentru a configura tabelele necesare.

4. **Instalarea pachetelor frontend:**
    ```bash
    cd ../ui
    npm install
    ```

## Rulare
### Pornire backend:
```bash
cd backend
source venv/bin/activate  # Pentru Windows: venv\Scripts\activate
uvicorn main:app --reload
```

### Pornire frontend:
```bash
cd ui
npm start
```

Accesează aplicația la `http://localhost:3000`.

## Utilizare
- **Pagina principală**: Navigare către diferite secțiuni precum chestionarul Holland, informații despre facultăți, admitere și contact.
- **Chestionarul Holland**: Completarea chestionarului pentru a obține recomandări personalizate.
- **Pagina de rezultate**: Vizualizarea recomandărilor bazate pe răspunsurile chestionarului.

## Administrare
- **Secțiunea Admin**: Administratorii pot vizualiza și gestiona răspunsurile utilizatorilor, adăuga sau modifica întrebări în chestionar și gestiona conținutul aplicației.

