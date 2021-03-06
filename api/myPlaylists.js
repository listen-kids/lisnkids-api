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
               if (serie.episodes.length > 0) {
                  for (i = 0; i < serie.episodes.length; i++) {
                     const episode = await episodes.findById(serie.episodes[i]);
                     if (!episode) {
                        console.log(
                           "Episode does not exist n° " + serie.episodes[i]
                        );
                     } else {
                        const newMyplaylist = new myPlaylists({
                           rank: children.myPlaylists.length + 1,
                           idEpisodes: episode.id,
                           title: episode.title,
                           image: episode.image,
                           createdAt: new Date(),
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
               //Check if episode exist in the playlist--------------------------
               bblock = false;
               if (children.myPlaylists.length > 0) {
                  for (i = 0; i < children.myPlaylists.length; i++) {
                     //search Playlist
                     const playslist = await myPlaylists.findById(
                        children.myPlaylists[i]
                     );
                     if (playslist) {
                        //Playlist ok

                        if (playslist.idEpisodes === req.fields.idEpisode) {
                           // blocage Securite
                           bblock = true;

                           // check if episode in the playlist isTrash=true we change at false
                           if (playslist.isTrash === true) {
                              playslist.isTrash = false;
                              await playslist.save();
                              res.status(200).json({
                                 message:
                                    "The episode change the state isTrash at false",
                              });
                           } else {
                              res.status(200).json({
                                 message:
                                    "The episode for this child already exists",
                              });
                           }
                        }
                     }
                  }
                  //End Check if episode exist in the playlist--------------------------
               }
               if (bblock === false) {
                  const newMyplaylist = new myPlaylists({
                     rank: children.myPlaylists.length + 1,
                     idEpisodes: episode.id,
                     title: episode.title,
                     image: episode.image,
                     createdAt: new Date(),
                  });
                  await newMyplaylist.save();
                  await children.myPlaylists.push(newMyplaylist);
                  await children.save();

                  const myPlaylistsChild = await childrens
                     .findById(req.fields.idChildren)
                     .populate("myPlaylists");
                  res.status(200).json(myPlaylistsChild);
               } else {
                  res.status(200).json("deja existant");
               }
            }
         }
      } catch (error) {
         console.log(error.message);
         res.status(400).json({ message: error.message });
      }
   }
);

// list  Episode => myPlayLists
// idChildren = id of Children
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
            .populate("myPlaylists");

         if (!children) {
            res.status(409).json({ message: "children does not exist" });
         }

         res.status(200).json(children);
         //res.status(200).json(children);
      } catch (error) {
         console.log(error.message);
         res.status(400).json({ message: error.message });
      }
   }
);

// list  Episode => myPlayLists
// idChildren = id of Children
router.post(
   "/api/listMyPlaylistEpisode",
   isAuthenticated,
   formidable(),
   async (req, res) => {
      try {
         //check Users

         const children = await childrens
            .findById(req.fields.idChildren)
            .populate({ path: "myPlaylists" });

         if (!children) {
            res.status(409).json({ message: "children does not exist" });
         }
         if (children.myPlaylists.length > 0) {
            let epiAll = [];
            let cpt = 0;
            for (i = 0; i < children.myPlaylists.length; i++) {
               if (children.myPlaylists[i].isTrash === false) {
                  const episode = await episodes.findById(
                     children.myPlaylists[i].idEpisodes
                  );

                  if (episode) {
                     cpt++;
                     console.log(episode);
                     episode.rank = cpt;
                     epiAll.push(episode);
                  }
               }
            }
            res.status(200).json(epiAll);
         } else {
            res.status(200).json("PlayList vide");
         }
      } catch (error) {
         console.log(error.message);
         res.status(400).json({ message: error.message });
      }
   }
);

// delete Episode od the myPlayLists
// idChildren = id of Children
// idPlaylists = id of de la playlists
router.post(
   "/api/trashEpisodeMyplaylists",
   isAuthenticated,
   formidable(),
   async (req, res) => {
      try {
         // trash episode
         const myplaylist = await myPlaylists.findById(req.fields.idPlayLists);
         if (!myplaylist) {
            res.status(409).json({ message: "n°PlayList does not exist" });
         } else {
            console.log(myplaylist);
            myplaylist.isTrash = true;
            await myplaylist.save();

            // update Rank de la playslist (req)

            //check Users
            const children = await childrens.findById(req.fields.idChildren);

            if (!children) {
               res.status(409).json({ message: "children does not exist" });
            } else {
               //Check if episode exist in the playlist
               if (children.myPlaylists.length > 0) {
                  let nbRank = 0;
                  for (i = 0; i < children.myPlaylists.length; i++) {
                     const myPlayListUpdate = await myPlaylists.findById(
                        children.myPlaylists[i]
                     );
                     if (myPlayListUpdate) {
                        if (myPlayListUpdate.isTrash === false) {
                           nbRank++;
                           myPlayListUpdate.rank = nbRank;
                           await myplaylist.save();
                        }
                     }
                  }
               }
               res.status(200).json({ message: "ok episode trash" });
            }
         }
      } catch (error) {
         console.log(error.message);
         res.status(400).json({ message: error.message });
      }
   }
);

//download Episode Myplaylists
// idPlaylists = id of de la playlists
router.post(
   "/api/downloadEpisodeMyplaylists",
   isAuthenticated,
   formidable(),
   async (req, res) => {
      try {
         // trash episode

         const myplaylist = await myPlaylists.findById(req.fields.idPlayLists);
         if (!myplaylist) {
            res.status(409).json({ message: "n°PlayList does not exist" });
         } else {
            myplaylist.downloaded = true;
            await myplaylist.save();
            res.status(200).json({ message: "ok episode downloaded" });
         }
      } catch (error) {
         console.log(error.message);
         res.status(400).json({ message: error.message });
      }
   }
);

//download Episode Myplaylists
// idPlaylists = id of de la playlists
router.post(
   "/api/downloadEpisodeAllChildren",
   isAuthenticated,
   formidable(),
   async (req, res) => {
      try {
         //check Users
         const children = await childrens.findById(req.fields.idChildren);

         if (!children) {
            res.status(409).json({ message: "children does not exist" });
         } else {
            //Check if episode exist in the playlist
            if (children.myPlaylists.length > 0) {
               for (i = 0; i < children.myPlaylists.length; i++) {
                  const myPlayListUpdate = await myPlaylists.findById(
                     children.myPlaylists[i]
                  );
                  if (myPlayListUpdate) {
                     myPlayListUpdate.downloaded = true;
                     await myPlayListUpdate.save();
                  }
               }
            }
            res.status(200).json({ message: "ok episodes trash" });
         }
      } catch (error) {
         console.log(error.message);
         res.status(400).json({ message: error.message });
      }
   }
);

module.exports = router;
