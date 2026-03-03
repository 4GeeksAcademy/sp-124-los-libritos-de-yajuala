import json
from api.ai.groq_client import call_groq
from api.ai.agent_prompt import AGENT_PROMPT
from api.models import Book, UserCategoryPreference


def get_user_favorite_categories(user_id):
    prefs = UserCategoryPreference.query.filter_by(id_usuario=user_id).all()
    categorias = []

    for pref in prefs:
        if pref.categoria and hasattr(pref.categoria, "nombre"):
            categorias.append(pref.categoria.nombre)

    return categorias


def normalize_history(history):
    normalized = []
    for m in history:
        role = m.get("role", "")

        if role == "bot":
            role = "assistant"
        elif role == "user":
            role = "user"
        elif role == "system":
            role = "system"
        else:
            continue

        normalized.append({
            "role": role,
            "content": m.get("content", "")
        })

    return normalized


def agent_decide(user_message, history, user_id):
    normalized_history = normalize_history(history)

    fav_categories = get_user_favorite_categories(user_id)
    fav_text = ", ".join(
        fav_categories) if fav_categories else "ninguna categoría guardada"

    system_prompt = (
        AGENT_PROMPT +
        f"\n\nEl usuario tiene estas categorías favoritas: {fav_text}.\n"
        "Úsalas siempre como contexto para recomendaciones."
    )

    messages = [
        {"role": "system", "content": system_prompt},
        *normalized_history,
        {"role": "user", "content": user_message}
    ]

    raw = call_groq(messages)

    try:
        start = raw.index("{")
        end = raw.rindex("}") + 1
        json_text = raw[start:end]
        return json.loads(json_text)
    except Exception:
        print("\n\n🔥 ERROR PARSEANDO JSON 🔥")
        print(raw)
        print("🔥 FIN ERROR 🔥\n\n")

        return {
            "accion": "preguntar",
            "query": None,
            "respuesta": "No pude interpretar la respuesta del modelo, ¿podrías reformular?"
        }


def agent_generate_final_response(user_message, history, resultados, user_id):
    normalized_history = normalize_history(history)

    fav_categories = get_user_favorite_categories(user_id)
    fav_text = ", ".join(
        fav_categories) if fav_categories else "ninguna categoría guardada"

    system_prompt = (
        AGENT_PROMPT +
        f"\n\nEl usuario tiene estas categorías favoritas: {fav_text}.\n"
        "Úsalas siempre como contexto para recomendaciones."
    )

    messages = [
        {"role": "system", "content": system_prompt},
        *normalized_history,
        {"role": "user", "content": user_message},
        {"role": "system",
            "content": f"Resultados de la búsqueda: {json.dumps(resultados)}"}
    ]

    raw = call_groq(messages)

    try:
        parsed = json.loads(raw)
        texto = parsed.get("respuesta", raw)
    except:
        texto = raw

    libro_importado = None
    for r in resultados:
        existente = Book.query.filter_by(
            titulo=r.get("titulo"),
            autor=r.get("autor")
        ).first()
        if existente:
            libro_importado = r
            break

    acciones = []

    if libro_importado:
        return {
            "respuesta": texto,
            "libro": {
                "titulo": libro_importado.get("titulo"),
                "autor": libro_importado.get("autor"),
                "categoria": libro_importado.get("categoria")
            },
            "acciones": []
        }

    libro_externo = resultados[0] if resultados else None

    if not libro_externo:
        return {
        "respuesta": texto or "No encontré libros de esa categoría en nuestra base ni en fuentes externas. ¿Quieres que busque otro género o que solicite importación?",
        "acciones": [
            {
                "tipo": "solicitar_importacion",
                "label": "Solicitar importación",
                "payload": {
                    "titulo": decision.get("query"),
                    "autor": "Desconocido",
                    "categoria": decision.get("query")
                }
            }
        ]
    }

    titulo = libro_externo.get("titulo")
    autor = libro_externo.get("autor")

    libro_existente = Book.query.filter_by(
        titulo=titulo,
        autor=autor
    ).first()

    if not libro_existente:
        acciones.append({
            "tipo": "solicitar_importacion",
            "label": "Solicitar importación a proveedores",
            "payload": {
                "titulo": titulo,
                "autor": autor,
                "categoria": libro_externo.get("categoria")
            }
        })

    return {
        "respuesta": texto,
        "libro": {
            "titulo": titulo,
            "autor": autor,
            "categoria": libro_externo.get("categoria")
        },
        "acciones": acciones
    }
