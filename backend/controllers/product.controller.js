import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllProducts = async (req, res) => {
  try {
    const allProducts = await Product.find({});
    res.json({ allProducts });
  } catch (error) {
    console.log("error in products controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
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

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "",
    });
    res.status(201).json({ product, message: "product created successfully" });
  } catch (error) {
    console.log("error in creating product controller", error.message);
    return res
      .status(501)
      .json({ message: "Server error", error: error.message });
  }
};

