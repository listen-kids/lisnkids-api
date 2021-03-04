const express = require("express");
const router = express.Router();

// Import model User and Children
const { avatars } = require("../models");

const isAuthenticated = (req, res, next) => {
   if (req.headers.authorization === `Bearer ${process.env.ACCESS_TOKEN}`) {
      next();
   } else {
      res.json({ message: "Unauthorized" });
   }
};

router.get("/api/avatars_all", isAuthenticated, async (req, res) => {
   const avatar = await avatars.find();
   res.status(200).json(avatar);
});

router.post("/api/avatars2", async (req, res) => {
   console.log(req.fields);
   console.log("toto");
   try {
      if (req.fields.title || req.fields.selected || req.fields.dayNightOnly) {
         console.log(req.fields);
         const paramsReceive = {};

         req.fields.title &&
            (paramsReceive.title = req.fields.title.toUpperCase());
         req.fields.selected &&
            (paramsReceive.selected = req.fields.selected.toUpperCase());
         req.fields.dayNIghtOnly &&
            (paramsReceive.dayNightOnly = req.fields.dayNightOnly.toUpperCase());

         console.log(paramsReceive);

         const response = await avatars.find(paramsReceive);
         res.json(response.url);
      } else {
         // user not sent the required information? ?
         res.status(400).json({ message: "Missing parameters" });
      }
   } catch (error) {
      console.log(error.message);
      res.status(400).json(error.message);
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

         const newAvatar = new avatars({
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
