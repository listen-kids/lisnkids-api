const express = require("express");
const {
    PermissionMiddlewareCreator,
    RecordCreator,
    RecordUpdater,
} = require("forest-express-mongoose");
const { childrens } = require("../models");
const cloudinary = require("cloudinary").v2;

const router = express.Router();
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const permissionMiddlewareCreator = new PermissionMiddlewareCreator(
    "childrens"
);

// This file contains the logic of every route in Forest Admin for the collection childrens:
// - Native routes are already generated but can be extended/overriden - Learn how to extend a route here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/extend-a-route
// - Smart action routes will need to be added as you create new Smart Actions - Learn how to create a Smart Action here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/actions/create-and-manage-smart-actions

// Create a Schildrens

// Create a childrens - Check out our documentation for more details: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#create-a-record
router.post(
    "/childrens",
    permissionMiddlewareCreator.create(),
    (request, response, next) => {
        const recordCreator = new RecordCreator(childrens);
        recordCreator
            .deserialize(request.body)
            .then(async (recordToCreate) => {
                if (recordToCreate.avatar) {
                    const result = await cloudinary.uploader.upload(
                        recordToCreate.avatar
                    );
                    recordToCreate.avatar = result.secure_url;
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

// Update a childrens
router.put(
    "/childrens/:recordId",
    permissionMiddlewareCreator.update(),
    (request, response, next) => {
        const recordUpdater = new RecordUpdater(childrens);
        recordUpdater
            .deserialize(request.body)
            .then(async (recordToUpdate) => {
                if (recordToUpdate.avatar) {
                    const result = await cloudinary.uploader.upload(
                        recordToUpdate.avatar
                    );
                    recordToUpdate.avatar = result.secure_url;
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

// Delete a childrens
router.delete(
    "/childrens/:recordId",
    permissionMiddlewareCreator.delete(),
    (request, response, next) => {
        // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-record
        next();
    }
);

// Get a list of childrens
router.get(
    "/childrens",
    permissionMiddlewareCreator.list(),
    (request, response, next) => {
        // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-list-of-records
        next();
    }
);

// Get a number of childrens
router.get(
    "/childrens/count",
    permissionMiddlewareCreator.list(),
    (request, response, next) => {
        // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-number-of-records
        next();
    }
);

// Get a User
router.get(
    "/childrens/:recordId(?!count)",
    permissionMiddlewareCreator.details(),
    (request, response, next) => {
        // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-record
        next();
    }
);

// Export a list of childrens
router.get(
    "/childrens.csv",
    permissionMiddlewareCreator.export(),
    (request, response, next) => {
        // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#export-a-list-of-records
        next();
    }
);

// Delete a list of childrens
router.delete(
    "/childrens",
    permissionMiddlewareCreator.delete(),
    (request, response, next) => {
        // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-list-of-records
        next();
    }
);

module.exports = router;
