import express from "express";
import { login, logout, signup,refreshToken } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/sign-up", signup);
router.post("/login", login);
router.get("/logout", logout);
router.post('/refresh-token',refreshToken)

export default router;
