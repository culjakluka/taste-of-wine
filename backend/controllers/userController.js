const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

// login a user
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.login(username, password);

    // create a token
    const token = createToken(user._id);

    // role is sent so the frontend knows which buttons to show
    res.status(200).json({ username, userId: user._id, role: user.role, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// signup a user
const signupUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.signup(username, email, password);

    // no token here: after registering, the user is sent to the login page
    res.status(201).json({ username: user.username });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get all users (admin)
const getUsers = async (req, res) => {
  try {
    // "-password" leaves the password hash out of the answer
    const users = await User.find({}).select("-password").sort({ username: 1 });
    res.status(200).json(users);
  } catch (error) {
    console.error("getUsers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// change a user's role (admin)
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such user." });
  }

  // an admin can't change their own role, so there is always at least one admin
  if (req.user._id.equals(id)) {
    return res.status(400).json({ error: "You can't change your own role." });
  }

  try {
    const user = await User.findOneAndUpdate(
      { _id: id },
      { role },
      { new: true, runValidators: true } // vrati updateani dokument + provjeri schemu
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "No such user." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("updateUserRole error:", error);
    res.status(400).json({ error: error.message });
  }
};

// delete a user (admin)
const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such user." });
  }

  // an admin can't delete their own account
  if (req.user._id.equals(id)) {
    return res.status(400).json({ error: "You can't delete your own account." });
  }

  try {
    const user = await User.findOneAndDelete({ _id: id }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "No such user." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("deleteUser error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { signupUser, loginUser, getUsers, updateUserRole, deleteUser };
