const express = require("express");

const router = express.Router();
const {
  authenthicateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const {
  getAllProducts,
  getSingProduct,
  updateProduct,
  createProduct,
  uploadImage,
  deleteProduct,
} = require("../controllers/productController");

const { getSingProductReviews } = require("../controllers/reviewController");

router.route("/").get(getAllProducts);
router
  .route("/")
  .post([authenthicateUser, authorizePermissions("admin")], createProduct);

router
  .route("/uploadImage")
  .post([authenthicateUser, authorizePermissions("admin")], uploadImage);
router.route("/:id").get(getSingProduct);
router
  .route("/:id")
  .patch([authenthicateUser, authorizePermissions("admin")], updateProduct);
router
  .route("/:id")
  .delete([authenthicateUser, authorizePermissions("admin")], deleteProduct);

router.route("/:id/reviews").get(getSingProductReviews);

module.exports = router;
