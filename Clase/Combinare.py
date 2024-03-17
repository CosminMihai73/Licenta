import json
from collections import OrderedDict
import os

class Combinare:

    @staticmethod
    def combina_fisiere_json(fisiere_intrare, fisier_iesire):
        # Funcția pentru a combina fișierele JSON și a scrie în fișierul de ieșire
        # Șterge fișierul de ieșire dacă există deja
        if os.path.exists(fisier_iesire):
            os.remove(fisier_iesire)

        # Creează o listă pentru a ține toate datele combinate
        date_combine = []

        # Parcurge toate fișierele de intrare și adaugă datele lor la lista combinată
        for fisier_intrare in fisiere_intrare:
            try:
                with open(fisier_intrare, 'r', encoding='utf-8') as file:
                    date_fisier = json.load(file, object_pairs_hook=OrderedDict)

                    # Parcurge fiecare întrebare din fișierul de intrare și adaugă la date_combine
                    for categorie in date_fisier:
                        for intrebare in date_fisier[categorie]:
                            # Asigură că fiecare întrebare are structura specificată pentru variantele de răspuns
                            intrebare['variante_raspuns'] = intrebare.get('variante_raspuns', {})

                            # Parcurge fiecare variantă de răspuns și asigură că are toate câmpurile necesare
                            for varianta_raspuns in intrebare['variante_raspuns'].values():
                                # Verifică dacă variantă de răspuns este un dicționar
                                if not isinstance(varianta_raspuns, dict):
                                    varianta_raspuns = {}

                                # Adaugă câmpurile lipsă pentru fiecare variantă de răspuns
                                varianta_raspuns['voturi'] = varianta_raspuns.get('voturi', 0)
                                varianta_raspuns['raspuns_poza'] = varianta_raspuns.get('raspuns_poza', '')

                            # Adaugă întrebarea la date_combine
                            intrebare_noua = {
                                'id': len(date_combine) + 1,
                                'text': intrebare['text'],
                                'text_poza': intrebare.get('text_poza', ''),
                                'timer': intrebare.get('timer', 0),
                                'categorie': categorie,
                                'variante_raspuns': intrebare['variante_raspuns']


                            }
                            date_combine.append(intrebare_noua)
            except FileNotFoundError:
                print(f"Fisierul {fisier_intrare} nu a fost gasit.")
                continue

        # Sortează întrebările după id înainte de a le scrie în fișier
        date_combine = sorted(date_combine, key=lambda x: x['id'])

        # Scrie datele combinate în fișierul de ieșire
        with open(fisier_iesire, 'w', encoding='utf-8') as file_iesire:
            json.dump(date_combine, file_iesire, indent=2, ensure_ascii=False)
