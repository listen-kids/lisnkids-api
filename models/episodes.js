module.exports = (mongoose, Mongoose) => {
   const schema = Mongoose.Schema(
      {
         rank: Number,
         title: String,
         year: String,
         image: String,
         duration: String,
         descriptions: String,
         author: String,
         audio: String,
         size: String,
         rating: Number,
         libInfos: String,
         nbDownload: Number,
         createdAt: Date,

         updatedAt: { type: Date, default: Date.now },

         //series: { type: [Mongoose.Schema.Types.ObjectId], ref: "series" },

         //series: [{ type: Mongoose.Schema.Types.ObjectId, ref: "series" }],
      },
      {
         timestamps: false,
      }
   );
   return mongoose.model("episodes", schema, "episodes");
};
