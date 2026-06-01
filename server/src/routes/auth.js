const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');

const router = express.Router();
const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET environment variable is not set. Auth will fail.');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send OTP
router.post('/send-otp', [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser?.isBlocked) {
      return res.status(403).json({ error: 'Your account has been blocked by the admin.' });
    }

    // Generate 6-digit OTP (Fixed for admin)
    const otpCode = email === 'admin@fixnest.com' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Upsert OTP in DB
    await prisma.otp.upsert({
      where: { email },
      update: { code: otpCode, expiresAt },
      create: { email, code: otpCode, expiresAt }
    });

    if (email === 'admin@fixnest.com') {
      console.log(`[OTP] Admin login bypass. Code is 123456`);
      return res.json({ message: 'OTP sent successfully to your email.' });
    }

    // Send Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your FixNest Login Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 10px;">
          <h2 style="color: #1D9E75; text-align: center;">FixNest</h2>
          <p>Hello,</p>
          <p>Here is your one-time verification code to securely log in to FixNest. This code will expire in 5 minutes.</p>
          <div style="background-color: #E1F5EE; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #168a63;">${otpCode}</span>
          </div>
          <p>If you didn't request this code, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6b7280; text-align: center;">FixNest Home Services App</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[OTP] Sent code ${otpCode} to ${email}`);

    res.json({ message: 'OTP sent successfully to your email.' });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
});

// Verify OTP & Login/Register
router.post('/verify-otp', [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, code, name } = req.body;

    const otpRecord = await prisma.otp.findUnique({ where: { email } });
    if (!otpRecord) return res.status(400).json({ error: 'No OTP found for this email. Request a new one.' });

    if (otpRecord.code !== code) return res.status(400).json({ error: 'Invalid verification code.' });

    if (new Date() > otpRecord.expiresAt) return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });

    // OTP is valid. Check if user exists.
    let user = await prisma.user.findUnique({ where: { email } });

    if (user?.isBlocked) {
      return res.status(403).json({ error: 'Your account has been blocked by the admin.' });
    }

    if (!user) {
      // Create new user if they don't exist
      const isAdmin = email === 'admin@fixnest.com' || email === 'ak.akramhossain001@gmail.com' || email === 'akakramhossain001@gmail.com';
      const role = isAdmin ? 'admin' : 'customer';
      user = await prisma.user.create({
        data: {
          name: name || email.split('@')[0], // Use provided name or default to email prefix
          email,
          role
        }
      });

      // Create welcome notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to FixNest!',
          message: 'Thank you for joining FixNest. Get ready to experience seamless home services!',
          type: 'system'
        }
      });
    }

    // Delete the OTP record so it can't be used again
    await prisma.otp.delete({ where: { email } });

    // Generate JWT
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone }
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

// Google Login/Signup
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    // Verify token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Email not provided by Google' });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    
    if (user?.isBlocked) {
      return res.status(403).json({ error: 'Your account has been blocked by the admin.' });
    }

    if (user) {
      // If user exists but doesn't have googleId set, update it
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId }
        });
      }
    } else {
      // Create new user
      const isAdmin = email === 'admin@fixnest.com' || email === 'ak.akramhossain001@gmail.com' || email === 'akakramhossain001@gmail.com';
      const role = isAdmin ? 'admin' : 'customer';
      user = await prisma.user.create({
        data: {
          name,
          email,
          googleId,
          role
        }
      });

      // Create a welcome notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to FixNest!',
          message: 'Thank you for joining FixNest using Google. Get ready to experience seamless home services!',
          type: 'system'
        }
      });
    }

    // Generate our JWT
    const jwtToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Google login successful',
      token: jwtToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

module.exports = router;
