const mongoose = require("mongoose");

const schema = mongoose.Schema({
   email: { type: String, unique: true },
   account: {
      userName: String,
      languageDefault: String,
      guidance: Boolean,
      secretCode: Number,
      isActif: { type: Boolean, default: true },
      isAdmin: Boolean,
   },

   children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Children" }],

   createdAt: Date,
   updatedAt: { type: Date, default: Date.now },
   token: String,
   hash: String,
   salt: String,
});

module.exports = mongoose.model("Users", schema, "users");
