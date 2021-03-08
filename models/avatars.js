module.exports = (mongoose, Mongoose) => {
    const schema = Mongoose.Schema(
        {
            title: String,
            daySelected: String,
            dayUnselected: String,
            nightSelected: String,
            nightUnselected: String,
            onlySelected: String,
            onlyUnselected: String,
        },
        {
            timestamps: false,
        }
    );
    return mongoose.model("avatars", schema, "avatars");
};
