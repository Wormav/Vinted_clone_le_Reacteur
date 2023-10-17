const { Router } = require("express");
const { signup, login } = require("../controllers/auth.controllers");

const userRouter = Router();

// Signup
userRouter.post("/signup", (req, res) => {
  signup(req, res);
});

// Login
userRouter.post("/login", (req, res) => {
  login(req, res);
});

module.exports = userRouter;
