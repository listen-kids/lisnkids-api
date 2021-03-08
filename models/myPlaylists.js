module.exports = (mongoose, Mongoose) => {
   const schema = Mongoose.Schema(
      {
         rank: Number,
         id_episodes: String,
         start_listen_date: Date,
         last_listen_date: Date,
         duration: Number,
         downloaded: {
            type: Boolean,
            default: false,
         },
         createdAt: Date,
         updatedAt: { type: Date, default: Date.now },
         isTrash: {
            type: Boolean,
            default: false,
         },
      },
      {
         timestamps: false,
      }
   );
   return mongoose.model("myPlaylists", schema, "myPlaylists");
};
