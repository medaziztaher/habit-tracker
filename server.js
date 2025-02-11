const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const authRoutes =require("./Routes/authRoutes")
const habitRoutes =require("./Routes/habitRoutes")
const userRoutes =require("./Routes/userRoutes")



dotenv.config();
console.log(process.env.PORT)

const app = express();
const server = http.createServer(app);



app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ useTempFiles: true }));
app.use(cookieParser());
require("./Configs/dbConnexion");

app.use("/api/users", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/habits", habitRoutes);


app.use(express.static(path.join(__dirname, "public")));



app.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
