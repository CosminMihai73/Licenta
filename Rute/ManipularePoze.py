from fastapi import APIRouter, HTTPException,UploadFile,File
from typing import List, Dict
from pydantic import BaseModel
import os

router = APIRouter(tags=["Poze Holland Page"])

@router.post("/upload/")
async def upload_image(file: UploadFile = File(...)):
    upload_folder = "Holland/poze"
    os.makedirs(upload_folder, exist_ok=True)  # Creează folderul dacă nu există
    
    # Separă numele fișierului și extensia
    filename, file_extension = os.path.splitext(file.filename)
    
    # Adaugă extensia dorită
    filename_with_new_extension = filename + ".png"
    
    # Creează calea completă a noului fișier
    file_location = os.path.join(upload_folder, filename_with_new_extension)
    
    # Salvează fișierul cu extensia nouă
    with open(file_location, "wb") as buffer:
        buffer.write(await file.read())
    
    return {"filename": filename_with_new_extension}

@router.delete("/delete/")
async def delete_image(filename: str):
    upload_folder = "Holland/poze"
    file_path = os.path.join(upload_folder, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        return {"message": f"File '{filename}' deleted successfully"}
    else:
        return {"message": f"File '{filename}' not found"}
    
@router.get("/images/")
async def get_all_images():
    images_dir = "Holland/poze"
    if os.path.exists(images_dir):
        images = []
        for filename in os.listdir(images_dir):
            if filename.endswith(".jpg") or filename.endswith(".jpeg") or filename.endswith(".png"):
                image_path = os.path.join(images_dir, filename)
                images.append({
                    "image_url": f"http://localhost:8000/images/{filename}",
                    "image_name": filename
                })
        return images
    else:
        return {"error": "Image directory not found"}


    
@router.put("/rename/")
async def rename_file(old_filename: str, new_filename: str):
    upload_folder = "Holland/poze"
    old_file_path = os.path.join(upload_folder, old_filename)
    new_file_path = os.path.join(upload_folder, new_filename)

    if not os.path.isfile(old_file_path):
        raise HTTPException(status_code=404, detail="File not found")

    try:
        os.rename(old_file_path, new_file_path)
        return {"message": "File renamed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to rename file: {str(e)}")
    
