const mongoose = require("mongoose");

const db = mongoose
  .connect("mongodb://localhost:27017/vinted")
  .then(() => {
    console.log("Connexion établie avec la DB");
  })
  .catch((err) => console.error(err));

module.exports = db;
