import { redis } from "../lib/redis.js";
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

export const getFeaturedProducts = async (req, res, next) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.status(200).json(JSON.parse(featuredProducts));
    }
    //if not in redis fetch from mongodb
    featuredProducts = await Product.find({ isFeatured: true }).lean(); //lean returns plain javascript objects instead of mongoodb objects which is good for performance
    if (!featuredProducts) {
      return res.status(400).json({ message: "No Featured Products Found" });
    }

    //store in redis for future quick access
    await redis.set("featured_products", JSON.stringify(featuredProducts));
    res.json({ featuredProducts });
  } catch (error) {
    console.log("error in featured product controller", error.message);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};
