import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'habit-tracker-super-secret-jwt-key-2026';

const DEFAULT_GUEST_USER = {
  id: 'default-user',
  name: 'Habit Champion',
  email: 'champion@project-h.app',
  timezone: 'UTC',
};

// Ensure default user row exists in SQLite so foreign key relations (userId) succeed
let defaultUserCreated = false;
async function ensureDefaultUserInDb() {
  if (defaultUserCreated) return;
  try {
    const existing = await prisma.user.findUnique({
      where: { id: DEFAULT_GUEST_USER.id },
    });
    if (!existing) {
      await prisma.user.upsert({
        where: { id: DEFAULT_GUEST_USER.id },
        update: {},
        create: {
          id: DEFAULT_GUEST_USER.id,
          name: DEFAULT_GUEST_USER.name,
          email: DEFAULT_GUEST_USER.email,
          passwordHash: 'guest-no-password-hash',
          timezone: DEFAULT_GUEST_USER.timezone,
        },
      });
    }
    defaultUserCreated = true;
  } catch (err) {
    // If DB is temporarily locked or offline, ignore
  }
}

export const authenticate = async (req, res, next) => {
  try {
    await ensureDefaultUserInDb();

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Auto-authenticate as default guest user
      req.user = DEFAULT_GUEST_USER;
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined' || token === 'local-token-active' || token === 'active-session') {
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

export default authenticate;
