const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { // korisničko ime
    type: String,
    required: true,
    unique: true,
  },
  email: { // email adresa korisnika
    type: String,
    required: true,
    unique: true,
  },
  password: { // hash lozinke, nikad čista lozinka
    type: String,
    required: true,
  },
  role: { // uloga korisnika, samo admin smije CRUD
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  cart: [ // košarica: jedna stavka = vino + količina
    {
      _id: false, // stavke ne trebaju svoj id, prepoznajemo ih po vinu
      wine: {
        type: Schema.Types.ObjectId,
        ref: "Wine",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1,
      },
    },
  ],
  favourites: [ // lista favorita: reference na vina
    {
      type: Schema.Types.ObjectId,
      ref: "Wine",
    },
  ],
});

// static signup method
userSchema.statics.signup = async function (username, email, password) {
  // validation
  if (!username || !email || !password) {
    throw Error("All fields must be filled");
  }
  if (!validator.isEmail(email)) {
    throw Error("Email is not valid");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("Password not strong enough");
  }

  const exists = await this.findOne({ username });
  if (exists) {
    throw Error("Username already in use");
  }

  const emailExists = await this.findOne({ email });
  if (emailExists) {
    throw Error("Email already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  // role is never taken from the request, every new account is a normal user
  const user = await this.create({ username, email, password: hash });

  return user;
};

// static login method
userSchema.statics.login = async function (username, password) {
  if (!username || !password) {
    throw Error("All fields must be filled");
  }

  // same message for both cases, so nobody can find out which usernames exist
  const user = await this.findOne({ username });
  if (!user) {
    throw Error("Incorrect username or password");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw Error("Incorrect username or password");
  }

  return user;
};

module.exports = mongoose.model("User", userSchema);
