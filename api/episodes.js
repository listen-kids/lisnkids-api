const express = require("express");
const router = express.Router();
const formidable = require("express-formidable");
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

router.post(
   "/api/add_episode",
   isAuthenticated,
   formidable(),
   async (req, res) => {
      try {
         const serie = await series.findById(req.fields.id);
         console.log(serie);

         if (!serie) {
            res.status(409).json({ message: "serie does not exist" });
         } else {
            if (serie.episodes.length > 0) {
               for (i = 0; i < serie.episodes.length; i++) {
                  if (serie.episodes[i].title === req.fields.title) {
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
               title: req.fields.title,
               image: result.secur_url,
               duration: req.fields.duration,
               author: req.fields.author,
               description: req.fields.description,
               audio: req.fields.audio,
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
   }
);

module.exports = router;
