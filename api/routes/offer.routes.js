const { Router } = require("express");
const fileUpload = require("express-fileupload");
const isAuthenticated = require("../middleware/isAuthenticated.middleware");
const { publishOffer } = require("../controllers/offer.controllers");

const offerRouter = Router();

offerRouter.post("/publish", isAuthenticated, fileUpload(), publishOffer);

module.exports = offerRouter;
