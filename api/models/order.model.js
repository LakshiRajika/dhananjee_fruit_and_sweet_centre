const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    productDetails: {
        type: Array,
        default: [],
    },
    email: {
        type: String,
        default: "",
    },
    userId: {
        type: String,
        default: "",
    },
    paymentDetails: {
        paymentId: {
            type: String,
            default: "",
        },
        payment_method_type: {
            type: Array,
            default: [],
        },
        payment_status: {
            type: String,
            default: "",
        },
    },
    shipping_options: {
        type: Array,
        default: [],
    },
    shipping_details: {
        type: Object,
        default: {},
    },
    totalAmount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true
});

// ✅ Prevent OverwriteModelError by checking if model exists
const OrderProduct = mongoose.models.OrderProduct || mongoose.model('OrderProduct', orderSchema);

module.exports = OrderProduct;