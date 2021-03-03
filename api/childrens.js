const express = require("express");
const router = express.Router();
// Import model User and Children
const User = require("../models/users");
const Children = require("../models/childrens");

const cloudinary = require("cloudinary").v2;
const { result } = require("lodash");
cloudinary.config({
   cloud_name: process.env.CLOUD_NAME,
   api_key: process.env.API_KEY,
   api_secret: process.env.API_SECRET,
});

const isAuthenticated = (req, res, next) => {
   if (req.headers.authorization === `Bearer ${process.env.ACCESS_TOKEN}`) {
      next();
   } else {
      res.json({ message: "Unauthorized" });
   }
};

// Route Create Children
router.post("/api/add_children", isAuthenticated, async (req, res) => {
   try {
      // Search in the BDD.  Does a user have this email address ?

      const user = await User.findById(req.fields._id).populate("children");

      if (!user) {
         res.status(409).json({ message: "User does not exist" });
      } else {
         // Test Limit 4
         if (user.children.length < 4) {
            if (user.children.length > 0) {
               for (i = 0; i < user.children.length; i++) {
                  if (user.children[i].firstName === req.fields.firstName) {
                     res.status(400).json({
                        message: "children already exists",
                     });
                  }
               }
            }
            // picture
            let pictureToUpload = req.files.avatar.path;
            const result = await cloudinary.uploader.upload(pictureToUpload);

            const newChildren = new Children({
               firstName: req.fields.firstName,
               avatar: result.secure_url,
               age: req.fields.age,
               createdAt: new Date(),
            });
            await newChildren.save();
            user.children.push(newChildren);
            user.save();
            res.status(200).json(user.children);
         } else {
            res.status(400).json({ message: "Limit of 4 children exceeded" });
         }
      }
   } catch (error) {
      console.log(error.message);
      res.status(400).json({ message: error.message });
   }
});

// Route Update Children
router.post("/api/update_children", isAuthenticated, async (req, res) => {
   try {
      // Search in the BDD.  Does a user have this email address ?

      const child = await Children.findById(req.fields._id);

      if (!child) {
         res.status(409).json({ message: "child does not exist" });
      } else {
         // required information ?
         if (req.files.avatar.path || req.fields.age || req.fields.firstName) {
            if (req.files.avatar.path) {
               // send picture on cloudinary
               let pictureToUpload = req.files.avatar.path;
               const result = await cloudinary.uploader.upload(pictureToUpload);
               child.avatar = result.secure_url;
            }

            req.fields.firstName && (child.firstName = req.fields.firstName);
            req.fields.age && (child.age = req.fields.age);

            // Save in the bdd :
            await child.save();
            res.status(200).json(child);
         }
      }
   } catch (error) {
      console.log(error.message);
      res.status(400).json({ message: error.message });
   }
});

// Route Delete Children
router.post("/api/delete_children", isAuthenticated, async (req, res) => {
   try {
      // Search in the BDD.  Does a user have this id address ?
      console.log(req.fields);
      const user = await User.findById(req.fields._id).populate("children");

      if (user) {
         for (i = 0; i < user.children.length; i++) {
            if (user.children[i].firstName === req.fields.firstName) {
               user.children.splice(i, 1);
               user.save();
               res.status(200).json({
                  message: "children deleted",
               });
            }
         }
         res.status(200).json({
            message: "children already deleted",
         });
      } else {
         res.status(409).json({ message: "User does not deleted" });
      }
   } catch (error) {
      console.log(error.message);
      res.status(400).json({ message: error.message });
   }
});

module.exports = router;
