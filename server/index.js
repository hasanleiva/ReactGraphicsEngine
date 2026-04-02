import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import imageRoutes from './routes/images.js';
import templateRoutes from './routes/templates.js';
import r2Routes from './routes/r2.js';
import fontRoutes from './routes/fonts.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS: in production Nginx handles same-origin, so restrict to APP_URL if set
app.use(cors({
  origin: process.env.APP_URL || false,
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use(authRoutes);
app.use(imageRoutes);
app.use(templateRoutes);
app.use(r2Routes);
app.use(fontRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, '127.0.0.1', () => {
  console.log(`API server running on http://127.0.0.1:${PORT}`);
});
