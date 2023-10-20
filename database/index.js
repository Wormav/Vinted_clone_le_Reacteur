const mongoose = require("mongoose");

const db = mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("Connexion établie avec la DB");
  })
  .catch((err) => console.error(err));

module.exports = db;
