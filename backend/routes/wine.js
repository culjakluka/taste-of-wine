const express = require("express");

// controller functions
const {
  getWines,
  getWine,
  createWine,
  updateWine,
  deleteWine,
} = require("../controllers/wineController");

// middleware
const requireAuth = require("../middleware/requireAuth");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

// every route below needs a valid token
router.use(requireAuth);

// GET all wines
router.get("/", getWines);

// GET a single wine
router.get("/:id", getWine);

// POST a new wine (admin)
router.post("/", requireAdmin, createWine);

// UPDATE a wine (admin)
router.patch("/:id", requireAdmin, updateWine);

// DELETE a wine (admin)
router.delete("/:id", requireAdmin, deleteWine);

module.exports = router;
