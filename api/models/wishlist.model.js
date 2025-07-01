import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  productId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true,
    get: (image) => {
      if (image.startsWith('http')) {
        return image;
      }
      return `http://localhost:3000${image}`;
    }
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  toJSON: { getters: true } 
});

wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

wishlistSchema.post('find', function(docs) {
  console.log('Found wishlist items:', docs);
});

wishlistSchema.post('findOne', function(doc) {
  console.log('Found wishlist item:', doc);
});

export default mongoose.model('Wishlist', wishlistSchema);