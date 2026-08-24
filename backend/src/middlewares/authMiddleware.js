const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');
const { error } = require('../utils/response');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return error(res, 'Not authorized, no token provided', 401);
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return error(res, 'Not authorized, user not found', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    return error(res, 'Not authorized, invalid or expired token', 401);
  }
};

module.exports = { protect };

