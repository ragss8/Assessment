from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
from pydantic import BaseModel, EmailStr
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta, timezone,time
import secrets
from bson.objectid import ObjectId
from typing import Dict, List

app = FastAPI()

class SignupForm(BaseModel):
    restaurantName: str
    email: EmailStr
    password: str

class LoginForm(BaseModel):
    email: EmailStr
    password: str

class RestaurantForm(BaseModel):
    restaurantName: str
    address: str
    phoneNumber: str
    email: str
    cuisineType: str
    openingHours: time
    deliveryTime: str
    averageRating: float

class MenuItem(BaseModel):
    item_name: str
    description: str
    price: float
    ingredients: str

class Order(BaseModel):
    items: Dict[str, int]
    name: str
    phonenumber: str
    address: str

mongodb_uri = 'mongodb+srv://raghugaikwad8641:Raghugaikwad8@userinfo.d4n8sns.mongodb.net/?retryWrites=true&w=majority'
port = 8002
client = MongoClient(mongodb_uri, port)
db = client['Khatejao']
user_collection = db['Restaurant_management']
order_collection = db['Orders']    

@app.post("/restaurantsignup")
async def signup(form: SignupForm):
    try:
        user_exists = user_collection.find_one({"email": form.email})
        if user_exists:
            raise HTTPException(status_code=400, detail="User already exists. Please sign in.")

        if not any(char.isdigit() for char in form.password):
            raise HTTPException(status_code=400, detail="Password must contain at least one digit")

        if not any(char.isupper() for char in form.password):
            raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter")

        user_data = {
            "restaurantName": form.restaurantName,
            "email": form.email,
            "password": form.password,
        }

        user_collection.insert_one(user_data)

        return {"message": "Signup successful"}

    except Exception as e:
        return {"error": str(e)}

@app.post("/restologin")
def login(form: LoginForm):
    existing_user = user_collection.find_one({"email": form.email})

    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    if existing_user["password"] != form.password:
        raise HTTPException(status_code=401, detail="Invalid password")

    session_token = secrets.token_hex(16)
    token_expiration = datetime.now(timezone.utc) + timedelta(minutes=10)
    user_collection.update_one(
        {"email": form.email},
        {"$set": {"session_token": session_token, "token_expiration": token_expiration}}
    )
    return {"session_token": session_token, "message": "Login successful"}

#This is a endpoint to get all the restaurants in the user_collection
@app.get("/restaurants")
async def get_all_restaurants():
    try:
        restaurants = user_collection.find({})
        restaurant_list = []

        for restaurant in restaurants:
            restaurant_data = {
                "restaurantName": restaurant["restaurantName"],
                "address": restaurant["address"],
                "cuisineType": restaurant["cuisineType"],
                "deliveryTime": restaurant["deliveryTime"], 
                "averageRating": restaurant["averageRating"], 
            }
            restaurant_list.append(restaurant_data)

        return restaurant_list

    except Exception as e:
        return {"error": str(e)}

#Endpoint to get the _id or so called restaurant_id
@app.get("/get-user-id/{email}")
async def get_user_id(email: EmailStr):
    try:
        existing_user = user_collection.find_one({"email": email})
        if not existing_user:
            return {"error": "User not found"}

        return {"_id": str(existing_user["_id"])}

    except Exception as e:
        return {"error": str(e)}

# Endpoint for Updating the restaurant details
@app.put("/update-restaurant/{email}")
async def update_restaurant(email: EmailStr, form: RestaurantForm):
    try:
        existing_user = user_collection.find_one({"email": email})
        if not existing_user:
            return {"error": "User not found"}

        restaurant_data = {
            "restaurantName": form.restaurantName,
            "address": form.address,
            "phoneNumber": form.phoneNumber,
            "email": form.email,
            "cuisineType": form.cuisineType,
            "openingHours": form.openingHours.strftime('%H:%M'),
            "deliveryTime": form.deliveryTime,
            "averageRating": form.averageRating,
        }

        user_collection.update_one(
            {"email": email},
            {"$set": restaurant_data}
        )

        return {"message": "Restaurant information updated successfully"}

    except Exception as e:
        return {"error": str(e)}

