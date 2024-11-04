import User from "../models/user.model.js";
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
    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message:error.message
    })
  }
};
export const login = async (req, res, next) => {
  res.send("Login route called");
};
export const logout = async (req, res, next) => {
  res.send("Logout route called");
};


