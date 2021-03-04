const express = require("express");
const router = express.Router();

// Import model User and Children
const { series } = require("../models");

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

router.post("/api/add_episode", isAuthenticated, async (req, res) => {
   try {
      const serie = await series.findById(req.body.id);
      console.log(serie);

      if (!serie) {
         res.status(409).json({ message: "serie does not exist" });
      } else {
         if (serie.episodes.length > 0) {
            for (i = 0; i < serie.episodes.length; i++) {
               if (serie.episodes[i].title === req.body.title) {
                  res.status(400).json({
                     message: "episode in this serie already exists",
                  });
               }
            }
         }
         // picture
         let pictureToUpload = req.files.picture.path;
         const result = await cloudinary.uploader.upload(pictureToUpload);

         const newEpisode = new Episode({
            title: req.body.title,
            image: result.secur_url,
            duration: req.body.duration,
            author: req.body.author,
            description: req.body.description,
            audio: req.body.audio,
            nbDownload: 0,
            createdAt: new Date(),
            series: [serie],
         });
         await newEpisode.save();
         serie.episodes.push(newEpisode);
         await serie.save();

         res.status(200).json(newEpisode);
      }
   } catch (error) {
      console.log(error.message);
      res.status(400).json({ message: error.message });
   }
});
router.get("/api/episodes", isAuthenticated, async (req, res) => {
   const serie = await series.findById(req.query.id).populate("episodes");
   console.log(serie.episodes);
   if (serie) {
      res.status(200).json(serie);
   } else {
      res.status(400).json({ message: "serie not found" });
   }
});

module.exports = router;
