const express = require("express");

const router = express.Router();

const {
  authenthicateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const {
  getAllOrders,
  getSingOrder,
  getCurUserOrders,
  updateOrder,
  createOrder,
} = require("../controllers/orderController");

router
  .route("/")
  .get(authenthicateUser, authorizePermissions("admin"), getAllOrders)
  .post(authenthicateUser, createOrder);

router.route("/showAllMyOrders").get(authenthicateUser, getCurUserOrders);
router.route("/:id").get(authenthicateUser, getSingOrder);

router.route("/:id").patch(authenthicateUser, updateOrder);

module.exports = router;
