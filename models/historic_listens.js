module.exports = (mongoose, Mongoose) => {
   const schema = Mongoose.Schema(
      {
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
      },
      {
         timestamps: false,
      }
   );
   return mongoose.model("historic_listens", schema, "historic_listens");
};
