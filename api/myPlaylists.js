const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
// Import model MyPlaysLists
const { myPlaylists } = require("../models");
const { childrens } = require("../models");
const { episodes } = require("../models");
const { series } = require("../models");
const formidable = require("express-formidable");

const isAuthenticated = (req, res, next) => {
   if (req.headers.authorization === `Bearer ${process.env.ACCESS_TOKEN}`) {
      next();
   } else {
      res.json({ message: "Unauthorized" });
   }
};

router.post(
   "/api/addSeriesMyplaylists",
   isAuthenticated,
   formidable(),
   async (req, res) => {
      try {
         //check childrens + series
         const children = await childrens.findById(req.fields.idChildren);
         const serie = await series
            .findById(req.fields.idSeries)
            .populate("episodes");
         if (!children) {
            res.status(409).json({ message: "children does not exist" });
         } else {
            if (!serie) {
               res.status(409).json({ message: "serie does not exist" });
            } else {
               const rightNow = new Date();
               if (serie.episodes.length > 0) {
                  for (i = 0; i < serie.episodes.length; i++) {
                     const episode = await episodes.findById(serie.episodes[i]);
                     if (!episode) {
                        console.log(
                           "Episode does not exist n° " + serie.episodes[i]
                        );
                     } else {
                        newRank = rightNow.getTime(); // to put the rank last in the list

                        const newMyplaylist = new myPlaylists({
                           rank: newRank,
                           idEpisodes: episode.id,
                           title: episode.title,
                           image: episode.image,
                           createdAt: rightNow,
                        });
                        await newMyplaylist.save();
                        await children.myPlaylists.push(newMyplaylist);
                        await children.save();
                     }
                  }
               }

               const myPlaylistsChild = await childrens
                  .findById(req.fields.idChildren)
                  .populate("myPlaylists");
               res.status(200).json(myPlaylistsChild);
            }
         }
      } catch (error) {
         console.log(error.message);
         res.status(400).json({ message: error.message });
      }
   }
);

// Route Create in Episode => myPlayLists
// idChildren = id of Children
// idEpisode = id of Episode
router.post(
   "/api/addEpisodeMyplaylists",
   isAuthenticated,
   formidable(),
   async (req, res) => {
      try {
         console.log(req.fields.idChildren, req.fields.idEpisode);
         //check Users
         const children = await childrens.findById(req.fields.idChildren);
         const episode = await episodes.findById(req.fields.idEpisode);
         if (!children) {
            res.status(409).json({ message: "children does not exist" });
         } else {
            if (!episode) {
               res.status(409).json({ message: "episode does not exist" });
            } else {
               const rightNow = new Date();
               newRank = rightNow.getTime(); // to put the rank last in the list

               const newMyplaylist = new myPlaylists({
                  rank: newRank,
                  idEpisodes: episode.id,
                  title: episode.title,
                  image: episode.image,
                  createdAt: rightNow,
               });
               await newMyplaylist.save();
               await children.myPlaylists.push(newMyplaylist);
               await children.save();

               const myPlaylistsChild = await childrens
                  .findById(req.fields.idChildren)
                  .populate("myPlaylists");
               res.status(200).json(myPlaylistsChild);
            }
         }
      } catch (error) {
         console.log(error.message);
         res.status(400).json({ message: error.message });
      }
   }
);

router.post(
   "/api/listMyPlaylist",
   isAuthenticated,
   formidable(),
   async (req, res) => {
      try {
         //check Users
         console.log(req.fields.idChildren);
         const children = await childrens
            .findById(req.fields.idChildren)
            .populate({ path: "myPlaylists", match: { isTrash: false } });
         console.log(children);
         if (!children) {
            res.status(409).json({ message: "children does not exist" });
         }

         res.status(200).json(children);
      } catch (error) {
         console.log(error.message);
         res.status(400).json({ message: error.message });
      }
   }
);

router.post(
   "/api/trashEpisodeMyplaylists",
   isAuthenticated,
   formidable(),
   async (req, res) => {
      try {
         const myplaylist = await myPlaylists.findOne({
            idEpisodes: req.fields.idEpisode,
         });
         if (!myplaylist) {
            console.log(
               "episode don't exist for trash of the playlist : " +
                  req.fields.idEpisode
            );
            res.status(409).json({ message: "episode does not exist" });
         } else {
            console.log(myplaylist);
            myplaylist.isTrash = true;
            await myplaylist.save();
            res.status(200).json({ message: "ok episode trash" });
         }
      } catch (error) {
         console.log(error.message);
         res.status(400).json({ message: error.message });
      }
   }
);

module.exports = router;
