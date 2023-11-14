const stripe = require("stripe")(process.env.STRIPE_API_KEY);

const pay = async (req, res) => {
  try {
    const { stripeToken, amout, title } = req.body;

    const response = await stripe.charges.create({
      amout: amout * 100,
      currency: "eur",
      description: title,
      source: stripeToken,
    });
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Une erreur est survenue", err: err.message });
  }
};

module.exports = { pay };
