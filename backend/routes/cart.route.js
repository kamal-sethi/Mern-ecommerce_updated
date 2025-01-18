import express from "express";
import { addToCart } from "../controllers/cart.controller";
import { protectRoute } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", protectRoute, getCartProducts);
router.post("/", protectRoute, addToCart);
router.delete("/", protectRoute, removeAllFromCart);
router.put("/:id", protectRoute, updatedProductQuantity);

export default router;
