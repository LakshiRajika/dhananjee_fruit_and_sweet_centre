import express from "express";
import multer from "multer";

import { getAllFeedback, addFeedback, getById, updateFeedback, deleteFeedback, getFeedbackStats } from "../controllers/feedback.controller.js";

const router=express.Router();
const upload = multer({ dest: 'uploads/' });

router.get("/",getAllFeedback);

router.get("/:id",getById);
router.put("/:id",updateFeedback);
router.delete("/:id",deleteFeedback);
router.post("/", upload.single('image'), addFeedback);
router.get("/stats", getFeedbackStats);


export default router; 