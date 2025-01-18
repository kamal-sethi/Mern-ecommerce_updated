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
