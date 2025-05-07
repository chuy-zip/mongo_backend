import random
import string
from pymongo import MongoClient

# conexión
MONGO_URI = " "
DB_NAME = " "

# conexion a mongo
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# colecciones
users_collection = db["users"]
reviews_collection = db["reviews"]

# parametros iniciales
NUM_USERS = 10000
REVIEWS_PER_USER = 4
START_USER_ID = 25
START_REVIEW_ID = 10

# texto random para título y comentario
def random_text(length):
    return ''.join(random.choices(string.ascii_letters + string.digits + " ", k=length))

# direcciones default
addresses = ["casa1", "casa2", "casa3"]

# id por el que se iniciará a agregar documentos
current_review_id = START_REVIEW_ID

users_bulk = []
reviews_bulk = []

for user_id in range(START_USER_ID, START_USER_ID + NUM_USERS):
    # usuario
    user_doc = {
        "user_id": user_id,
        "user_name": f"user{user_id}",
        "password": "psswd123",
        "img": "",
        "admin": 0,
        "address": random.sample(addresses, k=random.randint(1, len(addresses))),
        "orders": [],
        "reviews": []
    }

    # reviews por usuario
    for _ in range(REVIEWS_PER_USER):
        review_doc = {
            "review_id": current_review_id,
            "user_id": user_id,
            "type": "restaurant",
            "rate": random.randint(1, 5),
            "title": random_text(10),
            "comment": random_text(30),
            "reviewed_item_id": str(random.randint(1, 4))
        }

        reviews_bulk.append(review_doc)
        user_doc["reviews"].append(current_review_id) # agrego las revies a cada usuario

        current_review_id += 1

    users_bulk.append(user_doc)


print("Agregando users...")
users_collection.insert_many(users_bulk)
print("Users agregados!")

print("Agregando reviews...")
reviews_collection.insert_many(reviews_bulk)
print("Reviews agregados!")

print("Se insertaron", NUM_USERS, "usuarios y", NUM_USERS * REVIEWS_PER_USER, "reseñas.")
