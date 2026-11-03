import prisma from '../config/db.js';

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

// Authentication completely bypassed - login removed
export const authenticate = async (req, res, next) => {
  try {
    await ensureDefaultUserInDb();
  } catch (e) {}
  req.user = DEFAULT_GUEST_USER;
  next();
};

export default authenticate;
