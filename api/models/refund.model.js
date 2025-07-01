import mongoose from 'mongoose';

const refundSchema = new mongoose.Schema({
  refundId: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: String,
    required: true,
    ref: 'Order'
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processed'],
    default: 'pending'
  },
  processedBy: {
    type: String,
    ref: 'User'
  },
  processedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
refundSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Refund', refundSchema);