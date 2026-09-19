 import Order from '../models/Order.js';

 // Example of your backend order creation controller
const addOrderItems = async (req, res) => {
  try {
    const { orderItems, shippingAddress, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    const order = new Order({
      orderItems,
      shippingAddress,
      totalPrice,
      user: req.user._id, // <--- MAKE SURE THIS IS INCLUDED
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
    try {
        // Fetch all orders sorted by newest first
        const orders = await Order.find({}).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};