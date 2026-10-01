import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.js";

export const createRazorpayOrder = async (req, res) => {
    try {
        // Check Razorpay credentials
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET){
            return res.status(500).json({
                message: "Razorpay keys are not configured",
            });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                message: "Order ID is required",
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        // Make sure the order belongs to the logged-in user
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Not authorized to pay for this order",
            });
        }

        const options = {
            amount: Math.round(order.totalPrice * 100),
            currency: "INR",
            receipt: `order_${order._id}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        return res.status(200).json({
            message: "Razorpay order created successfully",
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to create Razorpay order",
            error: error.message,
        });
    }
};

export const verifyRazorpayPayment = async (req, res) => {
    try {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({
                message: "Razorpay keys are not configured",
            });
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
            return res.status(400).json({
                message: "Payment details are required",
            });
        }

        const generatedSignature = crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                message: "Invalid payment signature",
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        // Make sure the order belongs to the logged-in user
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Not authorized",
            });
        }

        order.isPaid = true;
        order.paidAt = new Date();

        const updatedOrder = await order.save();

        return res.status(200).json({
            message: "Payment verified successfully",
            order: updatedOrder,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Payment verification failed",
            error: error.message,
        });
    }
};