const express = require("express");

// controller functions
const {
  getFavourites,
  addFavourite,
  removeFavourite,
} = require("../controllers/favouriteController");

// middleware
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// every route below needs a valid token (the list belongs to the logged-in user)
router.use(requireAuth);

// GET my favourites
router.get("/", getFavourites);

// POST a wine into my favourites
router.post("/:wineId", addFavourite);

// DELETE a wine from my favourites
router.delete("/:wineId", removeFavourite);

module.exports = router;
