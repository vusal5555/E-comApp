const express = require("express");

const router = express.Router();
const {
  authenthicateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const {
  getAllUsers,
  getSingUser,
  showCurUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userController");

router
  .route("/")
  .get(authenthicateUser, authorizePermissions("admin", "owner"), getAllUsers);

router.route("/showme").get(authenthicateUser, showCurUser);
router.route("/updateUser").patch(authenthicateUser, updateUser);
router
  .route("/updateUserPassword")
  .patch(authenthicateUser, updateUserPassword);

router.route("/:id").get(authenthicateUser, getSingUser);

module.exports = router;
