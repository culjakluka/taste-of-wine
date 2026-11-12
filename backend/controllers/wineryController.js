const Winery = require("../models/wineryModel");
const Wine = require("../models/wineModel");
const mongoose = require("mongoose");

// get all wineries (sorted alphabetically)
const getWineries = async (req, res) => {
  try {
    const wineries = await Winery.find({});

    // "hr" so that Č, Š and Ž land in the right place
    wineries.sort((a, b) => a.name.localeCompare(b.name, "hr"));

    res.status(200).json(wineries);
  } catch (error) {
    console.error("getWineries error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// get a single winery together with its wines
const getWinery = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such winery." });
  }

  try {
    const winery = await Winery.findById(id);
    if (!winery) {
      return res.status(404).json({ error: "No such winery." });
    }

    // all wines that point to this winery
    const wines = await Wine.find({ winery: id }).sort({ name: 1 });

    res.status(200).json({ winery, wines });
  } catch (error) {
    console.error("getWinery error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// create a winery
const createWinery = async (req, res) => {
  const { name, country, region, foundedYear, description, logoUrl } = req.body;

  // collect empty required fields so the form can highlight them
  const emptyFields = [];
  if (!name) emptyFields.push("name");
  if (!country) emptyFields.push("country");
  if (!foundedYear) emptyFields.push("foundedYear");

  if (emptyFields.length > 0) {
    return res.status(400).json({ error: "Please fill in all fields", emptyFields });
  }

  try {
    const winery = await Winery.create({
      name,
      country,
      region,
      foundedYear,
      description,
      logoUrl,
    });
    res.status(201).json(winery);
  } catch (error) {
    console.error("createWinery error:", error);
    res.status(400).json({ error: error.message });
  }
};

// update a winery
const updateWinery = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such winery." });
  }

  try {
    const winery = await Winery.findOneAndUpdate(
      { _id: id },
      req.body,
      { new: true, runValidators: true } // vrati updateani dokument + provjeri schemu
    );
    if (!winery) {
      return res.status(404).json({ error: "No such winery." });
    }
    res.status(200).json(winery);
  } catch (error) {
    console.error("updateWinery error:", error);
    res.status(400).json({ error: error.message });
  }
};

// delete a winery (only if no wine uses it)
const deleteWinery = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such winery." });
  }

  try {
    // a winery that still has wines cannot be deleted
    const wineCount = await Wine.countDocuments({ winery: id });
    if (wineCount > 0) {
      return res.status(409).json({ error: "Winery still has wines.", wineCount });
    }

    const winery = await Winery.findOneAndDelete({ _id: id });
    if (!winery) {
      return res.status(404).json({ error: "No such winery." });
    }
    res.status(200).json(winery);
  } catch (error) {
    console.error("deleteWinery error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getWineries,
  getWinery,
  createWinery,
  updateWinery,
  deleteWinery,
};
