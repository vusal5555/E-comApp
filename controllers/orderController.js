const Order = require("../model/Order");
const Product = require("../model/Product");
const { StatusCodes } = require("http-status-codes");
const {
  NotFoundError,
  BadRequestError,
  UnauthenticatedError,
} = require("../errors/index");

const checkPermissions = require("../utils/checkPermissions");
const { db } = require("../model/Review");

const fakeStripeApi = async ({ amount, currency }) => {
  const clientSecret = "someRandomValue";
  return { clientSecret, amount };
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json(orders);
};

const getSingOrder = async (req, res) => {
  const { id } = req.params;
  const order = await Order.findOne({ _id: id });

  if (!order) {
    throw new NotFoundError("No order found id");
  }

  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json(order);
};

const getCurUserOrders = async (req, res) => {
  const order = await Order.findOne({ user: req.user.id });

  if (!order) {
    throw new NotFoundError("No order found id");
  }

  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json(order);
};

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new BadRequestError("No cart items provided");
  }

  if (!tax || !shippingFee) {
    throw new BadRequestError("Please provide tax and shipping fee");
  }

  let orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new NotFoundError("No product found with that id");
    }
    const { name, price, image, _id } = dbProduct;

    const singleOrderItem = {
      amount: Number(item.amount),
      name,
      price,
      image,
      product: _id,
    };

    //add item to order
    orderItems = [...orderItems, singleOrderItem];
    subtotal += item.amount * price;
  }

  console.log(orderItems);
  console.log(subtotal);

  const total = tax + shippingFee + subtotal;

  //get client secret
  const paymentIntent = await fakeStripeApi({
    amount: total,
    currency: "usd",
  });

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.clientSecret,
    user: req.user.id,
  });
  res
    .status(StatusCodes.CREATED)
    .json({ order: order, clientSecret: order.clientSecret });
};

const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { paymentIntentId } = req.body;

  const { status } = req.body;

  const order = await Order.findOne({ _id: id }, req.body);

  if (!order) {
    throw new NotFoundError("No order found id");
  }

  checkPermissions(req.user, order.user);

  order.paymentIntentId = paymentIntentId;
  order.status = "paid";

  await order.save();
  res.status(StatusCodes.CREATED).json({ order });
};

module.exports = {
  getAllOrders,
  getCurUserOrders,
  getSingOrder,
  createOrder,
  updateOrder,
};
