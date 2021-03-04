module.exports = (mongoose, Mongoose) => {
   const schema = Mongoose.Schema(
      {
         rank: Number,
         title: { type: String, unique: true },
         description: String,
         year: String,
         image: String,
         author: String,
         rating: Number,
         hit: { type: Boolean, default: false },
         episodes: {
            type: [Mongoose.Schema.Types.ObjectId],
            ref: "episodes",
         },
         createdAt: Date,
         updatedAt: { type: Date, default: Date.now },
      },
      {
         timestamps: false,
      }
   );
   return mongoose.model("series", schema, "series");
};
