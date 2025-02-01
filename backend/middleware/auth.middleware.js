import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
export const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    console.log(accessToken)
    if (!accessToken) {
      return res
        .status(400)
        .json({ message: "Unauthorized-No access token found" });
    }
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      req.user = user;
      next();
    } catch (error) {
      if (error === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Unauthorized token-Access Token expired" });
      }
      throw error;
    }
  } catch (error) {
    console.log("error in auth middleware", error.message);
    return res.status(500).json({ message: "error in auth middleware" });
  }
};

export const adminRoute = async (req, res, next) => {
  try {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      return res.status(403).json({ message: "admin only" });
    }
  } catch (error) {}
};
