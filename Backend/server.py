from fastapi import FastAPI, HTTPException, Response
from pymongo import MongoClient
from pydantic import BaseModel, EmailStr
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta, timezone
import secrets

user = FastAPI()

mongodb_uri = 'mongodb+srv://raghugaikwad8641:Raghugaikwad8@userinfo.d4n8sns.mongodb.net/?retryWrites=true&w=majority'
port = 8003
client = MongoClient(mongodb_uri, port)
db = client.get_database('Khatejao')
user_collection = db.users

class SignupForm(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone_number: str
    address: str

class LoginForm(BaseModel):
    email: EmailStr
    password: str

class UserLogout(BaseModel):
    session_token: str    

@user.post("/signup")
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
            "name": form.name,
            "email": form.email,
            "password": form.password,
            "phone_number": form.phone_number,
            "address": form.address,
        }

        user_collection.insert_one(user_data)

        return {"message": "Signup successful"}

    except Exception as e:
        return {"error": str(e)}

@user.get("/user/{email}")
async def get_user_details(email: str):
    try:
        user_data = user_collection.find_one({"email": email}, {"_id": 0, "name": 1, "address": 1, "phone_number": 1})

        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        return user_data

    except Exception as e:
        return {"error": str(e)}


@user.post("/login")
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

@user.post("/logout")
async def logout_user(
    user_logout: UserLogout,
    response: Response
):
    existing_user = user_collection.find_one({"session_token": user_logout.session_token})
    if not existing_user:
        raise HTTPException(status_code=404, detail="Session not found")
    user_collection.update_one({"session_token": user_logout.session_token}, {"$set": {"session_token": "", "token_expiration": ""}})
    response.status_code = 200
    return {"message": "Logout successful"}

    
user.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)    
