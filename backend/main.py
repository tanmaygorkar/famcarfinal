import os
import json
import asyncio
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(title="FamilyCar API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "data", "listings.json")
PUBLIC_DIR = os.path.join(BASE_DIR, "public")

# Helper to read database
def read_db() -> Dict[str, List[Dict[str, Any]]]:
    try:
        if not os.path.exists(DATA_FILE):
            return {"cars": [], "bikes": []}
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print("Error reading database:", e)
        return {"cars": [], "bikes": []}

# Helper to write database
def write_db(data: Dict[str, List[Dict[str, Any]]]):
    try:
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print("Error writing database:", e)

# In-memory Mock conversations, matching exactly the Express backend structure
conversations = [
    {
        "id": "conv-1",
        "userId": "1",
        "userName": "Manish K.",
        "userAvatar": "M",
        "subject": "Hyundai Creta SX Opt",
        "image": "https://commons.wikimedia.org/wiki/Special:FilePath/2022_Hyundai_Creta_1.6_Plus_(Chile)_front_view.jpg?width=600",
        "lastMessage": "I can do 14.2L, final.",
        "time": "10:42 AM",
        "unread": 1,
        "messages": [
            { "sender": "system", "text": "Conversation started yesterday", "time": "Yesterday" },
            { "sender": "me", "text": "Hi, I am interested in your car. Is it still available? I am ready to close the deal this week.", "time": "Yesterday, 4:00 PM" },
            { "sender": "me", "type": "offer", "price": "₹ 14,00,000", "status": "pending", "time": "Yesterday, 4:05 PM" },
            { "sender": "them", "text": "Hello! Yes, it's available. However, 14L is a bit low for me. The car is in immaculate condition.", "time": "Yesterday, 5:30 PM" },
            { "sender": "them", "text": "I can do 14.2L, final. Let know if that works.", "time": "Today, 10:42 AM" }
        ]
    },
    {
        "id": "conv-2",
        "userId": "rahul-s",
        "userName": "Rahul S.",
        "userAvatar": "R",
        "subject": "Honda City ZX CVT",
        "image": "./Honda city (My listed car).webp",
        "lastMessage": "Is it still available?",
        "time": "Yesterday",
        "unread": 0,
        "messages": [
            { "sender": "system", "text": "Conversation started yesterday", "time": "Yesterday" },
            { "sender": "them", "text": "Is it still available?", "time": "Yesterday, 2:15 PM" }
        ]
    }
]

# --- REQUEST SCHEMAS ---
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    mobile: str
    password: str

class OtpSendRequest(BaseModel):
    mobile: str

class OtpVerifyRequest(BaseModel):
    mobile: str
    otp: str

class ProfileRequest(BaseModel):
    user: Dict[str, Any]

class ListingCreateRequest(BaseModel):
    vehicle: Dict[str, Any]

class ListingUpdateRequest(BaseModel):
    updateData: Dict[str, Any]

class ListingSoldRequest(BaseModel):
    sold: bool

class MessageSendRequest(BaseModel):
    convId: str
    text: str
    sender: str = "me"

class OfferCreateRequest(BaseModel):
    vehicleId: str
    offerPrice: str
    sellerName: str

# --- AUTH ENDPOINTS ---
@app.post("/api/auth/login")
def login(req: LoginRequest):
    email = req.email
    password = req.password

    if email == "1" and password == "1":
        user = {
            "name": "Manish Kumar",
            "email": "1",
            "mobile": "9876543210",
            "address": "Andheri West, Mumbai, Maharashtra 400053",
            "aadhaar": "123456789012",
            "dl": "MH-02-20150012345",
            "ownsCar": True,
            "ownsBike": False,
            "intentBuy": True,
            "intentSell": False,
            "completion": 100
        }
    else:
        user = {
            "name": email.split('@')[0] if '@' in email else "User",
            "email": email,
            "mobile": "9876543210",
            "address": "",
            "aadhaar": "",
            "dl": "",
            "ownsCar": False,
            "ownsBike": False,
            "intentBuy": False,
            "intentSell": False,
            "completion": 40
        }
    return {"success": True, "user": user}

@app.post("/api/auth/register")
def register(req: RegisterRequest):
    user = {
        "name": req.name,
        "email": req.email,
        "mobile": req.mobile,
        "address": "",
        "aadhaar": "",
        "dl": "",
        "ownsCar": False,
        "ownsBike": False,
        "intentBuy": False,
        "intentSell": False,
        "completion": 40
    }
    return {"success": True, "user": user}

@app.post("/api/auth/send-otp")
def send_otp(req: OtpSendRequest):
    return {"success": True, "message": f"OTP sent to {req.mobile}"}

@app.post("/api/auth/verify-otp")
def verify_otp(req: OtpVerifyRequest):
    user = {
        "name": "Manish Kumar",
        "email": "manish@example.com",
        "mobile": req.mobile,
        "address": "",
        "aadhaar": "",
        "dl": "",
        "ownsCar": False,
        "ownsBike": False,
        "intentBuy": False,
        "intentSell": False,
        "completion": 40
    }
    return {"success": True, "user": user}

@app.post("/api/auth/profile")
def profile(req: ProfileRequest):
    user = req.user
    user["completion"] = 100
    return {"success": True, "user": user}

# --- LISTINGS ENDPOINTS ---
@app.get("/api/listings")
def get_listings():
    return read_db()

@app.post("/api/listings")
def create_listing(req: ListingCreateRequest):
    vehicle = req.vehicle
    db = read_db()
    
    category = "bikes" if vehicle.get("category") == "bike" else "cars"
    new_id = f"{vehicle.get('category', 'car')}-{len(db[category]) + 1}"
    
    new_vehicle = {
        **vehicle,
        "id": new_id,
        "priceNumeric": float(vehicle.get("priceNumeric", 0)),
        "isVerified": vehicle.get("isVerified", False),
        "trustScore": vehicle.get("trustScore", 75),
        "interested": 0,
        "views": 0,
        "offersCount": 0,
        "sold": False
    }
    
    db[category].insert(0, new_vehicle)
    write_db(db)
    return {"success": True, "vehicle": new_vehicle}

@app.put("/api/listings/{id}")
def update_listing(id: str, req: ListingUpdateRequest):
    update_data = req.updateData
    db = read_db()
    found = False

    # Check in cars
    for idx, car in enumerate(db["cars"]):
        if car["id"] == id:
            db["cars"][idx] = {**car, **update_data}
            found = True
            break
            
    # Check in bikes
    if not found:
        for idx, bike in enumerate(db["bikes"]):
            if bike["id"] == id:
                db["bikes"][idx] = {**bike, **update_data}
                found = True
                break

    if found:
        write_db(db)
        return {"success": True, "message": "Listing updated successfully"}
    else:
        raise HTTPException(status_code=404, detail="Listing not found")

@app.post("/api/listings/{id}/sold")
def toggle_sold(id: str, req: ListingSoldRequest):
    sold = req.sold
    db = read_db()
    found = False

    for idx, car in enumerate(db["cars"]):
        if car["id"] == id:
            db["cars"][idx]["sold"] = sold
            db["cars"][idx]["status"] = "sold" if sold else "live"
            found = True
            break

    if not found:
        for idx, bike in enumerate(db["bikes"]):
            if bike["id"] == id:
                db["bikes"][idx]["sold"] = sold
                db["bikes"][idx]["status"] = "sold" if sold else "live"
                found = True
                break

    if found:
        write_db(db)
        return {"success": True, "message": f"Listing marked as {'sold' if sold else 'active'}"}
    else:
        raise HTTPException(status_code=404, detail="Listing not found")

@app.delete("/api/listings/{id}")
def delete_listing(id: str):
    db = read_db()
    initial_cars = len(db["cars"])
    db["cars"] = [c for c in db["cars"] if c["id"] != id]
    
    initial_bikes = len(db["bikes"])
    db["bikes"] = [b for b in db["bikes"] if b["id"] != id]

    if len(db["cars"]) < initial_cars or len(db["bikes"]) < initial_bikes:
        write_db(db)
        return {"success": True, "message": "Listing deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="Listing not found")

# --- MESSAGES CHAT ENDPOINTS ---
@app.get("/api/messages")
def get_messages():
    return conversations

# Simple background task to simulate active chat reply
async def simulate_reply(conv_id: str):
    await asyncio.sleep(1.5)
    for conv in conversations:
        if conv["id"] == conv_id:
            conv["messages"].append({
                "sender": "them",
                "text": "Thanks for your message! This is an automated simulator reply. I will check the details and get back to you shortly.",
                "time": "Just now"
            })
            conv["lastMessage"] = "Thanks for your message! This is..."
            break

@app.post("/api/messages")
def send_message(req: MessageSendRequest, background_tasks: BackgroundTasks):
    conv_id = req.convId
    text = req.text
    sender = req.sender

    found_conv = None
    for conv in conversations:
        if conv["id"] == conv_id:
            found_conv = conv
            break

    if not found_conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    new_message = {
        "sender": sender,
        "text": text,
        "time": "Just now"
    }
    found_conv["messages"].append(new_message)
    found_conv["lastMessage"] = text
    found_conv["time"] = "Just now"

    if sender == "me":
        background_tasks.add_task(simulate_reply, conv_id)

    return {"success": True, "conversations": conversations}

@app.post("/api/messages/offer")
def make_offer(req: OfferCreateRequest):
    vehicle_id = req.vehicleId
    offer_price = req.offerPrice
    seller_name = req.sellerName

    db = read_db()
    vehicle = None
    
    # search car or bike
    for car in db["cars"]:
        if car["id"] == vehicle_id:
            vehicle = car
            break
    if not vehicle:
        for bike in db["bikes"]:
            if bike["id"] == vehicle_id:
                vehicle = bike
                break

    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle listing not found")

    formatted_offer = f"₹ {int(offer_price):,}"

    # Check if conversation already exists
    existing_conv = None
    for conv in conversations:
        if conv["subject"] == vehicle["name"] and conv["userName"].startswith(seller_name.split(' ')[0]):
            existing_conv = conv
            break

    if existing_conv:
        existing_conv["messages"].append({
            "sender": "me",
            "type": "offer",
            "price": formatted_offer,
            "status": "pending",
            "time": "Just now"
        })
        existing_conv["lastMessage"] = f"You offered {formatted_offer}"
        existing_conv["time"] = "Just now"
        conv_id = existing_conv["id"]
    else:
        conv_id = f"conv-{len(conversations) + 1}"
        new_conv = {
            "id": conv_id,
            "userId": f"{vehicle_id}-seller",
            "userName": seller_name or "Seller",
            "userAvatar": (seller_name or "S").strip()[0].upper(),
            "subject": vehicle["name"],
            "image": vehicle["image"],
            "lastMessage": f"You offered {formatted_offer}",
            "time": "Just now",
            "unread": 0,
            "messages": [
                { "sender": "system", "text": "Conversation started just now", "time": "Just now" },
                { "sender": "me", "text": f"Hi {seller_name or 'there'}, I'm interested in your {vehicle['name']}. Here's my offer.", "time": "Just now" },
                { "sender": "me", "type": "offer", "price": formatted_offer, "status": "pending", "time": "Just now" }
            ]
        }
        conversations.insert(0, new_conv)

    return {"success": True, "convId": conv_id}

# --- STATIC FILES ROUTING ---
# Must be mounted AFTER API routes to prevent intercepting API requests
if os.path.exists(PUBLIC_DIR):
    app.mount("/", StaticFiles(directory=PUBLIC_DIR, html=True), name="public")
