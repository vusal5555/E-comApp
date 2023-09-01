const { UnauthenticatedError, Unauthorized } = require("../errors/index");
const { isTokenValid } = require("../utils/jwt");

const authenthicateUser = async (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new UnauthenticatedError("authentication failed");
  }

  try {
    const payload = isTokenValid({ token });
    req.user = { name: payload.name, id: payload.userId, role: payload.role };
    next();
  } catch (error) {
    throw new UnauthenticatedError("authentication failed");
  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new Unauthorized("Forbidden to access this route");
    }
    next();
  };
};

module.exports = { authenthicateUser, authorizePermissions };
