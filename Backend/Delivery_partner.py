from fastapi import FastAPI,HTTPException,UploadFile,File
from pymongo import MongoClient
from pydantic import BaseModel,EmailStr
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta, timezone
import secrets

app1 = FastAPI()

class SignupForm(BaseModel):
    name: str
    phoneNumber: str
    email: EmailStr
    password: str

class LoginForm(BaseModel):
    email: EmailStr
    password: str   

class PartnerCredentials(BaseModel):
    vehicle_details: UploadFile
    photo: UploadFile     
   

mongodb_uri = 'mongodb+srv://raghugaikwad8641:Raghugaikwad8@userinfo.d4n8sns.mongodb.net/?retryWrites=true&w=majority'
port = 8001
client = MongoClient(mongodb_uri, port)
db = client['Khatejao']
user_collection = db['Delivery_management']


@app1.post("/Deliverysignup")
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
            "phoneNumber":form.phoneNumber,
            "email":form.email,
            "password":form.password,    
        }

        user_collection.insert_one(user_data)

        return {"message": "Signup successful for delivery"}

    except Exception as e:
        return {"error": str(e)}    

@app1.post("/DeliveryPartnerLogin")
async def login(form: LoginForm):
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

# @app1.post("/partner-credentials")
# async def submit_partner_credentials(vehicle_details: UploadFile = File(...), photo: UploadFile = File(...)):
#     user_collection.insert_one({
#         'vehicle_details': vehicle_details.filename,
#         'photo': photo.filename
#     })

#     return {"message": "Partner credentials submitted successfully"}


app1.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)  



