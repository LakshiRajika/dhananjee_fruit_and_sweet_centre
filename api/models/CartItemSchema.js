import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema(
  {
    userId: { 
      type: String, 
      required: true 
    }, 
    itemId: { 
      type: String, 
      required: true,
      unique: true
   },
    name: { 
      type: String, 
      required: true 
    },
    image: { 
      type: String, 
      required: true 
    },
    price: { 
      type: Number, 
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true 
    },
  },
  { timestamps: true } 
);

const CartItem = mongoose.model("CartItem", CartItemSchema);
export default CartItem;