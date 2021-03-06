const express = require("express");
const router = express.Router();
const formidable = require("express-formidable");
// Import model User and Children
const { series } = require("../models");
const { episodes } = require("../models");

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

// Route Update Children
router.post(
   "/api/infoEpisode",
   isAuthenticated,
   formidable(),
   async (req, res) => {
      try {
         const episode = await episodes.findById(req.fields.idEpisode);
         if (!episode) {
            res.status(409).json({ message: "episode does not exist" });
         } else {
            res.status(200).json(episode);
         }
      } catch (error) {
         console.log(error.message);
         res.status(400).json({ message: error.message });
      }
   }
);

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

            const newEpisode = new episodes({
               title: req.fields.title,
               libInfos: serie.title,
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

router.get("/api/episodes", isAuthenticated, formidable(), async (req, res) => {
   const sendEpisodes = [];
   const serie = await series.findById(req.query.id).populate("episodes");
   if (serie) {
      //sendEpisodes.push(serie.episodes);
      res.status(200).json(serie);
   } else {
      res.status(400).json({ message: "serie not found" });
   }
});

module.exports = router;
