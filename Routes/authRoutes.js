const express = require("express");
const router = express.Router();
const Authetification = require("../Controllers/authController");
const upload = require("../middleware/upload");

router.post(
  "/register",
  upload.fields([{ name: "image", maxCount: 1 }]),
  Authetification.createAccount
);

router.post("/login", Authetification.login);

module.exports = router;