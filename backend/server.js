require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const wineRoutes = require("./routes/wine");
const wineryRoutes = require("./routes/winery");
const cartRoutes = require("./routes/cart");
const favouriteRoutes = require("./routes/favourite");

// express app
const app = express();

// middleware
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// routes
app.use("/api/user", userRoutes);
app.use("/api/wine", wineRoutes);
app.use("/api/winery", wineryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/favourite", favouriteRoutes);

// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// connect to database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    // listen for requests
    app.listen(process.env.PORT, () => {
      console.log("Connected to database & listening on port", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
