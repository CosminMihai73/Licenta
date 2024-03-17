import json

class InterpretareHolland:
    def __init__(self, fisier_punctaje):
        self.fisier_punctaje = fisier_punctaje
        self.tipuri_holland = {
            'artistic': 'Artistic',
            'conventional': 'Conventional',
            'realist': 'Realist',
            'intreprinzator': 'Intreprinzator',
            'investigativ': 'Investigativ',
            'social': 'Social'
        }
        self.punctaje = self.citeste_punctaje()
        self.combinatie_finala = self.genereaza_combinatie_finala()

    def citeste_punctaje(self):
        with open(self.fisier_punctaje, 'r', encoding='utf-8') as file:
            punctaje_data = json.load(file)
        return punctaje_data

    def genereaza_combinatie_finala(self):
        tipuri_sortate = sorted(self.tipuri_holland.keys(), key=lambda x: self.punctaje[x], reverse=True)
        tip_dominant = tipuri_sortate[0]
        tip_secundar = tipuri_sortate[1]
        return f"{self.tipuri_holland[tip_dominant]}-{self.tipuri_holland[tip_secundar]}"

    def interpreteaza(self):
        tipuri_sortate = sorted(self.tipuri_holland.keys(), key=lambda x: self.punctaje[x], reverse=True)

        self.tip_dominant = tipuri_sortate[0]
        scor_dominant = self.punctaje[self.tip_dominant]

        self.tip_secundar = tipuri_sortate[1]
        scor_secundar = self.punctaje[self.tip_secundar]

        combinatie_finala = f"{self.tipuri_holland[self.tip_dominant]}-{self.tipuri_holland[self.tip_secundar]}"

        rezultat = (
            f"Tip dominant: {self.tipuri_holland[self.tip_dominant]} ({scor_dominant} puncte)\n"
            f"Tip secundar: {self.tipuri_holland[self.tip_secundar]} ({scor_secundar} puncte)\n"
            f"{combinatie_finala}"
        )
        return rezultat
class InterpretareProfesii:
    def __init__(self, combinatie_finala, profesii_data):
        self.combinatie_finala = combinatie_finala
        self.profesii = profesii_data

    def citeste_profesii(self):
        with open('profesii.json', 'r', encoding='utf-8') as file:
            profesii_data = json.load(file)
        return profesii_data["profesii"]

    def atribuie_profesie(self):
        for combinatie in self.profesii:
            if self.combinatie_finala in combinatie:
                return combinatie[self.combinatie_finala]
        return "Nu s-a găsit o profesie potrivită pentru această combinație."