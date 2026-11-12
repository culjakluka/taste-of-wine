const User = require("../models/userModel");
const Wine = require("../models/wineModel");
const mongoose = require("mongoose");

// The cart lives on the user's document. Whose cart it is comes from the
// token (req.user, set by requireAuth), never from the request body.

// sends the user's cart with the wines filled in
const sendCart = async (userId, res) => {
  // populate replaces each wine id in the cart with the whole wine document
  const user = await User.findById(userId).populate("cart.wine");

  // a wine that was deleted in the meantime comes back as null, leave it out
  const cart = user.cart.filter((line) => line.wine);

  res.status(200).json(cart);
};

// get my cart
const getCart = async (req, res) => {
  try {
    await sendCart(req.user._id, res);
  } catch (error) {
    console.error("getCart error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// add one bottle of a wine to my cart
const addToCart = async (req, res) => {
  const { wineId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(wineId)) {
    return res.status(404).json({ error: "No such wine." });
  }

  try {
    const wine = await Wine.findById(wineId);
    if (!wine) {
      return res.status(404).json({ error: "No such wine." });
    }

    const user = await User.findById(req.user._id);

    // already in the cart -> one more, otherwise a new line
    const line = user.cart.find((line) => line.wine.equals(wineId));
    if (line) {
      line.quantity += 1;
    } else {
      user.cart.push({ wine: wineId, quantity: 1 });
    }
    await user.save();

    await sendCart(req.user._id, res);
  } catch (error) {
    console.error("addToCart error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// set the quantity of a wine in my cart (0 or less removes it)
const updateCartLine = async (req, res) => {
  const { wineId } = req.params;
  const quantity = Number(req.body.quantity);

  if (!mongoose.Types.ObjectId.isValid(wineId)) {
    return res.status(404).json({ error: "No such wine." });
  }
  if (!Number.isInteger(quantity)) {
    return res.status(400).json({ error: "Quantity must be a whole number." });
  }

  try {
    const user = await User.findById(req.user._id);

    const line = user.cart.find((line) => line.wine.equals(wineId));
    if (!line) {
      return res.status(404).json({ error: "This wine is not in the cart." });
    }

    if (quantity <= 0) {
      user.cart = user.cart.filter((line) => !line.wine.equals(wineId));
    } else {
      line.quantity = quantity;
    }
    await user.save();

    await sendCart(req.user._id, res);
  } catch (error) {
    console.error("updateCartLine error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// remove a wine from my cart
const removeFromCart = async (req, res) => {
  const { wineId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(wineId)) {
    return res.status(404).json({ error: "No such wine." });
  }

  try {
    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter((line) => !line.wine.equals(wineId));
    await user.save();

    await sendCart(req.user._id, res);
  } catch (error) {
    console.error("removeFromCart error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// check out: the cart is emptied
const checkout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.cart = [];
    await user.save();

    res.status(200).json([]);
  } catch (error) {
    console.error("checkout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartLine,
  removeFromCart,
  checkout,
};
