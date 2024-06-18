const express = require("express");
const app = express();
const port = 3000;
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Define routes and middleware here
const cors = require("cors");

// Middleware for JSON parsing
app.use(express.json());

// Enable CORS
app.use(cors());
app.timeout = 600000;
app.get("/", (req, res) => {
  res.json("Hello, World!");
});

app.get("/switchOn", (req, res) => {
  res.json("switch is now ON");
});

app.post("/switchOn", (req, res) => {
  res.json("switch is now ON");
});

app.post("/tempchange", (req, res) => {
  const { newValue } = req.body;
  if (newValue) res.json(`temp is changed to ${newValue}`);
});

app.post("/switchOff", (req, res) => {
  res.json("switch is off ");
});

app.post("/alert", (req, res) => {
  const { message } = req.body;
  res.json("your alert is noted " + message);
});

app.post("/set-temp-range", (req, res) => {
  res.json("the temp range is set ");
});

app.get("/uploads/:filename", (req, res) => {
  try {
    const fileName = req.params.filename;
    const filePath = path.join(__dirname, "upload", fileName);
    const fileStream = fs.createReadStream(filePath);

    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    fileStream.pipe(res);
  } catch (err) {
    res.send(err);
  }
});
const getUrl = () => {
  const config = JSON.parse(fs.readFileSync("config.json"));
  return config.url;
};

// Update the URL in config.json
const setUrl = (url) => {
  const config = { url };
  fs.writeFileSync("config.json", JSON.stringify(config));
};

// API endpoint to fetch the configured URL
app.get("/get-url", (req, res) => {
  const url = getUrl();
  res.json({ url });
});

// API endpoint to set the URL
app.post("/set-url", (req, res) => {
  const { url } = req.body;
  setUrl(url);
  res.json({ message: "URL updated successfully" });
});

let sendingInterval;

// API endpoint to start sending data at a specified interval
app.post("/start-sending", (req, res) => {
  const { interval, temperatureRange, humidityRange, windSpeedRange } =
    req.body;

  // Validate the ranges
  if (
    !isValidRange(temperatureRange) ||
    !isValidRange(humidityRange) ||
    !isValidRange(windSpeedRange)
  ) {
    return res.status(400).json({ error: "Invalid range values" });
  }

  // Clear any existing interval
  clearInterval(sendingInterval);

  // Start sending data at the specified interval
  sendingInterval = setInterval(async () => {
    try {
      const url = getUrl();
      const data = {
        temperature: getRandomValueInRange(temperatureRange),
        humidity: getRandomValueInRange(humidityRange),
        windSpeed: getRandomValueInRange(windSpeedRange),
      };
      await axios.post(url, data);
      console.log("Data sent successfully");
    } catch (error) {
      console.error("Error sending data:", error);
    }
  }, interval);

  res.json({ message: "Data sending started" });
});

// API endpoint to stop sending data
app.post("/stop-sending", (req, res) => {
  clearInterval(sendingInterval);
  console.log("Stopped Sending Data");
  res.json({ message: "Data sending stopped" });
});

// Helper function to check if a range is valid
const isValidRange = (range) => {
  return Array.isArray(range) && range.length === 2 && range[0] <= range[1];
};

// Helper function to generate a random value within a range
const getRandomValueInRange = (range) => {
  return Math.random() * (range[1] - range[0]) + range[0];
};

// dummy comment

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// here is my comment
