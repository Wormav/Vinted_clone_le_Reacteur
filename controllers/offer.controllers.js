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
        const { title, description, price, condition, city, brand, size, color } = req.body;

        // Check if all parameters are provided
        if (!title || !description || !price || !condition || !city || !brand || !size || !color) {
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
        let productImagesArray = [];  // This array will store all the Cloudinary results for each image
        if (req.files && req.files.picture) {
            const picturesToUpload = Array.isArray(req.files.picture) ? req.files.picture : [req.files.picture];

            for (let i = 0; i < picturesToUpload.length; i++) {
                const pictureToUpload = picturesToUpload[i];
                const base64Image = convertToBase64(pictureToUpload);
                const result = await cloudinary.uploader.upload(base64Image, {
                    folder: `vinted/offers/${newOffer._id}`,
                });
                productImagesArray.push(result);
            }

            // Set the first image result to product_image
            newOffer.product_image = productImagesArray[0];

            // If there are more than one image, set the rest to product_pictures
            if (productImagesArray.length > 1) {
                newOffer.product_pictures = productImagesArray.slice(1);
            } else {
                newOffer.product_pictures = [];
            }
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
        res.status(500).json({ message: "Une erreur est survenue", err: err.message });
    }
};


const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "Missing offer id" });

    let offer = await Offer.findById(id);

    if (!offer) return res.status(400).json({ message: "Annonce non trouvé !" });

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
      deletePictures
    } = req.body;

    const checkMaxCharDescription = maxCharDescription(description);
    if (!checkMaxCharDescription)
      return res.status(400).json({
        message: "La description ne doit pas dépasser 500 caractères",
      });

    const checkMaxPrice = maxPrice(price);
    if (!checkMaxPrice)
      return res.status(400).json({
        message: "Le prix ne doit pas dépasser 100000 euros",
      });

    const maxTitle = maxCharTitle(title);
    if (!maxTitle)
      return res.status(400).json({
        message: "Le titre ne doit pas dépasser 50 caractères",
      });

    const updateFields = {
      product_name: title || offer.product_name,
      product_description: description || offer.product_description,
      product_price: price ? parseInt(price) : offer.product_price,
      product_details: {
        MARQUE: brand || offer.product_details.MARQUE,
        TAILLE: size || offer.product_details.TAILLE,
        ETAT: condition || offer.product_details.ETAT,
        COULEUR: color || offer.product_details.COULEUR,
        EMPLACEMENT: city || offer.product_details.EMPLACEMENT,
      },
    };

    // Handle main image update
    if (req.files && req.files.picture) {
      if (offer.product_image && offer.product_image.public_id) {
        await cloudinary.uploader.destroy(offer.product_image.public_id);
      }

      const pictureToUpload = req.files.picture[0]; // First picture
      const base64Image = convertToBase64(pictureToUpload);
      const result = await cloudinary.uploader.upload(base64Image, {
        folder: `vinted/offers/${offer._id}`,
      });

      updateFields.product_image = result;

      // Handle other images for product_pictures
      if (req.files.picture.length > 1) {
        const additionalPictures = req.files.picture.slice(1);
        for (let pic of additionalPictures) {
          const base64Pic = convertToBase64(pic);
          const additionalResult = await cloudinary.uploader.upload(base64Pic, {
            folder: `vinted/offers/${offer._id}`,
          });
          if (!updateFields.product_pictures) {
            updateFields.product_pictures = [];
          }
          updateFields.product_pictures.push(additionalResult);
        }
      }
    }

    // Handle deletion of main image
    if (deleteImage === "true" && offer.product_image && offer.product_image.public_id) {
      await cloudinary.uploader.destroy(offer.product_image.public_id);
      updateFields.product_image = null;
    }

    // Handle deletion of specific images from product_pictures
    if (deletePictures && Array.isArray(deletePictures) && deletePictures.length) {
      // Destroy images on cloudinary
      for (let publicId of deletePictures) {
        await cloudinary.uploader.destroy(publicId);
      }

      // Filter out the images from the offer's product_pictures array
      offer.product_pictures = offer.product_pictures.filter(
        pic => !deletePictures.includes(pic.public_id)
      );
    }

    offer = await Offer.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

    res.status(200).json({ message: "Annonce modifié", offer });
  } catch (err) {
    res.status(500).json({ message: "Une erreur est survenue", err: err.message });
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

const getOffers = async (req, res) => {
  try {
    // Get parameters
    let filters = {};
    const { title, priceMin, priceMax, sort, page } = req.query;
    const limit = 5;

    // Check if title, priceMin, priceMax are provided
    if (title) filters.product_name = new RegExp(title, "i");

    if (priceMin) {
      if (!filters.product_price) filters.product_price = {};
      filters.product_price.$gte = Number(priceMin);
    }

    if (priceMax) {
      if (!filters.product_price) filters.product_price = {};
      filters.product_price.$lte = Number(priceMax);
    }

    // Check if sort is provided
    let sortQuery = {};
    if (sort === "price-desc") {
      sortQuery = { product_price: -1 };
    } else if (sort === "price-asc") {
      sortQuery = { product_price: 1 };
    }

    // Check if page is provided
    const pageQuery = Number(page) || 1;

    // Get offers
    const offers = await Offer.find(filters)
      .sort(sortQuery)
      .skip((pageQuery - 1) * limit)
      .limit(limit)
      .populate({
        path: "owner",
        select: "_id account avatar",
      });

    // Get offers count
    const count = await Offer.countDocuments(filters);

    // Send response
    res.status(200).json({ count, offers });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Une erreur est survenue", error: err.message });
  }
};

const getOfferDetails = async (req, res) => {
  try {
    // Get offer id
    const { id } = req.params;

    // Check if offer id is provided
    if (!id) return res.status(400).json({ message: "Missing offer id" });

    // Get offer
    const offer = await Offer.findById(id).populate({
      path: "owner",
      select: "_id account avatar",
    });

    // Check if offer exists
    if (!offer) {
      return res.status(404).json({ message: "Annonce non trouvé" });
    }

    // Send response
    res.status(200).json({ offer });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Une erreur est survenue", error: err.message });
  }
};

module.exports = {
  publishOffer,
  updateOffer,
  deleteOffer,
  getOffers,
  getOfferDetails,
};
