const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please provide product name"],
      trim: true,
      maxlength: [100, "name caanot be more than hundred characters"],
    },
    price: {
      type: Number,
      required: [true, "please provide product price"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "please provide product description"],
      maxlength: [1000, "name caanot be more than thousand characters"],
    },
    image: {
      type: String,
      default: "/uploads/example.jpg",
    },
    category: {
      type: String,
      required: [true, "please provide product category"],
      enum: ["office", "kitchen", "bedroom"],
    },
    company: {
      type: String,
      required: [true, "please provide product company"],
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: "{VALUE} is not supported",
      },
    },
    colors: {
      type: [String],
      required: true,
    },
    featured: {
      type: Boolean,
      required: false,
    },
    freeShipping: {
      type: Boolean,
      required: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
});

ProductSchema.pre("remove", async function (next) {
  await this.model("Review").deleteMany({ product: this._id });
});

module.exports = mongoose.model("Product", ProductSchema);
