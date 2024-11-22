const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
require('dotenv').config();
// Middleware
app.use(express.json()); // To parse JSON request bodies
app.use(cors());
// Routes
app.get('/', (req, res) => {
  res.send('Welcome to My Express App!');
});


// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});