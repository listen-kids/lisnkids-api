module.exports = (mongoose, Mongoose) => {
   const schema = Mongoose.Schema(
      {
         firstName: String,
         avatar: {
            nameAvatar: String,
            daySelected: String,
            dayUnselected: String,
            nightSelected: String,
            nightUnselected: String,
            onlySelected: String,
            onlyUnselected: String,
         },
         age: Number,
         isActif: {
            type: Boolean,
            default: true,
         },
         createdAt: Date,
         updatedAt: { type: Date, default: Date.now },

         //historic_listens: {
         //   type: [Mongoose.Schema.Types.ObjectId],
         //   ref: "historic_listens",
         //},

         myPlaylists: [
            {
               type: Mongoose.Schema.Types.ObjectId,
               ref: "myPlaylists",
            },
         ],
      },
      {
         timestamps: false,
      }
   );
   return mongoose.model("childrens", schema, "childrens");
};
