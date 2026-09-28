import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static images from root backend/public
app.use(express.static(path.join(__dirname, 'public')));

// Database files setup
const DATA_FILE = path.join(__dirname, 'data', 'listings.json');

// Mock User DB & State
let usersDB = {};
let activeSessions = {}; // Keep session info (token/user) simple

// Helper function to read database
function readDB() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { cars: [], bikes: [] };
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    return { cars: [], bikes: [] };
  }
}

// Helper function to write database
function writeDB(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing database:", error);
  }
}

// Mock Messages Database in-memory, resets on server restart, but is fully interactive!
let conversations = [
  {
    id: "conv-1",
    userId: "1", // मनीष
    userName: "Manish K.",
    userAvatar: "M",
    subject: "Hyundai Creta SX Opt",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/2022_Hyundai_Creta_1.6_Plus_(Chile)_front_view.jpg?width=600",
    lastMessage: "I can do 14.2L, final.",
    time: "10:42 AM",
    unread: 1,
    messages: [
      { sender: "system", text: "Conversation started yesterday", time: "Yesterday" },
      { sender: "me", text: "Hi, I am interested in your car. Is it still available? I am ready to close the deal this week.", time: "Yesterday, 4:00 PM" },
      { sender: "me", type: "offer", price: "₹ 14,00,000", status: "pending", time: "Yesterday, 4:05 PM" },
      { sender: "them", text: "Hello! Yes, it's available. However, 14L is a bit low for me. The car is in immaculate condition.", time: "Yesterday, 5:30 PM" },
      { sender: "them", text: "I can do 14.2L, final. Let know if that works.", time: "Today, 10:42 AM" }
    ]
  },
  {
    id: "conv-2",
    userId: "rahul-s",
    userName: "Rahul S.",
    userAvatar: "R",
    subject: "Honda City ZX CVT",
    image: "./Honda city (My listed car).webp",
    lastMessage: "Is it still available?",
    time: "Yesterday",
    unread: 0,
    messages: [
      { sender: "system", text: "Conversation started yesterday", time: "Yesterday" },
      { sender: "them", text: "Is it still available?", time: "Yesterday, 2:15 PM" }
    ]
  }
];

// --- AUTH API ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  let user;
  if (email === "1" && password === "1") {
    user = {
      name: "Manish Kumar",
      email: "1",
      mobile: "9876543210",
      address: "Andheri West, Mumbai, Maharashtra 400053",
      aadhaar: "123456789012",
      dl: "MH-02-20150012345",
      ownsCar: true,
      ownsBike: false,
      intentBuy: true,
      intentSell: false,
      completion: 100
    };
  } else {
    // Generic auto register
    user = {
      name: email.split('@')[0] || "User",
      email: email,
      mobile: "9876543210",
      address: "",
      aadhaar: "",
      dl: "",
      ownsCar: false,
      ownsBike: false,
      intentBuy: false,
      intentSell: false,
      completion: 40
    };
  }
  
  res.json({ success: true, user });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, mobile, password } = req.body;
  if (!name || !email || !mobile || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = {
    name,
    email,
    mobile,
    address: "",
    aadhaar: "",
    dl: "",
    ownsCar: false,
    ownsBike: false,
    intentBuy: false,
    intentSell: false,
    completion: 40
  };

  res.json({ success: true, user });
});

app.post('/api/auth/send-otp', (req, res) => {
  const { mobile } = req.body;
  if (!mobile) {
    return res.status(400).json({ message: "Mobile number is required" });
  }
  res.json({ success: true, message: `OTP sent to ${mobile}` });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp) {
    return res.status(400).json({ message: "Mobile and OTP are required" });
  }
  
  // Generic mock verify
  const user = {
    name: "Manish Kumar",
    email: "manish@example.com",
    mobile: mobile,
    address: "",
    aadhaar: "",
    dl: "",
    ownsCar: false,
    ownsBike: false,
    intentBuy: false,
    intentSell: false,
    completion: 40
  };
  
  res.json({ success: true, user });
});

app.post('/api/auth/profile', (req, res) => {
  const { user } = req.body;
  if (!user) {
    return res.status(400).json({ message: "User profile data is required" });
  }
  res.json({ success: true, user: { ...user, completion: 100 } });
});

// --- LISTINGS API ---
app.get('/api/listings', (req, res) => {
  const db = readDB();
  res.json(db);
});

app.post('/api/listings', (req, res) => {
  const { vehicle } = req.body;
  if (!vehicle) {
    return res.status(400).json({ message: "Vehicle details are required" });
  }

  const db = readDB();
  const category = vehicle.category === 'bike' ? 'bikes' : 'cars';
  
  const newId = `${vehicle.category}-${db[category].length + 1}`;
  const newVehicle = {
    ...vehicle,
    id: newId,
    priceNumeric: parseFloat(vehicle.priceNumeric || 0),
    isVerified: vehicle.isVerified || false,
    trustScore: vehicle.trustScore || 75,
    interested: 0,
    views: 0,
    offersCount: 0,
    sold: false
  };

  db[category].unshift(newVehicle);
  writeDB(db);
  
  res.json({ success: true, vehicle: newVehicle });
});

