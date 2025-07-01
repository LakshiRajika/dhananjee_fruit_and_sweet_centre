import mongoose from 'mongoose';

const deliveryDetailsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  mobileNumber: {
    type: String,
    required: true
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  deliveryType: {
    type: String,
    enum: ['stripe', 'bank_slip', 'cash'],
    required: true
  },
  deliveryService: {
    type: String,
    enum: ['uber', 'pickme', 'darazd', 'fardar', 'koombiyo', 'Pompt'],
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('DeliveryDetails', deliveryDetailsSchema); 