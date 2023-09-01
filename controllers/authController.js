const User = require("../model/User");
const { StatusCodes } = require("http-status-codes");
const {
  NotFoundError,
  BadRequestError,
  UnauthenticatedError,
} = require("../errors/index");
const { createJwt, isTokenValid, createCookie } = require("../utils/jwt");
const createUserToken = require("../utils/createTokeUser");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const emailAlreadyExists = await User.findOne({ email });

  if (emailAlreadyExists) {
    throw new BadRequestError("User exists with that email");
  }

  const isFirstAcc = (await User.countDocuments({})) === 0;
  const role = isFirstAcc ? "admin" : "user";

  if (!name || !email || !password) {
    throw new BadRequestError("Please provide all necessary credentials");
  }
  const user = await User.create({ name, email, password, role });

  if (!user) {
    throw new NotFoundError("No such user found");
  }

  const tokenUser = createUserToken(user);

  const token = createJwt(tokenUser);

  createCookie(res, token);
  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthenticatedError("Invalid credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("invalid credentials");
  }

  const tokenUser = createUserToken(user);

  const token = createJwt(tokenUser);

  createCookie(res, token);
  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const logOut = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out" });
};

module.exports = { register, logOut, login };
