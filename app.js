const express = require("express");
const app = express();
const port = 3010;
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const rateLimit = require("express-rate-limit"); // Add this line

// // Add these lines for API key
const API_KEY = "9f61e342-b040-48"; // Replace with a strong, randomly generated key
const FOTA_API_KEY = "6efd0"; // Separate key for FOTA endpoint

// Middleware for API key validation
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey && apiKey === API_KEY) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized: Invalid API key" });
  }
};

// Middleware for FOTA API key validation
const fotaApiKeyAuth = (req, res, next) => {
  const apiKey = req.headers["x-fota-api-key"];
  if (apiKey && apiKey === FOTA_API_KEY) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized: Invalid FOTA API key" });
  }
};

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(express.json());
app.use(cors());
// Apply API key middleware to all routes
// app.use(apiKeyAuth);
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
  const config = JSON.parse(fs.readFileSync("config2.json"));
  return config.url;
};

// Update the URL in config.json
const setUrl = (url) => {
  const config = { url };
  fs.writeFileSync("config2.json", JSON.stringify(config, null, 2));
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

// app.post("/fota", fotaApiKeyAuth, async (req, res) => {
//   const action = req.body.action;
//   const keep_settings = req.body.keep_settings;
//   const token = req.body.token;
//   let firmwareFile;

//   if (action === "downgrade") {
//     firmwareFile = "RUTX_R_00.07.06.10_WEBUI.bin";
//   } else if (action === "upgrade") {
//     firmwareFile = "RUTX_R_00.07.07.1_WEBUI.bin";
//   } else {
//     return res.status(400).send("Invalid action");
//   }

//   const filePath = path.join(__dirname, "upload", firmwareFile);
//   // return res.json(filePath);
//   try {
//     const form = new FormData();
//     form.append("keep_settings", keep_settings);
//     form.append("force_upgrade", "1");
//     form.append("file", fs.createReadStream(filePath));

//     const response = await axios.post(
//       "http://10.1.254.6/api/firmware/actions/upload_device_firmware",
//       form,
//       {
//         headers: {
//           ...form.getHeaders(),
//           Authorization: token,
//           maxContentLength: Infinity,
//           maxBodyLength: Infinity,
//           timeout: 300000, // 5 minutes in milliseconds
//         },
//       }
//     );

//     res.json(response.data);
//   } catch (error) {
//     console.error("Error details:", {
//       message: error.message,
//       status: error.response?.status,
//       statusText: error.response?.statusText,
//       data: error.response?.data.errors,
//       headers: error.response?.headers,
//     });
//     res.status(error.response?.status || 500).json({
//       error: "Error uploading firmware",
//       details: error.response?.data || error.message,
//     });
//     // res.status(500).send("Error uploading firmware");
//   }
// });

app.post("/application-data", async (req, res) => {
  res.json({
    message: "received data",
    ...req.body,
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// here is my comment
