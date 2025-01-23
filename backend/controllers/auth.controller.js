import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  );
};
const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, //prevent XSS attacks,cross site scripting attacks
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", ///prevents CSRF attacks,cross site request forgery attack
    maxAge: 15 * 60 * 1000, //15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, //prevent XSS attacks,cross site scripting attacks
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", ///prevents CSRF attacks,cross site request forgery attack
    maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
  });
};

//signup controller
export const signup = async (req, res, next) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });

  try {
    if (userExists) {
      res.status(400).json({
        message: "User already exits please login",
        success: false,
      });
    }
    const user = await User.create({ name, email, password });
    const { accessToken, refreshToken } = generateToken(user._id);

    await storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);
    res.status(201).json({
      message: "User registered successfully",
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.log("Error in Login controller", error.message);
    res.status(500).json({
      message: error.message,
    });
  }
};

//login controller
export const login = async (req, res, next) => {
  try {
    console.log("code is running");
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    const passwordMatched = await user.comparePassword(password);
    if (!passwordMatched) {
      console.log("password is matched");
    }
    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateToken(user._id);

      await storeRefreshToken(user._id, refreshToken);

      setCookies(res, accessToken, refreshToken);

      res.status(200).json({
        message: "Login Successfully",
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(500).json({
        message: "Invalid Credentials",
      });
    }
  } catch (error) {
    console.log("Error in Login controller", error.message);
    res.status(500).json({
      message: error.message,
    });
  }
};

//logout controller
export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await redis.del(`refresh_token:${decoded.userId}`);
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.json({ message: "logout Successfully" });
    }
  } catch (error) {
    console.log("Error in Logout controller", error.message);
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

//refresh token controller ->this will recreate an access token
export const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(500).json({
        message: "No refresh token is provided",
      });
    }
    console.log(refreshToken);
    const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    // console.log(decode.userId)

    const storedToken = await redis.get(`refresh_token:${decode.userId}`);
    console.log(storedToken);
    if (storedToken !== refreshToken) {
      return res.status(500).json({
        message: "invalid refresh token",
      });
    }

    const newAccessToken = await jwt.sign(
      { userId: decode.userId },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
    res.status(200).json({
      message: "token refreshed successfully",
    });
  } catch (error) {
    console.log("error in refresh token controller", error.message);
    res.status(500).json({
      message: "error in refreshing the access token",
      success: false,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    req.json(req.user);
  } catch (error) {
    console.log("error in getting profile controller", error.message);
    res.status(500).json({
      message: "error in refreshing the access token",
      success: false,
    });
  }
};
