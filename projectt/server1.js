// backend/server.js
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "mindfuljourneysecret";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12958nikhil@",
  database: "mindful_journey",
});

db.connect(err => {
  if (err) console.error("❌ Database error:", err);
  else console.log("✅ Connected to mindful_journey DB");
});

// 🔹 Register
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const q = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.query(q, [name, email, hash], err => {
    if (err) return res.status(500).json({ error: "Registration failed" });
    res.json({ message: "Registered successfully" });
  });
});

// 🔹 Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM users WHERE email=?", [email], async (err, data) => {
    if (err || !data.length) return res.status(401).json({ error: "Invalid credentials" });
    const user = data[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Wrong password" });
    const token = jwt.sign({ id: user.id, name: user.name }, SECRET, { expiresIn: "2h" });
    res.json({ token, name: user.name });
  });
});

// 🔹 Verify Token
const verify = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ error: "No token" });
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};

// 🔹 Mood
app.post("/api/mood", verify, (req, res) => {
  const { mood, note } = req.body;
  db.query("INSERT INTO moods (user_id, mood, note, date) VALUES (?, ?, ?, CURDATE())",
    [req.user.id, mood, note],
    err => {
      if (err) return res.status(500).json({ error: "Failed to log mood" });
      res.json({ message: "Mood saved successfully!" });
    }
  );
});

app.get("/api/mood", verify, (req, res) => {
  db.query("SELECT * FROM moods WHERE user_id=? ORDER BY date DESC", [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error fetching moods" });
    res.json(rows);
  });
});

// 🔹 Journal
app.post("/api/journal", verify, (req, res) => {
  db.query("INSERT INTO journals (user_id, content, date) VALUES (?, ?, CURDATE())",
    [req.user.id, req.body.content],
    err => {
      if (err) return res.status(500).json({ error: "Failed to save journal" });
      res.json({ message: "Journal saved!" });
    }
  );
});

app.get("/api/journal", verify, (req, res) => {
  db.query("SELECT * FROM journals WHERE user_id=? ORDER BY date DESC", [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error fetching journals" });
    res.json(rows);
  });
});

// 🔹 Analytics
app.get("/api/analytics", verify, (req, res) => {
  db.query("SELECT date, mood FROM moods WHERE user_id=? ORDER BY date ASC", [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error fetching analytics" });
    res.json(rows);
  });
});

// 🔹 Quotes
const quotes = [
  "🌱 You are growing through what you’re going through.",
  "🌿 Take a deep breath — peace begins inside you.",
  "☀️ Every sunrise brings new hope.",
  "💚 You are enough, just as you are."
];
app.get("/api/quote", (req, res) => res.json({ quote: quotes[Math.floor(Math.random() * quotes.length)] }));

// 🔹 Server start
app.listen(5000, () => console.log("🚀 Backend running on http://localhost:5000"));
