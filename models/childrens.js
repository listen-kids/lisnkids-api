module.exports = (mongoose, Mongoose) => {
   const schema = Mongoose.Schema(
      {
         firstName: String,
         avatar: String,
         age: Number,
         isActif: {
            type: Boolean,
            default: true,
         },
         createdAt: Date,
         updatedAt: { type: Date, default: Date.now },

         historic_listens: {
            type: [Mongoose.Schema.Types.ObjectId],
            ref: "historic_listens",
         },
      },
      {
         timestamps: false,
      }
   );
   return mongoose.model("childrens", schema, "childrens");
};
