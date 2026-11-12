const express = require("express");

// controller functions
const {
  getWineries,
  getWinery,
  createWinery,
  updateWinery,
  deleteWinery,
} = require("../controllers/wineryController");

// middleware
const requireAuth = require("../middleware/requireAuth");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

// every route below needs a valid token
router.use(requireAuth);

// GET all wineries
router.get("/", getWineries);

// GET a single winery (with its wines)
router.get("/:id", getWinery);

// POST a new winery (admin)
router.post("/", requireAdmin, createWinery);

// UPDATE a winery (admin)
router.patch("/:id", requireAdmin, updateWinery);

// DELETE a winery (admin)
router.delete("/:id", requireAdmin, deleteWinery);

module.exports = router;
