import feedback from "../models/feedback.model.js"; // ✅ Change require to import
import multer from "multer";
import path from "path";

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage: storage });

const getAllFeedback=async (req, res, next) => {
    let feedbacks;

    try{
        feedbacks=await feedback.find();
    }catch(err){
        console.error(err);
        return res.status(500).json({ message: "Server error while fetching feedbacks" });
    }

    if(!feedbacks){
        return res.status(404).json({message:"No feedback found"});
    }

    return res.status(200).json({feedbacks});
}

// Get feedbacks by user email 
const getUserFeedbacks = async (req, res, next) => {
    const { email } = req.params;  

    try {
        const feedbacks = await feedback.find({ email }).sort({ createdAt: -1 });
        if (!feedbacks.length) {
            return res.status(404).json({ message: "No feedbacks found for this user" });
        }
        return res.status(200).json({ feedbacks });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error fetching user feedbacks" });
    }
};


function categorizeFeedback(rating){
    rating = Number(rating);
    if(rating>=4){
        return "Positive";
    }else if(rating==3){
        return "Neutral";
    }else{
        return "Negative";
    }
}

const addFeedback = async (req, res, next) => {
    const { orderId, customerName, email, rating, review, recommended, response, anonymous, status, adminResponse } = req.body;
    const image = req.file ? req.file.filename : null; // Handle uploaded image
  
    const category = categorizeFeedback(Number(rating)); 
  
    try {
      const feedbacks = new feedback({ orderId, customerName, email, rating, review, image, recommended, response, anonymous, category, status, adminResponse });
      await feedbacks.save();
      return res.status(200).json({ message: "Feedback added successfully", feedbacks,imageUrl: image ? `http://localhost:3000/uploads/${image}` : null });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error adding feedback" });
    }
  };
const getById = async(req,res,next)=>{
    const id=req.params.id;

    let feedbacks;

    try{
        feedbacks=await feedback.findById(id);
    }catch(err){
        console.log(err);
    }

    if(!feedbacks){
        return res.status(404).send({message:"Feedback not available"});
    }

    return res.status(200).json({feedbacks});
}

const updateFeedback = async (req, res, next) => {
    const id = req.params.id;
    const { orderId, customerName, email, rating, review, image, recommended, response, anonymous, status, adminResponse } = req.body;

    const category = categorizeFeedback(Number(rating));  // Auto-update category based on rating

    let feedbacks;
    try {
        feedbacks = await feedback.findByIdAndUpdate(
            id,
            { orderId, customerName, email, rating, review, image, recommended, response, anonymous, category, status, adminResponse },
            { new: true }  // Returns updated document
        );
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error updating feedback" });
    }

    if (!feedbacks) {
        return res.status(404).json({ message: "Feedback not found" });
    }

    return res.status(200).json({ message: "Feedback updated successfully",feedbacks});
};

const deleteFeedback = async (req, res, next) => {
    const id = req.params.id;

    let feedbacks;
    try {
        feedbacks = await feedback.findByIdAndDelete(id);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error deleting feedback" });
    }

    if (!feedbacks) {
        return res.status(404).json({ message: "Feedback not found" });
    }

    return res.status(200).json({ message: "Feedback deleted successfully" });
};

const getFeedbackStats = async (req, res) => {
    try {
        const totalFeedbacks = await feedback.countDocuments();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaysFeedbacks = await feedback.countDocuments({ createdAt: { $gte: today } });
        const positiveFeedbacks = await feedback.countDocuments({ category: "Positive" });
        const negativeFeedbacks = await feedback.countDocuments({ category: "Negative" });

        return res.status(200).json({ totalFeedbacks, todaysFeedbacks, positiveFeedbacks, negativeFeedbacks });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error fetching feedback statistics" });
    }
};

export { getAllFeedback, addFeedback, getById, updateFeedback, deleteFeedback, getFeedbackStats, getUserFeedbacks };