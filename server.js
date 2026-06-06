const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Claude API Keys (เก็บ server-side ปลอดภัย)
const CLAUDE_KEY = process.env.CLAUDE_KEY || "";
const SHOPEE_AFF = process.env.SHOPEE_AFF || "15342760183";
const TIKTOK_AFF = process.env.TIKTOK_AFF || "7070274679944889345";

app.use(express.json());
app.use(express.static("."));

// CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Claude proxy endpoint
app.post("/api/search", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt required" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    res.json({ result: data.content[0].text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Config endpoint (ส่ง affiliate IDs ไป frontend)
app.get("/api/config", (req, res) => {
  res.json({ shopee_aff: SHOPEE_AFF, tiktok_aff: TIKTOK_AFF });
});

app.listen(PORT, () => console.log("Thuukdee server running on port " + PORT));
