import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
      ref: 'User' // Reference to User model
    },
    customerName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    email: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    postalCode: { type: String, required: true },
    district: { type: String, required: true },

    deliveryType: { 
      type: String, 
      enum: ["stripe", "bank_slip", "cash"], 
      required: true 
    },

    deliveryService: { 
      type: String, 
      enum: ["uber", "pickme", "darazd", "fardar", "koombiyo", "Pompt"], 
      required: true 
    },

    amount: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    totalAmount: { type: Number },

    status: {
      type: String,
      enum: ["Pending", "Picked Up", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Pending",
    },

    estimatedTime: { type: String },
    completedAt: { type: String, default: "Pending" },
  },
  { 
    timestamps: true,
    collection: 'deliveries'
  }
);

// Pre-save hook to calculate totalAmount before saving
deliverySchema.pre("save", function (next) {
  this.totalAmount = (this.amount || 0) + (this.deliveryCharge || 0);
  next();
});

// Add debugging middleware
deliverySchema.post('find', function(docs) {
  console.log('Found deliveries:', docs);
});

deliverySchema.post('findOne', function(doc) {
  console.log('Found delivery:', doc);
});

// Create index for userId
deliverySchema.index({ userId: 1 });

// Check if the model already exists
const Delivery = mongoose.models.Delivery || mongoose.model("Delivery", deliverySchema);
export default Delivery;