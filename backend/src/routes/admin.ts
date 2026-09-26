import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Contact from '../models/Contact';
import Product from '../models/Product';
import Gallery from '../models/Gallery';
import { upload, cloudinary } from '../lib/cloudinary';
import { authenticate } from '../middleware/auth';

const router = express.Router();

export const isAdmin = (req: any, res: any, next: any) => {
  const role = req.user.role;
  const Role = req.user.Role;
  if (role === 'admin' || role === 'Admin' || role === 2 || Role === 'admin' || Role === 'Admin' || Role === 2) {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

// Users
router.get('/users', authenticate, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password -PasswordHash');
    const mappedUsers = users.map(u => ({
      id: u._id.toString(),
      name: u.name || u.Name || 'Unknown',
      email: u.email || u.Email || '',
      role: u.role || u.Role || 'user',
      isActive: (u as any).isActive !== undefined ? (u as any).isActive : true,
      projectCount: 0
    }));
    res.json(mappedUsers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/users/:userId/toggle-status', authenticate, isAdmin, async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    let user = await User.findOne({ _id: userId });
    if (!user && mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    }
    if (!user) return res.status(404).json({ message: 'User not found' });
    (user as any).isActive = (user as any).isActive === undefined ? false : !(user as any).isActive;
    await user.save();
    res.json({ success: true, isActive: (user as any).isActive });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/users/:userId', authenticate, isAdmin, async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const { name, email, role } = req.body;
    let user = await User.findOne({ _id: userId });
    if (!user && mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    }
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.name = name;
    if (user.Name) user.Name = name;
    user.email = email;
    if (user.Email) user.Email = email;
    user.role = role;
    if (user.Role) user.Role = role;
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Contacts
router.get('/contacts', authenticate, isAdmin, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Products (Shop)
router.get('/products', authenticate, isAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/products', authenticate, isAdmin, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/products/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/products/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Gallery
router.get('/gallery', authenticate, isAdmin, async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ createdAt: -1 });
    res.json(gallery);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/gallery', authenticate, isAdmin, upload.single('image'), async (req: any, res: any) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
    const gallery = new Gallery({
      url: req.file.path,
      publicId: req.file.filename,
      title: req.body.title || 'Untitled'
    });
    await gallery.save();
    res.json(gallery);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/gallery/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (image) {
      await cloudinary.uploader.destroy(image.publicId);
      await Gallery.findByIdAndDelete(req.params.id);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
