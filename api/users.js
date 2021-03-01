const express = require("express");
const router = express.Router();

// uid2 et crypto-js crypt password
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

// Import model User and Children
const Users = require("../models/users");

const isAuthenticated = (req, res, next) => {
   if (req.headers.authorization === `Bearer ${process.env.ACCESS_TOKEN}`) {
      next();
   } else {
      res.json({ message: "Unauthorized" });
   }
};

// Route signup
router.post("/users/signup", isAuthenticated, async (req, res) => {
   console.log(req.body.email);

   try {
      // Search in the BDD.  Does a user have this email address ?
      const user = await Users.findOne({ email: req.body.email });

      // If ok, return a message and do not proceed with registration
      if (user) {
         res.status(409).json({ message: "This email already has an account" });
      } else {
         // required information ?
         if (req.body.email && req.body.password && req.body.userName) {
            const token = uid2(64);
            const salt = uid2(64);
            const hash = SHA256(req.body.password + salt).toString(encBase64);

            // create new user
            const newUser = new User({
               email: req.body.email,
               token: token,
               hash: hash,
               salt: salt,
               account: {
                  userName: req.body.userName,
                  languageDefault: req.body.languageDefault,
                  secretCode: req.body.secretcode,
                  isActif: true,
                  tutorialSeen: req.body.tutorialSeen,
               },
               createdAt: new Date(),
            });

            //  save this new user in the
            await newUser.save();
            res.status(200).json({
               _id: newUser._id,
               email: newUser.email,
               token: newUser.token,
               account: newUser.account,
            });
         } else {
            // user not sent the required information? ?
            res.status(400).json({ message: "Missing parameters" });
         }
      }
   } catch (error) {
      console.log(error.message);
      res.status(400).json({ message: error.message });
   }
});

router.post("/users/signin", isAuthenticated, async (req, res) => {
   try {
      const user = await Users.findOne({ email: req.fields.email });

      if (user) {
         if (
            SHA256(req.fields.password + user.salt).toString(encBase64) ===
            user.hash
         ) {
            res.status(200).json({
               _id: user._id,
               token: user.token,
               account: user.account,
            });
         } else {
            res.status(401).json({ error: "Unauthorized" });
         }
      } else {
         res.status(400).json({ message: "User not found" });
      }
   } catch (error) {
      console.log(error.message);
      res.json({ message: error.message });
   }
});

module.exports = router;
