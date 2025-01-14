import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    // quantity: {
    //   type: Number,
    //   required: true,
    // },
    image: { type: String, required: [true, "image is required"] },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    isFeatured: { type: Boolean, required: true },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
