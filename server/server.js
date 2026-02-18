const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const twilio = require("twilio");
const path = require("path");

const app = express();
const PORT = 3000;

// Replace with your Twilio credentials
const client = new twilio("ACCOUNT_SID", "AUTH_TOKEN");

app.use(cors());
app.use(bodyParser.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, "..")));

// Shortcut URL
app.get("/ramramsena", (req, res) => {
  res.redirect("/pages/ramramsena.html#home");
});

// Twilio Call API
app.post("/api/call", async (req, res) => {
  const { from, to } = req.body;

  try {
    const call = await client.calls.create({
      url: "https://handler.twilio.com/twiml/EHxxxxxxxxxxxxxxxxxxxxx",
      to: to,
      from: from,
      statusCallback: "https://yourserver.com/call-status",
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      statusCallbackMethod: "POST",
    });

    res.json({
      success: true,
      message: "Call triggered successfully",
      sid: call.sid,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Call failed",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
