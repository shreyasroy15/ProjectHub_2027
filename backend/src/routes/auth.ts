import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Register User
router.post('/register', async (req, res): Promise<any> => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();
    
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '12h' });
    res.status(201).json({ accessToken: token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login User/Admin
router.post('/login', async (req, res): Promise<any> => {
  try {
    const { email, password } = req.body;
    // Find by either new 'email' or legacy 'Email'
    const user = await User.findOne({ $or: [{ email }, { Email: email }] });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const passwordHash = user.get('password') || user.get('PasswordHash');
    
    if (!passwordHash) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    let isMatch = await bcrypt.compare(password, passwordHash);
    
    if (!isMatch && password === passwordHash) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const role = user.get('role') || user.get('Role');
    const name = user.get('name') || user.get('Name');
    const userId = user._id;

    const token = jwt.sign({ userId, role }, process.env.JWT_SECRET as string, { expiresIn: '12h' });
    res.json({ accessToken: token, user: { id: userId, name, email, role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Current User
router.get('/me', authenticate, (req: AuthRequest, res) => {
  const role = req.user.get('role') || req.user.get('Role');
  const name = req.user.get('name') || req.user.get('Name');
  const email = req.user.get('email') || req.user.get('Email');
  
  res.json({
    id: req.user._id,
    name,
    email,
    role
  });
});

// Logout
router.post('/logout', (req, res) => {
  res.status(204).send();
});

export default router;
