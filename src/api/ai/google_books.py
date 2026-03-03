import requests

def google_books_search(query):
    url = f"https://www.googleapis.com/books/v1/volumes?q={query}&maxResults=5"
    resp = requests.get(url).json()

    resultados = []
    for item in resp.get("items", []):
        info = item.get("volumeInfo", {})
        resultados.append({
            "titulo": info.get("title"),
            "autor": ", ".join(info.get("authors", [])) if info.get("authors") else "Autor desconocido",
            "descripcion": info.get("description", ""),
            "portada": info.get("imageLinks", {}).get("thumbnail", "")
        })

    return resultados
