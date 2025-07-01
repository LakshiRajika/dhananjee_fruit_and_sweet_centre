import mongoose from "mongoose";
const Schema=mongoose.Schema;

const feedbackSchema=new Schema({
    orderId:{
        type:String,
        required:true
    },

    customerName:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:false
    },

    rating:{
        type:Number,
        required:true,
        min:1,
        max:5

    },

    review:{
        type:String,
        required:true,
        maxlength:500
    },

    image:{
        type:String,
        required:false

    },

    recommended:{
        type:String,
        enum:['Yes','No'],
        required:true
    },

    response:{
        type:Boolean,
        default:false
    },

    anonymous:{
        type:Boolean,
        default:false
    },

    
    category:{
        type:String,
        enum:["Positive","Neutral","Negative"],
        default:"Neutral",
        required:true
    },

    status:{
        type:String,
        enum:["Pending","Approved","Rejected"],
        default:"Pending"
    },

    adminResponse:{
        type:String,
        required:false
    },

    createdAt:{
        type:Date,
        default:Date.now
    }

});

const feedback = mongoose.model("feedback", feedbackSchema);
export default feedback; 
