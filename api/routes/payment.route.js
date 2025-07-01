 import express from "express";
import { createCheckoutSession, handleStripeWebhook, uploadBankSlip, getOrderDetailsBySessionId } from "../controllers/payment.controller.js";
import multer from "multer";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/bank-slips/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post("/create-checkout-session", createCheckoutSession);
router.post("/webhook", handleStripeWebhook);
router.post("/upload-bank-slip", upload.single("slipImage"), uploadBankSlip);
router.get("/order-details/:sessionId", getOrderDetailsBySessionId);

export default router;
