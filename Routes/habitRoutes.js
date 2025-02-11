const express = require("express");
const HabitController = require("../Controllers/habitController");
const authenticate = require("../middleware/authorization");

const router = express.Router();

router.post("/",HabitController.createHabit);

router.delete("/:id",authenticate, HabitController.deleteHabit);


router.put("/:id",authenticate,HabitController.editHabit);


router.patch("/:id/track",authenticate, HabitController.trackHabit);

router.get("/user/:userId", authenticate,HabitController.getHabits);

module.exports = router;