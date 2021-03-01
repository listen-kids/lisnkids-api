const mongoose = require("mongoose");

const schema = mongoose.Schema({
   rank: Number,
   title: String,
   fullTitle: String,
   descriptions: String,
   year: String,
   image: String,
   crew: String,
   rating: Number,

   createdAt: Date,
   updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Movies", schema, "movies");
