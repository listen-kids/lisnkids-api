module.exports = (mongoose, Mongoose) => {
    const schema = Mongoose.Schema(
        {
            email: String, //{ type: String, unique: true },
            account: {
                userName: String,
                languageDefault: String,
                guidance: { type: Boolean, default: false },
                guidance1: { type: Boolean, default: false },
                guidance2: { type: Boolean, default: false },
                secretCode: Number,
                isActif: { type: Boolean, default: true },
                isAdmin: Boolean,
            },

            childrens: {
                type: [Mongoose.Schema.Types.ObjectId],
                ref: "childrens",
            },

            createdAt: Date,
            updatedAt: { type: Date, default: Date.now },
            token: String,
            hash: String,
            salt: String,
        },
        {
            timestamps: false,
        }
    );
    return mongoose.model("users", schema, "users");
};
