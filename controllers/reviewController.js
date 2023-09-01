const Review = require("../model/Review");
const Product = require("../model/Product");
const { StatusCodes } = require("http-status-codes");
const {
  NotFoundError,
  BadRequestError,
  UnauthenticatedError,
} = require("../errors/index");

const checkPermissions = require("../utils/checkPermissions");

const createReview = async (req, res) => {
  const { product: productId } = req.body;

  const isValidProduct = await Product.findOne({ _id: productId });

  if (!isValidProduct) {
    throw new NotFoundError("please provide product");
  }

  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.id,
  });

  if (alreadySubmitted) {
    throw new BadRequestError("already submitted");
  }

  req.body.user = req.user.id;

  const review = await Review.create(req.body);

  if (!review) {
    throw new NotFoundError("please provide review");
  }
  res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({}).populate({
    path: "product",
    select: "name company price",
  });
  res.status(StatusCodes.OK).json({ reviews: reviews });
};

const getSingReview = async (req, res) => {
  const { id } = req.params;
  const review = await Review.findOne({ _id: id });

  if (!review) {
    throw new NotFoundError("no review found with that id");
  }
  res.status(StatusCodes.OK).json(review);
};

const updateReview = async (req, res) => {
  const { id } = req.params;
  const { title, rating, comment } = req.body;

  const review = await Review.findOne({ _id: id });

  if (!review) {
    throw new NotFoundError("no review found with that id");
  }

  checkPermissions(req.user, review.user);

  review.title = title;
  review.rating = rating;
  review.comment = comment;

  await review.save();

  res.status(StatusCodes.OK).json(review);
};

const deleteReview = async (req, res) => {
  const { id } = req.params;

  const review = await Review.findOne({ _id: id });

  if (!review) {
    throw new NotFoundError("no review found with that id");
  }

  checkPermissions(req.user, review.user);

  await review.remove();

  res.status(StatusCodes.OK).json({ msg: "review deleted" });
};

const getSingProductReviews = async (req, res) => {
  const { id } = req.params;

  const reviews = await Review.find({ product: id });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

module.exports = {
  createReview,
  getAllReviews,
  updateReview,
  getSingReview,
  deleteReview,
  getSingProductReviews,
};
