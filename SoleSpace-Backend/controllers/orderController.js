 import Order from '../models/Order.js';

export const addOrderItems = async (req, res) => {
  try {
    const { orderItems, shippingAddress, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    const order = new Order({
      orderItems,
      shippingAddress,
      totalPrice,
      user: req.user._id,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    // Only fetch orders belonging to the logged-in user
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders/admin
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { status } = req.body;
    
    // Add to history
    order.statusHistory.push({
      previousStatus: order.status,
      newStatus: status,
      user: req.user.name,
      date: Date.now()
    });

    order.status = status;
    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update order shipment
// @route   PUT /api/orders/:id/shipment
// @access  Private/Admin
export const updateOrderShipment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { trackingNumber, carrier } = req.body;
    
    order.shipmentInfo = {
      trackingNumber,
      carrier,
      shippedAt: Date.now()
    };
    
    // Auto update status to shipped if not already
    if (order.status !== 'Shipped' && order.status !== 'Delivered') {
      order.statusHistory.push({
        previousStatus: order.status,
        newStatus: 'Shipped',
        user: req.user.name,
        date: Date.now()
      });
      order.status = 'Shipped';
    }

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Add order note
// @route   POST /api/orders/:id/notes
// @access  Private/Admin
export const addOrderNote = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { note } = req.body;
    order.internalNotes.push({
      note,
      author: req.user.name,
      createdAt: Date.now()
    });

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Approve/Reject return
// @route   PUT /api/orders/:id/return
// @access  Private/Admin
export const processReturnRequest = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { status } = req.body; // 'Approved' or 'Rejected'
    
    if (order.returnRequest) {
      order.returnRequest.status = status;
    } else {
      order.returnRequest = { status, requestedAt: Date.now() };
    }

    if (status === 'Approved') {
      order.statusHistory.push({
        previousStatus: order.status,
        newStatus: 'Returned',
        user: req.user.name,
        date: Date.now()
      });
      order.status = 'Returned';
    }

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};