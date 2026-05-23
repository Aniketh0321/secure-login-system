const express = require("express");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

const router = express.Router();

const User = require("../models/User");


// REGISTER PAGE
router.get("/register", (req, res) => {
    res.render("register");
});


// LOGIN PAGE
router.get("/login", (req, res) => {
    res.render("login");
});


// REGISTER USER
router.post(
    "/register",

    [
        body("username").notEmpty(),
        body("email").isEmail(),
        body("password").isLength({ min: 6 })
    ],

    async (req, res) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.send("Validation Error");
        }

        try {

            const { username, email, password } = req.body;

            const existingUser = await User.findOne({ email });

            if (existingUser) {
                return res.send("User already exists");
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new User({
                username,
                email,
                password: hashedPassword
            });

            await newUser.save();

            res.redirect("/login");

        } catch (error) {

            console.log(error);
            res.send("Server Error");

        }

    }
);


// LOGIN USER
router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.send("Invalid Email");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.send("Invalid Password");
        }

        req.session.user = user;

        res.redirect("/dashboard");

    } catch (error) {

        console.log(error);
        res.send("Login Error");

    }

});


// LOGOUT
router.get("/logout", (req, res) => {

    req.session.destroy(() => {
        res.redirect("/login");
    });

});

module.exports = router;