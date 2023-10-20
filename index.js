const express = require("express");
const cors = require("cors");
require("dotenv").config();
// require("./database"); // Connect to database
require("./config/cloudinary.config"); // Cloudinary config
const userRouter = require("./routes/user.routes");
const offerRouter = require("./routes/offer.routes");

// Create server
const app = express();

// Use express for JSON
app.use(express.json());

// Use cors
app.use(cors());

// Routes
app.use("/user", userRouter);
app.use("/offer", offerRouter);

// Start server
app.listen(3000, () => {
  console.log("listen server in port 3000");
});

app.listen();
