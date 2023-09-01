const Product = require("../model/Product");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError, BadRequestError } = require("../errors/index");
const path = require("path");

const createProduct = async (req, res) => {
  req.body.user = req.user.id;
  const product = await Product.create(req.body);

  res.status(StatusCodes.CREATED).json(product);
};

const getAllProducts = async (req, res) => {
  const products = await Product.find({});

  res.status(StatusCodes.OK).json(products);
};

const getSingProduct = async (req, res) => {
  const { id } = req.params;

  const product = await Product.findOne({ _id: id }).populate("reviews");

  if (!product) {
    throw new NotFoundError("No product with that id found");
  }

  res.status(StatusCodes.OK).json(product);
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    throw new NotFoundError("No product with that id found");
  }

  res.status(StatusCodes.OK).json(product);
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findOne({ _id: id });

  if (!product) {
    throw new NotFoundError("No product with that id found");
  }

  await product.remove();
  res.status(StatusCodes.OK).json({ msg: "Item deleted successfully" });
};

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new BadRequestError("image not found");
  }

  const productImage = req.files.image;

  if (!productImage.mimetype.startsWith("image")) {
    throw new BadRequestError("please upload image");
  }

  const maxSize = 1024 * 1024;

  if (productImage.size > maxSize) {
    throw new BadRequestError("please upload image smaller that 1mb");
  }

  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );

  productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
