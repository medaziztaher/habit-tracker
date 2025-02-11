const mongoose= require("mongoose");

const habitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  description: { type: String, default: "" }, 
  streak: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  progress: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }, 
});

const HabitModel = mongoose.model('HabitSchema', habitSchema);

module.exports = HabitModel;
