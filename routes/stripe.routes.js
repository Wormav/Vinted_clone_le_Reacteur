const { Router } = require("express");
const isAuthenticated = require("../middleware/isAuthenticated.middleware");
const { pay } = require("../controllers/stripe.controllers");
const stripeRouter = Router();

stripeRouter.post("/", isAuthenticated, pay);

module.exports = stripeRouter;
