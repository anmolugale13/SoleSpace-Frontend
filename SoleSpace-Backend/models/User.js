 import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  notifications: {
    orderUpdates: { type: Boolean, default: true },
    backInStock: { type: Boolean, default: true },
    priceDrop: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false }
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);