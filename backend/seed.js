// Fills the database with an admin account and a few wineries and wines.
// Run with: npm run seed
// Safe to run again: the admin is updated, wineries are added only if there are none.
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/userModel");
const Winery = require("./models/wineryModel");
const Wine = require("./models/wineModel");

const wineries = [
  {
    name: "Kozlović",
    country: "Croatia",
    region: "Momjan, Istria",
    foundedYear: 1904,
    description: "A family winery in the hills of northern Istria, known for Malvazija and Teran.",
    wines: [
      { name: "Malvazija", type: "White", colour: "Straw yellow", alcohol: 13.5, vintage: 2023, region: "Istria", price: 16, description: "Fresh and floral, with green apple and a slightly bitter almond finish." },
      { name: "Teran", type: "Red", colour: "Ruby", alcohol: 13, vintage: 2022, region: "Istria", price: 18, description: "Lively acidity, sour cherry and forest fruit." },
    ],
  },
  {
    name: "Krauthaker",
    country: "Croatia",
    region: "Kutjevo, Slavonia",
    foundedYear: 1992,
    description: "One of the best known names of Kutjevo, with vineyards on the slopes of Krndija.",
    wines: [
      { name: "Graševina", type: "White", colour: "Pale gold", alcohol: 13, vintage: 2023, region: "Slavonia", price: 14, description: "Graševina from the slopes above Kutjevo. Ripe apple, a touch of honey." },
      { name: "Zelenac", type: "White", colour: "Greenish yellow", alcohol: 12.5, vintage: 2022, region: "Slavonia", price: 17, description: "Light and aromatic, with citrus and fresh herbs." },
    ],
  },
  {
    name: "Stina",
    country: "Croatia",
    region: "Bol, Brač",
    foundedYear: 2009,
    description: "A winery in the old cooperative building on the waterfront of Bol.",
    wines: [
      { name: "Plavac Mali", type: "Red", colour: "Deep garnet", alcohol: 14.5, vintage: 2021, region: "Brač", price: 22, description: "Grown on steep south-facing slopes above Bol. Dark cherry and dried fig, firm tannins, a long salty finish." },
      { name: "Pošip", type: "White", colour: "Golden yellow", alcohol: 13.5, vintage: 2023, region: "Brač", price: 19, description: "Full and rounded, with apricot and Mediterranean herbs." },
    ],
  },
  {
    name: "Šember",
    country: "Croatia",
    region: "Plešivica",
    foundedYear: 1991,
    description: "A small family producer from Plešivica, known for sparkling wines made the traditional way.",
    wines: [
      { name: "Brut", type: "Sparkling", colour: "Pale straw", alcohol: 12, vintage: 2020, region: "Plešivica", price: 24, description: "Fine bubbles, green apple and fresh bread." },
      { name: "Rosé Brut", type: "Sparkling", colour: "Salmon pink", alcohol: 12, vintage: 2021, region: "Plešivica", price: 26, description: "Pinot noir sparkling wine with wild strawberry and a dry finish." },
    ],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to database");

    // admin account (signup can't create one, because it always makes a normal user)
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("Admin123!", salt);

    await User.findOneAndUpdate(
      { username: "admin" },
      { username: "admin", email: "admin@admin.com", password: hash, role: "admin" },
      { upsert: true } // napravi ga ako ne postoji
    );
    console.log("Admin account ready: admin / Admin123!");

    // wineries and wines, only into an empty database
    const wineryCount = await Winery.countDocuments({});
    if (wineryCount > 0) {
      console.log("Wineries already exist, skipping them");
    } else {
      for (const wineryData of wineries) {
        const { wines, ...wineryFields } = wineryData;
        const winery = await Winery.create(wineryFields);

        for (const wine of wines) {
          // every wine points to its winery through the winery's _id
          await Wine.create({ ...wine, winery: winery._id });
        }
        console.log("Added", winery.name, "with", wines.length, "wines");
      }
    }
  } catch (error) {
    console.error("seed error:", error);
  }

  await mongoose.disconnect();
};

seed();
