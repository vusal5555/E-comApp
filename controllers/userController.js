const User = require("../model/User");
const { StatusCodes } = require("http-status-codes");
const {
  NotFoundError,
  BadRequestError,
  UnauthenticatedError,
} = require("../errors/index");
const createUserToken = require("../utils/createTokeUser");
const { createCookie } = require("../utils/jwt");
const checkPermissions = require("../utils/checkPermissions");

const getAllUsers = async (req, res) => {
  console.log(req.user);
  const users = await User.find({ role: "user" }).select("-password");

  res.status(StatusCodes.OK).json({ users });
};

const getSingUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findOne({ _id: id, role: "user" }).select(
    "-password"
  );

  if (!user) {
    throw new NotFoundError("User not found");
  }
  checkPermissions(req.user, user._id);

  res.status(StatusCodes.OK).json({ user });
};

const showCurUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    throw new BadRequestError("Please provide old password and new password");
  }

  const user = await User.findOne({ _id: req.user.id });

  user.name = name;
  user.email = email;

  await user.save();

  const tokenUser = createUserToken(user);
  createCookie(res, tokenUser);

  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new BadRequestError("Please provide old password and new password");
  }

  const user = await User.findOne({ _id: req.user.id });

  const isPasswordCorrect = user.comparePassword(oldPassword);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("invalid credentials");
  }

  user.password = newPassword;

  await user.save();

  res.status(StatusCodes.CREATED).json(user);
};

module.exports = {
  getAllUsers,
  getSingUser,
  showCurUser,
  updateUser,
  updateUserPassword,
};

// const { name, email } = req.body;

//   if (!name || !email) {
//     throw new BadRequestError("Please provide old password and new password");
//   }

//   const user = await User.findOneAndUpdate({ _id: req.user.id }, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   const tokenUser = createUserToken(user);
//   createCookie(res, tokenUser);

//   res.status(StatusCodes.CREATED).json({ user: tokenUser });
