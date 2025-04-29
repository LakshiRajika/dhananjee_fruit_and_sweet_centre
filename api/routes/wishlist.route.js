import express from 'express';
import { addToWishlist, getWishlist, removeFromWishlist } from '../controllers/wishlist.controller.js';

const router = express.Router();

router.post('/add', addToWishlist);
router.get('/:userId', getWishlist);
router.delete('/:userId/:itemId', removeFromWishlist);

export default router;
