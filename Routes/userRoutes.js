const express = require("express");
const UserController = require("../Controllers/userController");

const router = express.Router();

router.put("/:userId", UserController.updateProfile);


router.get("/:userId", UserController.userProfile);


router.get("/leaderboard", UserController.getLeaderboard);

module.exports = router;
