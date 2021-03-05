const express = require("express");
const {
    PermissionMiddlewareCreator,
    RecordCreator,
    RecordUpdater,
} = require("forest-express-mongoose");
const { episodes } = require("../models");
const cloudinary = require("cloudinary").v2;

const router = express.Router();
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const permissionMiddlewareCreator = new PermissionMiddlewareCreator("episodes");

// This file contains the logic of every route in Forest Admin for the collection episodes:
// - Native routes are already generated but can be extended/overriden - Learn how to extend a route here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/extend-a-route
// - Smart action routes will need to be added as you create new Smart Actions - Learn how to create a Smart Action here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/actions/create-and-manage-smart-actions

// Create a episodes

// Create a episodes - Check out our documentation for more details: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#create-a-record
router.post(
    "/episodes",
    permissionMiddlewareCreator.create(),
    (request, response, next) => {
        const recordCreator = new RecordCreator(episodes);
        recordCreator
            .deserialize(request.body)
            .then(async (recordToCreate) => {
                if (recordToCreate.image) {
                    const result = await cloudinary.uploader.upload(
                        recordToCreate.image
                    );
                    recordToCreate.image = result.secure_url;
                }
                if (recordToCreate.audio) {
                    const result2 = await cloudinary.uploader.upload(
                        recordToCreate.audio,
                        { resource_type: "video" }
                    );
                    console.log(result2);
                    recordToCreate.audio = result2.secure_url;
                }

                return recordCreator.create(recordToCreate);
            })
            .then((record) => {
                return recordCreator.serialize(record);
            })
            .then((recordSerialized) => response.send(recordSerialized))
            .catch(next);
    }
);

// Update a episodes
router.put(
    "/episodes/:recordId",
    permissionMiddlewareCreator.update(),
    (request, response, next) => {
        const recordUpdater = new RecordUpdater(episodes);
        recordUpdater
            .deserialize(request.body)
            .then(async (recordToUpdate) => {
                if (recordToUpdate.image) {
                    const result = await cloudinary.uploader.upload(
                        recordToUpdate.image
                    );
                    recordToUpdate.image = result.secure_url;
                }
                if (recordToUpdate.audio) {
                    const result2 = await cloudinary.uploader.upload(
                        "sound.mp3",
                        { resource_type: "video" }
                    );
                    recordToUpdate.audio = result2.secure_url;
                }

                return recordUpdater.update(
                    recordToUpdate,
                    request.params.recordId
                );
            })
            .then((record) => {
                return recordUpdater.serialize(record);
            })
            .then((recordSerialized) => response.send(recordSerialized))
            .catch(next);
    }
);

// Delete a episodes
router.delete(
    "/episodes/:recordId",
    permissionMiddlewareCreator.delete(),
    (request, response, next) => {
        // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-record
        next();
    }
);

// Get a list of episodes
router.get(
    "/episodes",
    permissionMiddlewareCreator.list(),
    (request, response, next) => {
        // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-list-of-records
        next();
    }
);

// Get a number of episodes
router.get(
    "/episodes/count",
    permissionMiddlewareCreator.list(),
    (request, response, next) => {
        // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-number-of-records
        next();
    }
);

// Get a User
router.get(
    "/episodes/:recordId(?!count)",
    permissionMiddlewareCreator.details(),
    (request, response, next) => {
        // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-record
        next();
    }
);

// Export a list of episodes
router.get(
    "/episodes.csv",
    permissionMiddlewareCreator.export(),
    (request, response, next) => {
        // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#export-a-list-of-records
        next();
    }
);

// Delete a list of episodes
router.delete(
    "/episodes",
    permissionMiddlewareCreator.delete(),
    (request, response, next) => {
        // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-list-of-records
        next();
    }
);

module.exports = router;
