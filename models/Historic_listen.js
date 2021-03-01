const mongoose = require("mongoose");

const schema = mongoose.Schema({
   rank: Number,
   id_episodes: Number,
   start_listen_date: Date,
   last_listen_date: Date,
   duration: Number,

   createdAt: Date,
   updatedAt: { type: Date, default: Date.now },
   isTrash: {
      type: Boolean,
      default: false,
   },
});

module.exports = mongoose.model("Historic_listen", schema, "historic_listen");
