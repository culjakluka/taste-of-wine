// use after requireAuth: logged in but not an admin -> 403
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Only admin can do this" });
  }
  next();
};

module.exports = requireAdmin;