#Endpoint to get Specific details of the restaurant to performs [task]
@app.get("/restaurant/{restaurant_id}")
async def get_restaurant(restaurant_id: str):
    try:
        restaurant_id = ObjectId(restaurant_id)
        restaurant_data = user_collection.find_one({"_id": restaurant_id})

        if restaurant_data:
            return {
                "restaurantName": restaurant_data["restaurantName"],
                "address": restaurant_data["address"],
                "phoneNumber": restaurant_data["phoneNumber"],
                "email": restaurant_data["email"]
            }
        else:
            return {"message": "Restaurant not found"}

    except Exception as e:
        return {"error": str(e)}

#Endpoint to store the menu item details into the restaurant
@app.post("/menu/{restaurant_id}")
def create_menu_item(restaurant_id: str, item: MenuItem):
    try:
        restaurant_id = ObjectId(restaurant_id)

        menu_data = {
            "item_name": item.item_name,
            "description": item.description,
            "price": item.price,
            "ingredients": item.ingredients
        }

        menu_item_id = ObjectId()
        menu_data["_id"] = menu_item_id

        user_collection.update_one(
            {"_id": restaurant_id},
            {"$push": {"menu": menu_data}}
        )

        return {"message": "Menu item created successfully"}

    except Exception as e:
        return {"error": str(e)}

#Endpoint to get the details of the menu stored in the restaurant
@app.get("/menu/id/{restaurant_id}")
def get_menu_items_by_id(restaurant_id: str):
    try:
        restaurant_id = ObjectId(restaurant_id)
        restaurant_data = user_collection.find_one({"_id": restaurant_id})

        if restaurant_data is None:
            return {"message": "Restaurant not found"}

        menu_items = restaurant_data.get("menu", ())

        formatted_menu_items = [
            {
                "item_name": item["item_name"],
                "description": item["description"],
                "price": item["price"],
                "ingredients": item["ingredients"],
            }
            for item in menu_items
        ]

        return {"menu": formatted_menu_items}

    except Exception as e:
        return {"error": str(e)}

@app.get("/menu/name/{restaurant_name}")
def get_menu_items_by_name(restaurant_name: str):
    try:
        restaurant_data = user_collection.find_one({"restaurantName": restaurant_name})

        if restaurant_data is None:
            return {"message": "Restaurant not found"}

        menu_items = restaurant_data.get("menu", ())

        formatted_menu_items = [
            {
                "item_name": item["item_name"],
                "description": item["description"],
                "price": item["price"],
                "ingredients": item["ingredients"],
            }
            for item in menu_items
        ]

        return {"menu": formatted_menu_items}

    except Exception as e:
        return {"error": str(e)}

@app.post("/orders/{restaurant_name}", response_model=dict)
async def place_order(restaurant_name: str, order: Order):
    try:
        restaurant_data = user_collection.find_one({"restaurantName": restaurant_name})

        if restaurant_data is None:
            return {"message": "Restaurant not found"}

        total_price = 0.0
        order_items = []

        for item_name, quantity in order.items.items():
            for item in restaurant_data.get("menu", ()):
                if item["item_name"] == item_name:
                    total_price += item["price"] * quantity
                    order_items.append({
                        "item_name": item["item_name"],
                        "quantity": quantity,
                        "price_per_item": item["price"],
                    })

        order_data = {
            "restaurant_name": restaurant_name,
            "total_price": total_price,
            "order_items": order_items,
            "name": order.name,
            "phonenumber": order.phonenumber,
            "address": order.address,
        }

        order_id = order_collection.insert_one(order_data).inserted_id

        return {
            "order_id": str(order_id),
            "restaurant_name": restaurant_name,
            "total_price": total_price,
            "order_items": order_items,
            "name": order.name,
            "phonenumber": order.phonenumber,
            "address": order.address,
        }

    except Exception as e:
        return {"error": str(e)}
    
@app.get("/orders/{order_id}", response_model=dict)
async def get_order(order_id: str):
    try:
        order_data = order_collection.find_one({"_id": ObjectId(order_id)})

        if order_data is None:
            return {"message": "Order not found"}

        return {
            "order_id": str(order_data["_id"]),
            "restaurant_name": order_data["restaurant_name"],
            "total_price": order_data["total_price"],
            "order_items": order_data["order_items"],
            "name": order_data["name"],
            "phonenumber": order_data["phonenumber"],
            "address": order_data["address"],
        }

    except Exception as e:
        return {"error": str(e)}    


