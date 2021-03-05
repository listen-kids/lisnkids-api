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

router.post("/api/avatars", async (req, res) => {
    try {
        if (req.body.title || req.body.selected || req.body.dayNightOnly) {
            console.log(req.body);
            const paramsReceive = {};

            req.body.title &&
                (paramsReceive.title = req.body.title.toUpperCase());
            req.body.selected &&
                (paramsReceive.selected = req.body.selected.toUpperCase());
            req.body.dayNightOnly &&
                (paramsReceive.dayNightOnly = req.body.dayNightOnly.toUpperCase());

            const response = await avatars.find(paramsReceive);

            if (response.length > 0) {
                res.status(200).json(response);
            } else {
                res.status(400).json({ message: "Not picture" });
            }
        } else {
            const avatarAll = await avatars.find();
            res.status(200).json(avatarAll);
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).json(error.message);
    }
});

//////////////////////////////////////
// reserve admin request for import avatars///------------------------------------------
//////////////////////////////////////
router.post("/api/addAvatars", isAuthenticated, async (req, res) => {
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
