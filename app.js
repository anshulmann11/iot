const express = require('express');
const app = express();
const port = 3000;

// Define routes and middleware here
const cors = require('cors');

// Middleware for JSON parsing
app.use(express.json());

// Enable CORS
app.use(cors());

app.get('/', (req, res) => {
    res.json('Hello, World!');
  });
  

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
