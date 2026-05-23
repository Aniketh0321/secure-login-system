require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();


// DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));


// TEMPLATE ENGINE
app.set("view engine", "ejs");


// MIDDLEWARE
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// STATIC FILES
app.use(express.static(path.join(__dirname, "public")));


// SECURITY
app.use(helmet());


// RATE LIMITER
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests"
});

app.use(limiter);


// SESSION
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,

        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI
        }),

        cookie: {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 1000 * 60 * 60
        }
    })
);


// ROUTES
app.use("/", authRoutes);


// HOME ROUTE
app.get("/", (req, res) => {
    res.redirect("/login");
});


// DASHBOARD
app.get("/dashboard", authMiddleware, (req, res) => {
    res.render("dashboard");
});


// SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});