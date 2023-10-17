const express = require("express");
require("./database"); // Connect to database
const bodyParser = require("body-parser");
const userRouter = require("./routes/user.routes");

// Create server
const app = express();

// Use body parser for JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.use("/user", userRouter);

// Start server
app.listen(3000, () => {
  console.log("listen server in port 3000");
});

app.listen();
