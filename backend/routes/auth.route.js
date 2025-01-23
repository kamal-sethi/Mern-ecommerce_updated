import express from "express";
import { login, logout, signup,refreshToken } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/sign-up", signup);
router.post("/login", login);
router.get("/logout", logout);
router.post('/refresh-token',refreshToken)
router.get('/getProfile',protectRoute,getProfile)

export default router;
