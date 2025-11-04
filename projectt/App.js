import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import Picker from "emoji-picker-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./App.css";
import logo from "./assets/logo.png";
import Chart from "chart.js/auto";

const API = "http://localhost:5000/api";

// 🌿 Navbar
function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <img src={logo} alt="Mindful Journey" className="logo" />
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/mood">Mood</Link>
            <Link to="/journal">Journal</Link>
            <Link to="/analytics">Analytics</Link>
            <Link to="/hrv">HRV</Link>
            <button onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

// 🏡 Home
function Home() {
  return (
    <div className="home">
      <h1>
        Welcome to <span>Mental Wellness Journey 🌿</span>
      </h1>
      <p>
        Track your mood, write journals, analyze your emotions, and check your
        HRV health.
      </p>
      <Link to="/register" className="btn">
        Get Started
      </Link>
    </div>
  );
}

// 🧍‍♂️ Register
function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`${API}/register`, form);
    alert("Registered Successfully!");
    navigate("/login");
  };

  return (
    <div className="auth-container">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

// 🔑 Login
function Login({ setUser }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/login`, form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", res.data.name);
      setUser(res.data.name);
      navigate("/dashboard");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="auth-container">
      <h2>Welcome Back</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">Login</button>
      </form>
      <p>
        New user? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

// 🧘 Dashboard
function Dashboard() {
  const [quote, setQuote] = useState("");
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    axios.get(`${API}/quote`).then((res) => setQuote(res.data.quote));
    const savedStreak = localStorage.getItem("streak") || 0;
    setStreak(parseInt(savedStreak) + 1);
    localStorage.setItem("streak", parseInt(savedStreak) + 1);
  }, []);

  return (
    <div className="dashboard">
      <h2>Hello 🌞</h2>
      <p>
        Your current streak: <strong>{streak} days</strong>
      </p>
      <blockquote>“{quote}”</blockquote>
      <Link to="/mood" className="btn">
        Log Your Mood
      </Link>
    </div>
  );
}

// 😃 Mood Tracker (Enhanced)
function MoodTracker() {
  const [mood, setMood] = useState("");
  const [note, setNote] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(null);

  const handleMoodSelect = (emojiObject) => {
    setMood(emojiObject.emoji);
    setSelectedEmoji(emojiObject.emoji);
    setShowEmoji(false);
  };

  const handleMood = async () => {
    if (!mood) {
      alert("Please pick a mood emoji!");
      return;
    }
    const token = localStorage.getItem("token");
    await axios.post(
      `${API}/mood`,
      { mood, note },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Mood saved successfully!");
    setNote("");
    setSelectedEmoji(null);
  };

  return (
    <div className="mood-container">
      <h2>How are you feeling today?</h2>
      <button className="emoji-btn" onClick={() => setShowEmoji(!showEmoji)}>
        😀 Pick Emoji
      </button>

      {showEmoji && (
        <div className="emoji-picker">
          <Picker onEmojiClick={handleMoodSelect} />
        </div>
      )}

      {selectedEmoji && (
        <h3 style={{ fontSize: "2rem", margin: "10px 0" }}>
          You selected: {selectedEmoji}
        </h3>
      )}

      <textarea
        placeholder="Write your thoughts..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button onClick={handleMood}>Save Mood</button>
    </div>
  );
}

// 📓 Journal
function Journal() {
  const [content, setContent] = useState("");
  const [entries, setEntries] = useState([]);

  const fetchJournals = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API}/journal`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setEntries(res.data);
  };

  const addJournal = async () => {
    const token = localStorage.getItem("token");
    await axios.post(
      `${API}/journal`,
      { content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setContent("");
    fetchJournals();
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  return (
    <div className="journal-container">
      <h2>Daily Journal</h2>
      <textarea
        placeholder="Reflect on your day..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={addJournal}>Save Entry</button>
      <div className="journal-entries">
        {entries.map((e, i) => (
          <div key={i} className="entry">
            <p>{e.content}</p>
            <small>{e.date}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

// 📈 Analytics (Enhanced Mood Graph)
function Analytics() {
  const [data, setData] = useState([]);

  const moodToScore = (emoji) => {
    switch (emoji) {
      case "😀":
        return 5;
      case "🙂":
        return 4;
      case "😐":
        return 3;
      case "😟":
        return 2;
      case "😣":
        return 1;
      default:
        return 3;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API}/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const formatted = res.data.map((entry) => ({
          date: entry.date,
          mood: moodToScore(entry.mood),
          emoji: entry.mood,
        }));
        setData(formatted);
      });
  }, []);

  return (
    <div className="analytics-container">
      <h2>Your Mood Patterns 📊</h2>
      {data.length === 0 ? (
        <p>No mood data yet. Log your mood to see your emotional patterns!</p>
      ) : (
        <>
          <ResponsiveContainer width="90%" height={320}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                domain={[1, 5]}
                tickFormatter={(v) =>
                  ["😣", "😟", "😐", "🙂", "😀"][v - 1]
                }
              />
              <Tooltip
                formatter={(value) => ["😣", "😟", "😐", "🙂", "😀"][value - 1]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#2e7d32"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="legend">
            <p>😀 Excellent</p>
            <p>🙂 Good</p>
            <p>😐 Neutral</p>
            <p>😟 Low</p>
            <p>😣 Very Low</p>
          </div>
        </>
      )}
    </div>
  );
}

// ❤️ HRV Calculator
function HRVCalculator() {
  const [input, setInput] = useState("");
  const [rmssd, setRmssd] = useState(null);
  const [level, setLevel] = useState("");
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const calculateHRV = () => {
    const rr = input
      .split(",")
      .map((n) => Number(n.trim()))
      .filter(Boolean);

    if (rr.length < 2) {
      alert("Please enter at least 2 RR intervals!");
      return;
    }

    let diffs = [];
    for (let i = 1; i < rr.length; i++) diffs.push(rr[i] - rr[i - 1]);
    const sqDiffs = diffs.map((d) => d * d);
    const meanSq = sqDiffs.reduce((a, b) => a + b, 0) / sqDiffs.length;
    const rmssdVal = Math.sqrt(meanSq);
    setRmssd(rmssdVal.toFixed(2));

    let color = "";
    if (rmssdVal > 80) {
      setLevel("Very Low Stress 🌿");
      color = "#00C853";
    } else if (rmssdVal > 60) {
      setLevel("Low Stress 🙂");
      color = "#AEEA00";
    } else if (rmssdVal > 40) {
      setLevel("Moderate Stress 😐");
      color = "#FFD600";
    } else if (rmssdVal > 20) {
      setLevel("High Stress 😟");
      color = "#FF6D00";
    } else {
      setLevel("Very High Stress 😣");
      color = "#D50000";
    }

    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = chartRef.current.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, color + "AA");
    gradient.addColorStop(1, color + "00");

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: rr.map((_, i) => `Beat ${i + 1}`),
        datasets: [
          {
            label: "RR Intervals (ms)",
            data: rr,
            borderColor: color,
            backgroundColor: gradient,
            fill: true,
            borderWidth: 3,
            pointBackgroundColor: color,
            tension: 0.4,
          },
        ],
      },
      options: {
        animation: { duration: 1500, easing: "easeOutQuart" },
        scales: {
          x: { ticks: { color: "#1b5e20" } },
          y: { ticks: { color: "#1b5e20" } },
        },
        plugins: { legend: { labels: { color: "#1b5e20" } } },
      },
    });
  };

  return (
    <div className="analytics-container">
      <h2>❤️ HRV (RMSSD) Calculator</h2>
      <p>Enter your RR intervals (in milliseconds, comma-separated):</p>
      <input
        placeholder="e.g. 820, 830, 810, 790, 805, 815"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={calculateHRV}>Calculate HRV</button>

      {rmssd && (
        <div className="result-box">
          <h3>💓 HRV (RMSSD): {rmssd} ms</h3>
          <h3>
            🧠 Stress Level: <span>{level}</span>
          </h3>
        </div>
      )}

      <canvas ref={chartRef} height="100" />
    </div>
  );
}

// 🌿 Main App
function App() {
  const [user, setUser] = useState(localStorage.getItem("user"));
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
  };

  return (
    <div className="App">
      <Navbar user={user} onLogout={logout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mood" element={<MoodTracker />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/hrv" element={<HRVCalculator />} />
      </Routes>
    </div>
  );
}

export default App;

