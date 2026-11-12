const Wine = require("../models/wineModel");
const mongoose = require("mongoose");

// get all wines (sorted alphabetically by winery, then by wine name)
const getWines = async (req, res) => {
  try {
    // populate replaces the winery id with the whole winery document
    const wines = await Wine.find({}).populate("winery");

    // "hr" so that Č, Š and Ž land in the right place
    wines.sort((a, b) => {
      const byWinery = a.winery.name.localeCompare(b.winery.name, "hr");
      if (byWinery !== 0) {
        return byWinery;
      }
      return a.name.localeCompare(b.name, "hr");
    });

    res.status(200).json(wines);
  } catch (error) {
    console.error("getWines error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// get a single wine
const getWine = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such wine." });
  }

  try {
    const wine = await Wine.findById(id).populate("winery");
    if (!wine) {
      return res.status(404).json({ error: "No such wine." });
    }
    res.status(200).json(wine);
  } catch (error) {
    console.error("getWine error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// create a wine
const createWine = async (req, res) => {
  const { name, type, colour, alcohol, vintage, region, price, description, winery } = req.body;

  // collect empty required fields so the form can highlight them
  const emptyFields = [];
  if (!name) emptyFields.push("name");
  if (!type) emptyFields.push("type");
  if (alcohol === undefined || alcohol === "") emptyFields.push("alcohol");
  if (price === undefined || price === "") emptyFields.push("price");
  if (!winery) emptyFields.push("winery");

  if (emptyFields.length > 0) {
    return res.status(400).json({ error: "Please fill in all fields", emptyFields });
  }

  try {
    const wine = await Wine.create({
      name,
      type,
      colour,
      alcohol,
      vintage,
      region,
      price,
      description,
      winery,
    });
    res.status(201).json(wine);
  } catch (error) {
    console.error("createWine error:", error);
    res.status(400).json({ error: error.message });
  }
};

// update a wine
const updateWine = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such wine." });
  }

  try {
    const wine = await Wine.findOneAndUpdate(
      { _id: id },
      req.body,
      { new: true, runValidators: true } // vrati updateani dokument + provjeri schemu
    );
    if (!wine) {
      return res.status(404).json({ error: "No such wine." });
    }
    res.status(200).json(wine);
  } catch (error) {
    console.error("updateWine error:", error);
    res.status(400).json({ error: error.message });
  }
};

// delete a wine
const deleteWine = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such wine." });
  }

  try {
    const wine = await Wine.findOneAndDelete({ _id: id });
    if (!wine) {
      return res.status(404).json({ error: "No such wine." });
    }
    res.status(200).json(wine);
  } catch (error) {
    console.error("deleteWine error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getWines,
  getWine,
  createWine,
  updateWine,
  deleteWine,
};
