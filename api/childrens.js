const express = require("express");
const router = express.Router();
// Import model User and Children
const Users = require("../models/users");
const Childrens = require("../models/childrens");
const Avatars = require("../models/avatars");

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

router.post("/api/select_avatar", isAuthenticated, async (req, res) => {
   try {
      if (
         req.fields.name ||
         req.fields.selected ||
         req.fields.only ||
         req.fields.dayNight
      ) {
         console.log(req.fields);
         const params = [];

         req.fields.name && params.push({ name: `${req.fields.name}` });
         req.fields.selected &&
            params.push({ selected: `${req.fields.selected}` });
         req.fields.only && params.push({ only: `${req.fields.only}` });
         req.fields.dayNIght &&
            params.push({ dayNight: `${req.fields.dayNight}` });
         console.log(params);

         res.status(200).json(params);
         // const req = await Avatar.findOne({});
      } else {
         // user not sent the required information? ?
         res.status(400).json({ message: "Missing parameters" });
      }
   } catch (error) {}
});

router.get("/api/avatars", isAuthenticated, async (req, res) => {
   const avatar = await Avatars.find();
   res.status(200).json(avatar);
});

// Route Create Children
router.post("/api/add_children", isAuthenticated, async (req, res) => {
   try {
      // Search in the BDD.  Does a user have this email address ?

      const user = await Users.findById(req.fields._id).populate("children");

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
            // picture
            let pictureToUpload = req.files.avatar.path;
            const result = await cloudinary.uploader.upload(pictureToUpload);

            const newChildren = new Childrens({
               firstName: req.fields.firstName,
               avatar: result.secure_url,
               age: req.fields.age,
               createdAt: new Date(),
            });
            await newChildren.save();
            user.childrens.push(newChildren);
            user.save();
            res.status(200).json(user.childrens);
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
});

// Route Update Children
router.post("/api/update_children", isAuthenticated, async (req, res) => {
   try {
      // Search in the BDD.  Does a user have this email address ?

      const child = await Childrens.findById(req.fields._id);

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
      const user = await Users.findById(req.fields._id).populate("children");

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
});

//////////////////////////////////////
// reserve admin request for import avatars///------------------------------------------
//////////////////////////////////////
router.post("/api/add_avatars", isAuthenticated, async (req, res) => {
   try {
      const testFolder = "/Users/maxencederepas/Downloads/AVATARS";

      const files = await readdir(testFolder);
      for await (const file of files) {
         const words = file.split("_");
         let pictureToUpload = testFolder + "/" + file;
         const result = await cloudinary.uploader.upload(pictureToUpload, {
            folder: "/lisnkids-avatars",
         });

         let chaine1 = words[3].split(".");
         console.log(chaine1[0]);

         const newAvatar = new Avatars({
            title: words[1],
            selected: chaine1[0],
            dayNightOnly: words[2],
            extension: ".png",
            url: result.secure_url,
         });
         console.log(newAvatar);
         await newAvatar.save();
      }
      res.status(200).json({ message: "avatar save" });
   } catch (error) {
      console.log(error.message);
      res.status(400).json({ message: error.message });
   }
});

module.exports = router;
