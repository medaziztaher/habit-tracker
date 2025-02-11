const Habit = require("../Models/habitModel");
const User = require("../Models/userModel");


const BADGES = {
    SEVEN_DAY_STREAK: "7-Day Streak",
    THIRTY_HABITS_COMPLETED: "30 Habits Completed",
    FIFTY_POINTS: "50 Points Earned",
};



const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000]; 
const checkMilestones = async (user) => {
    const { streak, habitsCompleted, points } = user;

    if (streak >= 7 && !user.badges.includes(BADGES.SEVEN_DAY_STREAK)) {
        user.badges.push(BADGES.SEVEN_DAY_STREAK);
    }
    if (habitsCompleted >= 30 && !user.badges.includes(BADGES.THIRTY_HABITS_COMPLETED)) {
        user.badges.push(BADGES.THIRTY_HABITS_COMPLETED);
    }
    if (points >= 50 && !user.badges.includes(BADGES.FIFTY_POINTS)) {
        user.badges.push(BADGES.FIFTY_POINTS);
    }

    await user.save();
};


const checkLevelUp = async (user) => {
    const { points } = user;

    let newLevel = 1;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (points >= LEVEL_THRESHOLDS[i]) {
            newLevel = i + 1;
            break;
        }
    }

    if (newLevel > user.level) {
        user.level = newLevel;
        await user.save();
    }
};


const createHabit = async (req, res) => {
    try {
        const { userId, name, description } = req.body;

        if (!userId || !name) {
            return res.status(400).json({ message: "User ID and name are required" });
        }

        if (name.length > 50) {
            return res.status(400).json({ message: "Name must be less than 50 characters" });
        }

        if (description && description.length > 200) {
            return res.status(400).json({ message: "Description must be less than 200 characters" });
        }

        const newHabit = new Habit({
            userId,
            name,
            description,
        });

        await newHabit.save();

        return res.status(201).json({ message: "Habit created successfully", habit: newHabit });
    } catch (error) {
        console.error("Error creating habit:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

const deleteHabit = async (req, res) => {
    try {
        const { id } = req.params;

      
        const habit = await Habit.findById(id);
        if (!habit) {
            return res.status(404).json({ message: "Habit not found" });
        }

       
        if (habit.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only the creator can delete this habit.",
            });
        }

       
        await Habit.findByIdAndDelete(id);

        return res.status(200).json({ message: "Habit deleted successfully" });
    } catch (error) {
        console.error("Error deleting habit:", error);
        return res.status(500).json({ message: "Server error" });
    }
};


const editHabit = async (req, res) => {
    try {
        const { id } = req.params;
        const habit = await Habit.findById(id);
        if (!habit) {
            return res.status(404).json({ message: "Habit not found" });
        }

       
        if (habit.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only the creator can edit this habit.",
            });
        }
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        if (name.length > 50) {
            return res.status(400).json({ message: "Name must be less than 50 characters" });
        }

        if (description && description.length > 200) {
            return res.status(400).json({ message: "Description must be less than 200 characters" });
        }

        const updatedHabit = await Habit.findByIdAndUpdate(
            id,
            { name, description, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedHabit) {
            return res.status(404).json({ message: "Habit not found" });
        }

        return res.status(200).json({ message: "Habit updated successfully", habit: updatedHabit });
    } catch (error) {
        console.error("Error editing habit:", error);
        return res.status(500).json({ message: "Server error" });
    }
};


const trackHabit = async (req, res) => {
    try {
        const { id } = req.params;

       

        const { completed } = req.body;

        const habit = await Habit.findById(id);
        if (!habit) {
            return res.status(404).json({ message: "Habit not found" });
        }
        if (habit.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only the creator can track this habit.",
            });
        }
       
        habit.completed = completed;

       
        if (completed) {
            habit.streak += 1;
        } else {
            habit.streak = 0; 
        }

    
        await habit.save();

       
        const user = await User.findById(habit.user);
        if (completed) {
            user.points += 10;
            user.streak += 1; 
            user.habitsCompleted += 1;
            if (user.streak > user.longestStreak) {
                user.longestStreak = user.streak; 
            }
        } else {
            user.streak = 0; 
        }

      
        await checkMilestones(user);
        await checkLevelUp(user);

       
        await user.save();

        return res.status(200).json({
            message: "Habit tracked successfully",
            habit,
            user: {
                points: user.points,
                streak: user.streak,
                longestStreak: user.longestStreak,
                badges: user.badges,
                level: user.level,
            },
        });
    } catch (error) {
        console.error("Error tracking habit:", error);
        return res.status(500).json({ message: "Server error" });
    }
};


const getHabits = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, completed } = req.query;

        const query = { userId };
        if (completed !== undefined) {
            query.completed = completed === "true";
        }

        const habits = await Habit.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalHabits = await Habit.countDocuments(query);

        return res.status(200).json({
            message: "Habits fetched successfully",
            habits,
            totalHabits,
            totalPages: Math.ceil(totalHabits / limit),
            currentPage: parseInt(page),
        });
    } catch (error) {
        console.error("Error fetching habits:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

const HabitController = {
    createHabit,
    deleteHabit,
    editHabit,
    trackHabit,
    getHabits,
};

module.exports = HabitController;