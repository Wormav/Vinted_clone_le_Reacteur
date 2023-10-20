const User = require("../models/User.model");
const uid2 = require("uid2");
const { SHA256 } = require("crypto-js");
const encBase64 = require("crypto-js/enc-base64");
const cloudinary = require("../config/cloudinary.config");
const convertToBase64 = require("../utils/convertToBase64");

const signup = async (req, res) => {
  try {
    const { email, username, password, newsletter } = req.body;

    // Check if all parameters are provided
    if (!email || !username || !password || newsletter === undefined) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    // Check if email already exists
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email déjà utilisé" });

    // Create salt, hash and token
    const salt = uid2(16);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(16);

    // Create new user
    const newUser = new User({
      email,
      account: { username },
      newsletter,
      token,
      hash,
      salt,
    });

    // Handle avatar upload
    if (req.files && req.files.avatar) {
      const pictureToUpload = req.files.avatar; // <-- Ici
      const base64Avatar = convertToBase64(pictureToUpload);
      const result = await cloudinary.uploader.upload(base64Avatar, {
        folder: `vinted/users/${email}`,
      });
      newUser.account.avatar = result;
    }
    await newUser.save();

    // Send response
    res.status(200).json({
      _id: newUser._id,
      token: newUser.token,
      account: newUser.account,
    });
  } catch (err) {
    // Send error response
    res
      .status(500)
      .json({ message: "Une erreur est survenue", err: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if all parameters are provided
    if (!email || !password) {
      res.status(400).json({ message: "Missing parameters" });
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(400)
        .json({ message: "Cet email n'a pas était trouvé !" });

    // Check if password is correct
    const hashToCompare = SHA256(password + user.salt).toString(encBase64);
    if (user.hash === hashToCompare) {
      return res.status(200).json({
        _id: user._id,
        token: user.token,
        account: user.account,
      });
    } else {
      // Send error response
      return res.status(401).json({ message: "Mots de passe invalide !" });
    }
  } catch (err) {
    // Send error response
    res.status(500).json({ message: "Une erreur est survenue", err });
  }
};

module.exports = { signup, login };
