 import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register Controller
 export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ $or: [{ email: cleanEmail }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or phone' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ 
      name, 
      email: cleanEmail, 
      phone, 
      password: hashedPassword 
    });

    res.status(201).json({
      message: 'Account created successfully',
      user: { id: newUser._id, name: newUser.name, email: newUser.email, phone: newUser.phone }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Login Controller (supports Email or Phone)
 export const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const cleanIdentifier = identifier.toLowerCase().trim();

    const user = await User.findOne({ 
      $or: [
        { email: cleanIdentifier }, 
        { phone: identifier.trim() }
      ] 
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// Update user profile / settings
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Assumes your auth middleware attaches decoded user token to req.user
    const { name, notifications } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        ...(name && { name }),
        ...(notifications && { notifications })
      },
      { new: true, runValidators: true }
    ).select('-password'); // Exclude password from response

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};