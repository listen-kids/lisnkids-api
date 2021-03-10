const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
// Import model User and Children
const { users } = require("../models");
const { childrens } = require("../models");
const { avatars } = require("../models");
const formidable = require("express-formidable");

const { readdir } = require("fs");

const cloudinary = require("cloudinary").v2;
const { result } = require("lodash");

const fs = require("fs");
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
router.post(
   "/api/add_children",
   isAuthenticated,
   formidable(),
   async (req, res) => {
      try {
         // Search in the BDD.  Does a user have this email address ?

         const user = await users
            .findById(req.fields._id)
            .populate("childrens");

         if (!user) {
            res.status(409).json({ message: "User does not exist" });
         } else {
            // Test Limit 4

            if (user.childrens.length < 4) {
               if (user.childrens.length > 0) {
                  for (i = 0; i < user.childrens.length; i++) {
                     if (user.childrens[i].firstName === req.fields.firstName) {
                        res.status(400).json({
                           message: "children already exists",
                        });
                     }
                  }
               }

               const newChildren = new childrens({
                  firstName: req.fields.firstName,
                  avatar: {
                     nameAvatar: req.fields.nameAvatar,
                     daySelected: req.fields.daySelected,
                     dayUnselected: req.fields.dayUnselected,
                     nightSelected: req.fields.nightSelected,
                     nightUnselected: req.fields.nightUnselected,
                     onlySelected: req.fields.onlySelected,
                     onlyUnselected: req.fields.onlyUnselected,
                  },
                  age: req.fields.age,
                  createdAt: new Date(),
               });
               await newChildren.save();
               await user.childrens.push(newChildren);
               await user.save();
               const user1 = await users
                  .findById(req.fields._id)
                  .populate("childrens");
               res.status(200).json(user1);
            } else {
               res.status(400).json({
                  message: "Limit of 4 children exceeded",
               });
            }
         }
      } catch (error) {
         console.log(error.message);
         res.status(400).json({ message: error.message });
      }
   }
);

// Route Update Children
router.post(
   "/api/infoChildren",
   isAuthenticated,
   formidable(),
   async (req, res) => {
      try {
         // Search in the BDD.  Does a user have this email address ?
         const child = await childrens
            .findById(req.fields.idChildren)
            .populate("myPlaylists");
         if (!child) {
            res.status(409).json({ message: "child does not exist" });
         } else {
            res.status(400).json(child);
         }
      } catch (error) {
         console.log(error.message);
         res.status(400).json({ message: error.message });
      }
   }
);

// Route Update Children
router.post(
   "/api/update_children",
   isAuthenticated,
   formidable(),
   async (req, res) => {
      try {
         // Search in the BDD.  Does a user have this email address ?

         const child = await childrens.findById(req.fields._id);

         if (!child) {
            res.status(409).json({ message: "child does not exist" });
         } else {
            // required information ?
            if (
               req.fields.age ||
               req.fields.firstName ||
               req.fields.nameAvatar ||
               req.fields.daySelected ||
               req.fields.dayUnselected ||
               req.fields.nightSelected ||
               req.fields.nightUnselected ||
               req.fields.onlySelected ||
               req.fields.onlyUnselected
            ) {
               req.fields.nameAvatar &&
                  (child.avatar.nameAvatar = req.req.fields.nameAvatar);
               req.fields.firstName && (child.firstName = req.fields.firstName);
               req.fields.age && (child.age = req.fields.age);
               req.fields.daySelected &&
                  (child.avatar.daySelected = req.fields.daySelected);
               req.fields.dayUnselected &&
                  (child.avatar.dayUnselected = req.fields.dayUnselected);
               req.fields.nightSelected &&
                  (child.avatar.nightSelected = req.fields.nightSelected);
               req.fields.nightUnselected &&
                  (child.avatar.nightUnselected = req.fields.nightUnselected);
               req.fields.onlySelected &&
                  (child.avatar.onlySelected = req.fields.onlySelected);
               req.fields.onlyUnselected &&
                  (child.avatar.onlyUnselected = req.fields.onlyUnselected);
               // Save in the bdd :
               await child.save();
               res.status(200).json(child);
            } else {
               res.status(400).json({ message: "missing parameters" });
            }
         }
      } catch (error) {
         console.log(error.message);
         res.status(400).json({ message: error.message });
      }
   }
);

// Route Delete Children
router.post(
   "/api/delete_children",
   isAuthenticated,
   formidable(),
   async (req, res) => {
      try {
         // Search in the BDD.  Does a user have this id address ?
         console.log(req.fields);
         const user = await users
            .findById(req.fields._id)
            .populate("childrens");

         if (user) {
            for (i = 0; i < user.childrens.length; i++) {
               if (user.childrens[i].firstName === req.fields.firstName) {
                  user.childrens.splice(i, 1);
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
   }
);
module.exports = router;
