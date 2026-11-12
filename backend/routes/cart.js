const express = require("express");

// controller functions
const {
  getCart,
  addToCart,
  updateCartLine,
  removeFromCart,
  checkout,
} = require("../controllers/cartController");

// middleware
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// every route below needs a valid token (the cart belongs to the logged-in user)
router.use(requireAuth);

// GET my cart
router.get("/", getCart);

// POST check out (empties the cart)
router.post("/checkout", checkout);

// POST one bottle of a wine into my cart
router.post("/:wineId", addToCart);

// UPDATE the quantity of a wine in my cart
router.patch("/:wineId", updateCartLine);

// DELETE a wine from my cart
router.delete("/:wineId", removeFromCart);

module.exports = router;
