const mongoose = require("mongoose");

const schema = mongoose.Schema({
   createdAt: Date,

   updatedAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Subscriptions", schema, "subscriptions");
