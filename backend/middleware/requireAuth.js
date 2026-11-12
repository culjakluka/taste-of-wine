const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// runs before protected controllers: no valid token -> 401 and the request stops here
const requireAuth = async (req, res, next) => {
  // header looks like: "Bearer eyJhbGciOi..."
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = authorization.split(" ")[1];

  try {
    // throws if the token is fake or expired
    const { _id } = jwt.verify(token, process.env.SECRET);

    // attach the user to the request so controllers know who is calling
    // (role is read from the database, so a role change counts immediately)
    req.user = await User.findOne({ _id }).select("_id username role");

    if (!req.user) {
      return res.status(401).json({ error: "Request is not authorized" });
    }

    next();
  } catch (error) {
    console.error("requireAuth error:", error.message);
    res.status(401).json({ error: "Request is not authorized" });
  }
};

module.exports = requireAuth;
