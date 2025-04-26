import express from 'express';

import { 
    getCartItems, 
    addToCart, 
    updateCartItemQuantity, 
    deleteCartItem,
    clearCart
} from '../controllers/cart.controller.js'; 

const router = express.Router();

router.post('/add-to-cart', addToCart);
router.get('/items/:userId', getCartItems);
router.put('/item/:itemId', updateCartItemQuantity);
router.delete("/item/:userId/:itemId", deleteCartItem);
router.delete('/clear/:userId', clearCart);

export default router;