module.exports = (mongoose, Mongoose) => {
   const schema = Mongoose.Schema(
      {
         createdAt: Date,

         updatedAt: { type: Date, default: Date.now },
      },
      {
         timestamps: false,
      }
   );
   return mongoose.model("subscriptions", schema, "subscriptions");
};
