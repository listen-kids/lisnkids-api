const express = require("express");
const router = express.Router();

// uid2 et crypto-js crypt password
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

// Import model User and Children
const { users } = require("../models");

const isAuthenticated = (req, res, next) => {
   if (req.headers.authorization === `Bearer ${process.env.ACCESS_TOKEN}`) {
      next();
   } else {
      res.json({ message: "Unauthorized" });
   }
};

// Route List User
router.get("/api/users", isAuthenticated, async (req, res) => {
   const user = await users.find();
   res.status(200).json(user);
});

// Route signup
router.post("/api/signup", isAuthenticated, async (req, res) => {
   try {
      // Search in the BDD.  Does a user have this email address ?
      const user = await users.findOne({ email: req.fields.email });

      // If ok, return a message and do not proceed with registration
      if (user) {
         res.status(409).json({ message: "This email already has an account" });
      } else {
         // required information ?
         if (req.fields.email && req.fields.password && req.fields.userName) {
            const token = uid2(64);
            const salt = uid2(64);
            const hash = SHA256(req.fields.password + salt).toString(encBase64);

            // create new user
            const newUser = new users({
               email: req.fields.email,
               token: token,
               hash: hash,
               salt: salt,
               account: {
                  userName: req.fields.userName,
                  guidance: req.fields.guidance,
                  languageDefault: req.fields.languageDefault,
                  secretCode: req.fields.secretCode,
               },
               childrens: [],
               isActif: true,
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

// Route update
router.post("/api/update", isAuthenticated, async (req, res) => {
   try {
      // Search in the BDD.  Does a user have this Id ?
      console.log(req.fields);
      const user = await users.findById(req.fields._id);

      // If ok, return a message and do not proceed with registration
      if (!user) {
         res.status(409).json({ message: "This user does not exist" });
      } else {
         // required information ?
         if (
            req.fields.email ||
            req.fields.userName ||
            req.fields.guidance ||
            req.fields.languageDefault ||
            req.fields.secretCode
         ) {
            req.fields.email && (user.email = req.fields.email);
            req.fields.userName &&
               (user.account.userName = req.fields.userName);
            req.fields.guidance &&
               (user.account.guidance = req.fields.guidance);
            req.fields.languageDefault &&
               (user.account.languageDefault = req.fields.languageDefault);
            req.fields.secretCode &&
               (user.account.secretCode = req.fields.secretCode);

            if (req.fields.password) {
               const salt = uid2(64);
               const hash = SHA256(req.fields.password + salt).toString(
                  encBase64
               );
               user.salt = salt;
               user.hash = hash;
            }
            // Save in the bdd :
            await user.save();
            res.status(200).json({
               _id: user._id,
               email: user.email,
               token: user.token,
               account: user.account,
            });
         } else {
            // user not sent the required information? ?
            res.status(400).json({ message: "Missing parameters" });
         }
      }
   } catch (error) {}
});

router.post("/api/signin", isAuthenticated, async (req, res) => {
   try {
      const user = await users.findOne({ email: req.fields.email });

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
