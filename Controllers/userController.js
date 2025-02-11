const User = require("../Models/userModel")
const Habit = require("../Models/habitModel");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_API_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const updateProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { username, bio, preferences } = req.body;
        let profilePicture;


        if (req.files && req.files["image"]) {
            const file = req.files["image"][0];
            const result = await cloudinary.uploader.upload(file.path);
            profilePicture = result.secure_url;
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        if (username) user.username = username;
        if (bio) user.bio = bio;
        if (preferences) user.preferences = preferences;
        if (profilePicture) user.profilePicture = profilePicture;


        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                username: user.username,
                profilePicture: user.profilePicture,
                bio: user.bio,
                preferences: user.preferences,
            },
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
const userProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        const habits = await Habit.find({ userId });

        return res.status(200).json({
            message: "User profile fetched successfully",
            user: {
                ...user._doc,
                habits,
            },
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

const getLeaderboard = async (req, res) => {
    try {

        const users = await User.find()
            .select("-password")
            .sort({ points: -1 });

        return res.status(200).json({
            message: "Leaderboard fetched successfully",
            leaderboard: users,
        });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

const UserController = {
    updateProfile,
    getLeaderboard,
    userProfile
}

module.exports = UserController