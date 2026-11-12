const express = require("express");

// controller functions
const {
  signupUser,
  loginUser,
  getUsers,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");

// middleware
const requireAuth = require("../middleware/requireAuth");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

// login route (no token needed, this is where the token comes from)
router.post("/login", loginUser);

// signup route (no token needed)
router.post("/signup", signupUser);

// GET all users (admin)
router.get("/", requireAuth, requireAdmin, getUsers);

// UPDATE a user's role (admin)
router.patch("/:id", requireAuth, requireAdmin, updateUserRole);

// DELETE a user (admin)
router.delete("/:id", requireAuth, requireAdmin, deleteUser);

module.exports = router;
