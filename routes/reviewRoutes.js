const express = require("express");
const { authenthicateUser } = require("../middleware/authentication");

const router = express.Router();
const {
  getAllReviews,
  getSingReview,
  deleteReview,
  updateReview,
  createReview,
} = require("../controllers/reviewController");

router.route("/").get(getAllReviews).post(authenthicateUser, createReview);
router
  .route("/:id")
  .get(getSingReview)
  .delete(authenthicateUser, deleteReview)
  .patch(authenthicateUser, updateReview);

module.exports = router;
