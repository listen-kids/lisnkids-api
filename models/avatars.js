module.exports = (mongoose, Mongoose) => {
   const schema = Mongoose.Schema(
      {
         titles: String,
         selected: String,
         dayNightOnly: String,
         url: String,
         extension: String,
      },
      {
         timestamps: false,
      }
   );
   return mongoose.model("avatars", schema, "avatars");
};
