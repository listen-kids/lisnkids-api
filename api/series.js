const express = require("express");
const router = express.Router();
const formidable = require("express-formidable");

// Import model Series
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
    "/api/add_series",
    isAuthenticated,
    formidable(),
    async (req, res) => {
        try {
            // Search in the BDD.  Does a user have this title ?
            const serie = await series.findOne({ title: req.fields.title });

            if (serie) {
                res.status(409).json({
                    message: "This serie's name already exist",
                });
            } else {
                let pictureToUpload = req.files.picture.path;
                const result = await cloudinary.uploader.upload(
                    pictureToUpload
                );

                const newSerie = new series({
                    title: req.fields.title,
                    image: result.secure_url,
                    author: req.fields.author,
                    description: req.fields.description,
                    episodes: [],
                    createdAt: new Date(),
                });
                await newSerie.save();
                res.status(200).json(newSerie);
            }
        } catch (error) {
            console.log(error.message);
            res.status(400).json({ message: error.message });
        }
    }
);

router.get("/api/series", isAuthenticated, formidable(), async (req, res) => {
    const serie = await series.find();
    res.status(200).json(serie);
});

router.get(
    "/api/seriesStarsList",
    isAuthenticated,
    formidable(),
    async (req, res) => {
        try {
            const serie = await series.find({ hit: true });
            res.status(200).json(serie);
        } catch (error) {
            console.log(error.message);
            res.status(400).json({ message: error.message });
        }
    }
);

router.get(
    "/api/seriesStarsAll",
    isAuthenticated,
    formidable(),
    async (req, res) => {
        try {
            const serie = await series.find({ hit: true }).populate("episodes");
            res.status(200).json(serie);
        } catch (error) {
            console.log(error.message);
            res.status(400).json({ message: error.message });
        }
    }
);

module.exports = router;
