import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'habit-tracker-super-secret-jwt-key-2026';

const DEFAULT_GUEST_USER = {
  id: 'default-user',
  name: 'Habit Champion',
  email: 'champion@project-h.app',
  timezone: 'UTC',
};

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Default guest bypass - no login required
      req.user = DEFAULT_GUEST_USER;
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (token === 'local-token-active' || token === 'active-session') {
      req.user = DEFAULT_GUEST_USER;
      return next();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, timezone: true },
      });

      req.user = user || DEFAULT_GUEST_USER;
    } catch {
      req.user = DEFAULT_GUEST_USER;
    }

    next();
  } catch (error) {
    req.user = DEFAULT_GUEST_USER;
    next();
  }
};