@app.get("/orders/restaurant/{restaurant_name}", response_model=List[Order])
async def get_orders_by_restaurant(restaurant_name: str):
    try:
        orders = order_collection.find({"restaurant_name": restaurant_name})

        orders_list = [Order(**order) for order in orders]

        return orders_list

    except Exception as e:
        return {"error": str(e)}

#Endpoint to delete the menu item from the menu stored under the restaurant_id
@app.delete("/menu/{restaurant_id}/{item_name}")
def delete_menu_item(restaurant_id: str, item_name: str):
    try:
        restaurant_id = ObjectId(restaurant_id)

        restaurant_data = user_collection.find_one({"_id": restaurant_id})
        if restaurant_data is None:
            raise HTTPException(status_code=404, detail="Restaurant not found")

        menu_items = restaurant_data.get("menu", ())
        matching_items = [item for item in menu_items if item["item_name"] == item_name]

        if not matching_items:
            raise HTTPException(status_code=404, detail="Menu item not found")

        user_collection.update_one(
            {"_id": restaurant_id},
            {"$pull": {"menu": {"item_name": item_name}}}
        )

        return {"message": "Menu item deleted successfully"}

    except HTTPException as e:
        raise e

    except Exception as e:
        return {"error": str(e)}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)




# @app.get("/menu/{restaurant_id}")
# def get_menu_items(restaurant_id: str):
#     try:
#         restaurant_id = ObjectId(restaurant_id)
#         restaurant_data = user_collection.find_one({"_id": restaurant_id})

#         if restaurant_data is None:
#             return {"message": "Restaurant not found"}

#         menu_items = restaurant_data.get("menu", ())
#         print(menu_items)

#         formatted_menu_items = [{"menu_item_id": str(item["_id"]), **item} for item in menu_items]

#         return {"menu": formatted_menu_items}
#     except Exception as e:
#         return {"error": str(e)}

#@app.delete("/menu/{restaurant_id}/{menu_item_id}")
# def delete_menu_item(restaurant_id: str, menu_item_id: str):
#     restaurant_id = ObjectId(restaurant_id)
#     menu_item_id = ObjectId(menu_item_id)
    
#     result = user_collection.update_one(
#         {"_id": restaurant_id},
#         {"$pull": {"menu": {"_id": menu_item_id}}}
#     )
    
#     if result.modified_count > 0:
#         return {"message": "Menu item deleted successfully"}
#     else:
#         return {"message": "Menu item not found"}


 # photo: UploadFile
    # license: UploadFile
    # businessRegistration: UploadFile
    # healthAndSafetyCertificates: UploadFile
    # taxRegistration: UploadFile
# @app.post("/store-restaurant")
# async def store_restaurant(
#     form: RestaurantForm,
#     photo: UploadFile = File(...),
#     # license: UploadFile = File(...),
#     # businessRegistration: UploadFile = File(...),
#     # healthAndSafetyCertificates: UploadFile = File(...),
#     # taxRegistration: UploadFile = File(...)
# ):
#     try:
#         restaurant_data = {
#             "restaurantName": form.restaurantName,
#             "address": form.address,
#             "phoneNumber": form.phoneNumber,
#             "email": form.email,
#             "cuisineType": form.cuisineType,
#             "openingHours": form.openingHours.strftime('%H:%M'),
#             "deliveryTime": form.deliveryTime,
#             "averageRating": form.averageRating,
#         }
#         user_collection.insert_one(restaurant_data)

#         photo_id = gridfs.put(photo.file, filename=photo.filename)
#         # license_id = gridfs.put(license.file, filename=license.filename)
#         # businessRegistration_id = gridfs.put(businessRegistration.file, filename=businessRegistration.filename)
#         # healthAndSafetyCertificates_id = gridfs.put(
#         #     healthAndSafetyCertificates.file,
#         #     filename=healthAndSafetyCertificates.filename
#         # )
#         # taxRegistration_id = gridfs.put(taxRegistration.file, filename=taxRegistration.filename)

#         return {"message": "Restaurant information and files stored successfully"}

#     except Exception as e:
#         return {"error": str(e)}
    
