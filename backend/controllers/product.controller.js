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

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product is not found" });
    }

    //deleting image from cloudinary
    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0]; //this will get the id of the image
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("image deleted from cloudinary");
      } catch (error) {
        console.log("error in deleting image from cloudinary", error.message);
      }
    }

    //deleting product from the database
    await Product.findByIdAndDelete(req.params.id);

    // to do - if the product is available in redis then delete from there also

    res.status(200).json("Product deleted Successfully");
  } catch (error) {
    console.log("Error in delete product controller ", error.message);
    res
      .status(500)
      .json({ message: "internal server error", error: error.message });
  }
};

export const getProductRecommendation = async (req, res) => {
  try {
    const product = await Product.aggregate([
      //aggregate used for filtering and making queries in the database
      {
        $sample: { size: 3 }, //randomly selects the 3 products
      },
      {
        $project: {
          //we are telling database what to include in the result
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);
    res.json(product);
  } catch (error) {
    console.log(
      "Error in get Product recommendation controller",
      error.message
    );
    res
      .status(500)
      .json({ message: "internal server error", error: error.message });
  }
};

export const getProductByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category });
    res.json({ products });
  } catch (error) {
    console.log("error in get product by category controller", error.message);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
export const toggleFeaturedProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      //updating in redis

      await updateFeatureProductsCache();

      res.json(updatedProduct);
    } else {
      res.json({ message: "No Product is found" });
    }
  } catch (error) {
    console.log(
      "error in get product by toggle featured product controller",
      error.message
    );
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

async function updateFeatureProductsCache() {
  try {
    const featuredProduct = await Product.find({ isFeatured: true }).lean();

    await redis.set("featured_products", JSON.stringify(featuredProduct));
  } catch (error) {
    console.log(
      "Error in updating the featured products in redis",
      error.message
    );
    res.status(500).json({ message: "internal server error" });
  }
}
