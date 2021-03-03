module.exports = (mongoose, Mongoose) => {
   // This section contains the properties of your model, mapped to your collection's properties.
   // Learn more here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/models/enrich-your-models#declaring-a-new-field-in-a-model
   const schema = Mongoose.Schema(
      {
         firstName: String,
         avatar: String,
         age: Number,
         isActif: Boolean,

         createdAt: Date,
         updatedAt: Date,
         Historic_listens: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "historic_childrens",
         },
         //Historic_listens: [
         //   { type: mongoose.Schema.Types.ObjectId, ref: "Historic_listens" },
         //],
      },
      {
         timestamps: false,
      }
   );
   return mongoose.model("childrens", schema, "childrens");
};
