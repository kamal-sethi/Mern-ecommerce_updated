export const addToCart = async (req, res) => {
  try {
  } catch (error) {
    console.log("error in add to cart controller", error.message);
    res.status(500).json({ message: "internal server error" });
  }
};
