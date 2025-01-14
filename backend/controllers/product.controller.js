import Product from "../models/product.model.js";

export const getAllProducts = async (req, res, next) => {
  try {
    const allProducts = await Product.find({});
    res.json({ allProducts });
  } catch (error) {
    console.log("error in products controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
