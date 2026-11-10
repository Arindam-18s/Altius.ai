// const jwt = require('jsonwebtoken');

// module.exports = function authMiddleware(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   const token      = authHeader && authHeader.split(' ')[1]; // Bearer <token>

//   if (!token) {
//     return res.status(401).json({ error: 'Access denied — no token provided' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user      = decoded;
//     next();
//   } catch (err) {
//     return res.status(403).json({ error: 'Invalid or expired token' });
//   }
// };

const jwt = require('jsonwebtoken');

// Verifies the Bearer token and attaches the decoded payload to req.user
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Use after requireAuth: restricts a route to the given roles
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Students may only access their own altius_id. Counselors and admins may access any.
function requireOwnStudent(req, res, next) {
  const targetAltiusId = req.params.altius_id || req.body.altius_id;
  if (req.user.role === 'student' && req.user.altius_id !== targetAltiusId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

module.exports = { requireAuth, requireRole, requireOwnStudent };