app.put('/api/listings/:id', (req, res) => {
  const { id } = req.params;
  const { updateData } = req.body;
  if (!updateData) {
    return res.status(400).json({ message: "Update data is required" });
  }

  const db = readDB();
  let found = false;
  
  // Try to find and update in cars
  const carIndex = db.cars.findIndex(item => item.id === id);
  if (carIndex !== -1) {
    db.cars[carIndex] = { ...db.cars[carIndex], ...updateData };
    found = true;
  }
  
  // Try to find and update in bikes if not found in cars
  if (!found) {
    const bikeIndex = db.bikes.findIndex(item => item.id === id);
    if (bikeIndex !== -1) {
      db.bikes[bikeIndex] = { ...db.bikes[bikeIndex], ...updateData };
      found = true;
    }
  }

  if (found) {
    writeDB(db);
    res.json({ success: true, message: "Listing updated successfully" });
  } else {
    res.status(404).json({ message: "Listing not found" });
  }
});

app.post('/api/listings/:id/sold', (req, res) => {
  const { id } = req.params;
  const { sold } = req.body;

  const db = readDB();
  let found = false;

  const carIndex = db.cars.findIndex(item => item.id === id);
  if (carIndex !== -1) {
    db.cars[carIndex].sold = sold;
    db.cars[carIndex].status = sold ? "sold" : "live";
    found = true;
  }

  if (!found) {
    const bikeIndex = db.bikes.findIndex(item => item.id === id);
    if (bikeIndex !== -1) {
      db.bikes[bikeIndex].sold = sold;
      db.bikes[bikeIndex].status = sold ? "sold" : "live";
      found = true;
    }
  }

  if (found) {
    writeDB(db);
    res.json({ success: true, message: `Listing marked as ${sold ? 'sold' : 'active'}` });
  } else {
    res.status(404).json({ message: "Listing not found" });
  }
});

app.delete('/api/listings/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  
  const initialCarsLength = db.cars.length;
  db.cars = db.cars.filter(item => item.id !== id);
  
  const initialBikesLength = db.bikes.length;
  db.bikes = db.bikes.filter(item => item.id !== id);

  if (db.cars.length < initialCarsLength || db.bikes.length < initialBikesLength) {
    writeDB(db);
    res.json({ success: true, message: "Listing deleted successfully" });
  } else {
    res.status(404).json({ message: "Listing not found" });
  }
});

// --- MESSAGES / CHAT API ---
app.get('/api/messages', (req, res) => {
  res.json(conversations);
});

app.post('/api/messages', (req, res) => {
  const { convId, text, sender = "me" } = req.body;
  if (!convId || !text) {
    return res.status(400).json({ message: "Conversation ID and message text are required" });
  }

  const conv = conversations.find(c => c.id === convId);
  if (!conv) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  const newMessage = {
    sender,
    text,
    time: "Just now"
  };

  conv.messages.push(newMessage);
  conv.lastMessage = text;
  conv.time = "Just now";
  
  // Set mock auto reply if message is sent by me
  if (sender === "me") {
    setTimeout(() => {
      conv.messages.push({
        sender: "them",
        text: `Thanks for your message! This is an automated simulator reply. I will check the details and get back to you shortly.`,
        time: "Just now"
      });
      conv.lastMessage = "Thanks for your message! This is...";
    }, 1500);
  }

  res.json({ success: true, conversations });
});

app.post('/api/messages/offer', (req, res) => {
  const { vehicleId, offerPrice, sellerName } = req.body;
  if (!vehicleId || !offerPrice) {
    return res.status(400).json({ message: "Vehicle ID and offer price are required" });
  }

  // Find if a conversation already exists
  const db = readDB();
  let vehicle = db.cars.find(c => c.id === vehicleId) || db.bikes.find(b => b.id === vehicleId);
  
  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle listing not found" });
  }

  const formattedOffer = `₹ ${parseInt(offerPrice).toLocaleString('en-IN')}`;
  
  // Check if we already have conv for this vehicle
  let conv = conversations.find(c => c.subject === vehicle.name && c.userName.startsWith(sellerName.split(' ')[0]));
  
  if (conv) {
    conv.messages.push({
      sender: "me",
      type: "offer",
      price: formattedOffer,
      status: "pending",
      time: "Just now"
    });
    conv.lastMessage = `You offered ${formattedOffer}`;
    conv.time = "Just now";
  } else {
    // Create new conversation
    const newConvId = `conv-${conversations.length + 1}`;
    conv = {
      id: newConvId,
      userId: vehicleId + "-seller",
      userName: sellerName || "Seller",
      userAvatar: (sellerName || "S").trim().charAt(0).toUpperCase(),
      subject: vehicle.name,
      image: vehicle.image,
      lastMessage: `You offered ${formattedOffer}`,
      time: "Just now",
      unread: 0,
      messages: [
        { sender: "system", text: "Conversation started just now", time: "Just now" },
        { sender: "me", text: `Hi ${sellerName || "there"}, I'm interested in your ${vehicle.name}. Here's my offer.`, time: "Just now" },
        { sender: "me", type: "offer", price: formattedOffer, status: "pending", time: "Just now" }
      ]
    };
    conversations.unshift(conv);
  }

  res.json({ success: true, convId: conv.id });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
