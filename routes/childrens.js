const express = require("express");
const {
    PermissionMiddlewareCreator,
    RecordCreator,
    RecordUpdater,
} = require("forest-express-mongoose");
const { series } = require("../models");
const cloudinary = require("cloudinary").v2;

const router = express.Router();
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const permissionMiddlewareCreator = new PermissionMiddlewareCreator("series");

// This file contains the logic of every route in Forest Admin for the collection series:
// - Native routes are already generated but can be extended/overriden - Learn how to extend a route here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/extend-a-route
// - Smart action routes will need to be added as you create new Smart Actions - Learn how to create a Smart Action here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/actions/create-and-manage-smart-actions

// Create a Sseries

// Create a series - Check out our documentation for more details: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#create-a-record
router.post(
    "/series",
    permissionMiddlewareCreator.create(),
    (request, response, next) => {
        const recordCreator = new RecordCreator(series);
        recordCreator
            .deserialize(request.body)
            .then(async (recordToCreate) => {
                if (recordToCreate.image) {
                    const result = await cloudinary.uploader.upload(
                        recordToCreate.image
                    );
                    recordToCreate.image = result.secure_url;
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

// Update a series
router.put(
    "/series/:recordId",
    permissionMiddlewareCreator.update(),
    (request, response, next) => {
        const recordUpdater = new RecordUpdater(series);
        recordUpdater
            .deserialize(request.body)
            .then(async (recordToUpdate) => {
                if (recordToUpdate.image) {
                    const result = await cloudinary.uploader.upload(
                        recordToUpdate.image
                    );
                    recordToUpdate.image = result.secure_url;
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

// Delete a series
router.delete(
    "/series/:recordId",
    permissionMiddlewareCreator.delete(),
    (request, response, next) => {
        // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-record
        next();
    }
);

// Get a list of series
router.get(
    "/series",
    permissionMiddlewareCreator.list(),
    (request, response, next) => {
        // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-list-of-records
        next();
    }
);

// Get a number of series
router.get(
    "/series/count",
    permissionMiddlewareCreator.list(),
    (request, response, next) => {
        // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-number-of-records
        next();
    }
);

// Get a User
router.get(
    "/series/:recordId(?!count)",
    permissionMiddlewareCreator.details(),
    (request, response, next) => {
        // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-record
        next();
    }
);

// Export a list of series
router.get(
    "/series.csv",
    permissionMiddlewareCreator.export(),
    (request, response, next) => {
        // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#export-a-list-of-records
        next();
    }
);

// Delete a list of series
router.delete(
    "/series",
    permissionMiddlewareCreator.delete(),
    (request, response, next) => {
        // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-list-of-records
        next();
    }
);

module.exports = router;
