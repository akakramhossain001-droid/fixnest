const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const providerRoutes = require('./routes/providers');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const walletRoutes = require('./routes/wallet');
const reviewsRoutes = require('./routes/reviews');
const usersRoutes = require('./routes/users');
const addressesRoutes = require('./routes/addresses');
const notificationsRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware (Helmet sets secure HTTP headers)
app.use(helmet());

// Strict CORS Policy
const allowedOrigins = ['http://localhost', 'https://localhost', 'capacitor://localhost', 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:3000', 'https://app-two-psi-80.vercel.app', 'https://app-dymltfang-akram-s-projects17.vercel.app'];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Rate Limiting to prevent Brute-Force and DDoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
// Apply rate limiter to all requests
app.use(limiter);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FixNest API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/addresses', addressesRoutes);
app.use('/api/notifications', notificationsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
