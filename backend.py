from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Rute.ManipulareIntrebari import router as Manipulare_intrebari
from Rute.PaginaIntrebariHolland import router as PaginaIntrebariH
from Rute.GraficeHolland import router as GraficeH
from Rute.ListaRaspunusriUserHolland import router as RaspunusriHolland
from Rute.ManipularePaginiHolland import router as PaginiHolland

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(Manipulare_intrebari)
app.include_router(PaginaIntrebariH)
app.include_router(GraficeH)
app.include_router(RaspunusriHolland)
app.include_router(PaginiHolland)




if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)



