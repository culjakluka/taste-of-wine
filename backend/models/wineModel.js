const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const wineSchema = new Schema(
  {
    name: { // naziv vina
      type: String,
      required: true,
    },
    type: { // tip vina
      type: String,
      enum: ["Red", "White", "Rosé", "Sparkling", "Dessert"],
      required: true,
    },
    colour: { // boja, npr. "Deep garnet"
      type: String,
    },
    alcohol: { // postotak alkohola
      type: Number,
      required: true,
      min: 0,
      max: 25,
    },
    vintage: { // godina berbe
      type: Number,
    },
    region: { // regija iz koje vino dolazi
      type: String,
    },
    price: { // cijena u eurima
      type: Number,
      required: true,
      min: 0,
    },
    description: { // opis vina
      type: String,
    },
    winery: { // proizvođač, referenca na Winery dokument
      type: Schema.Types.ObjectId,
      ref: "Winery", // must equal the name in mongoose.model("Winery", ...)
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wine", wineSchema);
