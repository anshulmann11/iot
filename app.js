const express = require("express");
const app = express();
const port = 3000;
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
  if (increment) res.json(`temp is changes to ${newValue}`);
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

// dummy comment

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// here is my comment
