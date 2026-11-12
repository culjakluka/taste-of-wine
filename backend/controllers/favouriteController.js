const User = require("../models/userModel");
const Wine = require("../models/wineModel");
const mongoose = require("mongoose");

// Favourites live on the user's document, like the cart. Whose list it is
// comes from the token (req.user, set by requireAuth).

// sends the user's favourites with the wines filled in
const sendFavourites = async (userId, res) => {
  // populate replaces each wine id with the whole wine document
  const user = await User.findById(userId).populate("favourites");

  // a deleted wine is simply not returned by populate
  res.status(200).json(user.favourites);
};

// get my favourites
const getFavourites = async (req, res) => {
  try {
    await sendFavourites(req.user._id, res);
  } catch (error) {
    console.error("getFavourites error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// add a wine to my favourites
const addFavourite = async (req, res) => {
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

    // add it only if it isn't there already
    const alreadyThere = user.favourites.some((id) => id.equals(wineId));
    if (!alreadyThere) {
      user.favourites.push(wineId);
      await user.save();
    }

    await sendFavourites(req.user._id, res);
  } catch (error) {
    console.error("addFavourite error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// remove a wine from my favourites
const removeFavourite = async (req, res) => {
  const { wineId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(wineId)) {
    return res.status(404).json({ error: "No such wine." });
  }

  try {
    const user = await User.findById(req.user._id);

    user.favourites = user.favourites.filter((id) => !id.equals(wineId));
    await user.save();

    await sendFavourites(req.user._id, res);
  } catch (error) {
    console.error("removeFavourite error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getFavourites,
  addFavourite,
  removeFavourite,
};
