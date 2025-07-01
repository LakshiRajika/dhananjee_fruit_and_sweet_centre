// models/inventory.js

import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  product_ID: { type: String, required: true,unique:true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true ,enum:["fruit","sweet"]},
  price: { type: Number, required: true,min:1 },
  quantity: { type: Number, required: true, default: 0 }, 
  image: { type: String,required:true },
 
   // Add quantity field
});

const inventory = mongoose.model("Inventory", inventorySchema);
export default inventory;
