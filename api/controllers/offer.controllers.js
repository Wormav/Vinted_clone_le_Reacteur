const cloudinary = require("../config/cloudinary.config");
const Offer = require("../models/Offer.model");
const {
  maxCharDescription,
  maxPrice,
  maxCharTitle,
} = require("../utils/checkConditionOffer");
const convertToBase64 = require("../utils/convertToBase64");

const publishOffer = async (req, res) => {
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

    // Check description length
    const checkMaxCharDescription = maxCharDescription(description);

    if (!checkMaxCharDescription)
      return res.status(400).json({
        message: "La description ne doit pas dépasser 500 caractères",
      });

    // Check price
    const checkMaxPrice = maxPrice(price);

    if (!checkMaxPrice)
      return res.status(400).json({
        message: "Le prix ne doit pas dépasser 100000 euros",
      });

    // Check title length
    const maxTitle = maxCharTitle(title);

    if (!maxTitle)
      return res.status(400).json({
        message: "Le titre ne doit pas dépasser 50 caractères",
      });

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

const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "Missing offer id" });

    let offer = await Offer.findById(id);

    if (!offer)
      return res.status(400).json({ message: "Annonce non trouvé !" });

    if (offer.owner._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Vous n'avez pas le droit de modifier cette annonce !",
      });
    }

    const {
      title,
      description,
      price,
      condition,
      city,
      brand,
      size,
      color,
      deleteImage,
    } = req.body;

    // Check description length
    const checkMaxCharDescription = maxCharDescription(description);

    if (!checkMaxCharDescription)
      return res.status(400).json({
        message: "La description ne doit pas dépasser 500 caractères",
      });

    // Check price
    const checkMaxPrice = maxPrice(price);

    if (!checkMaxPrice)
      return res.status(400).json({
        message: "Le prix ne doit pas dépasser 100000 euros",
      });

    // Check title length
    const maxTitle = maxCharTitle(title);

    if (!maxTitle)
      return res.status(400).json({
        message: "Le titre ne doit pas dépasser 50 caractères",
      });

    // Check if user is authorized to update offer
    const updateFields = {
      product_name: title || offer.product_name,
      product_description: description || offer.product_description,
      product_price: price ? parseInt(price) : offer.product_price,
      product_details: {
        MARQUE: brand || offer.product_details.marque,
        TAILLE: size || offer.product_details.taille,
        ETAT: condition || offer.product_details.état,
        COULEUR: color || offer.product_details.couleur,
        EMPLACEMENT: city || offer.product_details.emplacement,
      },
    };

    // Check if user wants to delete image
    if (req.files && req.files.picture) {
      if (offer.product_image && offer.product_image.public_id) {
        await cloudinary.uploader.destroy(offer.product_image.public_id);
      }
      // Upload new image
      const pictureToUpload = req.files.picture;
      const base64Image = convertToBase64(pictureToUpload);
      const result = await cloudinary.uploader.upload(base64Image, {
        folder: `vinted/offers/${offer._id}`,
      });

      updateFields.product_image = result;
    } // Check if user wants to delete image
    else if (deleteImage === "true") {
      if (offer.product_image && offer.product_image.public_id) {
        await cloudinary.uploader.destroy(offer.product_image.public_id);
      }
      updateFields.product_image = null;
    }

    offer = await Offer.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    res.status(200).json({ message: "Annonce modifié", offer });
  } catch (err) {
    // Send error response
    res
      .status(500)
      .json({ message: "Une erreur est survenue", err: err.message });
  }
};

const deleteOffer = async (req, res) => {
  try {
    // Get offer id
    const { id } = req.params;

    // Check if offer id is provided
    if (!id) return res.status(400).json({ message: "Missing offer id" });

    // Check if offer exists
    const offer = await Offer.findById(id);

    // Check if offer exists
    if (!offer) {
      return res.status(404).json({ message: "Annonce non trouvé" });
    }

    if (offer.owner._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Vous êtes pas autorisé à supprimer cette annonce !",
      });
    }

    // Delete the Cloudinary folder
    if (offer.product_image && offer.product_image.public_id) {
      await cloudinary.api.delete_resources(offer.product_image.public_id);
    }

    // Delete the offer from the database
    const deleted = await Offer.deleteOne({ _id: id });

    if (!deleted)
      return res.status(400).json({ message: "Une erreur est survenue" });

    res.status(200).json({ message: "Annonce supprimé" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Une erreur est survenue", error: err.message });
  }
};

module.exports = { publishOffer, updateOffer, deleteOffer };
