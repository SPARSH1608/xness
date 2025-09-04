const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'ex ness';

function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    // console.log("User authenticated:", req.user, decoded);
    const userId = req.user.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { authenticate };