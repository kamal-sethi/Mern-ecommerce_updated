import Product from "../models/product.model.js";
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;

    const user = req.user;

    const existingItem = await user.cartItems.find(
      (item) => item.id === productId
    );
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push(productId);
    }
    await user.save();
    res.json(cartItems);
  } catch (error) {
    console.log("error in add to cart controller", error.message);
    res.status(500).json({ message: "internal server error" });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;

    const user = req.user;
    if (!productId) {
      user.cartItems = [];
    } else {
      user.cartItems = user.cartItems.filter((item) => item !== productId);
    }
    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updatedProductQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find((item) => item.id === productId);
    if (existingItem) {
      if (quantity === 0) {
        user.cartItems.filter((item) => item.id !== productId);
        await user.save();
        res.json(user.cartItems);
      }
      existingItem.quantity = quantity;
      await user.save();
      res.json(user.cartItems);
    } else {
      res.status(404).json({ message: "product not found" });
    }
  } catch (error) {
    console.log("error in updating product in  cart controller", error.message);
    res.status(500).json({ message: "internal server error" });
  }
};

export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({ _id: { $in: req.user.cartItems } });

    //adding quantity to each product

    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find(
        (cartItem) => cartItem.id === product.id
      );
      return { ...product.toJSON(), quantity: item.quantity };
    });
    res.json(cartItems);
  } catch (error) {
    console.log("error in get cart products controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
