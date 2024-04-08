import json
import os

class Citeste:
    @staticmethod
    def citeste_date(file_path):
        if not os.path.exists(file_path):
            with open(file_path, 'w', encoding='utf-8') as new_file:
                json.dump([], new_file)
                return []
        else:
            with open(file_path, 'r', encoding='utf-8') as file:
                return json.load(file)

    @staticmethod
    def citeste(nume_fisier):
        with open(nume_fisier, "r", encoding="utf-8") as file:
            return json.load(file)
