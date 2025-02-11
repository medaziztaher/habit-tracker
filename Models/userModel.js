const mongoose= require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default:"" },
    bio: { type: String, default: '' },
    points: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
    level:{ type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
