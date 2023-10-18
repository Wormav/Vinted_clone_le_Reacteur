const cloudinary = require("../config/cloudinary.config");
const Offer = require("../models/Offer.model");
const convertToBase64 = require("../utils/convertToBase64");

const publishOffer = async (req, res) => {
  console.log(req.body);
  try {
    // Get parameters
    const { title, description, price, condition, city, brand, size, color } =
      req.body;

    // Check if all parameters are provided
    if (
      !title ||
      !description ||
      !price ||
      !condition ||
      !city ||
      !brand ||
      !size ||
      !color
    ) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    // Create new offer
    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: parseInt(price),
      product_details: [
        { MARQUE: brand },
        { TAILLE: size },
        { ETAT: condition },
        { COULEUR: color },
        { EMPLACEMENT: city },
      ],
      owner: req.user,
    });

    // Check if pictures were uploaded
    if (req.files && req.files.picture) {
      const pictureToUpload = req.files.picture;
      const base64Image = convertToBase64(pictureToUpload);
      const result = await cloudinary.uploader.upload(base64Image, {
        folder: `vinted/offers/${newOffer._id}`,
      });
      newOffer.product_image = result; // Assuming product_image can store an array of URLs
    }

    await newOffer.save();

    if (!newOffer) {
      return res.status(400).json({ message: "Error while saving offer" });
    }

    // Populate offer with owner
    const populatedOffer = await Offer.findById(newOffer._id).populate({
      path: "owner",
      select: "_id account avatar",
    });

    // Check if offer was populated
    if (!populatedOffer) {
      return res.status(400).json({ message: "Error while retrieving offer" });
    }

    res.status(200).json({ message: "Offre crée", offer: populatedOffer });
  } catch (err) {
    // Send error response
    res
      .status(500)
      .json({ message: "Une erreur est survenue", err: err.message });
  }
};

module.exports = { publishOffer };
