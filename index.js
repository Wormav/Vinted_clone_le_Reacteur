const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./database"); // Connect to database
require("./config/cloudinary.config"); // Cloudinary config
const userRouter = require("./routes/user.routes");
const offerRouter = require("./routes/offer.routes");
const stripeRouter = require("./routes/stripe.routes");

// Create server
const app = express();

// Use express for JSON
app.use(express.json());

// Use cors
app.use(cors());

// Routes
app.use("/user", userRouter);
app.use("/offer", offerRouter);
app.use("/pay", stripeRouter);

// Error 404
app.use("*", (req, res) => {
  res.status(404).json({ message: "Page not found" });
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(`listen server in port ${process.env.PORT}`);
});

app.listen();
