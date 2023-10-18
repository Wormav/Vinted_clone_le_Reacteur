const User = require("../models/User.model");

const isAuthenticated = async (req, res, next) => {
  try {
    // Get authorization header
    const headerAuth = req.headers.authorization;

    // Check if authorization header is provided
    if (!headerAuth) {
      return res
        .status(401)
        .json({ message: "Aucun en-tête d'autorisation fourni." });
    }

    // Validate Bearer token format
    if (!headerAuth.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Format de l'en-tête d'autorisation incorrect." });
    }

    // Extract token from header
    const token = headerAuth.replace("Bearer ", "");

    // Check if authorization header is valid
    const user = await User.findOne({ token: token });

    // Check if user exists
    if (!user) {
      return res
        .status(401)
        .json({ message: "Token d'autorisation non valide." });
    }

    delete user.newsletter;
    delete user.token;
    delete user.hash;
    delete user.salt;

    req.user = user;
    next();
  } catch (err) {
    // Send error response
    res
      .status(500)
      .json({ message: "Une erreur est survenue", error: err.message });
  }
};

module.exports = isAuthenticated;
