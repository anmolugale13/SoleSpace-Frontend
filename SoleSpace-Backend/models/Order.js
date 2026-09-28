 import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    orderItems: [
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            image: { type: String, required: false }, // Made optional to prevent blocking
            price: { type: Number, required: true },
            sku: { type: String, required: false },   // Made optional to prevent blocking
        }
    ],
    shippingAddress: {
        address: { type: String, required: false },
        city: { type: String, required: false },
        postalCode: { type: String, required: false },
        country: { type: String, required: false },
    },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    paymentMethod: { type: String, required: false },
    
    // Order Operations Fields
    status: { 
        type: String, 
        required: true, 
        default: 'Pending',
        enum: ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested', 'Returned']
    },
    internalNotes: [
        {
            note: { type: String, required: true },
            author: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    statusHistory: [
        {
            previousStatus: { type: String },
            newStatus: { type: String, required: true },
            user: { type: String, required: true },
            date: { type: Date, default: Date.now }
        }
    ],
    shipmentInfo: {
        trackingNumber: { type: String },
        carrier: { type: String },
        shippedAt: { type: Date }
    },
    returnRequest: {
        reason: { type: String },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected'] },
        requestedAt: { type: Date }
    }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
export default Order;