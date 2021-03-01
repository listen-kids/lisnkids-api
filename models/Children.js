const mongoose = require("mongoose");

const schema = mongoose.Schema({
   firstName: String,
   avatar: String,
   age: Number,
   isActif: {
      type: Boolean,
      default: true,
   },
   createdAt: Date,
   updatedAt: { type: Date, default: Date.now },
   Historic_listen   : [{ type: mongoose.Schema.Types.ObjectId, ref: "historic_children" }],
});

module.exports = mongoose.model("Children", schema, "children");
