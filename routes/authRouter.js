const express = require("express");

const router = express.Router();

const { logOut, login, register } = require("../controllers/authController");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logOut);

module.exports = router;
