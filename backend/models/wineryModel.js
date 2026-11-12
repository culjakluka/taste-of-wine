const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const winerySchema = new Schema(
  {
    name: { // naziv vinarije
      type: String,
      required: true,
    },
    country: { // država
      type: String,
      required: true,
    },
    region: { // regija, npr. "Kutjevo, Slavonija"
      type: String,
    },
    foundedYear: { // godina osnivanja
      type: Number,
      required: true,
    },
    description: { // kratki opis vinarije
      type: String,
    },
    logoUrl: { // url na logo vinarije
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Winery", winerySchema);
