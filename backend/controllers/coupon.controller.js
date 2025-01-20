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

export const getValidateCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    const coupon = await Coupon.findOne({
      code: code,
      isActive: true,
      userId: req.user._id,
    });

    if (!coupon) {
      return res.status(400).json({ message: "Coupon not found" });
    }

    if (coupon.expirationDate < new Date()) {
      (coupon.isActive = false), await coupon.save();
      return res.status(400, json({ message: "coupon expired" }));
    }

    res.json({
      message: "coupon is valid",
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
    });
  } catch (error) {
    console.log("error in coupon controller ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
