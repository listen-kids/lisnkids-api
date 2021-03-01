const mongoose = require("mongoose");

const schema = mongoose.Schema({
   rank: Number,
   title: String,
   fullTitle: String,
   year: String,
   image: String,
   descriptions: String,
   crew: String,
   rating: Number,
   nbDownload: Number,
   createdAt: Date,

   updatedAt: { type: Date, default: Date.now },

   serie: [{ type: mongoose.Schema.Types.ObjectId, ref: "series" }],
});

module.exports = mongoose.model("Episodes", schema, "episodes");
