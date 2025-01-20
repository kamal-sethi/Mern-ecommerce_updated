import { Coupon } from "../models/coupon.model.js";
export const getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      userId: req.user._id,
      isActive: true,
    });
    res.json(coupon || null);
  } catch (error) {
    console.log("error in coupon controller ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
